import os
import json
import threading


_CACHE = {}
_LOCK = threading.Lock()


def load_json(path):
    if not path:
        return None
    try:
        st = os.stat(path)
    except OSError:
        return None
    key = (os.path.normcase(os.path.abspath(path)), st.st_mtime_ns, st.st_size)
    with _LOCK:
        if key in _CACHE:
            return _CACHE[key]
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception:
        return None
    with _LOCK:
        if len(_CACHE) > 24:
            _CACHE.clear()
        _CACHE[key] = data
    return data



_CLEAN_CACHE = {}


def load_cleaned(path):
    if not path:
        return []
    try:
        st = os.stat(path)
    except OSError:
        return []
    key = (os.path.normcase(os.path.abspath(path)), st.st_mtime_ns, st.st_size)
    with _LOCK:
        if key in _CLEAN_CACHE:
            return _CLEAN_CACHE[key]
    items, _ = clean_items(_as_list(load_json(path)))
    with _LOCK:
        if len(_CLEAN_CACHE) > 48:
            _CLEAN_CACHE.clear()
        _CLEAN_CACHE[key] = items
    return items


MIN_SEG = 8


def _norm(s):
    return " ".join(str(s).split())


def split_clusters(text):
    raw = str(text)
    if "\n" not in raw and "\r" not in raw:
        return [_norm(raw)] if _norm(raw) else []

    segs = []
    for seg in raw.replace("\r\n", "\n").replace("\r", "\n").split("\n"):
        seg = _norm(seg)
        if len(seg) >= MIN_SEG:
            segs.append(seg)
    if not segs:
        return []
    if len(segs) == 1:
        return segs
    return segs


def clean_items(items, split=True):
    out, seen = [], set()
    stat = {"raw": len(items), "split_extra": 0, "dup": 0, "empty": 0, "bad": 0}

    for it in items:
        if not isinstance(it, str):
            if isinstance(it, (int, float)):
                it = str(it)
            else:
                stat["bad"] += 1
                continue
        pieces = split_clusters(it) if split else [_norm(it)]
        if len(pieces) > 1:
            stat["split_extra"] += len(pieces) - 1
        for p in pieces:
            if not p or len(p) < 2:
                stat["empty"] += 1
                continue
            if p in seen:
                stat["dup"] += 1
                continue
            seen.add(p)
            out.append(p)
    return out, stat


def iter_categories(data):
    if data is None:
        return
    if isinstance(data, list):
        yield ("全部", data)
        return
    if not isinstance(data, dict):
        return
    for k, v in data.items():
        if isinstance(v, list):
            yield (k, v)
        elif isinstance(v, dict):
            merged = []
            for sub in v.values():
                if isinstance(sub, list):
                    merged.extend(sub)
            if merged:
                yield (k, merged)



def plugin_dir():
    return os.path.dirname(os.path.abspath(__file__))


def data_dir():
    env = os.environ.get("SUNSET_DATA", "").strip()
    if env and os.path.isdir(env):
        return os.path.normpath(env)
    return os.path.normpath(os.path.join(plugin_dir(), "data"))


def find_file(*rel):
    p = os.path.join(data_dir(), *rel)
    return p if os.path.isfile(p) else None



def load_krea2_parts():
    packs = {}
    for i in range(1, 13):
        name = "part{:02d}".format(i)
        items = load_cleaned(find_file("krea2", name + ".json"))
        if items:
            packs[name] = items
    return packs


def load_krea2_nsfw():
    return load_cleaned(find_file("krea2", "part13.json"))


def load_super():
    return load_cleaned(find_file("shared", "luori.json"))


def load_zimage_categories():
    p = find_file("zimage", "prompt_library.json")
    data = load_json(p)
    cats, stats = {}, {}
    for name, items in iter_categories(data) or []:
        cl, st = clean_items(items)
        if cl:
            cats[name] = cl
            stats[name] = st
    return cats, stats


def load_extra_categories():
    d = os.path.join(data_dir(), "zimage", "extra")
    cats = {}
    if not os.path.isdir(d):
        return cats
    for fn in sorted(os.listdir(d)):
        if not fn.lower().endswith(".json"):
            continue
        items = load_cleaned(os.path.join(d, fn))
        if items:
            cats[os.path.splitext(fn)[0]] = items
    return cats


def load_zimage_libraries():
    p = find_file("zimage", "libraries.json")
    return load_json(p) or {}


def load_style_templates():
    p = find_file("zimage", "style_templates.json")
    return load_json(p) or {}


def load_action_options():
    p = find_file("zimage", "action_options.json")
    d = load_json(p)
    return d if isinstance(d, list) else []


def load_style_enhance():
    p = find_file("zimage", "style_enhance.json")
    return load_json(p) or {}


def load_presets():
    p = find_file("zimage", "fashion_presets.json")
    d = load_json(p)
    return d if isinstance(d, list) else []


def _as_list(data):
    if data is None:
        return []
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        for k in ("超强词库", "prompts", "prompt", "list", "items", "data"):
            v = data.get(k)
            if isinstance(v, list):
                return v
        out = []
        for v in data.values():
            if isinstance(v, list):
                out.extend(v)
            elif isinstance(v, dict):
                for sub in v.values():
                    if isinstance(sub, list):
                        out.extend(sub)
        return out
    return []



MATERIAL_BLOCKS = {
    "羊绒": ("吊带", "抹胸", "泳装", "比基尼", "热裤", "露脐", "渔网", "肚兜", "薄纱", "透视"),
    "羊毛": ("吊带", "抹胸", "泳装", "比基尼", "热裤", "露脐", "渔网", "薄纱", "透视"),
    "毛绒": ("泳装", "比基尼", "热裤", "露脐"),
    "毛呢": ("泳装", "比基尼", "吊带", "抹胸", "热裤", "露脐"),
    "摇粒绒": ("泳装", "比基尼", "吊带", "抹胸", "热裤", "露脐"),
    "羽绒": ("泳装", "比基尼", "吊带", "抹胸", "热裤", "露脐"),
    "天鹅绒": ("泳装", "比基尼"),
    "金丝绒": ("泳装", "比基尼"),
    "雪尼尔": ("泳装", "比基尼"),
}

OUTDOOR_ONLY_WEATHER = ("雪天", "雾天", "雷雨天", "台风天", "沙尘天", "彩虹天",
                        "极光夜", "雨天")

INDOOR_HINTS = ("室内", "房间", "客厅", "卧室", "厨房", "浴室", "书房", "包间",
                "教室", "健身房", "瑜伽室", "桑拿", "办公室", "美术馆", "博物馆",
                "画廊", "录音棚", "花房", "水族馆", "天文馆", "科技馆", "图书馆",
                "咖啡馆", "茶室", "酒吧", "游戏厅", "网吧", "KTV", "餐厅",
                "衣帽间", "地下室", "酒窖", "阳光房", "舞蹈房", "画室", "摄影棚",
                "和室", "酒店套房", "民宿房间", "床上", "沙发", "地板", "飘窗")


def looks_indoor(scene):
    s = str(scene)
    return any(w in s for w in INDOOR_HINTS)


def material_fits(material, garment):
    bad = MATERIAL_BLOCKS.get(str(material))
    if not bad:
        return True
    g = str(garment)
    return not any(w in g for w in bad)


def weather_fits(weather, scene):
    w = str(weather)
    if not any(x in w for x in OUTDOOR_ONLY_WEATHER):
        return True
    return not looks_indoor(scene)


def pick_compatible(pool, judge, rng, tries=24):
    if not pool:
        return ""
    for _ in range(tries):
        c = rng.choice(pool)
        if judge(c):
            return c
    return rng.choice(pool)



def vet():
    rep = []
    rep.append("词库目录: %s" % data_dir())
    rep.append("")

    parts = load_krea2_parts()
    rep.append("【Krea2】part01..12")
    tot = 0
    for k in sorted(parts):
        rep.append("   %s  %5d 条" % (k, len(parts[k])))
        tot += len(parts[k])
    rep.append("   合计 %d 条" % tot)
    nsfw = load_krea2_nsfw()
    rep.append("   part13(NSFW)  %5d 条" % len(nsfw))
    rep.append("")

    sup = load_super()
    rep.append("【共用】超强词库  %d 条" % len(sup))
    rep.append("")

    cats, stats = load_zimage_categories()
    rep.append("【ZImage 抽取器】prompt_library.json")
    for k, v in cats.items():
        st = stats.get(k, {})
        extra = ""
        if st.get("split_extra"):
            extra += "  ← 拆出 %d 段" % st["split_extra"]
        if st.get("dup"):
            extra += "  去重 %d" % st["dup"]
        rep.append("   %-8s %5d 条%s" % (k, len(v), extra))
    rep.append("")

    extras = load_extra_categories()
    if extras:
        rep.append("【ZImage 额外分类】data\\zimage\\extra")
        for k, v in extras.items():
            rep.append("   %-8s %5d 条" % (k, len(v)))
        rep.append("")

    libs = load_zimage_libraries()
    n = 0
    for sub in libs.values():
        if isinstance(sub, dict):
            n += sum(len(v) for v in sub.values() if isinstance(v, list))
        elif isinstance(sub, list):
            n += len(sub)
    rep.append("【ZImage 生成器】libraries.json  %d 组 / %d 条" % (len(libs), n))
    rep.append("             style_templates %d 主题 · action_options %d 项"
               % (len(load_style_templates()), len(load_action_options())))
    rep.append("             fashion_presets %d 套" % len(load_presets()))
    return rep
