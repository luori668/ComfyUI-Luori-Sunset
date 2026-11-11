import asyncio
import json
import os
import re
import subprocess
import sys
import threading
import time
import uuid
from datetime import datetime
from pathlib import Path

from PIL import Image

import folder_paths
from aiohttp import web
from server import PromptServer

ROOT = Path(folder_paths.get_user_directory()).resolve() / "luori_krea2"
THUMBS = ROOT / "thumbs"
UPLOADS = ROOT / "uploads"
INDEX = ROOT / "gallery.json"
LIMIT = 1000
WARN_AT = 950
THUMB_MAX = 480
MAX_UPLOAD = 20 * 1024 * 1024
LOCK = threading.Lock()
_save_lock = threading.Lock()


def _ensure():
    ROOT.mkdir(parents=True, exist_ok=True)
    THUMBS.mkdir(parents=True, exist_ok=True)
    UPLOADS.mkdir(parents=True, exist_ok=True)


def _empty():
    return {"version": 1, "items": []}


def _read():
    _ensure()
    if not INDEX.is_file():
        return _empty()
    try:
        data = json.loads(INDEX.read_text(encoding="utf-8"))
    except Exception:
        return _empty()
    if not isinstance(data, dict) or not isinstance(data.get("items"), list):
        return _empty()
    return data


def _write(data):
    _ensure()
    temp = INDEX.with_name("gallery.tmp.json")
    with open(temp, "w", encoding="utf-8", newline="\n") as handle:
        handle.write(json.dumps(data, ensure_ascii=False, indent=1))
        handle.flush()
        os.fsync(handle.fileno())
    os.replace(temp, INDEX)


def _now():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def _new_id():
    return "g-" + time.strftime("%Y%m%d%H%M%S") + "-" + uuid.uuid4().hex[:6]


def _thumb(source, target):
    with Image.open(source) as image:
        image = image.convert("RGB")
        image.thumbnail((THUMB_MAX, THUMB_MAX))
        image.save(target, format="WEBP", quality=82, method=6)


def _same(path, root):
    try:
        return Path(path).resolve().is_relative_to(Path(root).resolve())
    except Exception:
        return False


def _image_base(kind):
    kind = str(kind or "output").lower()
    if kind == "temp":
        return Path(folder_paths.get_temp_directory()).resolve()
    if kind == "input":
        return Path(folder_paths.get_input_directory()).resolve()
    return Path(folder_paths.get_output_directory()).resolve()


def _open_output_dir():
    target = Path(folder_paths.get_output_directory()).resolve()
    target.mkdir(parents=True, exist_ok=True)
    if os.name == "nt":
        os.startfile(str(target))
    else:
        subprocess.Popen(["open" if sys.platform == "darwin" else "xdg-open", str(target)])
    return target


def _output_path(filename, subfolder="", kind="output"):
    base = _image_base(kind)
    target = (base / str(subfolder or "") / str(filename or "")).resolve()
    if not target.is_relative_to(base):
        return None
    return target if target.is_file() else None


def _first_image(prompt_id):
    try:
        history = PromptServer.instance.prompt_queue.get_history(prompt_id=prompt_id)
    except Exception:
        return None
    entry = (history or {}).get(prompt_id) or {}
    status = entry.get("status") or {}
    if str(status.get("status_str") or "") == "error":
        return None
    outputs = entry.get("outputs") or {}
    fallback = None
    for node_id in outputs:
        node_out = outputs.get(node_id) or {}
        images = node_out.get("images")
        if not isinstance(images, list):
            continue
        for first in images:
            if not isinstance(first, dict) or not first.get("filename"):
                continue
            if str(first.get("type") or "output").lower() == "output":
                return first
            if fallback is None:
                fallback = first
    return fallback


def _locate(row):
    image = row.get("image") or {}
    if row.get("stored"):
        target = (UPLOADS / row.get("stored")).resolve()
        return target if target.is_relative_to(UPLOADS) and target.is_file() else None
    if not image.get("filename"):
        return None
    return _output_path(image.get("filename"), image.get("subfolder"), image.get("type"))


def _public(row):
    return {
        "id": row.get("id"),
        "prompt": row.get("prompt", ""),
        "seed": row.get("seed", ""),
        "source": row.get("source", ""),
        "rarity": row.get("rarity", ""),
        "star": bool(row.get("star")),
        "created": row.get("created", ""),
        "has_image": bool(row.get("thumb") or row.get("stored") or row.get("image")),
        "thumb_url": "/luori/k2/gallery/thumb/" + row.get("id", "") if row.get("thumb") else "",
        "params": row.get("params") or {},
        "stages": row.get("stages") or [],
        "file": str((row.get("image") or {}).get("filename") or row.get("stored") or ""),
    }


def _dir_bytes(path):
    total = 0
    try:
        for entry in Path(path).iterdir():
            if entry.is_file():
                try:
                    total += entry.stat().st_size
                except OSError:
                    pass
    except OSError:
        pass
    return total


def list_payload():
    data = _read()
    items = data.get("items", [])
    return {
        "items": [_public(row) for row in items],
        "total": len(items),
        "limit": LIMIT,
        "warn": WARN_AT,
        "bytes": _dir_bytes(THUMBS) + _dir_bytes(UPLOADS),
    }


_MISSING = object()
SKIP_NO_IMAGE = "no_image"
SKIP_DUPLICATE = "duplicate"
SKIP_UNUSED = "unused"


def _on_image_chain(prompt_id, node_id):
    if not prompt_id or node_id is None or str(node_id) == "":
        return True
    try:
        history = PromptServer.instance.prompt_queue.get_history(prompt_id=prompt_id)
    except Exception:
        return True
    entry = (history or {}).get(prompt_id) or {}
    item = entry.get("prompt")
    graph = item[2] if isinstance(item, (list, tuple)) and len(item) > 2 else None
    if not isinstance(graph, dict):
        return True
    roots = []
    for nid, out in (entry.get("outputs") or {}).items():
        if not isinstance(out, dict):
            continue
        for key in ("images", "gifs", "videos"):
            val = out.get(key)
            if isinstance(val, list) and val:
                roots.append(str(nid))
                break
    if not roots:
        return True
    target = str(node_id)
    seen = set()
    stack = list(roots)
    while stack:
        nid = stack.pop()
        if nid == target:
            return True
        if nid in seen:
            continue
        seen.add(nid)
        spec = graph.get(nid)
        if not isinstance(spec, dict):
            continue
        inputs = spec.get("inputs")
        if not isinstance(inputs, dict):
            continue
        for val in inputs.values():
            if isinstance(val, (list, tuple)) and len(val) == 2:
                stack.append(str(val[0]))
    return False


def _prompt_graph(prompt_id):
    if not prompt_id:
        return None, None
    try:
        history = PromptServer.instance.prompt_queue.get_history(prompt_id=prompt_id)
    except Exception:
        return None, None
    entry = (history or {}).get(prompt_id) or {}
    item = entry.get("prompt")
    graph = item[2] if isinstance(item, (list, tuple)) and len(item) > 2 else None
    if not isinstance(graph, dict):
        return None, None
    return graph, entry


def _chain_nodes(graph, entry):
    roots = []
    for nid, out in (entry.get("outputs") or {}).items():
        if not isinstance(out, dict):
            continue
        for key in ("images", "gifs", "videos"):
            val = out.get(key)
            if isinstance(val, list) and val:
                roots.append(str(nid))
                break
    if not roots:
        return None
    seen = set()
    stack = list(roots)
    while stack:
        nid = stack.pop()
        if nid in seen:
            continue
        seen.add(nid)
        spec = graph.get(nid)
        inputs = spec.get("inputs") if isinstance(spec, dict) else None
        if isinstance(inputs, dict):
            for val in inputs.values():
                if isinstance(val, (list, tuple)) and len(val) == 2:
                    stack.append(str(val[0]))
    return seen


def _resolve_value(graph, val, hops=0):
    if isinstance(val, (list, tuple)) and val:
        if hops >= 5:
            return None
        up = graph.get(str(val[0]))
        ins = up.get("inputs") if isinstance(up, dict) else None
        if isinstance(ins, dict):
            for key in ("seed", "noise_seed", "sampler_name", "scheduler", "value", "int", "number", "steps", "cfg"):
                if key in ins:
                    return _resolve_value(graph, ins[key], hops + 1)
        return None
    if isinstance(val, (dict, list, tuple)):
        return None
    return val


def _sampler_depth(graph, nid, sset, seen):
    if nid in seen:
        return 0
    seen = set(seen)
    seen.add(nid)
    spec = graph.get(nid)
    ins = spec.get("inputs") if isinstance(spec, dict) else None
    best = 0
    if isinstance(ins, dict):
        for val in ins.values():
            if isinstance(val, (list, tuple)) and val:
                up = str(val[0])
                if up in graph:
                    d = _sampler_depth(graph, up, sset, seen)
                    if up in sset:
                        d += 1
                    if d > best:
                        best = d
    return best


def _node_key(nid):
    try:
        return (0, int(nid))
    except Exception:
        return (1, str(nid))


def _build_stages(graph, ids, chain):
    if chain is not None:
        ids = [n for n in ids if n in chain]
    if not ids:
        return []
    sset = set(ids)
    depth = {n: _sampler_depth(graph, n, sset, set()) for n in ids}
    ids.sort(key=lambda n: (depth[n], _node_key(n)))
    labels = ["一采", "二采", "三采", "四采", "五采", "六采", "七采", "八采", "九采", "十采"]
    fields = [("seed", ("seed", "noise_seed")), ("steps", ("steps",)), ("cfg", ("cfg",)),
              ("sampler", ("sampler_name", "sampler")), ("scheduler", ("scheduler",)),
              ("denoise", ("denoise",)), ("start", ("start_at_step",)), ("end", ("end_at_step",))]
    out = []
    for i, nid in enumerate(ids):
        spec = graph.get(nid)
        ins = spec.get("inputs") if isinstance(spec, dict) else None
        if not isinstance(ins, dict):
            continue
        st = {"label": labels[i] if i < len(labels) else str(i + 1) + "采",
              "node": "#" + str(nid), "kind": str(spec.get("class_type") or "")}
        for key, sources in fields:
            for src in sources:
                if src not in ins:
                    continue
                val = _resolve_value(graph, ins[src])
                if val is not None and val != "" and not isinstance(val, (list, tuple, dict)):
                    st[key] = val
                    break
        out.append(st)
    return out


def _extract_all(prompt_id):
    graph, entry = _prompt_graph(prompt_id)
    if graph is None:
        return {"params": {}, "stages": []}
    out = {}
    fields = {"steps": "steps", "cfg": "cfg", "sampler_name": "sampler",
              "scheduler": "scheduler", "denoise": "denoise"}
    loras = []
    sampler_ids = []
    for nid, spec in graph.items():
        if not isinstance(spec, dict):
            continue
        ct = str(spec.get("class_type") or "")
        ins = spec.get("inputs")
        if not isinstance(ins, dict):
            continue
        low = ct.lower()
        if "sampler" in low and "select" not in low:
            sampler_ids.append(str(nid))
        if "sampler" in low or "scheduler" in low:
            for key, field in fields.items():
                val = ins.get(key)
                if field not in out and not isinstance(val, (list, tuple, dict)) and val not in (None, ""):
                    out[field] = val
        if any(tag in ct for tag in ("CheckpointLoader", "UNETLoader", "UnetLoader", "ModelLoader")):
            for key in ("ckpt_name", "unet_name", "model_name"):
                val = ins.get(key)
                if isinstance(val, str) and val and "model" not in out:
                    out["model"] = val
        if ct.startswith("Empty") and "Latent" in ct:
            width = ins.get("width")
            height = ins.get("height")
            if isinstance(width, int) and isinstance(height, int) and "size" not in out:
                out["size"] = str(width) + "x" + str(height)
        if "LoraLoader" in ct:
            val = ins.get("lora_name")
            if isinstance(val, str) and val and val not in loras and len(loras) < 6:
                loras.append(val)
    if loras:
        out["loras"] = ", ".join(loras)
    chain = _chain_nodes(graph, entry)
    return {"params": out, "stages": _build_stages(graph, sampler_ids, chain)}


def _extract_params(prompt_id):
    return _extract_all(prompt_id)["params"]


def _extract_stages(prompt_id):
    return _extract_all(prompt_id)["stages"]

def add_item(prompt, seed="", source="", rarity="", prompt_id="", require_image=False, image=_MISSING, node_id=""):
    text = str(prompt or "").strip()
    if not text:
        raise ValueError("empty_prompt")
    pid = str(prompt_id or "")
    with _save_lock:
        data = _read()
        items = data.get("items", [])
        if len(items) >= LIMIT:
            raise OverflowError("full")
        if pid:
            for old in reversed(items[-40:]):
                if str(old.get("prompt_id") or "") == pid and old.get("prompt") == text:
                    return SKIP_DUPLICATE
        if not _on_image_chain(pid, node_id):
            return SKIP_UNUSED
        if image is _MISSING:
            image = _first_image(pid) if pid else None
        if require_image and not image:
            return SKIP_NO_IMAGE
        row = {
            "id": _new_id(),
            "prompt": text,
            "prompt_id": pid,
            "seed": str(seed or ""),
            "source": str(source or ""),
            "rarity": str(rarity or ""),
            "created": _now(),
            "star": False,
            "params": _extract_params(pid),
            "stages": _extract_stages(pid),
            "image": image or {},
            "thumb": "",
            "stored": "",
        }
        if image:
            src = _output_path(image.get("filename"), image.get("subfolder"), image.get("type"))
            if src:
                name = row["id"] + ".webp"
                try:
                    _thumb(src, THUMBS / name)
                    row["thumb"] = name
                except Exception:
                    row["thumb"] = ""
        items.append(row)
        data["items"] = items
        _write(data)
        return _public(row)


def add_upload(data_bytes, prompt, filename="", source="手动"):
    text = str(prompt or "").strip()
    if not text:
        raise ValueError("empty_prompt")
    if len(data_bytes) > MAX_UPLOAD:
        raise OverflowError("too_large")
    with _save_lock:
        data = _read()
        items = data.get("items", [])
        if len(items) >= LIMIT:
            raise OverflowError("full")
        row = {
            "id": _new_id(),
            "prompt": text,
            "seed": "",
            "source": str(source or "手动"),
            "rarity": "",
            "created": _now(),
            "star": False,
            "params": {},
            "stages": [],
            "image": {"filename": str(filename or "")},
            "thumb": "",
            "stored": "",
        }
        _ensure()
        suffix = Path(str(filename or "")).suffix.lower()
        if suffix not in (".png", ".jpg", ".jpeg", ".webp", ".bmp"):
            suffix = ".png"
        stored = row["id"] + suffix
        target = UPLOADS / stored
        with open(target, "wb") as handle:
            handle.write(data_bytes)
        try:
            with Image.open(target) as probe:
                probe.verify()
            row["stored"] = stored
            _thumb(target, THUMBS / (row["id"] + ".webp"))
            row["thumb"] = row["id"] + ".webp"
        except Exception:
            try:
                target.unlink()
            except OSError:
                pass
            raise ValueError("bad_image")
        items.append(row)
        data["items"] = items
        _write(data)
        return _public(row)


def toggle_star(item_id, star):
    with _save_lock:
        data = _read()
        for row in data.get("items", []):
            if row.get("id") == item_id:
                row["star"] = bool(star)
                _write(data)
                return _public(row)
    raise KeyError(item_id)


def remove_item(item_id, purge=False):
    with _save_lock:
        data = _read()
        items = data.get("items", [])
        keep = []
        found = None
        for row in items:
            if row.get("id") == item_id and found is None:
                found = row
                continue
            keep.append(row)
        if found is None:
            raise KeyError(item_id)
        purged = False
        if purge:
            target = _locate(found)
            if target and _same(target, folder_paths.get_output_directory()):
                try:
                    target.unlink()
                    purged = True
                except OSError:
                    purged = False
        thumb = found.get("thumb")
        if thumb:
            try:
                (THUMBS / thumb).unlink()
            except OSError:
                pass
        stored = found.get("stored")
        if stored:
            try:
                (UPLOADS / stored).unlink()
            except OSError:
                pass
        data["items"] = keep
        _write(data)
        return {"removed": item_id, "purged": purged}


def export_text(only_star=False):
    data = _read()
    lines = []
    for row in data.get("items", []):
        if only_star and not row.get("star"):
            continue
        lines.append(str(row.get("prompt", "")).replace("\n", " ").strip())
    return "\n".join(line for line in lines if line)


routes = PromptServer.instance.routes


@routes.get("/luori/k2/gallery")
async def gallery_list(request):
    try:
        return web.json_response(list_payload(), headers={"Cache-Control": "no-store"})
    except Exception as exc:
        return web.json_response({"error": str(exc)[:120]}, status=500)


@routes.post("/luori/k2/gallery")
async def gallery_add(request):
    try:
        body = await request.json()
    except Exception:
        return web.json_response({"error": "bad_request"}, status=400)
    if not isinstance(body, dict):
        return web.json_response({"error": "bad_request"}, status=400)
    pid = str(body.get("prompt_id") or "")
    strict = bool(body.get("require_image"))
    image = _first_image(pid) if pid else None
    if strict and image is None and pid:
        for _ in range(12):
            await asyncio.sleep(0.08)
            image = _first_image(pid)
            if image is not None:
                break
    try:
        row = add_item(
            body.get("prompt", ""),
            body.get("seed", ""),
            body.get("source", ""),
            body.get("rarity", ""),
            pid,
            require_image=strict,
            image=image,
            node_id=body.get("node_id", ""),
        )
        if isinstance(row, str):
            return web.json_response({"skipped": row}, status=200)
        return web.json_response({"item": row, "total": len(_read().get("items", []))}, status=201)
    except OverflowError:
        return web.json_response({"error": "full", "limit": LIMIT}, status=409)
    except ValueError:
        return web.json_response({"error": "empty_prompt"}, status=400)


@routes.post("/luori/k2/gallery/manual")
async def gallery_manual(request):
    try:
        multipart = await request.multipart()
        payload = None
        text = ""
        name = ""
        async for part in multipart:
            if part.name == "image" and part.filename is not None:
                chunks = []
                size = 0
                while True:
                    chunk = await part.read_chunk()
                    if not chunk:
                        break
                    size += len(chunk)
                    if size > MAX_UPLOAD:
                        return web.json_response({"error": "too_large"}, status=413)
                    chunks.append(chunk)
                payload = b"".join(chunks)
                name = part.filename
            elif part.name == "prompt":
                text = (await part.read()).decode("utf-8", "replace")
        if payload is None:
            return web.json_response({"error": "image_required"}, status=400)
        row = add_upload(payload, text, name)
        return web.json_response({"item": row, "total": len(_read().get("items", []))}, status=201)
    except OverflowError as exc:
        if str(exc) == "full":
            return web.json_response({"error": "full", "limit": LIMIT}, status=409)
        return web.json_response({"error": "too_large"}, status=413)
    except ValueError as exc:
        return web.json_response({"error": str(exc)}, status=400)
    except Exception as exc:
        return web.json_response({"error": str(exc)[:120]}, status=500)


@routes.post("/luori/k2/gallery/star")
async def gallery_star(request):
    try:
        body = await request.json()
    except Exception:
        return web.json_response({"error": "bad_request"}, status=400)
    try:
        row = toggle_star(str(body.get("id", "")), bool(body.get("star")))
        return web.json_response({"item": row})
    except KeyError:
        return web.json_response({"error": "not_found"}, status=404)


@routes.delete("/luori/k2/gallery/{item_id}")
async def gallery_delete(request):
    item_id = request.match_info.get("item_id", "")
    if not re.fullmatch(r"[A-Za-z0-9_-]{1,80}", item_id or ""):
        return web.json_response({"error": "bad_id"}, status=400)
    purge = request.query.get("mode", "keep") == "purge"
    try:
        return web.json_response(remove_item(item_id, purge))
    except KeyError:
        return web.json_response({"error": "not_found"}, status=404)


@routes.get("/luori/k2/gallery/thumb/{item_id}")
async def gallery_thumb(request):
    item_id = request.match_info.get("item_id", "")
    for row in _read().get("items", []):
        if row.get("id") == item_id and row.get("thumb"):
            target = (THUMBS / row["thumb"]).resolve()
            if target.is_relative_to(THUMBS) and target.is_file():
                return web.FileResponse(target, headers={"Cache-Control": "private, max-age=86400"})
    raise web.HTTPNotFound()


@routes.get("/luori/k2/gallery/image/{item_id}")
async def gallery_image(request):
    item_id = request.match_info.get("item_id", "")
    for row in _read().get("items", []):
        if row.get("id") == item_id:
            target = _locate(row)
            if target:
                return web.FileResponse(target, headers={"Cache-Control": "private, max-age=60"})
    raise web.HTTPNotFound()


@routes.get("/luori/k2/gallery/export")
async def gallery_export(request):
    only_star = request.query.get("star", "") == "1"
    body = export_text(only_star)
    stamp = time.strftime("%Y%m%d_%H%M%S")
    return web.Response(
        text=body,
        content_type="text/plain",
        charset="utf-8",
        headers={"Content-Disposition": 'attachment; filename="luori_prompts_%s.txt"' % stamp},
    )


@routes.post("/luori/k2/gallery/open_output")
async def gallery_open_output(request):
    try:
        target = _open_output_dir()
        return web.json_response({"ok": True, "path": str(target)})
    except Exception as exc:
        return web.json_response({"ok": False, "error": str(exc)[:120]}, status=500)
