import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

const SKIN_VERSION = "3.30";


const CONFIG = {
  autoResize: true,     
  width: 352,           
  hideNative: true,     
  paintNode: true,      
  glow: true,           
  syncInterval: 400,    
};

const K2_MIN_PANEL_W = 240;

const THEME = {
  orange: "#FF8A3D",
  pink:   "#FF2E93",
  purple: "#8B2FF7",
  cyan:   "#22D3EE",
  danger: "#FF3D71",
  bgDeep: "#100B1F",
  bgMid:  "#1D1438",
};

const THEMES = [
  { name: "霓虹", orange: "#FF8A3D", pink: "#FF2E93", purple: "#8B2FF7", cyan: "#22D3EE",
    bg1: "#191134", bg2: "#100B1F",
    g1: "rgba(255,46,147,.18)", g2: "rgba(139,47,247,.22)" },
  { name: "赛博蓝", orange: "#38BDF8", pink: "#22D3EE", purple: "#2563EB", cyan: "#67E8F9",
    bg1: "#0B1A2E", bg2: "#05101F",
    g1: "rgba(56,189,248,.20)", g2: "rgba(37,99,235,.26)" },
  { name: "暗金", orange: "#F5B942", pink: "#E0862B", purple: "#8A5A1C", cyan: "#FFD98A",
    bg1: "#1E160C", bg2: "#120C06",
    g1: "rgba(245,185,66,.18)", g2: "rgba(138,90,28,.26)" },
  { name: "极光", orange: "#4ADE80", pink: "#22D3EE", purple: "#A78BFA", cyan: "#86EFAC",
    bg1: "#0C1F1A", bg2: "#05110F",
    g1: "rgba(74,222,128,.16)", g2: "rgba(167,139,250,.22)" },
  { name: "樱粉", orange: "#FF9AC1", pink: "#FF5FA2", purple: "#C026D3", cyan: "#FFD1E8",
    bg1: "#241126", bg2: "#150A18",
    g1: "rgba(255,95,162,.20)", g2: "rgba(192,38,211,.24)" },
  { name: "深海", orange: "#5EEAD4", pink: "#38BDF8", purple: "#4338CA", cyan: "#A5F3FC",
    bg1: "#0A1430", bg2: "#04091C",
    g1: "rgba(56,189,248,.18)", g2: "rgba(67,56,202,.28)" },
  { name: "熔岩", orange: "#FF6B2C", pink: "#FF2D55", purple: "#7C1D12", cyan: "#FFC48A",
    bg1: "#24100A", bg2: "#140704",
    g1: "rgba(255,109,44,.20)", g2: "rgba(124,29,18,.30)" },
  { name: "幻紫", orange: "#C084FC", pink: "#A855F7", purple: "#6D28D9", cyan: "#E9D5FF",
    bg1: "#1A1030", bg2: "#0C0718",
    g1: "rgba(168,85,247,.20)", g2: "rgba(109,40,217,.28)" },
];

let themeIdx = 0;
let sfxOn = true;
let actx = null;

function storeGet(k, d) {
  try {
    const v = localStorage.getItem(k);
    return v == null ? d : v;
  } catch (e) { return d; }
}

function storeSet(k, v) {
  try { localStorage.setItem(k, String(v)); } catch (e) { }
}

function loadPrefs() {
  const t = parseInt(storeGet("k2_theme", "0"), 10);
  themeIdx = (Number.isFinite(t) && t >= 0 && t < THEMES.length) ? t : 0;
  sfxOn = storeGet("k2_sfx", "1") !== "0";
}
loadPrefs();

function applyTheme(root) {  const t = THEMES[themeIdx];
  THEME.orange = t.orange;
  THEME.pink = t.pink;
  THEME.purple = t.purple;
  THEME.cyan = t.cyan;
  THEME.bgDeep = t.bg2;
  THEME.bgMid = t.bg1;
  if (root && root.style && root.style.setProperty) {
    root.style.setProperty("--o", t.orange);
    root.style.setProperty("--p", t.pink);
    root.style.setProperty("--v", t.purple);
    root.style.setProperty("--cy", t.cyan);
    root.style.setProperty("--bg1", t.bg1);
    root.style.setProperty("--bg2", t.bg2);
    root.style.setProperty("--g1", t.g1);
    root.style.setProperty("--g2", t.g2);
  }
}

function paintZs(root, t) {
  if (!root || !root.style) return;
  root.style.setProperty("--o", t.orange);
  root.style.setProperty("--p", t.pink);
  root.style.setProperty("--v", t.purple);
  root.style.setProperty("--cy", t.cyan);
  root.style.setProperty("--c1", t.orange);
  root.style.setProperty("--c2", t.pink);
  root.style.setProperty("--c3", t.purple);
  root.style.setProperty("--bgtop", t.bg1);
  root.style.setProperty("--bgbtm", t.bg2);
}

window.__k2Shared = {
  sfx: (kind) => sfx(kind),
  sfxForce: (kind) => sfxRaw(kind),
  warm: () => { acGet(); },
  sfxEnabled: () => sfxOn,
  themes: THEMES,
  index: () => themeIdx,
  cycle: () => {
    themeIdx = (themeIdx + 1) % THEMES.length;
    storeSet("k2_theme", String(themeIdx));
    const t = THEMES[themeIdx];
    document.querySelectorAll(".k2-root").forEach((r) => { try { applyTheme(r); } catch (e) { } });
    document.querySelectorAll(".zs-root").forEach((r) => { try { paintZs(r, t); } catch (e) { } });
    return themeIdx;
  },
};

function acGet() {
  if (actx) {
    if (actx.state === "suspended" && actx.resume) { try { actx.resume(); } catch (e) { } }
    return actx;
  }
  try {
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AC) return null;
    actx = new AC();
  } catch (e) { return null; }
  return actx;
}

function tone(c, freq, t0, dur, type, vol) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g);
  g.connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.03);
}

function sfxRaw(kind) {
  const c = acGet();
  if (!c) return;
  try {
    const t = c.currentTime + 0.005;
    if (kind === "tick") tone(c, 1180, t, 0.05, "square", 0.035);
    else if (kind === "flip") {
      tone(c, 660, t, 0.1, "triangle", 0.07);
      tone(c, 990, t + 0.07, 0.14, "triangle", 0.055);
    } else if (kind === "ssr") {
      const notes = [523, 659, 784, 1047, 1319];
      for (let i = 0; i < notes.length; i++) tone(c, notes[i], t + i * 0.075, 0.36, "sine", 0.07);
    } else if (kind === "on") tone(c, 520, t, 0.09, "sine", 0.05);
    else if (kind === "off") tone(c, 320, t, 0.09, "sine", 0.05);
  } catch (e) { }
}

function sfx(kind) {
  if (!sfxOn) return;
  sfxRaw(kind);
}

function rollTo(host, text) {
  const s = String(text == null ? "" : text);
  if (!host) return;
  const prev = host.__k2roll;
  if (prev === s) return;
  host.__k2roll = s;
  if (prev === undefined || prev === "") { host.textContent = s; return; }
  const box = document.createElement("span");
  box.className = "k2-roll";
  const out = document.createElement("span");
  out.className = "k2-rout";
  out.textContent = prev;
  const inn = document.createElement("span");
  inn.className = "k2-rin";
  inn.textContent = s;
  box.appendChild(out);
  box.appendChild(inn);
  host.textContent = "";
  host.appendChild(box);
  setTimeout(() => {
    if (host.__k2roll === s) host.textContent = s;
  }, 360);
}

const NODE_CLASS = "Krea2PromptPicker";
const W_NAME = {
  dir:    "prompt_dir",
  seed:   "seed",
  mode:   "mode",
  sep:    "separator",
  trigOn: "触发词开关",
  trigTx: "触发词内容",
  cn:     "超强中文模式",
  nsfw:   "NSFW",
  hz1:    "大呲花词库",
  hz2:    "KOOK词库",
  sfw:    "SFW词库",
  p19:    "19+词库",
  moss:   "Krea2-Moss-Anima词库",
  tip:    "使用提示",
};
const PART_COUNT = 12;
const partName = (i) => `提示词${i}`;

const DRAW_MAP = new Map();
const K2G_PENDING = new Map();
let k2gHooked = false;

const k2gFind = (id) => {
  try {
    if (app.graph && typeof app.graph.getNodeById === "function") return app.graph.getNodeById(id);
    const list = (app.graph && app.graph._nodes) || [];
    return list.find((n) => n.id === id) || null;
  } catch (e) {
    return null;
  }
};

const k2gHook = () => {
  if (k2gHooked) return;
  k2gHooked = true;
  const drop = () => { K2G_PENDING.clear(); };
  api.addEventListener("execution_error", drop);
  api.addEventListener("execution_interrupted", drop);
  api.addEventListener("execution_success", async (ev) => {
    const pid = ev && ev.detail && ev.detail.prompt_id;
    if (!pid || !K2G_PENDING.size) return;
    const now = Date.now();
    const jobs = [];
    for (const [nodeId, draw] of K2G_PENDING.entries()) {
      K2G_PENDING.delete(nodeId);
      if (draw.at && now - draw.at > 600000) continue;
      jobs.push([nodeId, draw]);
    }
    if (!jobs.length) return;
    for (const pair of jobs) {
      const nodeId = pair[0];
      const draw = pair[1];
      const target = k2gFind(nodeId);
      if (!target) continue;
      const props = target.properties || {};
      const autoOn = typeof props.__k2AutoSave === "boolean" ? props.__k2AutoSave : true;
      if (!autoOn) continue;
      try {
        await api.fetchApi("/luori/k2/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: draw.prompt,
            seed: draw.seed,
            source: draw.source,
            rarity: draw.rarity,
            prompt_id: pid,
            require_image: true,
            node_id: nodeId,
          }),
        });
      } catch (e) { }
    }
  });
};
let drawBound = false;

function bindDrawFeed() {
  if (drawBound) return;
  drawBound = true;
  try {
    app.api.addEventListener("executed", (ev) => {
      const d = (ev && ev.detail) || ev;
      if (!d) return;
      const fn = d.node != null ? DRAW_MAP.get(d.node) : null;
      if (!fn) return;
      const t = d.text;
      const arr = Array.isArray(t) ? t : (t != null ? [t] : []);
      if (!arr.length) return;
      try { fn(arr[arr.length - 1]); } catch (e) { }
    });
  } catch (e) { }
}

const PART_SIZES = [500, 500, 500, 500, 500, 500, 500, 500, 491, 247, 247, 1662];
const PART_TOTAL = PART_SIZES.reduce((a, b) => a + b, 0);


const HZ1_SIZE = 13430;
const HZ2_SIZE = 391;
const SFW_SIZE = 2462;
const P19_SIZE = 7063;
const MOSS_SIZE = 1571;

const TITLE_H = 30;     


const findWidget = (node, name) => node?.widgets?.find((w) => w.name === name) ?? null;

function readW(node, name, fallback) {
  const w = findWidget(node, name);
  return w ? w.value : fallback;
}

const MISS_WARNED = new Set();

function writeW(node, name, value) {
  const w = findWidget(node, name);
  if (!w) {
    if (!MISS_WARNED.has(name)) {
      MISS_WARNED.add(name);
      console.warn("[Krea2Skin] 节点缺少控件：" + name +
        " —— 节点定义还是旧的，请重启 ComfyUI 后再 Ctrl+F5");
    }
    return;
  }
  if (Object.is(w.value, value)) return;
  w.value = value;
  try { w.callback?.(value, app.canvas, node); } catch (e) {  }
  node.graph?.setDirtyCanvas?.(true, true);
  node.setDirtyCanvas?.(true, true);
}

function chain(obj, key, fn) {
  const prev = obj[key];
  obj[key] = function (...args) {
    let out;
    try { out = prev?.apply(this, args); } catch (e) {  }
    try { fn.apply(this, args); } catch (e) { console.warn("[Krea2Skin]", e); }
    return out;
  };
}

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

const GALLERY_SKINS = [
  {
    id: "neon", name: "霓虹粉",
    bg1: "#1B0F33", bg2: "#0D0719", g1: "rgba(255,46,147,.20)",
    o: "#FF8A3D", p: "#FF2E93",
    grad: "linear-gradient(120deg,#FF3D71,#FF8A3D,#FFD166,#FF2E93,#8B2FF7,#FF3D71)",
    sw: "conic-gradient(#FF3D71,#FF8A3D,#FFD166,#FF2E93,#8B2FF7,#FF3D71)",
  },
  {
    id: "aurora", name: "极光青",
    bg1: "#0B2430", bg2: "#06131B", g1: "rgba(34,211,238,.20)",
    o: "#22D3EE", p: "#4ADE80",
    grad: "linear-gradient(120deg,#22D3EE,#4ADE80,#FFD166,#3B82F6,#8B2FF7,#22D3EE)",
    sw: "conic-gradient(#22D3EE,#4ADE80,#FFD166,#3B82F6,#8B2FF7,#22D3EE)",
  },
  {
    id: "lava", name: "熔岩红",
    bg1: "#2A0C0C", bg2: "#140505", g1: "rgba(255,61,113,.22)",
    o: "#FF6B35", p: "#E5322D",
    grad: "linear-gradient(120deg,#E5322D,#FF6B35,#FFD166,#FF2E93,#8B2FF7,#E5322D)",
    sw: "conic-gradient(#E5322D,#FF6B35,#FFD166,#FF2E93,#8B2FF7,#E5322D)",
  },
  {
    id: "jade", name: "翡翠绿",
    bg1: "#0B2418", bg2: "#05120C", g1: "rgba(74,222,128,.18)",
    o: "#4ADE80", p: "#22D3EE",
    grad: "linear-gradient(120deg,#4ADE80,#22D3EE,#FFD166,#10B981,#8B2FF7,#4ADE80)",
    sw: "conic-gradient(#4ADE80,#22D3EE,#FFD166,#10B981,#8B2FF7,#4ADE80)",
  },
  {
    id: "gold", name: "暗金",
    bg1: "#241B08", bg2: "#120D04", g1: "rgba(255,176,32,.20)",
    o: "#FFB020", p: "#FF8A3D",
    grad: "linear-gradient(120deg,#FFB020,#FFD166,#FF8A3D,#FF3D71,#8B2FF7,#FFB020)",
    sw: "conic-gradient(#FFB020,#FFD166,#FF8A3D,#FF3D71,#8B2FF7,#FFB020)",
  },
  {
    id: "galaxy", name: "星云紫",
    bg1: "#1A0F3A", bg2: "#090418", g1: "rgba(139,47,247,.26)",
    o: "#8B2FF7", p: "#22D3EE",
    grad: "linear-gradient(120deg,#8B2FF7,#22D3EE,#FF2E93,#FFD166,#4ADE80,#8B2FF7)",
    sw: "conic-gradient(#8B2FF7,#22D3EE,#FF2E93,#FFD166,#4ADE80,#8B2FF7)",
  },
];

let gallerySkin = "neon";
try {
  const saved = localStorage.getItem("k2g_skin");
  if (saved) gallerySkin = saved;
} catch (e) { }

function applyGallerySkin(winEl) {
  const s = GALLERY_SKINS.find((x) => x.id === gallerySkin) || GALLERY_SKINS[0];
  winEl.style.setProperty("--bg1", s.bg1);
  winEl.style.setProperty("--bg2", s.bg2);
  winEl.style.setProperty("--g1", s.g1);
  winEl.style.setProperty("--o", s.o);
  winEl.style.setProperty("--p", s.p);
  winEl.style.setProperty("--skin-grad", s.grad);
}


let cssDone = false;
function injectCSS() {
  if (cssDone) return;
  cssDone = true;

  const s = document.createElement("style");
  s.id = "krea2-skin-css";
  s.textContent = `
@property --k2a { syntax: '<angle>'; initial-value: 0deg; inherits: false; }

.k2-root{
  --o:${THEME.orange}; --p:${THEME.pink}; --v:${THEME.purple};
  --cy:${THEME.cyan};  --dg:${THEME.danger};
  --ln:rgba(255,255,255,.09); --tx:#EDE9FE; --dim:#9A90C4;
  --bg1:#191134; --bg2:#100B1F;
  --g1:rgba(255,46,147,.18); --g2:rgba(139,47,247,.22);
  box-sizing:border-box; width:100%; padding:10px;
  position:relative;
  height:auto !important; min-height:0; overflow:hidden;
  font:12px/1.45 "Segoe UI","PingFang SC","Microsoft YaHei",system-ui,sans-serif;
  color:var(--tx); border-radius:12px;
  background:
    radial-gradient(130% 90% at 100% 0%,  var(--g1), transparent 58%),
    radial-gradient(120% 85% at 0% 100%,  var(--g2), transparent 58%),
    linear-gradient(180deg,var(--bg1),var(--bg2));
  border:1px solid rgba(255,255,255,.075);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.07), 0 10px 30px rgba(0,0,0,.55);
}
.k2-root::after{content:"";position:absolute;inset:0;pointer-events:none;z-index:3;
  background:linear-gradient(105deg,transparent 30%,
    rgba(255,61,113,.16) 38%,
    rgba(255,138,61,.16) 43%,
    rgba(255,224,102,.18) 48%,
    rgba(74,222,128,.16) 53%,
    rgba(34,211,238,.18) 58%,
    rgba(139,47,247,.16) 63%,
    transparent 72%);
  transform:translateX(-130%);
  animation:k2sweep 7s linear infinite,k2hue 6s linear infinite;}
@keyframes k2sweep{0%{transform:translateX(-130%)}52%{transform:translateX(130%)}100%{transform:translateX(130%)}}
@keyframes k2hue{0%{filter:hue-rotate(0deg)}100%{filter:hue-rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.k2-root::after{animation:none;opacity:0;}}
.k2-root *{box-sizing:border-box;}


.k2-body{display:flex;flex-direction:column;flex:0 0 auto;width:100%;}


.k2-head{display:flex;align-items:center;gap:8px;padding-bottom:8px;border-bottom:1px solid var(--ln);}
.k2-dot{width:7px;height:7px;border-radius:50%;flex:0 0 auto;
  background:var(--o);box-shadow:0 0 9px var(--o);animation:k2pulse 2.6s ease-in-out infinite;}
@keyframes k2pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.82)}}
.k2-title{font-weight:800;font-size:12.5px;letter-spacing:.05em;
  background:linear-gradient(92deg,var(--o),var(--p) 52%,var(--v));
  -webkit-background-clip:text;background-clip:text;color:transparent;white-space:nowrap;}
.k2-sub{margin-left:auto;flex:0 0 auto;padding:3px 9px;border-radius:99px;
  font-size:10px;font-weight:700;letter-spacing:.06em;color:var(--dim);white-space:nowrap;
  border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.035);
  transition:color .18s,border-color .18s,background .18s,box-shadow .18s;}


.k2-sech{display:flex;align-items:center;gap:8px;margin:9px 0 6px;
  font-size:9.5px;letter-spacing:.16em;color:var(--dim);text-transform:uppercase;}
.k2-sech::after{content:"";flex:1;height:1px;
  background:linear-gradient(90deg,rgba(255,138,61,.55),rgba(139,47,247,.15),transparent);}


.k2-big.k2-wide{grid-column:1 / -1;}
.k2-big .k2-badge{position:absolute;top:6px;right:8px;padding:2px 7px;border-radius:99px;
  font:700 9.5px/1.35 inherit;letter-spacing:.04em;
  border:1px solid rgba(255,255,255,.14);background:rgba(0,0,0,.22);color:var(--dim);
  transition:color .18s,border-color .18s,background .18s;}
.k2-big.on .k2-badge{color:#fff;border-color:rgba(255,255,255,.34);background:rgba(0,0,0,.2);}

.k2-toprow{display:flex;align-items:center;gap:5px;max-width:100%;}
.k2-toprow .k2-badge{position:static;}
.k2-count{font:600 8.5px/1.2 inherit;letter-spacing:.02em;white-space:nowrap;
  color:var(--dim);padding:2px 6px;border-radius:99px;
  border:1px solid rgba(255,255,255,.14);background:rgba(0,0,0,.22);
  transition:color .18s,border-color .18s;}
.k2-big.on .k2-count{color:#fff;border-color:rgba(255,255,255,.3);}

.k2-big.k2-src.on{border-color:transparent;
  background:linear-gradient(115deg,var(--o),var(--p) 55%,var(--v));
  box-shadow:0 5px 18px rgba(255,46,147,.4),inset 0 0 0 1px rgba(255,255,255,.18);}
.k2-big.k2-src.on .k2-badge{color:#fff;border-color:rgba(255,255,255,.34);background:rgba(0,0,0,.2);}

.k2-big.k2-part{color:#FFD8A8;border-color:rgba(255,138,61,.5);background:rgba(255,138,61,.09);}
.k2-big.k2-part .k2-badge{color:#FFD8A8;border-color:rgba(255,216,168,.4);}


.k2-more{margin-top:6px;}
.k2-more>summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:6px;
  font-size:9.5px;letter-spacing:.16em;color:var(--dim);text-transform:uppercase;
  user-select:none;transition:color .16s;}
.k2-more>summary::-webkit-details-marker{display:none;}
.k2-more>summary::before{content:"\\25B8";font-size:9px;transition:transform .2s;}
.k2-more[open]>summary::before{transform:rotate(90deg);}
.k2-more>summary:hover{color:var(--tx);}
.k2-morebody{margin-top:7px;}


.k2-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;}
.k2-tile{position:relative;height:40px;padding:0;border-radius:9px;cursor:pointer;
  border:1px solid rgba(255,255,255,.1);
  background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.015));
  color:var(--dim);font:600 11px/1 inherit;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;
  transition:transform .16s cubic-bezier(.4,0,.2,1),color .16s,border-color .16s,box-shadow .16s;}
.k2-tile span{position:relative;z-index:1;}
.k2-tile .k2-n{font-size:14px;font-weight:800;letter-spacing:.02em;}
.k2-tile .k2-l{font-size:8.5px;letter-spacing:.12em;opacity:.7;}
.k2-tile:hover{transform:translateY(-1px);color:#fff;border-color:rgba(255,138,61,.55);}
.k2-tile:active{transform:translateY(0) scale(.97);}
.k2-tile.on{color:#fff;border-color:transparent;
  background:linear-gradient(150deg,var(--o),var(--p) 55%,var(--v));
  box-shadow:0 4px 16px rgba(255,46,147,.42),inset 0 0 0 1px rgba(255,255,255,.18);}
.k2-tile.on::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1.5px;
  background:conic-gradient(from var(--k2a),#FFD08A,#FF2E93,#8B2FF7,#22D3EE,#FFD08A);
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;
  animation:k2spin 3.4s linear infinite;pointer-events:none;}
@keyframes k2spin{to{--k2a:360deg;}}


.k2-duo{display:grid;grid-template-columns:repeat(6,1fr);gap:6px;}
.k2-duo .k2-big{font-size:10.5px;}
.k2-duo .k2-big .k2-sym{font-size:13px;}
.k2-big.k2-th{grid-column:span 2;}
.k2-big.k2-half{grid-column:span 3;}
.k2-duo .k2-big.k2-moss .k2-sym{font-size:10px;letter-spacing:-.01em;white-space:nowrap;}
.k2-big{position:relative;height:44px;padding:0;border-radius:10px;cursor:pointer;
  border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);
  color:var(--dim);font:600 11.5px/1.3 inherit;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;
  transition:all .18s cubic-bezier(.4,0,.2,1);}
.k2-big .k2-sym{font-size:14px;line-height:1;letter-spacing:.05em;}
.k2-big:hover{color:#fff;border-color:rgba(255,255,255,.24);}
.k2-big:active{transform:scale(.97);}
.k2-big.on{color:#fff;border-color:rgba(34,211,238,.6);
  background:linear-gradient(180deg,rgba(34,211,238,.22),rgba(34,211,238,.05));
  box-shadow:0 0 15px rgba(34,211,238,.3),inset 0 0 0 1px rgba(34,211,238,.2);}

.k2-big.on:not(.k2-danger):not(.k2-src)::before{
  content:"";position:absolute;inset:0;border-radius:inherit;padding:1.6px;
  background:conic-gradient(from var(--k2a),
    rgba(34,211,238,0)   0deg 270deg,
    rgba(34,211,238,.42) 292deg,
    #9BF6FF              318deg,
    #FFFFFF              334deg,
    rgba(34,211,238,.42) 350deg,
    rgba(34,211,238,0)   360deg);
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;
  animation:k2spin 2.8s linear infinite;pointer-events:none;}

.k2-big.k2-src.on::before{
  content:"";position:absolute;inset:0;border-radius:inherit;padding:1.6px;
  background:conic-gradient(from var(--k2a),
    rgba(255,138,61,0)   0deg 266deg,
    rgba(255,138,61,.5)  288deg,
    #FFD08A              312deg,
    #FFFFFF              330deg,
    #FF2E93              346deg,
    rgba(255,138,61,0)   360deg);
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;
  animation:k2spin 3.2s linear infinite;pointer-events:none;}


.k2-big.on.k2-danger{border-color:rgba(255,61,113,.85);
  background:linear-gradient(180deg,rgba(255,61,113,.3),rgba(255,61,113,.06));
  animation:k2flash 1.15s ease-in-out infinite;}
@keyframes k2flash{
  0%,100%{box-shadow:0 0 8px rgba(255,61,113,.3),inset 0 0 0 1px rgba(255,61,113,.25),inset 0 0 6px rgba(255,61,113,.12);
          filter:brightness(1);}
  50%{box-shadow:0 0 28px 4px rgba(255,61,113,.85),inset 0 0 0 1px rgba(255,61,113,.75),inset 0 0 20px rgba(255,61,113,.45);
      filter:brightness(1.35) saturate(1.3);}
}


.k2-big.on.k2-hz{border-color:rgba(139,47,247,.85);
  background:linear-gradient(180deg,rgba(139,47,247,.3),rgba(139,47,247,.06));
  box-shadow:0 0 15px rgba(139,47,247,.4),inset 0 0 0 1px rgba(139,47,247,.28);}
.k2-big.on.k2-hz:not(.k2-danger):not(.k2-src)::before{
  content:"";position:absolute;inset:0;border-radius:inherit;padding:1.6px;
  background:conic-gradient(from var(--k2a),
    rgba(139,47,247,0)   0deg 270deg,
    rgba(139,47,247,.45) 292deg,
    #C9A6FF              318deg,
    #FFFFFF              334deg,
    rgba(139,47,247,.45) 350deg,
    rgba(139,47,247,0)   360deg);
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;
  animation:k2spin 3s linear infinite;pointer-events:none;}


.k2-big.on.k2-kook{border-color:rgba(52,211,153,.85);
  background:linear-gradient(180deg,rgba(52,211,153,.3),rgba(52,211,153,.06));
  box-shadow:0 0 15px rgba(52,211,153,.4),inset 0 0 0 1px rgba(52,211,153,.28);}
.k2-big.on.k2-kook:not(.k2-danger):not(.k2-src)::before{
  content:"";position:absolute;inset:0;border-radius:inherit;padding:1.6px;
  background:conic-gradient(from var(--k2a),
    rgba(52,211,153,0)   0deg 270deg,
    rgba(52,211,153,.45) 292deg,
    #A7F3D0              318deg,
    #FFFFFF              334deg,
    rgba(52,211,153,.45) 350deg,
    rgba(52,211,153,0)   360deg);
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;
  animation:k2spin 3s linear infinite;pointer-events:none;}


.k2-big.on.k2-sfw{border-color:rgba(56,189,248,.85);
  background:linear-gradient(180deg,rgba(56,189,248,.3),rgba(56,189,248,.06));
  box-shadow:0 0 15px rgba(56,189,248,.4),inset 0 0 0 1px rgba(56,189,248,.28);}
.k2-big.on.k2-sfw:not(.k2-danger):not(.k2-src)::before{
  content:"";position:absolute;inset:0;border-radius:inherit;padding:1.6px;
  background:conic-gradient(from var(--k2a),
    rgba(56,189,248,0)   0deg 270deg,
    rgba(56,189,248,.45) 292deg,
    #BAE6FD              318deg,
    #FFFFFF              334deg,
    rgba(56,189,248,.45) 350deg,
    rgba(56,189,248,0)   360deg);
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;
  animation:k2spin 2.6s linear infinite;pointer-events:none;}


.k2-big.on.k2-p19{border-color:rgba(255,176,32,.85);
  background:linear-gradient(180deg,rgba(255,176,32,.3),rgba(255,176,32,.06));
  box-shadow:0 0 15px rgba(255,176,32,.4),inset 0 0 0 1px rgba(255,176,32,.28);}
.k2-big.on.k2-p19:not(.k2-danger):not(.k2-src)::before{
  content:"";position:absolute;inset:0;border-radius:inherit;padding:1.6px;
  background:conic-gradient(from var(--k2a),
    rgba(255,176,32,0)   0deg 270deg,
    rgba(255,176,32,.5)  292deg,
    #FFE9A8              318deg,
    #FFFFFF              334deg,
    rgba(255,176,32,.5)  350deg,
    rgba(255,176,32,0)   360deg);
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;
  animation:k2spin 3.6s linear infinite;pointer-events:none;}


.k2-big.on.k2-cn,.k2-big.on.k2-moss{border-color:transparent;
  background:linear-gradient(180deg,rgba(255,255,255,.13),rgba(255,255,255,.03));
  box-shadow:0 0 16px rgba(255,255,255,.16),inset 0 0 0 1px rgba(255,255,255,.2);}
.k2-big.on.k2-cn:not(.k2-danger):not(.k2-src)::before,.k2-big.on.k2-moss:not(.k2-danger):not(.k2-src)::before{
  content:"";position:absolute;inset:0;border-radius:inherit;padding:1.8px;
  background:conic-gradient(from var(--k2a),
    #FF3D71 0deg, #FF8A3D 52deg, #FFE066 104deg, #4ADE80 156deg,
    #22D3EE 208deg, #6366F1 260deg, #A855F7 312deg, #FF3D71 360deg);
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;
  animation:k2spin 2.2s linear infinite,k2rain 4s linear infinite;pointer-events:none;}
@keyframes k2rain{0%{filter:saturate(1.15) brightness(1)}50%{filter:saturate(1.6) brightness(1.22)}100%{filter:saturate(1.15) brightness(1)}}
.k2-big.on.k2-cn .k2-sym,.k2-big.on.k2-moss .k2-sym{
  background:linear-gradient(92deg,#FF3D71,#FF8A3D,#FFE066,#4ADE80,#22D3EE,#A855F7,#FF3D71);
  background-size:280% 100%;
  -webkit-background-clip:text;background-clip:text;color:transparent;
  animation:k2slide 3.2s linear infinite;}
@keyframes k2slide{0%{background-position:0% 50%}100%{background-position:280% 50%}}


.k2-row{display:flex;gap:6px;align-items:stretch;}
.k2-tgl{flex:0 0 auto;display:inline-flex;align-items:center;gap:7px;height:34px;
  padding:0 11px;border-radius:8px;cursor:pointer;border:1px solid rgba(255,255,255,.1);
  background:rgba(255,255,255,.03);color:var(--dim);font:600 11px inherit;
  white-space:nowrap;transition:all .18s;}
.k2-tgl .k2-track{width:29px;height:16px;border-radius:99px;flex:0 0 auto;position:relative;
  background:rgba(255,255,255,.13);transition:background .2s;}
.k2-tgl .k2-knob{position:absolute;top:2px;left:2px;width:12px;height:12px;border-radius:50%;
  background:#8B86A8;transition:left .2s,background .2s;}
.k2-tgl.on{color:#fff;border-color:rgba(255,138,61,.55);background:rgba(255,138,61,.1);}
.k2-tgl.on .k2-track{background:linear-gradient(90deg,var(--o),var(--p));}
.k2-tgl.on .k2-knob{left:15px;background:#fff;box-shadow:0 0 8px #fff;}

.k2-in{flex:1;min-width:0;height:34px;padding:0 10px;border-radius:8px;
  border:1px solid rgba(255,255,255,.1);background:rgba(8,6,16,.72);color:var(--tx);
  font:12px inherit;outline:none;transition:border-color .16s,box-shadow .16s;}
.k2-in::placeholder{color:rgba(154,144,196,.55);}
.k2-in:focus{border-color:var(--p);box-shadow:0 0 0 3px rgba(255,46,147,.16);}


.k2-adv{margin-top:9px;border-top:1px solid var(--ln);padding-top:8px;}
.k2-adv>summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:6px;
  font-size:9.5px;letter-spacing:.16em;color:var(--dim);text-transform:uppercase;
  user-select:none;transition:color .16s;}
.k2-adv>summary::-webkit-details-marker{display:none;}
.k2-adv>summary::before{content:"\\25B8";font-size:9px;transition:transform .2s;}
.k2-adv[open]>summary::before{transform:rotate(90deg);}
.k2-adv>summary:hover{color:var(--tx);}
.k2-advbody{margin-top:9px;display:flex;flex-direction:column;gap:8px;}
.k2-f{display:flex;flex-direction:column;gap:4px;}
.k2-fl{font-size:9.5px;letter-spacing:.1em;color:var(--dim);text-transform:uppercase;}
.k2-inwrap{display:flex;gap:6px;align-items:stretch;}
.k2-mini{flex:0 0 auto;height:34px;padding:0 12px;border-radius:8px;cursor:pointer;
  border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);
  color:var(--dim);font:700 12px inherit;transition:all .16s;}
.k2-mini:hover{color:#fff;border-color:rgba(255,138,61,.55);background:rgba(255,138,61,.1);}
.k2-mini:active{transform:scale(.95);}


.k2-seg{display:flex;height:34px;padding:2px;border-radius:8px;gap:2px;
  background:rgba(255,255,255,.05);}
.k2-seg>button{flex:1;border:none;border-radius:6px;cursor:pointer;background:transparent;
  color:var(--dim);font:600 11px inherit;transition:all .18s;}
.k2-seg>button:hover{color:#fff;background:rgba(255,255,255,.07);}
.k2-seg>button.on{color:#fff;background:linear-gradient(135deg,var(--o),var(--p));
  box-shadow:0 2px 10px rgba(255,46,147,.4);}


.k2-foot{margin-top:9px;padding-top:8px;border-top:1px solid var(--ln);
  display:flex;align-items:center;gap:7px;font-size:10.5px;color:var(--dim);}
.k2-chip{padding:3px 8px;border-radius:99px;white-space:nowrap;
  border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.035);}
.k2-chip.k2-hot,.k2-sub.k2-hot{color:#FFD8A8;border-color:rgba(255,138,61,.45);
  background:rgba(255,138,61,.12);box-shadow:0 0 10px rgba(255,138,61,.18);}
.k2-chip.k2-zero,.k2-sub.k2-zero{color:#7A7299;}
.k2-warn{margin-top:7px;font-size:10px;line-height:1.5;color:rgba(154,144,196,.8);}


.k2-seedrow{display:flex;gap:6px;align-items:stretch;}
.k2-seedin{flex:1;min-width:0;height:34px;padding:0 10px;border-radius:8px;
  border:1px solid rgba(255,138,61,.34);background:rgba(8,6,16,.72);
  color:#FFD8A8;font:700 13.5px/1 ui-monospace,Consolas,"Courier New",monospace;
  letter-spacing:.03em;outline:none;transition:border-color .16s,box-shadow .16s;}
.k2-seedin:focus{border-color:var(--o);box-shadow:0 0 0 3px rgba(255,138,61,.18);}
.k2-seedin::-webkit-outer-spin-button,
.k2-seedin::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
.k2-seedin{-moz-appearance:textfield;}
.k2-seedtag{flex:0 0 auto;align-self:center;height:24px;padding:0 10px;border-radius:99px;
  white-space:nowrap;font:700 10px inherit;color:var(--dim);cursor:pointer;user-select:none;
  border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.035);
  transition:filter .16s,border-color .16s,background .16s;}
.k2-seedtag:hover{filter:brightness(1.3);}
.k2-seedtag:active{transform:translateY(1px);}
.k2-seedtag.k2-fix{color:#FFD8A8;border-color:rgba(255,138,61,.45);
  background:rgba(255,138,61,.12);}
.k2-seedtag.k2-rand{color:#7DE3C0;border-color:rgba(125,227,192,.3);
  background:rgba(125,227,192,.08);}
.k2-seedtag.k2-pending{color:#2A1A00;background:#FFD08A;border-color:#FFD08A;
  animation:k2pending 1s ease-in-out infinite;}
@keyframes k2pending{0%,100%{opacity:1}50%{opacity:.5}}
.k2-seedin.k2-onfixed{border-color:rgba(255,138,61,.55);background:rgba(255,138,61,.08);}

.k2-draw{margin-top:9px;padding-top:9px;border-top:1px solid var(--ln);}
.k2-dhead{display:flex;align-items:center;gap:6px;margin-bottom:7px;}
.k2-dhead .k2-sech{flex:1;margin:0;min-width:0;}
.k2-rare{flex:0 0 auto;padding:2px 9px;border-radius:99px;white-space:nowrap;
  font:800 10px/1.5 inherit;letter-spacing:.1em;border:1px solid;}
.k2-rare.r-R,.k2-hr.r-R{color:#7DE3C0;border-color:rgba(125,227,192,.45);background:rgba(125,227,192,.1);}
.k2-rare.r-SR,.k2-hr.r-SR{color:#C4A6FF;border-color:rgba(178,140,255,.5);background:rgba(139,47,247,.16);}
.k2-hr.r-R,.k2-hr.r-SR,.k2-hr.r-SSR{border:1px solid;padding:1px 6px;}
.k2-rare.r-SSR,.k2-hr.r-SSR{color:#FFE2A8;border-color:rgba(255,209,102,.6);background:rgba(255,168,0,.16);}
.k2-rare.r-SSR{animation:k2ssr 1.8s ease-in-out infinite;}
@keyframes k2ssr{0%,100%{box-shadow:0 0 8px rgba(255,197,66,.22)}50%{box-shadow:0 0 18px rgba(255,197,66,.62)}}
.k2-card{position:relative;border-radius:11px;padding:9px 10px;min-height:70px;
  border:1px solid rgba(255,255,255,.1);
  background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.015));
  transform-style:preserve-3d;backface-visibility:hidden;}
.k2-card.k2-flip{animation:k2flip .6s cubic-bezier(.22,1,.36,1);}
@keyframes k2flip{from{transform:perspective(720px) rotateY(-92deg) scale(.94);opacity:0}
  to{transform:perspective(720px) rotateY(0) scale(1);opacity:1}}
.k2-card.r-SR{border-color:rgba(178,140,255,.4);}
.k2-card.r-SSR{border-color:rgba(255,209,102,.5);
  background:linear-gradient(180deg,rgba(255,190,80,.13),rgba(255,255,255,.02));}
.k2-dtxt{margin:0;max-height:88px;overflow:auto;white-space:pre-wrap;word-break:break-word;
  font:11.5px/1.55 "Segoe UI","PingFang SC","Microsoft YaHei",system-ui,sans-serif;color:var(--tx);}
.k2-dtxt::-webkit-scrollbar{width:6px;}
.k2-dtxt::-webkit-scrollbar-thumb{background:rgba(255,255,255,.16);border-radius:99px;}
.k2-dmeta{display:flex;flex-wrap:wrap;gap:5px;margin-top:7px;}
.k2-dmeta>span{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  padding:2px 8px;border-radius:99px;font:600 9.5px/1.5 inherit;color:var(--dim);
  border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.035);}
.k2-dbar{display:flex;align-items:center;gap:5px;margin-top:7px;overflow-x:auto;scrollbar-width:none;}
.k2-dsp{flex:1;min-width:0;}
.k2-dbtn{flex:0 0 auto;height:24px;padding:0 7px;border-radius:99px;cursor:pointer;white-space:nowrap;
  font:700 10px/1 inherit;color:var(--dim);border:1px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.04);transition:color .16s,border-color .16s,background .16s;}
.k2-dbtn:hover{color:var(--tx);border-color:rgba(255,255,255,.26);}
.k2-dbtn.k2-glow{position:relative;overflow:hidden;color:#fff;border:1px solid transparent;
  font-weight:700;letter-spacing:.4px;text-shadow:0 0 7px rgba(255,255,255,.6);
  background:
    linear-gradient(135deg,rgba(26,12,48,.86),rgba(26,12,48,.86)) padding-box,
    linear-gradient(90deg,#FF3D71,#FF8A3D,#FFD166,#4ADE80,#22D3EE,#8B2FF7,#FF2E93,#FF3D71) border-box;
  background-size:100% 100%,300% 100%;
  box-shadow:
    0 0 0 1px rgba(255,61,113,.66),
    0 0 9px rgba(255,61,113,.62),
    0 0 20px rgba(34,211,238,.42),
    0 0 34px rgba(139,47,247,.34),
    inset 0 0 12px rgba(255,255,255,.12);
  animation:k2gRainbow 2.2s linear infinite,k2gNeon 2.6s ease-in-out infinite;}
.k2-dbtn.k2-glow::after{content:"";position:absolute;top:0;left:0;width:46%;height:100%;
  background:linear-gradient(100deg,transparent,rgba(255,255,255,.68),transparent);
  transform:translateX(-160%);opacity:0;pointer-events:none;
  animation:k2gSweep 2.4s ease-in-out infinite;}
.k2-dbtn.k2-glow:hover{color:#fff;
  background:
    linear-gradient(135deg,rgba(52,26,86,.92),rgba(52,26,86,.92)) padding-box,
    linear-gradient(90deg,#FF3D71,#FF8A3D,#FFD166,#4ADE80,#22D3EE,#8B2FF7,#FF2E93,#FF3D71) border-box;
  background-size:100% 100%,300% 100%;
  box-shadow:
    0 0 0 1px rgba(255,255,255,.5),
    0 0 14px rgba(255,61,113,.8),
    0 0 28px rgba(34,211,238,.6),
    0 0 46px rgba(139,47,247,.5),
    inset 0 0 16px rgba(255,255,255,.2);}
@keyframes k2gRainbow{
  0%{background-position:0 0,0% 50%;}
  100%{background-position:0 0,300% 50%;}
}
@keyframes k2gNeon{
  0%,100%{filter:brightness(1);}
  50%{filter:brightness(1.32);}
}
@keyframes k2gSweep{
  0%{transform:translateX(-160%);opacity:0;}
  55%{transform:translateX(-160%);opacity:0;}
  65%{opacity:.85;}
  88%{transform:translateX(320%);opacity:0;}
  100%{transform:translateX(320%);opacity:0;}
}
.k2-dbtn.k2-on{color:#FFD8A8;border-color:rgba(255,138,61,.45);background:rgba(255,138,61,.12);}
.k2-hist{margin-top:7px;display:none;}
.k2-hist.k2-open{display:block;}
.k2-hlist{display:flex;flex-direction:column;gap:5px;max-height:128px;overflow:auto;}
.k2-hlist::-webkit-scrollbar{width:6px;}
.k2-hlist::-webkit-scrollbar-thumb{background:rgba(255,255,255,.16);border-radius:99px;}
.k2-hitem{display:flex;align-items:center;gap:6px;padding:5px 8px;border-radius:8px;cursor:pointer;
  border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);
  transition:border-color .16s,background .16s;}
.k2-hitem:hover{border-color:rgba(255,138,61,.4);background:rgba(255,138,61,.08);}
.k2-hitem .k2-hr{flex:0 0 auto;padding:1px 6px;border-radius:99px;font:800 8.5px/1.5 inherit;}
.k2-hitem .k2-hs{flex:0 0 auto;font:600 9px/1.5 inherit;color:var(--dim);white-space:nowrap;}
.k2-hitem .k2-ht{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  font:10.5px/1.5 inherit;color:var(--tx);}
.k2-dempty{padding:4px 2px;font-size:10.5px;color:#7A7299;}

.k2-dbar{flex-wrap:nowrap;}
.k2-dbar::-webkit-scrollbar{display:none;}
.k2-big::after,.k2-tile::after{content:"";position:absolute;inset:0;border-radius:inherit;
  pointer-events:none;opacity:0;transition:opacity .2s;
  background:radial-gradient(84px circle at var(--mx,50%) var(--my,50%),rgba(255,255,255,.2),transparent 62%);}
.k2-big:hover::after,.k2-tile:hover::after{opacity:1;}
.k2-tile::after{background:radial-gradient(64px circle at var(--mx,50%) var(--my,50%),
  rgba(255,255,255,.18),transparent 62%);}

.k2-roll{position:relative;display:inline-block;overflow:hidden;vertical-align:bottom;white-space:nowrap;}
.k2-roll>span{display:block;}
.k2-roll>.k2-rin{animation:k2rin .34s cubic-bezier(.22,1,.36,1);}
.k2-roll>.k2-rout{position:absolute;left:0;top:0;animation:k2rout .34s cubic-bezier(.22,1,.36,1);}
@keyframes k2rin{from{transform:translateY(105%);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes k2rout{from{transform:translateY(0);opacity:1}to{transform:translateY(-105%);opacity:0}}
@media (prefers-reduced-motion:reduce){
  .k2-roll>.k2-rin,.k2-roll>.k2-rout{animation:none;}
  .k2-roll>.k2-rout{display:none;}
}

.k2g-mask{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;
  background:rgba(6,4,14,.66);backdrop-filter:blur(8px);opacity:0;transition:opacity .16s ease-out;}
.k2g-mask.on{opacity:1;}
.k2g-win{position:relative;width:min(1600px,98vw);height:min(1020px,95vh);display:flex;flex-direction:column;border-radius:16px;
  overflow:hidden;transform:translateY(12px);transition:transform .18s cubic-bezier(.22,1,.36,1);
  background:
    radial-gradient(60% 46% at 10% 0%, var(--g1,#191134), transparent 62%),
    radial-gradient(56% 44% at 92% 100%, var(--g1,#191134), transparent 60%),
    linear-gradient(180deg,var(--bg1,#191134),var(--bg2,#100B1F));
  border:1px solid rgba(255,255,255,.1);
  box-shadow:0 30px 90px rgba(0,0,0,.72),inset 0 1px 0 rgba(255,255,255,.08);color:#EDE9FE;
  font:12px/1.45 "Segoe UI","PingFang SC","Microsoft YaHei",system-ui,sans-serif;}
.k2g-mask.on .k2g-win{transform:translateY(0);}
.k2g-head{display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid rgba(255,255,255,.08);
  background:linear-gradient(90deg,var(--g1,rgba(255,46,147,.18)),transparent 62%);}
.k2g-title{font-size:14px;font-weight:600;letter-spacing:.4px;white-space:nowrap;}
.k2g-count{font-size:11px;color:#9A90C4;font-variant-numeric:tabular-nums;white-space:nowrap;}
.k2g-bar{width:96px;height:4px;border-radius:2px;background:rgba(255,255,255,.08);overflow:hidden;flex:0 0 auto;}
.k2g-bar>i{display:block;height:100%;width:0;border-radius:2px;background:linear-gradient(90deg,var(--o,#FF8A3D),var(--p,#FF2E93));transition:width .2s;}
.k2g-search{flex:1;min-width:110px;max-width:280px;height:30px;padding:0 10px;border-radius:8px;
  border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.28);color:#EDE9FE;font:12px/1 inherit;outline:none;}
.k2g-search:focus{border-color:var(--o,#FF8A3D);box-shadow:0 0 0 2px rgba(255,138,61,.14);}
.k2g-x{width:30px;height:30px;border-radius:8px;border:1px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.04);color:#EDE9FE;cursor:pointer;font-size:15px;line-height:1;flex:0 0 auto;}
.k2g-x:hover{background:rgba(255,61,113,.18);border-color:rgba(255,61,113,.5);}
.k2g-warn{display:none;align-items:center;gap:8px;padding:9px 18px;font-size:12px;color:#FFD9DE;
  background:linear-gradient(90deg,rgba(255,61,113,.3),rgba(255,61,113,.05));border-bottom:1px solid rgba(255,61,113,.38);}
.k2g-warn.on{display:flex;}
.k2g-warn b{color:#fff;}
.k2g-tools{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:10px 18px;border-bottom:1px solid rgba(255,255,255,.07);}
.k2g-chip{padding:5px 11px;border-radius:99px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);
  color:#B9AFE0;font:11px/1 inherit;cursor:pointer;transition:all .12s;}
.k2g-chip:hover{border-color:rgba(255,255,255,.3);color:#EDE9FE;}
.k2g-sort{height:26px;padding:0 7px;border-radius:8px;font:11px/1 inherit;color:#E6DFFF;
  cursor:pointer;outline:none;background:rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.16);transition:border-color .12s;}
.k2g-sort:hover{border-color:rgba(255,255,255,.32);}
.k2g-sort option{background:#1B1333;color:#EDE9FE;}
.k2g-chip.on{color:#12071F;background:linear-gradient(135deg,var(--o,#FF8A3D),var(--p,#FF2E93));border-color:transparent;font-weight:600;}
.k2g-sp{flex:1;}
.k2g-act{height:30px;padding:0 12px;border-radius:8px;border:1px solid rgba(255,255,255,.14);
  background:rgba(255,255,255,.05);color:#EDE9FE;font:11px/1 inherit;cursor:pointer;transition:all .12s;}
.k2g-act:hover{border-color:var(--o,#FF8A3D);box-shadow:0 0 12px rgba(255,138,61,.18);}
.k2g-grid{flex:1;overflow:auto;padding:16px 18px 22px;display:grid;
  grid-template-columns:repeat(auto-fill,minmax(270px,1fr));grid-auto-rows:max-content;
  gap:18px;align-content:start;}
.k2g-grid.k2g-compact{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;}
@media (max-width:760px){
  .k2g-grid{grid-template-columns:repeat(auto-fill,minmax(140px,1fr));}
}
.k2g-card{position:relative;display:flex;flex-direction:column;border-radius:12px;overflow:hidden;background:rgba(255,255,255,.035);
  border:1px solid rgba(255,255,255,.09);transition:transform .14s ease,border-color .14s,box-shadow .14s;}
.k2g-card::before{content:"";position:absolute;inset:0;border-radius:12px;padding:1px;pointer-events:none;z-index:2;
  background:var(--skin-grad,linear-gradient(120deg,#FF3D71,#FF8A3D,#FFD166,#FF2E93,#8B2FF7,#FF3D71));
  background-size:300% 100%;
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;
  opacity:.72;
  animation:k2gFlow 7s linear infinite;
  animation-delay:calc(var(--i,0) * -0.42s);
  transition:opacity .16s;}
.k2g-card:hover{transform:translateY(-2px);border-color:transparent;box-shadow:0 12px 30px rgba(0,0,0,.55),0 0 18px rgba(139,92,246,.32);}
.k2g-card:hover::before{opacity:1;animation-duration:2.2s;animation-delay:0s;}
@keyframes k2gFlow{0%{background-position:0% 50%;}100%{background-position:300% 50%;}}
.k2g-skin{position:relative;flex:0 0 auto;z-index:9;}
.k2g-skin-btn{height:26px;padding:0 11px;border-radius:99px;cursor:pointer;display:inline-flex;
  align-items:center;gap:6px;border:1px solid rgba(255,255,255,.18);background:rgba(20,12,38,.92);
  color:#EDE9FE;font:10.5px/1 inherit;box-shadow:0 4px 14px rgba(0,0,0,.45);backdrop-filter:blur(8px);
  transition:border-color .14s,box-shadow .14s;}
.k2g-skin-btn:hover{border-color:rgba(255,255,255,.42);box-shadow:0 8px 26px rgba(139,92,246,.4);}
.k2g-skin-btn>i{width:12px;height:12px;border-radius:50%;flex:0 0 auto;
  background:conic-gradient(#FF3D71,#FF8A3D,#FFD166,#4ADE80,#22D3EE,#8B2FF7,#FF2E93,#FF3D71);
  box-shadow:0 0 7px rgba(255,255,255,.4);}
.k2g-skin-pop{position:absolute;right:0;bottom:calc(100% + 9px);display:none;width:186px;padding:7px;z-index:40;
  border-radius:12px;border:1px solid rgba(255,255,255,.14);background:rgba(18,10,34,.97);
  box-shadow:0 18px 44px rgba(0,0,0,.72);backdrop-filter:blur(12px);}
.k2g-skin-pop.on{display:block;}
.k2g-skin-item{display:flex;align-items:center;gap:9px;padding:7px 9px;border-radius:8px;
  cursor:pointer;font-size:11px;color:#CFC7EA;border:1px solid transparent;transition:all .12s;}
.k2g-skin-item:hover{background:rgba(255,255,255,.07);}
.k2g-skin-item.on{border-color:rgba(255,255,255,.3);background:rgba(255,255,255,.06);color:#fff;}
.k2g-skin-item>i{width:16px;height:16px;border-radius:5px;flex:0 0 auto;
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.28),0 0 8px rgba(0,0,0,.4);}
.k2g-thumb{position:relative;width:100%;height:275px;flex:0 0 auto;background:rgba(0,0,0,.3);
  overflow:hidden;cursor:zoom-in;}
.k2g-thumb img{width:100%;height:100%;object-fit:cover;object-position:center 26%;display:block;transition:transform .25s ease;}
.k2g-card:hover .k2g-thumb img{transform:scale(1.02);}
.k2g-grid::-webkit-scrollbar{width:9px;}
.k2g-grid::-webkit-scrollbar-thumb{background:rgba(255,255,255,.16);border-radius:5px;}
.k2g-grid::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,.28);}
.k2g-grid::-webkit-scrollbar-track{background:transparent;}
.k2g-thumb.none{display:flex;align-items:center;justify-content:center;color:#6B6191;font-size:11px;cursor:default;}
.k2g-star{position:absolute;top:7px;right:7px;width:26px;height:26px;border-radius:50%;border:0;
  background:rgba(0,0,0,.42);color:#9A90C4;cursor:pointer;font-size:13px;line-height:26px;text-align:center;backdrop-filter:blur(4px);}
.k2g-star.on{color:#FFD166;text-shadow:0 0 10px rgba(255,209,102,.6);}
.k2g-dup{position:absolute;top:8px;right:39px;z-index:4;height:20px;padding:0 8px;border-radius:99px;
  border:1px solid rgba(255,209,102,.55);background:rgba(38,20,8,.8);color:#FFD166;
  font:700 10px/18px inherit;cursor:pointer;backdrop-filter:blur(4px);
  box-shadow:0 3px 10px rgba(0,0,0,.5);transition:filter .14s,transform .14s;}
.k2g-dup:hover{filter:brightness(1.25);transform:translateY(-1px);}
.k2g-body{padding:9px 10px 6px;display:flex;flex-direction:column;gap:5px;}
.k2g-txt{margin:0;font-size:11px;line-height:1.5;color:#D8D2F0;display:-webkit-box;-webkit-line-clamp:2;
  -webkit-box-orient:vertical;overflow:hidden;word-break:break-word;min-height:33px;}
.k2g-meta{display:flex;gap:6px;font-size:10px;color:#8A80B4;align-items:center;flex-wrap:wrap;}
.k2g-acts{display:flex;border-top:1px solid rgba(255,255,255,.07);}
.k2g-acts button{flex:1;height:30px;border:0;background:transparent;color:#9A90C4;font:10px/1 inherit;cursor:pointer;
  transition:background .12s,color .12s;}
.k2g-acts button:hover{background:rgba(255,255,255,.07);color:#EDE9FE;}
.k2g-acts button.dg:hover{background:rgba(255,61,113,.18);color:#FF8FA3;}
.k2g-empty{grid-column:1/-1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;
  padding:70px 0;color:#6B6191;}
.k2g-ei{font-size:34px;opacity:.5;}
.k2g-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 18px;border-top:1px solid rgba(255,255,255,.07);
  font-size:11px;color:#7F75A8;}
.k2g-fhint{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.k2g-pager{display:flex;align-items:center;gap:6px;flex:0 0 auto;}
.k2g-pg{width:24px;height:22px;border-radius:6px;cursor:pointer;border:1px solid rgba(255,255,255,.14);
  background:rgba(255,255,255,.05);color:#CFC7EA;font:14px/1 inherit;padding:0;}
.k2g-pg:hover:not(:disabled){border-color:rgba(255,255,255,.4);color:#fff;}
.k2g-pg:disabled{opacity:.3;cursor:default;}
.k2g-pinfo{font-size:11px;color:#9A90C4;font-variant-numeric:tabular-nums;min-width:54px;text-align:center;}
.k2g-day{grid-column:1/-1;display:flex;align-items:center;gap:10px;margin:8px 0 2px;
  font:600 11px/1 inherit;color:#8E85B8;letter-spacing:.5px;}
.k2g-day>i{flex:1;height:1px;background:linear-gradient(90deg,rgba(139,92,246,.45),transparent);}
.k2g-pick{position:absolute;left:8px;top:8px;z-index:3;width:22px;height:22px;border-radius:6px;
  display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;
  border:1px solid rgba(255,255,255,.42);background:rgba(10,6,20,.55);color:#fff;
  font:700 12px/1 inherit;opacity:0;transition:opacity .14s,background .14s;backdrop-filter:blur(4px);}
.k2g-card:hover .k2g-pick{opacity:1;}
.k2g-pick.on{opacity:1;background:#8B5CF6;border-color:#C4B5FD;box-shadow:0 0 10px rgba(139,92,246,.8);}
.k2g-selbar{position:absolute;left:50%;bottom:44px;transform:translateX(-50%) translateY(8px);
  display:none;align-items:center;gap:8px;padding:8px 12px;border-radius:12px;z-index:8;
  background:rgba(20,12,38,.96);border:1px solid rgba(139,92,246,.45);
  box-shadow:0 14px 38px rgba(0,0,0,.7),0 0 20px rgba(139,92,246,.28);
  backdrop-filter:blur(12px);opacity:0;transition:opacity .16s,transform .16s;}
.k2g-selbar.on{display:flex;opacity:1;transform:translateX(-50%) translateY(0);}
.k2g-selc{font-size:11px;color:#DDD5F5;white-space:nowrap;padding-right:2px;}
.k2g-selbar>button{height:26px;padding:0 12px;border-radius:99px;cursor:pointer;
  border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);
  color:#D9D2F0;font:11px/1 inherit;transition:all .12s;white-space:nowrap;}
.k2g-selbar>button:hover{border-color:rgba(255,255,255,.4);color:#fff;}
.k2g-selbar>button.dg{color:#FF9AA8;border-color:rgba(255,61,113,.42);background:rgba(255,61,113,.12);}
.k2g-selbar>button.dg:hover{background:rgba(255,61,113,.24);color:#fff;}
.k2g-grid.k2g-compact .k2g-body,
.k2g-grid.k2g-compact .k2g-acts{display:none;}
.k2g-grid.k2g-compact .k2g-thumb{height:180px;}
.k2g-grid.k2g-compact .k2g-card{border-radius:10px;}
.k2g-thumb[data-param]::after{content:"⚙";position:absolute;left:7px;top:7px;width:20px;height:20px;
  border-radius:6px;background:rgba(16,10,32,.82);color:#FFD08A;font-size:11px;line-height:20px;text-align:center;
  pointer-events:none;border:1px solid rgba(255,208,138,.42);}
.k2g-full{position:absolute;inset:0;z-index:5;display:flex;
  background:linear-gradient(180deg,var(--bg1,#191134),var(--bg2,#100B1F));}
.k2g-det{display:flex;width:100%;height:100%;min-height:0;}
.k2g-det-img{position:relative;flex:1;min-width:0;display:flex;align-items:center;justify-content:center;
  padding:20px;overflow:hidden;background:rgba(0,0,0,.32);}
.k2g-det-img img{width:100%;height:100%;object-fit:contain;border-radius:8px;
  box-shadow:0 20px 60px rgba(0,0,0,.7);cursor:default;}
.k2g-det-none{font-size:11px;line-height:1.6;color:#8A80B4;padding:9px 10px;border-radius:8px;
  border:1px dashed rgba(255,255,255,.14);background:rgba(255,255,255,.025);}
.k2g-det-ph{display:flex;align-items:center;justify-content:center;color:#9A90C4;font-size:12px;
  width:100%;height:100%;}
.k2g-det-nav{position:absolute;top:50%;transform:translateY(-50%);width:34px;height:44px;border-radius:9px;
  border:1px solid rgba(255,255,255,.16);background:rgba(18,10,34,.82);color:#EDE9FE;font:20px/1 inherit;
  cursor:pointer;z-index:2;}
.k2g-det-nav:hover{border-color:var(--o,#FF8A3D);}
.k2g-det-nav:disabled{opacity:.25;cursor:default;}
.k2g-det-nav.prev{left:14px;}
.k2g-det-nav.next{right:14px;}
.k2g-det-side{width:320px;flex:0 0 320px;display:flex;flex-direction:column;min-height:0;
  border-left:1px solid rgba(255,255,255,.1);
  background:linear-gradient(180deg,var(--bg1,#191134),var(--bg2,#100B1F));}
.k2g-det-top{display:flex;align-items:center;gap:10px;padding:12px 14px;
  border-bottom:1px solid rgba(255,255,255,.08);}
.k2g-det-top b{font-size:13px;font-weight:600;}
.k2g-det-top span{font-size:11px;color:#9A90C4;font-variant-numeric:tabular-nums;}
.k2g-det-x{margin-left:auto;width:26px;height:26px;border-radius:7px;border:1px solid rgba(255,255,255,.14);
  background:rgba(255,255,255,.05);color:#EDE9FE;font:16px/1 inherit;cursor:pointer;}
.k2g-det-x:hover{border-color:var(--p,#FF2E93);}
.k2g-det-scroll{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:12px;}
.k2g-det-sec{font-size:10.5px;letter-spacing:.6px;color:#9A90C4;margin-bottom:-4px;}
.k2g-det-prompt{margin:0;padding:10px 11px;border-radius:9px;border:1px solid rgba(255,255,255,.1);
  background:rgba(255,255,255,.035);font:11.5px/1.7 inherit;color:#EDE9FE;white-space:pre-wrap;
  word-break:break-word;max-height:180px;overflow:auto;}
.k2g-det-kv{display:grid;grid-template-columns:74px minmax(0,1fr);gap:7px 10px;font-size:11.5px;}
.k2g-det-kv>span:nth-child(odd){color:#9A90C4;}
.k2g-det-kv>span:nth-child(even){color:#EDE9FE;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.k2g-det-kv>span.wide{grid-column:1/-1;white-space:normal;overflow:visible;text-overflow:clip;
  overflow-wrap:anywhere;word-break:break-word;line-height:1.6;padding:1px 0 3px;color:#EDE9FE;}
.k2g-det-stage{display:flex;align-items:center;gap:8px;font-size:11px;font-weight:600;letter-spacing:.5px;
  color:#FFD08A;padding:2px 0;}
.k2g-det-stage:before{content:"";width:3px;height:13px;border-radius:2px;flex:0 0 auto;
  background:linear-gradient(180deg,var(--o,#FF8A3D),var(--p,#FF2E93));}
.k2g-det-acts{display:flex;flex-wrap:wrap;gap:5px;padding:12px 14px 42px;
  border-top:1px solid rgba(255,255,255,.08);}
.k2g-det-acts>*{height:30px;padding:0 7px;border-radius:8px;border:1px solid rgba(255,255,255,.14);
  background:rgba(255,255,255,.05);color:#EDE9FE;font:11px/28px inherit;cursor:pointer;
  text-decoration:none;display:inline-flex;align-items:center;transition:border-color .12s;}
.k2g-det-acts>*:hover{border-color:var(--o,#FF8A3D);}
.k2g-det-acts>.dg:hover{border-color:#FF3D71;color:#FF8FA3;}
@media (max-width:900px){
  .k2g-det-side{width:250px;flex-basis:250px;}
}
.k2g-conf{position:absolute;inset:0;z-index:6;display:flex;align-items:center;justify-content:center;
  background:rgba(4,2,10,.8);backdrop-filter:blur(4px);padding:20px;}
.k2g-cbox{width:min(420px,90%);border-radius:14px;padding:20px;background:linear-gradient(180deg,var(--bg1,#191134),var(--bg2,#100B1F));
  border:1px solid rgba(255,255,255,.12);box-shadow:0 24px 60px rgba(0,0,0,.7);}
.k2g-ct{font-size:14px;font-weight:600;margin-bottom:8px;}
.k2g-cp{font-size:11.5px;line-height:1.75;color:#A79CCE;margin:0 0 12px;}
.k2g-cw{font-size:11px;line-height:1.6;color:#FF8FA3;background:rgba(255,61,113,.1);
  border:1px solid rgba(255,61,113,.28);border-radius:8px;padding:8px 10px;margin-bottom:14px;}
.k2g-cb{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;}
.k2g-btn{height:32px;padding:0 14px;border-radius:8px;border:1px solid rgba(255,255,255,.14);
  background:rgba(255,255,255,.05);color:#EDE9FE;font:12px/1 inherit;cursor:pointer;transition:all .12s;}
.k2g-btn:hover{border-color:rgba(255,255,255,.32);}
.k2g-btn.dg{background:linear-gradient(135deg,#FF3D71,#C2185B);border-color:transparent;color:#fff;font-weight:600;}
.k2g-btn.dg:hover{filter:brightness(1.08);}
.k2g-btn.pri{background:linear-gradient(135deg,var(--o,#FF8A3D),var(--p,#FF2E93));border-color:transparent;color:#12071F;font-weight:600;}
.k2g-form{display:flex;flex-direction:column;gap:11px;}
.k2g-lb{font-size:11px;color:#9A90C4;margin-bottom:4px;display:block;}
.k2g-in{width:100%;border-radius:8px;border:1px solid rgba(255,255,255,.13);background:rgba(0,0,0,.3);
  color:#EDE9FE;font:12px/1.5 inherit;padding:8px 10px;outline:none;box-sizing:border-box;}
.k2g-in:focus{border-color:var(--o,#FF8A3D);}
textarea.k2g-in{min-height:92px;resize:vertical;}
.k2g-file{font-size:11px;color:#9A90C4;}
@media (prefers-reduced-motion:reduce){
  .k2g-mask,.k2g-win,.k2g-card,.k2g-thumb img{transition:none;}
  .k2g-card:hover{transform:none;}
  .k2-dbtn.k2-glow,.k2-dbtn.k2-glow::after{animation:none;}
}

`;
  document.head.appendChild(s);
}


function hideWidget(w) {
  if (!w || w.__k2hidden) return;
  w.__k2hidden = true;
  w.__k2orig = {
    type: w.type,
    draw: w.draw,
    computeSize: w.computeSize,
    hidden: w.options?.hidden,
    showLabel: w.options?.showLabel,
    wHidden: w.hidden,
  };

  if (w.options?.hidden === true) {
    w.hidden = true;
    w.y = 0;
    return;
  }

  w.hidden = true;
  w.type = "hidden";
  w.options = Object.assign({}, w.options, { hidden: true, showLabel: false });
  w.draw = () => undefined;
  w.computeSize = () => [0, -4];
  w.y = 0;
}

function unhideWidget(w) {
  if (!w || !w.__k2hidden) return;
  w.__k2hidden = false;
  const o = w.__k2orig || {};
  if (o.type !== undefined) w.type = o.type;
  if (o.draw !== undefined) w.draw = o.draw;
  if (o.computeSize !== undefined) w.computeSize = o.computeSize;
  if (o.hidden !== undefined) w.options.hidden = o.hidden;
  else delete w.options.hidden;
  if (o.wHidden !== undefined) w.hidden = o.wHidden;
  else delete w.hidden;
  delete w.__k2orig;
}


function buildPanel(node) {
  const root = el("div", "k2-root");
  const body = el("div", "k2-body");
  root.appendChild(body);

  const head = el("div", "k2-head");
  const chipTotal = el("div", "k2-sub", `0 / ${PART_COUNT + 7}`);
  head.append(el("div", "k2-dot"), el("div", "k2-title", "SOURCE DECK"), chipTotal);
  body.appendChild(head);

  body.appendChild(el("div", "k2-sech", "特殊模式 / MODE · 八选一"));
  const duo = el("div", "k2-duo");
  const bigCN = el("button", "k2-big k2-cn k2-th");
  bigCN.type = "button";
  bigCN.title = "超强中文模式：追加 part-zc.json 的中文强化词库\n" +
                "八选一：开这个会自动关掉 NSFW、KOOK、SFW、19+、大呲花、Krea2-Moss-Anima 和杂项(12 源)";
  bigCN.append(el("span", "k2-sym", "ZH"), el("span", null, "超强中文模式"));
  bigCN.onclick = () => {
    const next = !readW(node, W_NAME.cn, false);
    writeW(node, W_NAME.cn, next);
    if (next) applyExclusive(node, "cn");   
    sync();
  };

  const bigNS = el("button", "k2-big k2-danger k2-th");
  bigNS.type = "button";
  bigNS.title = "NSFW：追加 part13.json 词库\n" +
                "八选一：开这个会自动关掉超强中文模式、KOOK、SFW、19+、大呲花、Krea2-Moss-Anima 和杂项(12 源)";
  bigNS.append(el("span", "k2-sym", "18+"));
  bigNS.onclick = () => {
    const next = !readW(node, W_NAME.nsfw, false);
    writeW(node, W_NAME.nsfw, next);
    if (next) applyExclusive(node, "nsfw");
    sync();
  };

  const bigKOOK = el("button", "k2-big k2-kook k2-th");
  bigKOOK.type = "button";
  bigKOOK.title = "KOOK：加载 part-hz2.json（共 " + HZ2_SIZE + " 条）\n" +
                  "八选一：开这个会自动关掉超强中文模式、NSFW、SFW、19+、大呲花、Krea2-Moss-Anima 和杂项(12 源)";
  const kookTop = el("span", "k2-toprow");
  kookTop.append(el("span", "k2-sym", "KOOK"), el("span", "k2-count", HZ2_SIZE + " 条"));
  bigKOOK.append(kookTop);
  bigKOOK.onclick = () => {
    const next = !readW(node, W_NAME.hz2, false);
    writeW(node, W_NAME.hz2, next);
    if (next) applyExclusive(node, "hz2");
    sync();
  };

  const bigSFW = el("button", "k2-big k2-sfw k2-th");
  bigSFW.type = "button";
  bigSFW.title = "SFW：加载 part-sfw.json（共 " + SFW_SIZE + " 条，桌面 SFW2300 词库）\n" +
                 "八选一：开这个会自动关掉超强中文模式、NSFW、KOOK、19+、大呲花、Krea2-Moss-Anima 和杂项(12 源)";
  const sfwTop = el("span", "k2-toprow");
  sfwTop.append(el("span", "k2-sym", "SFW"), el("span", "k2-count", SFW_SIZE + " 条"));
  bigSFW.append(sfwTop);
  bigSFW.onclick = () => {
    const next = !readW(node, W_NAME.sfw, false);
    writeW(node, W_NAME.sfw, next);
    if (next) applyExclusive(node, "sfw");
    sync();
  };

  const big19 = el("button", "k2-big k2-p19 k2-th");
  big19.type = "button";
  big19.title = "19+：加载 part-19.json（共 " + P19_SIZE + " 条，Bunny 三包合一）\n" +
                "八选一：开这个会自动关掉超强中文模式、NSFW、KOOK、SFW、大呲花、Krea2-Moss-Anima 和杂项(12 源)";
  const p19Top = el("span", "k2-toprow");
  p19Top.append(el("span", "k2-sym", "19+"), el("span", "k2-count", P19_SIZE + " 条"));
  big19.append(p19Top);
  big19.onclick = () => {
    const next = !readW(node, W_NAME.p19, false);
    writeW(node, W_NAME.p19, next);
    if (next) applyExclusive(node, "p19");
    sync();
  };

  const bigMisc = el("button", "k2-big k2-src k2-th");
  bigMisc.type = "button";
  bigMisc.title =
    `杂项 = 12 个词库合一（part01..part12.json，共 ${PART_TOTAL} 条）\n` +
    `开启后：single 模式从这 ${PART_COUNT} 个词库里随机抽 1 条；` +
    `concat 模式这 ${PART_COUNT} 个词库各抽 1 条再拼接。\n` +
    `点一下 = 12 个全开；再点一下 = 全关。单独挑词库请展开下面的「细分 12 源」。\n` +
    `八选一：开这个会自动关掉超强中文模式、NSFW、KOOK、SFW、19+、大呲花和 Krea2-Moss-Anima`;
  const mMiscBadge = el("span", "k2-badge", `0 / ${PART_COUNT}`);
  const miscTop = el("span", "k2-toprow");
  miscTop.append(el("span", "k2-sym", "MISC"), mMiscBadge);
  bigMisc.append(miscTop);
  bigMisc.onclick = () => {
    const next = miscState(node) !== "all";
    for (let i = 1; i <= PART_COUNT; i++) writeW(node, partName(i), next);
    if (next) applyExclusive(node, "misc");  
    sync();
  };

  const bigHZ1 = el("button", "k2-big k2-hz k2-half");
  bigHZ1.type = "button";
  bigHZ1.title = "大呲花提示词汇总（纯抽卡模式）：加载 part-hz1.json（共 " + HZ1_SIZE + " 条）\n" +
                 "八选一：开这个会自动关掉超强中文模式、NSFW、KOOK、SFW、19+、Krea2-Moss-Anima 和杂项(12 源)";
  const dzTop = el("span", "k2-toprow");
  dzTop.append(el("span", "k2-sym", "大呲花"), el("span", "k2-count", HZ1_SIZE + " 条"));
  bigHZ1.append(dzTop);
  bigHZ1.onclick = () => {
    const next = !readW(node, W_NAME.hz1, false);
    writeW(node, W_NAME.hz1, next);
    if (next) applyExclusive(node, "hz1");
    sync();
  };

  const bigMoss = el("button", "k2-big k2-moss k2-half");
  bigMoss.type = "button";
  bigMoss.title = "Krea2-Moss-Anima：加载 part-moss-anima.json（共 " + MOSS_SIZE + " 条美化提示词）\n" +
                  "八选一：开这个会自动关掉超强中文模式、NSFW、KOOK、SFW、19+、大呲花和杂项(12 源)";
  const mossTop = el("span", "k2-toprow");
  mossTop.append(el("span", "k2-sym", "Krea2-Moss-Anima"));
  bigMoss.append(mossTop, el("span", "k2-count", MOSS_SIZE + " 条"));
  bigMoss.onclick = () => {
    const next = !readW(node, W_NAME.moss, false);
    writeW(node, W_NAME.moss, next);
    if (next) applyExclusive(node, "moss");
    sync();
  };

  duo.append(bigCN, bigNS, bigKOOK, bigSFW, big19, bigMisc, bigHZ1, bigMoss);
  body.appendChild(duo);

  const more = el("details", "k2-more");
  more.appendChild(el("summary", null, "细分 12 源 / DETAIL"));
  const moreBody = el("div", "k2-morebody");
  const grid = el("div", "k2-grid");
  const tiles = [];
  for (let i = 1; i <= PART_COUNT; i++) {
    const t = el("button", "k2-tile");
    t.type = "button";
    t.title = `提示词${i} —— part${String(i).padStart(2, "0")}.json，${PART_SIZES[i - 1]} 条。点击切换启用状态`;
    t.append(el("span", "k2-n", String(i).padStart(2, "0")), el("span", "k2-l", "PART"));
    t.onclick = () => {
      const cur = !!readW(node, partName(i), false);
      writeW(node, partName(i), !cur);
      if (!cur) applyExclusive(node, "misc");
      sync();
    };
    tiles.push(t);
    grid.appendChild(t);
  }
  moreBody.appendChild(grid);
  more.appendChild(moreBody);
  body.appendChild(more);

  body.appendChild(el("div", "k2-sech", "触发词 / TRIGGER"));
  const row = el("div", "k2-row");
  const tgl = el("button", "k2-tgl");
  tgl.type = "button";
  tgl.title = "打开后，把下面的触发词拼在提示词最前面";
  const track = el("div", "k2-track");
  track.appendChild(el("div", "k2-knob"));
  tgl.append(track, el("span", null, "启用"));
  tgl.onclick = () => { writeW(node, W_NAME.trigOn, !readW(node, W_NAME.trigOn, false)); sync(); };

  const trigInput = el("input", "k2-in");
  trigInput.type = "text";
  trigInput.placeholder = "留空则不生效，例如：masterpiece, best quality";
  trigInput.oninput = () => writeW(node, W_NAME.trigTx, trigInput.value);
  trigInput.onchange = () => writeW(node, W_NAME.trigTx, trigInput.value);

  row.append(tgl, trigInput);
  body.appendChild(row);

  body.appendChild(el("div", "k2-sech", "随机种子 / SEED"));
  const seedWrap = el("div", "k2-seedrow");
  const seedInput = el("input", "k2-seedin");
  seedInput.type = "text";
  seedInput.inputMode = "numeric";
  seedInput.spellcheck = false;
  seedInput.title = "种子值：手填数字即固定该种子；留 0 = 每次运行随机";
  seedInput.value = String(Number(readW(node, W_NAME.seed, 0)) || 0);
  seedInput.addEventListener("input", () => {
    const raw = String(seedInput.value || "").replace(/[^\d]/g, "");
    const v = Math.min(4294967295, parseInt(raw || "0", 10) || 0);
    setSeedMode(v > 0);
    writeW(node, W_NAME.seed, v);
    paintSeed();
  });
  ["pointerdown", "mousedown", "wheel", "keydown", "keyup", "dblclick", "contextmenu"].forEach((t) =>
    seedInput.addEventListener(t, (e) => { try { e.stopPropagation(); } catch (_) { } }));

  const stopEvt = (e) => {
    if (!e) return;
    try { e.preventDefault(); } catch (_) { }
    try { e.stopPropagation(); } catch (_) { }
    try { e.stopImmediatePropagation && e.stopImmediatePropagation(); } catch (_) { }
  };

  const ctrlOf = () => (node.widgets || []).find((w) => w.name === "control_after_generate") || null;

  const lockCtrl = () => {
    const c = ctrlOf();
    if (!c) return;
    if (c.value === "fixed") return;
    c.value = "fixed";
    try { c.callback?.("fixed", app.canvas, node); } catch (_) { }
    try { node.graph?.setDirtyCanvas?.(true, false); } catch (_) { }
  };

  const SEED_FIXED_PROP = "__k2SeedFixed";

  let seedModeManual = false;

  const autoSeedMode = () => {
    if (seedModeManual) return;
    if (!node.properties) node.properties = {};
    if (typeof node.properties[SEED_FIXED_PROP] === "boolean") return;
    const idx = (node.widgets || []).findIndex((w) => w.name === W_NAME.seed);
    const fromWorkflow = Array.isArray(node.widgets_values) && node.widgets_values.length > 0;
    let base = 0;
    if (fromWorkflow && idx >= 0) base = Number(node.widgets_values[idx]) || 0;
    else if (fromWorkflow) base = Number(readW(node, W_NAME.seed, 0)) || 0;
    node.properties[SEED_FIXED_PROP] = base > 0;
  };
  autoSeedMode();
  chain(node, "onConfigure", function () { autoSeedMode(); paintSeed(); renderHist(); });

  const seedMode = () =>
    (node.properties && node.properties[SEED_FIXED_PROP] === true) ? "fixed" : "rand";

  const setSeedMode = (fixed) => {
    seedModeManual = true;
    if (!node.properties) node.properties = {};
    node.properties[SEED_FIXED_PROP] = !!fixed;
  };

  const isFixed = () => seedMode() === "fixed";

  const rollSeed = () => {
    writeW(node, W_NAME.seed, Math.floor(Math.random() * 0xFFFFFFFF));
    paintSeed();
  };

  const installSeedHook = () => {
    const sw = findWidget(node, W_NAME.seed);
    if (!sw || sw.__k2SeedHook) return;
    sw.__k2SeedHook = true;
    const prev = sw.beforeQueued;
    sw.beforeQueued = function (...a) {
      if (seedMode() !== "fixed") rollSeed();
      try { if (prev) prev.apply(this, a); } catch (_) { }
    };
  };

  const setFixed = (on) => {
    setSeedMode(on);
    const cur = Number(readW(node, W_NAME.seed, 0)) || 0;
    if (on && !cur) writeW(node, W_NAME.seed, Math.floor(Math.random() * 0xFFFFFFFF));
    lockCtrl();
    paintSeed();
    sync();
  };

  const btnRoll = el("button", "k2-mini", "\u21BB 随机");
  btnRoll.type = "button";
  btnRoll.title = "立刻换一颗随机种子";
  btnRoll.addEventListener("pointerdown", (e) => stopEvt(e), true);
  btnRoll.addEventListener("mousedown", (e) => stopEvt(e), true);
  btnRoll.addEventListener("click", (e) => {
    stopEvt(e);
    rollSeed();
    sync();
  });

  const seedTag = el("button", "k2-seedtag", "随机中");
  seedTag.type = "button";
  seedTag.addEventListener("pointerdown", (e) => stopEvt(e), true);
  seedTag.addEventListener("mousedown", (e) => stopEvt(e), true);
  seedTag.addEventListener("click", (e) => {
    stopEvt(e);
    setFixed(!isFixed());
    paintSeed();
    sync();
  });
  seedWrap.append(seedInput, btnRoll, seedTag);
  body.appendChild(seedWrap);

  function paintSeed() {
    const w = Number(readW(node, W_NAME.seed, 0)) || 0;
    if (document.activeElement !== seedInput) seedInput.value = String(w);
    const fixed = isFixed();
    seedTag.textContent = fixed ? "已固定" : "随机中";
    seedTag.classList.toggle("k2-fix", fixed);
    seedTag.classList.toggle("k2-rand", !fixed);
    seedInput.classList.toggle("k2-onfixed", fixed);
    seedTag.title = fixed
      ? `已锁定：每次运行都用种子 ${w}\n点一下切回随机（每次运行自动换一颗）`
      : `随机中：每次运行自动换一颗并显示出来\n点一下锁定当前值 ${w}`;
  }

  const adv = el("details", "k2-adv");
  adv.appendChild(el("summary", null, "高级参数 / ADVANCED"));
  const advBody = el("div", "k2-advbody");

  const fDir = el("div", "k2-f");
  fDir.appendChild(el("div", "k2-fl", "词库目录 prompt_dir"));
  const dirInput = el("input", "k2-in");
  dirInput.type = "text";
  dirInput.oninput = () => writeW(node, W_NAME.dir, dirInput.value);
  dirInput.onchange = () => writeW(node, W_NAME.dir, dirInput.value);
  fDir.appendChild(dirInput);
  advBody.appendChild(fDir);


  const fMode = el("div", "k2-f");
  fMode.appendChild(el("div", "k2-fl", "输出模式 mode"));
  const seg = el("div", "k2-seg");
  const segSingle = el("button", null, "单条 single");
  const segConcat = el("button", null, "拼接 concat");
  segSingle.onclick = () => { writeW(node, W_NAME.mode, "single"); sync(); };
  segConcat.onclick = () => { writeW(node, W_NAME.mode, "concat"); sync(); };
  seg.append(segSingle, segConcat);
  fMode.appendChild(seg);
  advBody.appendChild(fMode);

  const fSep = el("div", "k2-f");
  fSep.appendChild(el("div", "k2-fl", "拼接分隔符 separator"));
  const sepInput = el("input", "k2-in");
  sepInput.type = "text";
  sepInput.oninput = () => writeW(node, W_NAME.sep, sepInput.value);
  sepInput.onchange = () => writeW(node, W_NAME.sep, sepInput.value);
  fSep.appendChild(sepInput);
  advBody.appendChild(fSep);

  const fStrict = el("div", "k2-f");
  fStrict.appendChild(el("div", "k2-fl", "严格单图 · 检测到多个 SaveImage 时报错"));
  const segStrict = el("div", "k2-seg");
  const stOn = el("button", null, "开启");
  const stOff = el("button", null, "关闭");
  stOn.onclick = () => { writeW(node, "严格单图", true); paintAdv(); };
  stOff.onclick = () => { writeW(node, "严格单图", false); paintAdv(); };
  segStrict.append(stOn, stOff);
  fStrict.appendChild(segStrict);
  advBody.appendChild(fStrict);

  const fAuto = el("div", "k2-f");
  fAuto.appendChild(el("div", "k2-fl", "自动存档（默认开启）· 运行结束把词和图存进词图库"));
  const segAuto = el("div", "k2-seg");
  const auOn = el("button", null, "开启");
  const auOff = el("button", null, "关闭");
  auOn.onclick = () => { if (!node.properties) node.properties = {}; node.properties.__k2AutoSave = true; paintAdv(); };
  auOff.onclick = () => { if (!node.properties) node.properties = {}; node.properties.__k2AutoSave = false; paintAdv(); };
  segAuto.append(auOn, auOff);
  fAuto.appendChild(segAuto);
  advBody.appendChild(fAuto);

  function paintAdv() {
    const strict = readW(node, "严格单图", true);
    stOn.classList.toggle("on", !!strict);
    stOff.classList.toggle("on", !strict);
    const props = node.properties || {};
    const auto = typeof props.__k2AutoSave === "boolean" ? props.__k2AutoSave : true;
    auOn.classList.toggle("on", auto);
    auOff.classList.toggle("on", !auto);
  }
  paintAdv();

  adv.appendChild(advBody);
  body.appendChild(adv);

  const refit = () => scheduleFit(node, root, body, true);
  more.addEventListener("toggle", refit);
  adv.addEventListener("toggle", refit);

  const foot = el("div", "k2-foot");
  const chipMode = el("div", "k2-chip k2-zero", "尚未选择词库");
  foot.appendChild(chipMode);

  const tipText = String(readW(node, W_NAME.tip, "") || "").trim();
  const chipTip = el("div", "k2-chip", "?");
  chipTip.style.marginLeft = "auto";
  chipTip.style.cursor = "help";
  chipTip.style.padding = "3px 9px";
  if (tipText) chipTip.title = tipText;
  else chipTip.style.display = "none";
  foot.appendChild(chipTip);

  body.appendChild(foot);

  const drawWrap = el("div", "k2-draw");
  const drawHead = el("div", "k2-dhead");
  drawHead.appendChild(el("div", "k2-sech", "抽卡结果 / DRAW"));
  const rareTag = el("div", "k2-rare r-R", "R");
  rareTag.style.display = "none";
  drawHead.appendChild(rareTag);
  drawWrap.appendChild(drawHead);

  const cardBox = el("div", "k2-card");
  const cardTxt = el("div", "k2-dtxt", "运行一次后，这里会翻出抽到的卡。");
  cardBox.appendChild(cardTxt);
  drawWrap.appendChild(cardBox);

  const metaRow = el("div", "k2-dmeta");
  drawWrap.appendChild(metaRow);

  const btnBar = el("div", "k2-dbar");
  const btnCopy = el("button", "k2-dbtn", "复制");
  btnCopy.type = "button";
  const btnSkip = el("button", "k2-dbtn", "跳字");
  btnSkip.type = "button";
  const btnHist = el("button", "k2-dbtn", "历史 0");
  btnHist.type = "button";
  const btnSfx = el("button", "k2-dbtn", "音效");
  btnSfx.type = "button";
  btnSfx.title = "抽卡音效（默认开）\n开：翻牌声、SSR 专属音、按钮点击声\n关：批量排队时更安静";
  const btnTheme = el("button", "k2-dbtn", "配色");
  btnTheme.type = "button";
  btnTheme.title = "切换面板配色（8 套）：霓虹 / 赛博蓝 / 暗金 / 极光 / 樱粉 / 深海 / 熔岩 / 幻紫";
  const btnGallery = el("button", "k2-dbtn k2-glow", "词图库");
  btnGallery.type = "button";
  btnGallery.title = "我的词图库：看图 / 复制 / 删除 / 手动添加 / 导出";
  btnBar.append(btnCopy, btnSkip, btnSfx, btnTheme, btnGallery, btnHist);

  btnSfx.classList.toggle("k2-on", sfxOn);
  applyTheme(root);

  btnSfx.addEventListener("click", () => {
    sfxOn = !sfxOn;
    storeSet("k2_sfx", sfxOn ? "1" : "0");
    btnSfx.classList.toggle("k2-on", sfxOn);
    sfx(sfxOn ? "on" : "off");
  });

  btnTheme.addEventListener("click", () => {
    themeIdx = (themeIdx + 1) % THEMES.length;
    storeSet("k2_theme", String(themeIdx));
    applyTheme(root);
    btnTheme.textContent = THEMES[themeIdx].name;
    setTimeout(() => { btnTheme.textContent = "配色"; }, 1100);
  });
  drawWrap.appendChild(btnBar);

  const histBox = el("div", "k2-hist");
  const histList = el("div", "k2-hlist");
  histBox.appendChild(histList);
  drawWrap.appendChild(histBox);
  body.appendChild(drawWrap);

  const SRC_KEY = {
    "超强中文": W_NAME.cn,
    "18+": W_NAME.nsfw,
    "大呲花": W_NAME.hz1,
    "KOOK": W_NAME.hz2,
    "SFW": W_NAME.sfw,
    "19+": W_NAME.p19,
    "Krea2-Moss-Anima": W_NAME.moss,
  };

  let drawLast = "";
  let typeTimer = null;

  const stopType = () => {
    if (typeTimer) { clearInterval(typeTimer); typeTimer = null; }
  };

  const typeOut = (text) => {
    stopType();
    if (!text) { cardTxt.textContent = ""; return; }
    if (text.length > 300) { cardTxt.textContent = text; return; }
    let i = 0;
    cardTxt.textContent = "";
    const step = Math.max(1, Math.ceil(text.length / 55));
    typeTimer = setInterval(() => {
      i += step;
      if (i >= text.length) { cardTxt.textContent = text; stopType(); return; }
      cardTxt.textContent = text.slice(0, i);
    }, 16);
  };

  const histArr = () => {
    if (!node.properties) node.properties = {};
    if (!Array.isArray(node.properties.__k2Hist)) node.properties.__k2Hist = [];
    return node.properties.__k2Hist;
  };

  const clearKids = (box) => {
    while (box.firstChild) box.removeChild(box.firstChild);
  };

  const renderHist = () => {
    const arr = histArr();
    btnHist.textContent = `历史 ${arr.length}`;
    clearKids(histList);
    if (!arr.length) {
      histList.appendChild(el("div", "k2-dempty", "还没有记录，运行一次就有了"));
      return;
    }
    for (const it of arr.slice().reverse()) {
      const row = el("div", "k2-hitem");
      row.title = `${it.src} · 种子 ${it.seed}\n${it.text}\n点一下回填这个种子`;
      row.appendChild(el("span", "k2-hr r-" + it.r, it.r));
      row.appendChild(el("span", "k2-hs", it.src));
      row.appendChild(el("span", "k2-ht", it.text));
      row.addEventListener("click", () => {
        writeW(node, W_NAME.seed, Number(it.seed) || 0);
        if (!node.properties) node.properties = {};
        node.properties.__k2SeedFixed = (Number(it.seed) || 0) > 0;
        const key = SRC_KEY[it.src];
        if (key) {
          for (const k of Object.values(SRC_KEY)) {
            if (k !== key) writeW(node, k, false);
          }
          writeW(node, key, true);
        }
        sync();
      });
      histList.appendChild(row);
    }
  };

  btnSkip.addEventListener("click", () => {
    if (drawLast) { stopType(); cardTxt.textContent = drawLast; }
  });

  btnCopy.addEventListener("click", () => {
    const s = drawLast || cardTxt.textContent || "";
    try { navigator.clipboard.writeText(s); } catch (e) { }
    btnCopy.textContent = "已复制";
    setTimeout(() => { btnCopy.textContent = "复制"; }, 1200);
  });

  btnHist.addEventListener("click", () => {
    const open = !histBox.classList.contains("k2-open");
    histBox.classList.toggle("k2-open", open);
    btnHist.classList.toggle("k2-on", open);
    scheduleFit(node, root, body, true);
  });

  let drawStamp = "";
  let drawAt = 0;
  const applyDraw = (payload) => {
    const lines = String(payload || "").split("\n");
    if (lines.length < 4) return;
    const text = lines[0];
    const src = lines[1] || "-";
    const rr = lines[2] || "R";
    const sd = lines[3] || "0";
    const size = lines[4] || "0";
    const stamp = sd + "|" + src + "|" + text;
    const now = Date.now();
    if (stamp === drawStamp && now - drawAt < 1500) return;
    drawStamp = stamp;
    drawAt = now;
    drawLast = text;

    rareTag.style.display = "";
    rareTag.className = "k2-rare r-" + rr;
    rareTag.textContent = rr;
    cardBox.className = "k2-card k2-flip r-" + rr;
    setTimeout(() => cardBox.classList.remove("k2-flip"), 700);
    sfx(rr === "SSR" ? "ssr" : "flip");

    typeOut(text);

    clearKids(metaRow);
    const chips = [`来源 ${src}`, `种子 ${sd}`, `池 ${size} 条`, `${text.length} 字`];
    for (const c of chips) metaRow.appendChild(el("span", null, c));

    const arr = histArr();
    arr.push({ text: text.slice(0, 400), r: rr, src, seed: sd });
    K2G_PENDING.set(node.id, { prompt: text, seed: sd, source: src, rarity: rr, at: Date.now() });
    if (arr.length > 20) arr.splice(0, arr.length - 20);
    renderHist();
    scheduleFit(node, root, body, true);
  };

  renderHist();

  let galleryMask = null;
  let galleryItems = [];
  let galleryQ = "";
  let gallerySrc = "";
  let galleryStar = false;
  let galleryDup = false;
  let dupKey = "";
  let gallerySort = "new";
  let galleryPage = 1;
  let gallerySel = new Set();
  let galleryCompact = false;
  const GALLERY_PAGE_SIZE = 60;

  const closeGallery = () => {
    if (!galleryMask) return;
    const mask = galleryMask;
    galleryMask = null;
    mask.classList.remove("on");
    setTimeout(() => { try { mask.remove(); } catch (e) { } }, 180);
  };

  const gReq = async (url, opts) => {
    const res = await api.fetchApi(url, opts);
    let data = null;
    try { data = await res.json(); } catch (e) { data = null; }
    if (!res.ok) throw new Error((data && data.error) || ("HTTP " + res.status));
    return data;
  };

  const gCopy = async (text, btn) => {
    try {
      await navigator.clipboard.writeText(String(text || ""));
      if (btn) {
        const old = btn.textContent;
        btn.textContent = "已复制";
        setTimeout(() => { btn.textContent = old; }, 900);
      }
      return true;
    } catch (e) {
      if (btn) btn.textContent = "失败";
      return false;
    }
  };

  const gReuse = (item) => {
    writeW(node, W_NAME.seed, Number(item.seed) || 0);
    if (!node.properties) node.properties = {};
    node.properties.__k2SeedFixed = (Number(item.seed) || 0) > 0;
    const key = SRC_KEY[item.source];
    if (key) {
      for (const k of Object.values(SRC_KEY)) if (k !== key) writeW(node, k, false);
      writeW(node, key, true);
    }
    sync();
    paintSeed();
    closeGallery();
  };

  const gRemove = async (item, purge) => {
    await gReq("/luori/k2/gallery/" + encodeURIComponent(item.id) + (purge ? "?mode=purge" : ""), { method: "DELETE" });
    galleryItems = galleryItems.filter((x) => x.id !== item.id);
    return galleryItems.length;
  };

  const openGallery = async (opts = {}) => {
    if (galleryMask) { closeGallery(); return; }
    let detailStep = null;
    const mask = el("div", "k2g-mask");
    applyTheme(mask);
    const win = el("div", "k2g-win");
    applyGallerySkin(win);
    mask.appendChild(win);
    galleryMask = mask;
    document.body.append(mask);
    requestAnimationFrame(() => mask.classList.add("on"));
    mask.addEventListener("click", (ev) => { if (ev.target === mask) closeGallery(); });
    const onKey = (ev) => {
      if (!galleryMask) { document.removeEventListener("keydown", onKey); return; }
      const detail = win.querySelector(".k2g-full");
      if (ev.key === "Escape") {
        const conf = win.querySelector(".k2g-conf");
        if (conf) { conf.remove(); return; }
        if (detail) { detail.remove(); detailStep = null; return; }
        closeGallery();
        return;
      }
      if (detail && detailStep && (ev.key === "ArrowLeft" || ev.key === "ArrowRight")) {
        ev.preventDefault();
        detailStep(ev.key === "ArrowLeft" ? -1 : 1);
      }
    };
    document.addEventListener("keydown", onKey);

    const head = el("div", "k2g-head");
    head.appendChild(el("div", "k2g-title", "🗂 我的词图库"));
    const countEl = el("div", "k2g-count", "读取中…");
    const bar = el("div", "k2g-bar");
    const barFill = el("i");
    bar.appendChild(barFill);
    const search = el("input", "k2g-search");
    search.placeholder = "搜索提示词 / 种子 / 来源";
    search.spellcheck = false;
    search.oninput = () => { galleryQ = search.value.trim().toLowerCase(); galleryPage = 1; render(); };
    const btnX = el("button", "k2g-x", "×");
    btnX.type = "button";
    btnX.onclick = closeGallery;
    head.append(countEl, bar, el("div", "k2g-sp"), search, btnX);

    const warn = el("div", "k2g-warn");
    const warnIcon = el("b", null, "⚠");
    const warnText = el("span");
    warn.append(warnIcon, warnText);

    const tools = el("div", "k2g-tools");
    const srcChips = [];
    const srcList = [["", "全部"], ["文生图", "文生图"], ["超强中文", "超强中文"],
                     ["18+", "18+"], ["大呲花", "大呲花"],
                     ["KOOK", "KOOK"], ["SFW", "SFW"], ["19+", "19+"],
                     ["Krea2-Moss-Anima", "Moss-Anima"], ["手动", "手动"]];
    const knownSrc = new Set(srcList.map((x) => x[0]));
    for (const [value, label] of srcList) {
      const chip = el("button", "k2g-chip" + (value === gallerySrc ? " on" : ""), label);
      chip.type = "button";
      chip.onclick = () => {
        gallerySrc = value;
        galleryPage = 1;
        for (const c of srcChips) c.classList.toggle("on", c.dataset.v === value);
        render();
      };
      chip.dataset.v = value;
      srcChips.push(chip);
      tools.appendChild(chip);
    }
    const chipStar = el("button", "k2g-chip", "★ 收藏");
    chipStar.type = "button";
    chipStar.onclick = () => { galleryStar = !galleryStar; chipStar.classList.toggle("on", galleryStar); galleryPage = 1; render(); };
    const chipDup = el("button", "k2g-chip", "重复");
    chipDup.type = "button";
    chipDup.title = "只看有重复项的记录";
    const paintDup = () => {
      chipDup.textContent = dupKey ? "同词组 ×" : "重复";
      chipDup.classList.toggle("on", galleryDup || !!dupKey);
    };
    chipDup.onclick = () => {
      if (dupKey) { dupKey = ""; galleryDup = false; }
      else galleryDup = !galleryDup;
      galleryPage = 1;
      paintDup();
      render();
    };
    const addSrcChip = (value) => {
      if (!value || knownSrc.has(value)) return;
      knownSrc.add(value);
      const chip = el("button", "k2g-chip" + (value === gallerySrc ? " on" : ""), value);
      chip.type = "button";
      chip.dataset.v = value;
      chip.onclick = () => {
        gallerySrc = value;
        galleryPage = 1;
        for (const c of srcChips) c.classList.toggle("on", c.dataset.v === value);
        render();
      };
      srcChips.push(chip);
      tools.insertBefore(chip, chipStar);
    };
    const spacer = el("div", "k2g-sp");
    const btnOutput = el("button", "k2g-act", "📂 输出目录");
    btnOutput.type = "button";
    btnOutput.title = "打开 ComfyUI 的 output 目录";
    btnOutput.onclick = async () => {
      if (btnOutput.dataset.busy === "1") return;
      btnOutput.dataset.busy = "1";
      const label = btnOutput.textContent;
      try {
        const data = await gReq("/luori/k2/gallery/open_output", { method: "POST" });
        btnOutput.textContent = data && data.ok ? "已打开" : "打开失败";
      } catch (e) {
        btnOutput.textContent = "打开失败";
      }
      setTimeout(() => { btnOutput.textContent = label; btnOutput.dataset.busy = "0"; }, 1400);
    };
    const btnAdd = el("button", "k2g-act", "+ 手动添加");
    btnAdd.type = "button";
    btnAdd.onclick = () => askAdd();
    const sortSel = el("select", "k2g-sort");
    sortSel.title = "排序方式";
    [["new", "最新优先"], ["old", "最早优先"], ["nameAsc", "名称 A→Z"],
     ["nameDesc", "名称 Z→A"], ["seedAsc", "种子小→大"], ["seedDesc", "种子大→小"]]
      .forEach(([v, t]) => {
        const op = el("option", null, t);
        op.value = v;
        if (v === gallerySort) op.selected = true;
        sortSel.appendChild(op);
      });
    sortSel.onchange = () => { gallerySort = sortSel.value; galleryPage = 1; render(); };
    const btnCompact = el("button", "k2g-act", "紧凑");
    btnCompact.type = "button";
    btnCompact.title = "切换紧凑显示（一行放更多）";
    btnCompact.onclick = () => {
      galleryCompact = !galleryCompact;
      btnCompact.classList.toggle("on", galleryCompact);
      grid.classList.toggle("k2g-compact", galleryCompact);
    };
    tools.append(chipStar, chipDup, sortSel, spacer, btnOutput, btnAdd, btnCompact);

    const grid = el("div", "k2g-grid");
    const foot = el("div", "k2g-foot");
    foot.appendChild(el("span", "k2g-fhint", "点缩略图看详情 · ← → 翻页 · 双击提示词复制全文 · Esc 关闭"));
    const pager = el("div", "k2g-pager");
    const bPrev = el("button", "k2g-pg", "‹");
    const bNext = el("button", "k2g-pg", "›");
    const pgInfo = el("span", "k2g-pinfo", "1 / 1");
    bPrev.type = bNext.type = "button";
    bPrev.title = "上一页";
    bNext.title = "下一页";
    bPrev.onclick = () => { if (galleryPage > 1) { galleryPage -= 1; render(); grid.scrollTop = 0; } };
    bNext.onclick = () => { galleryPage += 1; render(); grid.scrollTop = 0; };
    pager.append(bPrev, pgInfo, bNext);
    foot.appendChild(pager);

    const paintPager = (total, pages, from) => {
      bPrev.disabled = galleryPage <= 1;
      bNext.disabled = galleryPage >= pages;
      if (pages > 1) {
        pgInfo.textContent = galleryPage + " / " + pages;
      } else {
        pgInfo.textContent = total ? total + " 条" : "0 条";
      }
    };

    const selBar = el("div", "k2g-selbar");
    const selCount = el("span", "k2g-selc", "已选 0 条");
    const bAll = el("button", null, "全选本页");
    const bStarAll = el("button", null, "收藏");
    const bCopyAll = el("button", null, "复制");
    const bDelAll = el("button", "dg", "删除");
    const bClear = el("button", null, "取消");
    bAll.type = bStarAll.type = bCopyAll.type = bDelAll.type = bClear.type = "button";
    selBar.append(selCount, bAll, bStarAll, bCopyAll, bDelAll, bClear);

    const paintSelBar = () => {
      const n = gallerySel.size;
      selCount.textContent = "已选 " + n + " 条";
      selBar.classList.toggle("on", n > 0);
    };

    const pageIds = () => Array.from(grid.querySelectorAll(".k2g-card"))
      .map((c) => c.dataset.id)
      .filter(Boolean);

    bAll.onclick = () => {
      const ids = pageIds();
      if (!ids.length) return;
      const allIn = ids.every((id) => gallerySel.has(id));
      if (allIn) {
        for (const id of ids) gallerySel.delete(id);
      } else {
        for (const id of ids) gallerySel.add(id);
      }
      render();
    };

    bStarAll.onclick = async () => {
      const ids = Array.from(gallerySel);
      if (!ids.length) return;
      bStarAll.disabled = true;
      for (const id of ids) {
        try {
          await gReq("/luori/k2/gallery/star", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, star: true }),
          });
          const it = galleryItems.find((x) => x.id === id);
          if (it) it.star = true;
        } catch (e) { }
      }
      bStarAll.disabled = false;
      render();
    };

    bCopyAll.onclick = async () => {
      const lines = [];
      for (const id of gallerySel) {
        const it = galleryItems.find((x) => x.id === id);
        if (it && it.prompt) lines.push(it.prompt);
      }
      if (!lines.length) return;
      await gCopy(lines.join("\n"), bCopyAll);
    };

    bDelAll.onclick = () => {
      const ids = Array.from(gallerySel);
      if (ids.length) askDeleteMany(ids);
    };

    bClear.onclick = () => {
      gallerySel.clear();
      render();
    };

    win.append(head, warn, tools, grid, selBar, foot);

    const skinWrap = el("div", "k2g-skin");
    const skinBtn = el("button", "k2g-skin-btn");
    skinBtn.type = "button";
    skinBtn.title = "切换词图库配色";
    skinBtn.appendChild(el("i"));
    skinBtn.appendChild(document.createTextNode("配色"));
    const skinPop = el("div", "k2g-skin-pop");
    for (const sk of GALLERY_SKINS) {
      const item = el("div", "k2g-skin-item" + (sk.id === gallerySkin ? " on" : ""));
      const dot = el("i");
      dot.style.background = sk.sw;
      item.appendChild(dot);
      item.appendChild(el("span", null, sk.name));
      item.addEventListener("click", (ev) => {
        ev.stopPropagation();
        gallerySkin = sk.id;
        try { localStorage.setItem("k2g_skin", sk.id); } catch (e) { }
        applyGallerySkin(win);
        for (const c of skinPop.children) c.classList.toggle("on", c === item);
        skinPop.classList.remove("on");
      });
      skinPop.appendChild(item);
    }
    skinBtn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      skinPop.classList.toggle("on");
    });
    skinWrap.append(skinBtn, skinPop);
    foot.insertBefore(skinWrap, pager);
    win.addEventListener("click", (ev) => {
      if (!skinWrap.contains(ev.target)) skinPop.classList.remove("on");
    });

    const updateCount = (total, limit, warnAt, bytes) => {
      const b = Number(bytes) || 0;
      const size = b >= 1048576 ? (b / 1048576).toFixed(1) + " MB" : Math.round(b / 1024) + " KB";
      countEl.textContent = total + " / " + limit + " · " + size;
      barFill.style.width = Math.min(100, (total / limit) * 100) + "%";
      if (total >= warnAt) {
        warn.classList.add("on");
        warnText.textContent = total >= limit
          ? "已存满 " + limit + " 条，新的存档会被拒绝，请先删除一些。"
          : "已存 " + total + " 条，接近上限 " + limit + "，建议清理。";
      } else {
        warn.classList.remove("on");
      }
    };

    const paramSummary = (p, stages) => {
      if (Array.isArray(stages) && stages.length) {
        const out = [];
        if (p && p.model) out.push("模型 " + p.model);
        for (const st of stages) {
          const bits = [];
          if (st.seed != null && st.seed !== "") bits.push("种子 " + st.seed);
          if (st.steps != null && st.steps !== "") bits.push(st.steps + "步");
          if (st.cfg != null && st.cfg !== "") bits.push("CFG " + st.cfg);
          if (st.sampler) bits.push(String(st.sampler));
          if (st.scheduler) bits.push(String(st.scheduler));
          out.push((st.label || "采") + " " + (bits.join(" · ") || st.kind || ""));
        }
        return out.length ? out.join(" / ") : "无参数记录";
      }
      if (!p || typeof p !== "object") return "无参数记录";
      const out = [];
      if (p.model) out.push("模型 " + p.model);
      if (p.steps != null && p.steps !== "") out.push("步数 " + p.steps);
      if (p.cfg != null && p.cfg !== "") out.push("CFG " + p.cfg);
      if (p.sampler) out.push("采样器 " + p.sampler);
      if (p.scheduler) out.push("调度器 " + p.scheduler);
      if (p.denoise != null && p.denoise !== "") out.push("降噪 " + p.denoise);
      if (p.size) out.push("尺寸 " + p.size);
      if (p.loras) out.push("LoRA " + p.loras);
      return out.length ? out.join(" · ") : "无参数记录";
    };

    const showFull = (item) => {
      if (win.querySelector(".k2g-full")) return;
      const ids = Array.from(grid.querySelectorAll(".k2g-card")).map((c) => c.dataset.id);
      const list = ids.map((id) => galleryItems.find((x) => x.id === id)).filter(Boolean);
      let idx = Math.max(0, list.findIndex((x) => x.id === item.id));
      const full = el("div", "k2g-full");
      const det = el("div", "k2g-det");
      const imgBox = el("div", "k2g-det-img");
      const side = el("div", "k2g-det-side");
      const bPrev = el("button", "k2g-det-nav prev", "‹");
      const bNext = el("button", "k2g-det-nav next", "›");
      bPrev.type = bNext.type = "button";
      imgBox.append(bPrev, bNext);
      det.append(imgBox, side);
      full.appendChild(det);
      const close = () => { full.remove(); detailStep = null; };
      const step = (delta) => {
        const next = idx + delta;
        if (next < 0 || next >= list.length) return;
        idx = next;
        paint();
      };
      detailStep = step;
      bPrev.onclick = () => step(-1);
      bNext.onclick = () => step(1);
      imgBox.onclick = (ev) => { if (ev.target === imgBox) close(); };
      const kvBlock = (pairs, sparse) => {
        const box = el("div", "k2g-det-kv");
        for (const pair of pairs) {
          const val = pair[1];
          if (sparse && (val == null || val === "")) continue;
          const text = val == null || val === "" ? "—" : String(val);
          const wide = text.length > 28 || /[\\/]/.test(text);
          box.append(el("span", null, pair[0]),
                     el("span", wide ? "wide" : null, text));
        }
        return box;
      };
      const paint = () => {
        const cur = list[idx] || item;
        const p = cur.params || {};
        imgBox.querySelectorAll("img,.k2g-det-ph").forEach((n) => n.remove());
        bPrev.disabled = idx <= 0;
        bNext.disabled = idx >= list.length - 1;
        const img = el("img");
        img.alt = cur.prompt || "";
        img.onerror = () => {
          try { img.remove(); } catch (e) { }
          const ph = el("div", "k2g-det-ph");
          ph.append(el("div", null, "原图已丢失（output 里的文件被清理了）"));
          ph.onclick = close;
          imgBox.appendChild(ph);
        };
        img.src = api.apiURL("/luori/k2/gallery/image/" + encodeURIComponent(cur.id));
        img.onclick = (ev) => {
          const r = img.getBoundingClientRect();
          const nw = img.naturalWidth, nh = img.naturalHeight;
          if (!nw || !nh) return;
          const s = Math.min(r.width / nw, r.height / nh);
          const w = nw * s, h = nh * s;
          const x = r.left + (r.width - w) / 2, y = r.top + (r.height - h) / 2;
          if (ev.clientX >= x && ev.clientX <= x + w && ev.clientY >= y && ev.clientY <= y + h) return;
          close();
        };
        imgBox.appendChild(img);
        side.replaceChildren();
        const top = el("div", "k2g-det-top");
        top.append(el("b", null, "图片详情"), el("span", null, (idx + 1) + " / " + list.length));
        const bx = el("button", "k2g-det-x", "×");
        bx.type = "button";
        bx.onclick = close;
        top.appendChild(bx);
        const scroll = el("div", "k2g-det-scroll");
        const prompt = el("pre", "k2g-det-prompt", cur.prompt || "—");
        prompt.ondblclick = () => gCopy(cur.prompt, null);
        scroll.append(el("div", "k2g-det-sec", "完整提示词"), prompt);
        scroll.append(el("div", "k2g-det-sec", "生成参数"));
        const stages = Array.isArray(cur.stages) ? cur.stages : [];
        const globalPairs = [["模型", p.model], ["尺寸", p.size], ["LoRA", p.loras]];
        const hasGlobal = globalPairs.some((x) => x[1] != null && x[1] !== "");
        if (!Object.keys(p).length && !stages.length) {
          scroll.append(el("div", "k2g-det-none", "旧存档或手动添加，未记录生成参数"));
        } else if (stages.length) {
          if (hasGlobal) scroll.append(kvBlock(globalPairs, true));
          for (const st of stages) {
            scroll.append(el("div", "k2g-det-stage", (st.label || "采") + (st.node ? " · " + st.node : "")));
            scroll.append(kvBlock([
              ["采样器", st.kind], ["种子", st.seed], ["步数", st.steps], ["CFG", st.cfg],
              ["采样器名称", st.sampler], ["调度器", st.scheduler], ["降噪", st.denoise],
              ["起始步", st.start], ["结束步", st.end],
            ], true));
          }
        } else {
          scroll.append(kvBlock([
            ["模型", p.model], ["步数", p.steps], ["CFG", p.cfg], ["采样器", p.sampler],
            ["调度器", p.scheduler], ["降噪", p.denoise], ["尺寸", p.size], ["LoRA", p.loras],
          ], true));
        }
        scroll.append(el("div", "k2g-det-sec", "记录信息"), kvBlock([
          ["种子", cur.seed], ["来源", cur.source], ["评级", cur.rarity],
          ["收藏", cur.star ? "★ 已收藏" : "未收藏"], ["时间", cur.created], ["编号", cur.id],
        ]));
        const acts = el("div", "k2g-det-acts");
        const bCp = el("button", null, "复制");
        bCp.type = "button";
        bCp.title = "复制完整提示词";
        bCp.onclick = () => gCopy(cur.prompt, bCp);
        const bRe = el("button", null, "重抽");
        bRe.type = "button";
        bRe.onclick = () => { close(); gReuse(cur); };
        const bSt = el("button", null, cur.star ? "取消收藏" : "★ 收藏");
        bSt.type = "button";
        bSt.title = "收藏 / 取消收藏";
        bSt.onclick = async () => {
          const next = !cur.star;
          cur.star = next;
          try {
            await gReq("/luori/k2/gallery/star", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: cur.id, star: next }),
            });
            render();
            paint();
          } catch (e) {
            cur.star = !next;
          }
        };
        const aDl = el("a", null, "下载");
        aDl.title = "下载原图";
        aDl.href = api.apiURL("/luori/k2/gallery/image/" + encodeURIComponent(cur.id));
        aDl.download = cur.file || (cur.id + ".png");
        const bDel = el("button", "dg", "删除");
        bDel.type = "button";
        bDel.title = "删除这条记录";
        bDel.onclick = () => { close(); askDelete(cur); };
        acts.append(bCp, bRe, bSt, aDl, bDel);
        side.append(top, scroll, acts);
      };
      paint();
      win.appendChild(full);
    };

    const askDelete = (item) => {
      const old = win.querySelector(".k2g-conf");
      if (old) old.remove();
      const conf = el("div", "k2g-conf");
      const box = el("div", "k2g-cbox");
      const title = el("div", "k2g-ct", "删除这一条？");
      const desc = el("p", "k2g-cp", "提示词和缩略图会一起删除，此操作不可恢复。");
      const note = el("div", "k2g-cw", "也可以选择同时删除 output 里的原图。删掉就无法恢复，且可能被其他工作流共用。");
      const bar2 = el("div", "k2g-cb");
      const cancel = el("button", "k2g-btn", "取消");
      const keep = el("button", "k2g-btn", "只删存档");
      const purge = el("button", "k2g-btn dg", "连原图一起删");
      cancel.type = keep.type = purge.type = "button";
      cancel.onclick = () => conf.remove();
      keep.onclick = async () => {
        keep.disabled = true;
        try {
          await gRemove(item, false);
          conf.remove();
          render();
        } catch (e) { keep.textContent = "删除失败"; keep.disabled = false; }
      };
      purge.onclick = async () => {
        purge.disabled = true;
        try {
          await gRemove(item, true);
          conf.remove();
          render();
        } catch (e) { purge.textContent = "删除失败"; purge.disabled = false; }
      };
      bar2.append(cancel, keep, purge);
      box.append(title, desc, note, bar2);
      conf.appendChild(box);
      conf.addEventListener("click", (ev) => { if (ev.target === conf) conf.remove(); });
      win.appendChild(conf);
    };

    const askDeleteMany = (ids) => {
      const old = win.querySelector(".k2g-conf");
      if (old) old.remove();
      const conf = el("div", "k2g-conf");
      const box = el("div", "k2g-cbox");
      const title = el("div", "k2g-ct", "删除选中的 " + ids.length + " 条？");
      const desc = el("p", "k2g-cp", "提示词和缩略图会一起删除，此操作不可恢复。");
      const note = el("div", "k2g-cw", "只删存档，不动 output 里的原图。");
      const bar2 = el("div", "k2g-cb");
      const cancel = el("button", "k2g-btn", "取消");
      const go = el("button", "k2g-btn dg", "确认删除");
      cancel.type = go.type = "button";
      cancel.onclick = () => conf.remove();
      go.onclick = async () => {
        go.disabled = true;
        go.textContent = "删除中…";
        let ok = 0;
        for (const id of ids) {
          try {
            await gReq("/luori/k2/gallery/" + encodeURIComponent(id) + "?mode=keep", { method: "DELETE" });
            galleryItems = galleryItems.filter((x) => x.id !== id);
            gallerySel.delete(id);
            ok += 1;
          } catch (e) { }
        }
        go.textContent = "已删 " + ok + " 条";
        conf.remove();
        render();
      };
      bar2.append(cancel, go);
      box.append(title, desc, note, bar2);
      conf.appendChild(box);
      conf.addEventListener("click", (ev) => { if (ev.target === conf) conf.remove(); });
      win.appendChild(conf);
    };

    const askAdd = () => {
      const old = win.querySelector(".k2g-conf");
      if (old) old.remove();
      const conf = el("div", "k2g-conf");
      const box = el("div", "k2g-cbox");
      const form = el("div", "k2g-form");
      const l1 = el("label", "k2g-lb", "图片（PNG / JPG / WebP，≤ 20MB）");
      const file = el("input");
      file.type = "file";
      file.accept = "image/*";
      file.className = "k2g-file";
      const l2 = el("label", "k2g-lb", "提示词");
      const ta = el("textarea", "k2g-in");
      ta.placeholder = "粘贴提示词…";
      const bar2 = el("div", "k2g-cb");
      const cancel = el("button", "k2g-btn", "取消");
      const save = el("button", "k2g-btn pri", "保存到词图库");
      cancel.type = save.type = "button";
      cancel.onclick = () => conf.remove();
      save.onclick = async () => {
        if (!file.files || !file.files[0]) { file.style.outline = "1px solid #FF3D71"; return; }
        if (!ta.value.trim()) { ta.style.outline = "1px solid #FF3D71"; return; }
        save.disabled = true;
        save.textContent = "保存中…";
        const fd = new FormData();
        fd.append("image", file.files[0]);
        fd.append("prompt", ta.value);
        try {
          await gReq("/luori/k2/gallery/manual", { method: "POST", body: fd });
          conf.remove();
          await load();
        } catch (e) {
          save.disabled = false;
          save.textContent = e.message === "full" ? "已满 1000 条" : "保存失败";
        }
      };
      bar2.append(cancel, save);
      form.append(l1, file, l2, ta, bar2);
      box.appendChild(form);
      conf.appendChild(box);
      conf.addEventListener("click", (ev) => { if (ev.target === conf) conf.remove(); });
      win.appendChild(conf);
    };

    const srcKey = (s) => {
      const v = String(s || "").trim();
      return v === "超强" || v === "分类" ? "文生图" : v;
    };

    const dayLabel = (d) => {
      const pad = (n) => String(n).padStart(2, "0");
      const now = new Date();
      const y = new Date(now.getTime() - 86400000);
      const today = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
      const yest = y.getFullYear() + "-" + pad(y.getMonth() + 1) + "-" + pad(y.getDate());
      if (d === today) return "今天";
      if (d === yest) return "昨天";
      return d;
    };

    const render = () => {
      for (const it of galleryItems) addSrcChip(srcKey(it.source));
      const list = galleryItems.filter((it) => {
        if (galleryStar && !it.star) return false;
        if (galleryDup && (Number(it.dup) || 1) < 2) return false;
        if (dupKey && String(it.prompt || "").trim() !== dupKey) return false;
        if (gallerySrc && srcKey(it.source) !== gallerySrc) return false;
        if (galleryQ) {
          const hay = (String(it.prompt || "") + " " + String(it.seed || "") + " " + String(it.source || "")).toLowerCase();
          if (!hay.includes(galleryQ)) return false;
        }
        return true;
      });
      const byName = (x, y) => String(x.prompt || "").localeCompare(String(y.prompt || ""), "zh");
      const byTime = (x, y) => String(x.created || "").localeCompare(String(y.created || ""));
      list.sort((a, b) => {
        const sa = a.star ? 1 : 0;
        const sb = b.star ? 1 : 0;
        if (sa !== sb) return sb - sa;
        if (gallerySort === "old") return byTime(a, b);
        if (gallerySort === "nameAsc") return byName(a, b);
        if (gallerySort === "nameDesc") return byName(b, a);
        if (gallerySort === "seedAsc") return (Number(a.seed) || 0) - (Number(b.seed) || 0);
        if (gallerySort === "seedDesc") return (Number(b.seed) || 0) - (Number(a.seed) || 0);
        return byTime(b, a);
      });

      const total = list.length;
      const pages = Math.max(1, Math.ceil(total / GALLERY_PAGE_SIZE));
      if (galleryPage > pages) galleryPage = pages;
      if (galleryPage < 1) galleryPage = 1;
      const from = (galleryPage - 1) * GALLERY_PAGE_SIZE;
      const pageList = list.slice(from, from + GALLERY_PAGE_SIZE);

      grid.replaceChildren();
      if (!total) {
        const empty = el("div", "k2g-empty");
        empty.append(el("div", "k2g-ei", "🗂"), el("div", null, galleryItems.length ? "没有匹配的记录" : "还没有存档，跑一次就有了"));
        grid.appendChild(empty);
        paintPager(0, 1, 0);
        paintSelBar();
        return;
      }

      const grouped = gallerySort === "new" || gallerySort === "old";
      let lastDay = "";
      pageList.forEach((it, idx) => {
        const day = String(it.created || "").slice(0, 10);
        if (grouped && day && day !== lastDay) {
          lastDay = day;
          const sep = el("div", "k2g-day");
          sep.appendChild(el("span", null, dayLabel(day)));
          sep.appendChild(el("i"));
          grid.appendChild(sep);
        }
        const card = el("article", "k2g-card");
        card.dataset.id = it.id;
        card.style.setProperty("--i", String(idx));
        const thumb = el("div", "k2g-thumb");
        if (it.has_image) {
          const img = el("img");
          img.loading = "lazy";
          img.decoding = "async";
          img.src = api.apiURL("/luori/k2/gallery/thumb/" + encodeURIComponent(it.id));
          img.alt = it.prompt || "";
          img.onerror = () => {
            try { img.remove(); } catch (e) { }
            thumb.classList.add("none");
            thumb.textContent = "缩略图已丢失";
          };
          img.onclick = () => showFull(it);
          thumb.appendChild(img);
        } else {
          thumb.classList.add("none");
          thumb.textContent = "无图";
        }
        const star = el("button", "k2g-star" + (it.star ? " on" : ""), it.star ? "★" : "☆");
        star.type = "button";
        star.title = "收藏 / 取消收藏";
        star.onclick = async (ev) => {
          ev.stopPropagation();
          const next = !it.star;
          it.star = next;
          star.textContent = next ? "★" : "☆";
          star.classList.toggle("on", next);
          try {
            await gReq("/luori/k2/gallery/star", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: it.id, star: next }),
            });
            render();
          } catch (e) {
            it.star = !next;
            render();
          }
        };
        thumb.appendChild(star);

        const picked = gallerySel.has(it.id);
        const pick = el("button", "k2g-pick" + (picked ? " on" : ""), picked ? "✓" : "");
        pick.type = "button";
        pick.title = "选中 / 取消";
        pick.onclick = (ev) => {
          ev.stopPropagation();
          if (gallerySel.has(it.id)) gallerySel.delete(it.id);
          else gallerySel.add(it.id);
          const on = gallerySel.has(it.id);
          pick.classList.toggle("on", on);
          pick.textContent = on ? "✓" : "";
          paintSelBar();
        };
        thumb.appendChild(pick);
        const dupN = Number(it.dup) || 1;
        if (dupN > 1) {
          const dupBadge = el("button", "k2g-dup", "×" + dupN);
          dupBadge.type = "button";
          dupBadge.title = "共 " + dupN + " 条同词记录，点击只看这一组";
          dupBadge.onclick = (ev) => {
            ev.stopPropagation();
            const key = String(it.prompt || "").trim();
            dupKey = dupKey === key ? "" : key;
            galleryDup = true;
            galleryPage = 1;
            paintDup();
            render();
          };
          thumb.appendChild(dupBadge);
        }

        const body = el("div", "k2g-body");
        const txt = el("p", "k2g-txt", it.prompt || "");
        txt.title = it.prompt || "";
        txt.ondblclick = () => gCopy(it.prompt, null);
        const meta = el("div", "k2g-meta");
        meta.append(el("span", null, it.source || "未知"), el("span", null, "·"),
                    el("span", null, it.rarity || "R"), el("span", null, "·"),
                    el("span", null, String(it.seed || "-")));
        meta.title = paramSummary(it.params, it.stages);
        if (it.params && Object.keys(it.params).length) thumb.dataset.param = "1";
        body.append(txt, meta);

        const acts = el("div", "k2g-acts");
        const bCopy = el("button", null, "复制");
        const bReuse = el("button", null, "重抽");
        const bDel = el("button", "dg", "删除");
        bCopy.type = bReuse.type = bDel.type = "button";
        bCopy.onclick = () => gCopy(it.prompt, bCopy);
        bReuse.onclick = () => gReuse(it);
        bDel.onclick = () => askDelete(it);
        if (opts && opts.hideReuse) acts.append(bCopy, bDel);
        else acts.append(bCopy, bReuse, bDel);

        card.append(thumb, body, acts);
        grid.appendChild(card);
      });

      paintPager(total, pages, from);
      paintSelBar();
    };

    const load = async () => {
      try {
        const data = await gReq("/luori/k2/gallery");
        galleryItems = Array.isArray(data.items) ? data.items : [];
        updateCount(data.total ?? galleryItems.length, data.limit ?? 1000, data.warn ?? 950, data.bytes ?? 0);
        render();
      } catch (e) {
        countEl.textContent = "读取失败";
        grid.replaceChildren();
        const empty = el("div", "k2g-empty");
        empty.append(el("div", "k2g-ei", "⚠"), el("div", null, "词图库读取失败：" + e.message));
        grid.appendChild(empty);
      }
    };

    await load();
  };

  btnGallery.onclick = openGallery;
  window.__k2GalleryOpen = (o) => openGallery(o || {});

  let spotTs = 0;
  body.addEventListener("mousemove", (ev) => {
    const now = Date.now();
    if (now - spotTs < 16) return;
    spotTs = now;
    const t = ev.target && ev.target.closest ? ev.target.closest(".k2-big,.k2-tile") : null;
    if (!t || !t.getBoundingClientRect || !t.style || !t.style.setProperty) return;
    const r = t.getBoundingClientRect();
    if (!r.width || !r.height) return;
    t.style.setProperty("--mx", (((ev.clientX - r.left) / r.width) * 100).toFixed(1) + "%");
    t.style.setProperty("--my", (((ev.clientY - r.top) / r.height) * 100).toFixed(1) + "%");
  });

  body.addEventListener("click", (ev) => {
    const t = ev.target && ev.target.closest ? ev.target.closest("button") : null;
    if (t && t !== btnSfx) sfx("tick");
  });

  function sync() {
    let partsOn = 0;
    for (let i = 1; i <= PART_COUNT; i++) {
      const on = !!readW(node, partName(i), false);
      if (on) partsOn++;
      tiles[i - 1].classList.toggle("on", on);
    }
    const ms = miscState(node);
    bigMisc.classList.toggle("on", ms === "all");
    bigMisc.classList.toggle("k2-part", ms === "some");
    rollTo(mMiscBadge, `${partsOn} / ${PART_COUNT}`);

    bigCN.classList.toggle("on", !!readW(node, W_NAME.cn, false));
    bigNS.classList.toggle("on", !!readW(node, W_NAME.nsfw, false));
    bigKOOK.classList.toggle("on", !!readW(node, W_NAME.hz2, false));
    bigSFW.classList.toggle("on", !!readW(node, W_NAME.sfw, false));
    big19.classList.toggle("on", !!readW(node, W_NAME.p19, false));
    bigHZ1.classList.toggle("on", !!readW(node, W_NAME.hz1, false));
    bigMoss.classList.toggle("on", !!readW(node, W_NAME.moss, false));
    tgl.classList.toggle("on", !!readW(node, W_NAME.trigOn, false));

    const setIfIdle = (input, val) => {
      const v = val == null ? "" : String(val);
      if (document.activeElement === input) return;
      if (input.value !== v) input.value = v;
    };
    setIfIdle(trigInput, readW(node, W_NAME.trigTx, ""));
    setIfIdle(dirInput, readW(node, W_NAME.dir, ""));
    setIfIdle(sepInput, readW(node, W_NAME.sep, ""));
    lockCtrl();
    installSeedHook();
    if (!isFixed() && (Number(readW(node, W_NAME.seed, 0)) || 0) === 0) rollSeed();
    paintSeed();

    const mode = String(readW(node, W_NAME.mode, "single"));
    segSingle.classList.toggle("on", mode === "single");
    segConcat.classList.toggle("on", mode === "concat");

    const n = countActive(node);
    const onlyMisc = ms === "all" && n === PART_COUNT;
    rollTo(chipTotal, `${n} / ${PART_COUNT + 7}`);
    chipTotal.classList.toggle("k2-hot", n > 0);
    chipTotal.classList.toggle("k2-zero", n === 0);

    if (n === 0) {
      chipMode.textContent = "尚未选择词库，节点会直接输出提示";
      chipMode.className = "k2-chip k2-zero";
    } else if (mode === "concat") {
      chipMode.textContent = onlyMisc
        ? `杂项 · ${PART_COUNT} 源各抽 1 条 → 拼接`
        : `${n} 个词库各抽 1 条 → 拼接`;
      chipMode.className = "k2-chip k2-hot";
    } else {
      chipMode.textContent = onlyMisc
        ? `杂项 · ${PART_COUNT} 源里随机抽 1 条`
        : `从 ${n} 个词库中随机抽 1 条`;
      chipMode.className = "k2-chip k2-hot";
    }
  }

  return { root, body, sync, applyDraw };
}

function miscState(node) {
  let on = 0;
  for (let i = 1; i <= PART_COUNT; i++) if (readW(node, partName(i), false)) on++;
  if (on === PART_COUNT) return "all";
  if (on === 0) return "none";
  return "some";
}

function countActive(node) {
  let n = 0;
  if (readW(node, W_NAME.cn, false)) n++;
  if (readW(node, W_NAME.nsfw, false)) n++;
  if (readW(node, W_NAME.hz1, false)) n++;
  if (readW(node, W_NAME.hz2, false)) n++;
  if (readW(node, W_NAME.sfw, false)) n++;
  if (readW(node, W_NAME.p19, false)) n++;
  if (readW(node, W_NAME.moss, false)) n++;
  for (let i = 1; i <= PART_COUNT; i++) if (readW(node, partName(i), false)) n++;
  return n;
}

function applyExclusive(node, group) {
  const keys = ["cn", "nsfw", "hz1", "hz2", "sfw", "p19", "moss"];
  for (const k of keys) if (k !== group) writeW(node, W_NAME[k], false);
  if (group !== "misc") {
    for (let i = 1; i <= PART_COUNT; i++) writeW(node, partName(i), false);
  }
}


function nodeSize(node) {
  const s = node.renderingSize || node.size || [200, 100];
  return [s[0] || 200, s[1] || 100];
}

function rr(ctx, x, y, w, h, r) {
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
  }
}

function paintBackground(ctx, node) {
  const [w, h] = nodeSize(node);
  const th = TITLE_H;

  ctx.save();

  const g = ctx.createLinearGradient(0, 0, w * 0.4, h);
  g.addColorStop(0, THEME.bgMid);
  g.addColorStop(1, THEME.bgDeep);
  rr(ctx, 0, 0, w, h, 12);
  ctx.fillStyle = g;
  ctx.fill();

  const halo1 = ctx.createRadialGradient(w, 0, 0, w, 0, w * 0.9);
  halo1.addColorStop(0, "rgba(255,46,147,.22)");
  halo1.addColorStop(1, "rgba(255,46,147,0)");
  rr(ctx, 0, 0, w, h, 12);
  ctx.fillStyle = halo1;
  ctx.fill();

  const halo2 = ctx.createRadialGradient(0, h, 0, 0, h, w * 0.9);
  halo2.addColorStop(0, "rgba(139,47,247,.28)");
  halo2.addColorStop(1, "rgba(139,47,247,0)");
  rr(ctx, 0, 0, w, h, 12);
  ctx.fillStyle = halo2;
  ctx.fill();

  const tg = ctx.createLinearGradient(0, 0, w, 0);
  tg.addColorStop(0, "rgba(255,138,61,.92)");
  tg.addColorStop(0.48, "rgba(255,46,147,.92)");
  tg.addColorStop(1, "rgba(139,47,247,.92)");
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(0, -th, w, th, [12, 12, 0, 0]);
  } else {
    ctx.beginPath();
    ctx.rect(0, -th, w, th);
  }
  ctx.fillStyle = tg;
  ctx.fill();

  ctx.restore();
}

function paintFrame(ctx, node) {
  const [w, h] = nodeSize(node);
  const th = TITLE_H;
  const active = countActive(node) > 0;

  ctx.save();
  const g = ctx.createLinearGradient(0, -th, w, h);
  g.addColorStop(0.0, THEME.orange);
  g.addColorStop(0.38, THEME.pink);
  g.addColorStop(0.74, THEME.purple);
  g.addColorStop(1.0, THEME.cyan);

  rr(ctx, -1, -th - 1, w + 2, h + th + 2, 13);
  ctx.strokeStyle = g;
  ctx.lineWidth = 1.6;
  if (CONFIG.glow && active) {
    ctx.shadowColor = "rgba(255,46,147,.7)";
    ctx.shadowBlur = 15;
    ctx.globalAlpha = 1;
  } else {
    ctx.globalAlpha = 0.5;
  }
  ctx.stroke();
  ctx.restore();
}

function installPainting(node) {
  if (!CONFIG.paintNode || node.__k2painted) return;
  node.__k2painted = true;

  try {
    node.bgcolor = THEME.bgDeep;
    node.color = "#3A2A6A";
  } catch (e) {  }

  chain(node, "onDrawBackground", function (ctx) {
    if (this.flags?.collapsed) return;   
    paintBackground(ctx, this);
  });
  chain(node, "onDrawForeground", function (ctx) {
    if (this.flags?.collapsed) return;
    paintFrame(ctx, this);
  });
}


function applyTriggerDefault(node) {
  const w = findWidget(node, W_NAME.trigOn);
  if (!w) return;
  const fromWorkflow = Array.isArray(node.widgets_values) && node.widgets_values.length > 0;
  if (fromWorkflow) return;        
  if (w.value === true) return;
  writeW(node, W_NAME.trigOn, true);
}



let booted = false;

app.registerExtension({
  name: "krea2sunset.Krea2Skin",

  beforeRegisterNodeDef(nodeType, nodeData) {
    if (nodeData?.name !== NODE_CLASS) return;
    const spec = nodeData?.input?.required?.[W_NAME.trigOn];
    if (Array.isArray(spec) && spec[1] && typeof spec[1] === "object") {
      spec[1].default = true;
    }

    try {
      const groups = [nodeData?.input?.required, nodeData?.input?.optional];
      for (const g of groups) {
        if (!g || typeof g !== "object") continue;
        for (const k of Object.keys(g)) {
          const s = g[k];
          if (Array.isArray(s) && s[1] && typeof s[1] === "object") {
            s[1].hidden = true;
          }
        }
      }
    } catch (e) {  }
  },

  async nodeCreated(node) {
    const cls = node?.comfyClass ?? node?.type;
    if (cls !== NODE_CLASS) return;
    if (node.__k2skin) return;
    node.__k2skin = true;

    injectCSS();
    bindPointerWatch();          
    k2gHook();
    installPainting(node);
    applyTriggerDefault(node);   

    if (CONFIG.hideNative && Array.isArray(node.widgets)) {
      for (const w of node.widgets) hideWidget(w);
    }

    const { root, body, sync, applyDraw } = buildPanel(node);
    node.__k2ctx = { root, body };
    k2LockWidth(node, root);
    node.__k2StableH = k2Measure(node, root) || k2Height(node);

    bindDrawFeed();
    const regFeed = () => { if (node.id != null) DRAW_MAP.set(node.id, applyDraw); };
    regFeed();
    setTimeout(regFeed, 300);
    chain(node, "onRemoved", function () { try { DRAW_MAP.delete(node.id); } catch (e) { } });
    chain(node, "onExecuted", function (msg) {
      const t = msg && msg.text;
      const arr = Array.isArray(t) ? t : (t != null ? [t] : []);
      if (arr.length) applyDraw(arr[arr.length - 1]);
    });

    let domWidget = null;
    if (typeof node.addDOMWidget === "function") {
      domWidget = node.addDOMWidget("krea2_deck", "krea2ui", root, {
        serialize: false,
        hideOnZoom: false,
        getHeight: () => k2Height(node),
        getMinHeight: () => k2Height(node),
      });
      if (domWidget) {
        domWidget.computeSize = () => [k2PanelWidth(node), k2Height(node)];
        domWidget.computeLayoutSize = () => ({
          minHeight: k2Height(node),
          minWidth: k2PanelWidth(node),
        });
        node.__k2dm = domWidget;
      }
    } else {
      console.warn("[Krea2Skin] 当前前端不支持 addDOMWidget，已降级为独立浮层");
      root.style.position = "absolute";
      document.body.appendChild(root);
    }
    const fit = (force) => scheduleFit(node, root, body, force);
    fit(false);
    requestAnimationFrame(() => fit(false));
    setTimeout(() => fit(false), 120);
    setTimeout(() => fit(false), 500);
    setTimeout(() => fit(false), 1200);
    setTimeout(() => fit(false), 2600);
    startWatchdog();                    

    if (typeof ResizeObserver === "function") {
      let last = 0;
      const ro = new ResizeObserver(() => {
        const now = Date.now();
        if (now - last < 60) return;     
        last = now;
        fit(false);
      });
      try { ro.observe(body); } catch (e) {  }
      chain(node, "onRemoved", function () { try { ro.disconnect(); } catch (e) {  } });
    }

    sync();
    if (CONFIG.syncInterval > 0) {
      const timer = setInterval(sync, CONFIG.syncInterval);
      chain(node, "onRemoved", function () { clearInterval(timer); });
    }

    chain(node, "onResize", function () {
      lastResizeTs = Date.now();          
      if (sizing) return;                 
      bumpCanvas(this);
      setTimeout(() => fit(false), 0);    
    });

    chain(node, "onConfigure", function () {
      this.__k2fitted = false;
      setTimeout(() => fit(false), 0);
      setTimeout(() => fit(false), 200);   
    });

    chain(node, "onRemoved", function () {
      this.__k2gone = true;
      this.__k2ctx = null;
    });

    booted = true;
    console.log("[Krea2Skin] 皮肤已挂载到节点:", node.title || cls, "| 面板高:", panelH);
  },
});

const PAD_TB = 22;      
const BOX_PAD = 10;     
const EDGE_GAP = 2;     

let panelH = 460;       
let sizing  = false;    
let lastResizeTs = 0;   
let fitTimer = null;
let wdTimer = null;     

function k2PanelWidth(node) {
  return Math.max(K2_MIN_PANEL_W, Math.round(Number(node?.size?.[0]) || CONFIG.width) - 20);
}

function k2Height(node) {
  const root = node?.__k2ctx?.root;
  if (root && root.isConnected && root.offsetWidth >= K2_MIN_PANEL_W) {
    const h = Math.round(root.offsetHeight);
    if (h > 40) { node.__k2StableH = h; return h; }
  }
  const cached = Math.round(Number(node?.__k2StableH) || 0);
  return cached > 40 ? cached : (Math.round(panelH) || 600);
}

function k2Measure(node, root) {
  if (!root || typeof document === "undefined" || !document.body) return 0;
  const want = k2PanelWidth(node);
  const prevParent = root.parentNode;
  const prevNext = root.nextSibling;
  const probe = document.createElement("div");
  probe.style.cssText = "position:fixed;left:-20000px;top:0;width:" + want + "px;visibility:hidden;pointer-events:none;";
  root.style.width = want + "px";
  let h = 0;
  try {
    probe.appendChild(root);
    document.body.appendChild(probe);
    h = Math.round(root.offsetHeight);
  } catch (e) { h = 0; }
  try {
    if (root.parentNode === probe) {
      probe.removeChild(root);
      if (prevParent) prevParent.insertBefore(root, prevNext);
    }
    probe.remove();
  } catch (e) { }
  return h > 40 ? h : 0;
}

function k2LockWidth(node, root) {
  const want = k2PanelWidth(node);
  if (Math.round(Number.parseFloat(root.style.width) || 0) !== want) {
    root.style.width = want + "px";
  }
  return root.offsetWidth >= K2_MIN_PANEL_W;
}

function contentHeight(body) {
  if (!body) return panelH;
  const h = Math.max(body.offsetHeight || 0, body.scrollHeight || 0);
  return h > 40 ? h : panelH;   
}

function widgetY(node, root) {
  const dm = node?.__k2dm;
  if (dm && typeof dm.y === "number" && dm.y >= 0) return dm.y;
  return BOX_PAD;
}

function isUserResizing(node) {
  try {
    const cv = app?.canvas;
    if (!cv || !node) return false;
    return cv.resizing_node === node || cv.resizingNode === node;
  } catch (e) { return false; }
}

function pointerIsDown() {
  try {
    const cv = app?.canvas;
    return !!(cv && (cv.pointer_is_down || cv.pointerIsDown));
  } catch (e) { return false; }
}

let k2PtrDown = false;      
let k2PtrDownAt = 0;        
let k2PtrMoveAt = 0;        
let k2PtrBound = false;     

function bindPointerWatch() {
  if (k2PtrBound) return;
  const up = () => { k2PtrDown = false; };
  const down = () => { k2PtrDown = true; k2PtrDownAt = Date.now(); k2PtrMoveAt = Date.now(); };
  const move = () => { k2PtrMoveAt = Date.now(); };
  try {
    window.addEventListener("pointerdown", down, true);
    window.addEventListener("pointermove", move, true);
    window.addEventListener("pointerup", up, true);
    window.addEventListener("pointercancel", up, true);
    window.addEventListener("blur", up, true);
    document.addEventListener("visibilitychange", () => { if (document.hidden) up(); });
    k2PtrBound = true;
  } catch (e) { console.warn("[Krea2Skin] 指针监听挂载失败:", e); }
}

function dragFlags(node) {
  try {
    const cv = app?.canvas;
    if (!cv) return null;
    return {
      marked: cv.resizing_node === node || cv.resizingNode === node,   
      pressed: !!(cv.pointer_is_down || cv.pointerIsDown),             
    };
  } catch (e) { return null; }
}

function clearStaleDragFlags(node) {
  if (k2PtrDown) return false;                 
  try {
    const cv = app?.canvas;
    if (!cv) return false;
    const f = dragFlags(node);
    if (!f || (!f.marked && !f.pressed)) return false;
    if (f.marked) { cv.resizing_node = null; cv.resizingNode = null; }
    cv.pointer_is_down = false;
    cv.pointerIsDown = false;
    dbg(node, "清残留拖拽状态(" + (f.marked ? "resizing_node" : "") + (f.pressed ? (f.marked ? "+" : "") + "pointerIsDown" : "") + ")");
    return true;
  } catch (e) { return false; }
}

function isDraggingNow(node) {
  if (!k2PtrDown) return false;                              
  if (Date.now() - k2PtrDownAt > 15000) return false;        
  if (Date.now() - lastResizeTs > 1500) return false;        
  const f = dragFlags(node);
  const marked = !!(f && f.marked);                          
  const moved = (Date.now() - k2PtrMoveAt) < 1500;           
  return marked || moved;
}

function relayout(node, root, body) {
  if (!node || !root || !body || node.__k2gone) return false;

  const need = contentHeight(body) + PAD_TB;              
  const changed = Math.abs(need - panelH) > 0.5;
  if (changed) panelH = need;

  const rootH = root.offsetHeight || need;
  node.__k2StableH = rootH;
  if (!CONFIG.autoResize) {
    if (changed) bumpCanvas(node);
    return false;
  }

  if (isDraggingNow(node)) { dbg(node, "skip: 指针按着，让位给用户拖"); return false; }

  clearStaleDragFlags(node);

  if (!k2LockWidth(node, root)) { dbg(node, "skip: 面板宽度异常"); return false; }

  const wY = widgetY(node, root);
  let goal = Math.round(rootH + wY + BOX_PAD + EDGE_GAP);       
  const min = Math.max(120, wY + BOX_PAD + 60);
  if (goal < min) goal = min;

  const curH = node.size?.[1] || 0;
  const curW = node.size?.[0] || 0;
  const targetW = Math.max(curW, CONFIG.width);

  if (changed) bumpCanvas(node);

  if (Math.abs(goal - curH) <= 1 && Math.abs(targetW - curW) <= 1) {
    dbg(node, `ok ${Math.round(curH)}`);
    return false;
  }

  dbg(node, `${goal < curH ? "收回空白" : "撑开"} ${Math.round(curH)}→${goal} (面板 ${rootH} 偏移 ${wY})`);
  sizing = true;
  try { node.setSize?.([targetW, goal]); } catch (e) {  }
  bumpCanvas(node);
  node.__k2fitted = true;
  requestAnimationFrame(() => { sizing = false; });
  return true;
}

function dbg(node, msg) {
  try {
    if (!node.__k2dbg) node.__k2dbg = [];
    const a = node.__k2dbg;
    const last = a[a.length - 1];
    if (last && last.msg === msg && Date.now() - last.t < 900) return;   
    a.push({ t: Date.now() % 100000, msg });
    if (a.length > 8) a.shift();
  } catch (e) {  }
}

function startWatchdog() {
  if (wdTimer) return;
  wdTimer = setInterval(() => {
    const nodes = app?.graph?._nodes;
    if (!Array.isArray(nodes)) return;
    for (const n of nodes) {
      const ctx = n.__k2ctx;
      if (!ctx || n.__k2gone) continue;
      try { relayout(n, ctx.root, ctx.body); }
      catch (e) { console.error("[Krea2Skin] 巡检失败:", e); }
    }
  }, 300);
}

function bumpCanvas(node) {
  try { node.setDirtyCanvas?.(true, true); } catch (e) {  }
  try { node.graph?.setDirtyCanvas?.(true, true); } catch (e) {  }
  try { app?.canvas?.setDirty?.(true, true); } catch (e) {  }
}

function scheduleFit(node, root, body, force) {
  if (!node || !root || !body) return;
  void force;
  clearTimeout(fitTimer);
  let round = 0;
  const step = () => {
    let changed = false;
    try { changed = relayout(node, root, body); }
    catch (e) { console.error("[Krea2Skin] 尺寸贴合失败:", e); return; }
    round++;
    if (round < 5) fitTimer = setTimeout(step, changed ? 60 : 0);
  };
  requestAnimationFrame(step);
}

function measurePanel(root) {
  const body = root?.querySelector?.(".k2-body");
  return contentHeight(body);
}

const TOP_BTN_ID = "k2-top-gallery";

function topToast(msg) {
  const old = document.getElementById("k2-top-toast");
  if (old) old.remove();
  const t = document.createElement("div");
  t.id = "k2-top-toast";
  t.textContent = msg;
  t.style.cssText =
    "position:fixed;left:50%;top:72px;transform:translateX(-50%);z-index:99999;" +
    "padding:8px 16px;border-radius:9px;background:rgba(24,14,44,.96);color:#FFD9D6;" +
    "border:1px solid rgba(255,61,113,.55);font:12px/1.4 'Segoe UI','Microsoft YaHei',sans-serif;" +
    "box-shadow:0 10px 30px rgba(0,0,0,.6);pointer-events:none;transition:opacity .3s;";
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = "0"; }, 1800);
  setTimeout(() => { try { t.remove(); } catch (e) { } }, 2200);
}

function injectTopBtnCSS() {
  if (document.getElementById("k2-top-btn-css")) return;
  const s = document.createElement("style");
  s.id = "k2-top-btn-css";
  s.textContent = `
.k2-top-luori{
  position:relative;overflow:hidden;box-sizing:border-box;
  height:30px;padding:0 14px 0 12px;margin:0 4px;border-radius:8px;
  display:inline-flex;align-items:center;justify-content:center;gap:6px;
  cursor:pointer;border:1px solid transparent;flex:0 0 auto;white-space:nowrap;
  color:#fff;font:800 13px/1 'Segoe UI','Microsoft YaHei',sans-serif;letter-spacing:2px;
  text-shadow:0 0 7px rgba(255,255,255,.72),0 1px 2px rgba(0,0,0,.55);
  background:
    linear-gradient(135deg,rgba(24,10,42,.94),rgba(24,10,42,.94)) padding-box,
    linear-gradient(90deg,#FF3D71,#FF8A3D,#FFD166,#4ADE80,#22D3EE,#8B2FF7,#FF2E93,#FF3D71) border-box;
  background-size:100% 100%,300% 100%;
  box-shadow:
    0 0 0 1px rgba(255,61,113,.66),
    0 0 9px rgba(255,61,113,.6),
    0 0 20px rgba(34,211,238,.4),
    0 0 34px rgba(139,47,247,.32),
    inset 0 0 12px rgba(255,255,255,.1);
  animation:k2tRainbow 2.2s linear infinite,k2tNeon 2.6s ease-in-out infinite;
}
.k2-top-luori::before{
  content:"";width:8px;height:8px;border-radius:50%;flex:0 0 auto;
  background:radial-gradient(circle at 35% 35%,#FFF3B0,#FFD166 42%,#FF8A3D 72%,#FF3D71);
  box-shadow:0 0 8px #FF8A3D,0 0 16px rgba(255,61,113,.75);
  animation:k2tSun 2.4s ease-in-out infinite;
}
.k2-top-luori::after{
  content:"";position:absolute;top:0;left:0;width:46%;height:100%;
  background:linear-gradient(100deg,transparent,rgba(255,255,255,.7),transparent);
  transform:translateX(-160%);opacity:0;pointer-events:none;
  animation:k2tSweep 2.4s ease-in-out infinite;
}
.k2-top-luori:hover{
  color:#fff;
  background:
    linear-gradient(135deg,rgba(52,26,86,.94),rgba(52,26,86,.94)) padding-box,
    linear-gradient(90deg,#FF3D71,#FF8A3D,#FFD166,#4ADE80,#22D3EE,#8B2FF7,#FF2E93,#FF3D71) border-box;
  background-size:100% 100%,300% 100%;
  box-shadow:
    0 0 0 1px rgba(255,255,255,.5),
    0 0 14px rgba(255,61,113,.82),
    0 0 30px rgba(34,211,238,.62),
    0 0 48px rgba(139,47,247,.5),
    inset 0 0 16px rgba(255,255,255,.2);
}
.k2-top-luori:active{transform:translateY(1px);}
@keyframes k2tRainbow{0%{background-position:0 0,0% 50%;}100%{background-position:0 0,300% 50%;}}
@keyframes k2tNeon{0%,100%{filter:brightness(1);}50%{filter:brightness(1.28);}}
@keyframes k2tSun{
  0%,100%{transform:scale(1);opacity:.9;}
  50%{transform:scale(1.22);opacity:1;}
}
@keyframes k2tSweep{
  0%{transform:translateX(-160%);opacity:0;}
  55%{transform:translateX(-160%);opacity:0;}
  65%{opacity:.85;}
  88%{transform:translateX(320%);opacity:0;}
  100%{transform:translateX(320%);opacity:0;}
}
@media (prefers-reduced-motion:reduce){
  .k2-top-luori,.k2-top-luori::before,.k2-top-luori::after{animation:none;}
}
`;
  document.head.appendChild(s);
}

function makeTopButton() {
  injectTopBtnCSS();
  const b = document.createElement("button");
  b.id = TOP_BTN_ID;
  b.type = "button";
  b.className = "k2-top-luori";
  b.textContent = "落日";
  b.title = "落日词图库（点击打开）";
  b.setAttribute("aria-label", "落日词图库");
  b.addEventListener("pointerdown", (e) => e.stopPropagation());
  b.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (typeof window.__k2GalleryOpen === "function") {
      try {
        window.__k2GalleryOpen();
      } catch (err) {
        topToast("词图库打开失败");
      }
    } else {
      topToast("先在工作流里放一个 ✨落日-最强-文生图 节点");
    }
  });
  return b;
}

function attachTopButton() {
  if (document.getElementById(TOP_BTN_ID)) return true;
  const lora = (() => {
    const all = document.querySelectorAll("button");
    for (const b of all) {
      const s = (b.getAttribute("aria-label") || "") + " " + (b.title || "");
      if (/lora\s*manager/i.test(s)) return b;
    }
    return null;
  })();
  const btn = makeTopButton();
  if (lora && lora.parentElement) {
    lora.insertAdjacentElement("afterend", btn);
    return true;
  }
  const bar = document.querySelector('[data-testid="action-bar-buttons"]') ||
    document.querySelector(".comfyui-menu-right");
  if (bar) {
    bar.appendChild(btn);
    return true;
  }
  return false;
}

function watchTopButton(n) {
  if (attachTopButton()) return;
  if (n < 600) requestAnimationFrame(() => watchTopButton(n + 1));
}

app.registerExtension({
  name: "krea2sunset.TopGalleryButton",
  async setup() {
    watchTopButton(0);
    try {
      new MutationObserver(() => { attachTopButton(); }).observe(document.body, { childList: true });
    } catch (e) { }
    setInterval(() => { attachTopButton(); }, 5000);
  },
});

console.log(`[Krea2Skin] 皮肤脚本已加载 v${SKIN_VERSION} (ComfyUI-Luori-Sunset · 落日提示词 · 霓虹外观)`);
