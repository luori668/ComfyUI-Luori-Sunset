import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

const SAVER_CLASS = "LuoriGallerySaver";
const PENDING = new Map();
const TTL = 600000;

const field = (out, detail, key) => {
  const a = (out && out[key]) || (detail && detail[key]);
  if (!Array.isArray(a) || !a.length) return "";
  const v = a[a.length - 1];
  return String(v == null ? "" : v);
};

const nodeClass = (id) => {
  try {
    const g = app.graph;
    if (!g) return "";
    const n = typeof g.getNodeById === "function"
      ? g.getNodeById(id)
      : (g._nodes || []).find((x) => String(x.id) === String(id));
    return String((n && (n.comfyClass || n.type)) || "");
  } catch (e) {
    return "";
  }
};

const hook = () => {
  api.addEventListener("executed", (ev) => {
    const detail = (ev && ev.detail) || ev || {};
    const out = detail.output || detail;
    const text = field(out, detail, "gallery_text").trim();
    const auto = field(out, detail, "gallery_auto") === "1";
    if (!text && !auto) return;
    const node = String(detail.node != null ? detail.node : field(out, detail, "gallery_node"));
    const cls = node ? nodeClass(node) : "";
    if (cls && cls !== SAVER_CLASS) return;
    PENDING.set(node + "|" + (text.slice(0, 48) || "auto") + "|" + PENDING.size, {
      prompt: text,
      seed: field(out, detail, "gallery_seed"),
      source: field(out, detail, "gallery_source") || "手动存档",
      at: Date.now(),
    });
  });

  const drop = () => { PENDING.clear(); };
  api.addEventListener("execution_error", drop);
  api.addEventListener("execution_interrupted", drop);

  api.addEventListener("execution_success", async (ev) => {
    const pid = ev && ev.detail && ev.detail.prompt_id;
    if (!PENDING.size) return;
    const jobs = Array.from(PENDING.values());
    PENDING.clear();
    if (!pid) return;
    for (const job of jobs) {
      if (Date.now() - job.at > TTL) continue;
      try {
        const res = await api.fetchApi("/luori/k2/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: job.prompt,
            seed: job.seed,
            source: job.source,
            rarity: "",
            prompt_id: pid,
            require_image: true,
            node_id: "",
          }),
        });
        if (!res.ok) {
          console.warn("[落日词图库] 存档失败", res.status);
        } else {
          const data = await res.json().catch(() => null);
          if (data && data.skipped) console.warn("[落日词图库] 已跳过", data.skipped);
        }
      } catch (e) { }
    }
  });
};

app.registerExtension({
  name: "luorisunset.GallerySaver",
  async setup() {
    hook();
  },
});
