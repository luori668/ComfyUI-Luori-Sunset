import { app } from "../../scripts/app.js";

const SKIN_VERSION = "1.0.0";
const CLS = "LuoriGallerySaver";
const CSS_ID = "luori-saver-skin-css";
const TITLE_H = 30;

const DEFAULT_THEME = {
  orange: "#FF8A3D",
  pink: "#FF2E93",
  purple: "#8B2FF7",
  cyan: "#22D3EE",
  bg1: "#191134",
  bg2: "#100B1F",
};

const CSS_TEXT = `
.luori-saver-ta{
  box-sizing:border-box !important;
  border-radius:10px !important;
  padding:8px 10px !important;
  color:#EDE9FE !important;
  font:11px/1.55 "Segoe UI","PingFang SC","Microsoft YaHei",sans-serif !important;
  background:linear-gradient(180deg,var(--lgs-bg1,#191134),var(--lgs-bg2,#100B1F)) !important;
  border:1px solid var(--lgs-line,rgba(255,46,147,.42)) !important;
  box-shadow:inset 0 0 14px rgba(139,47,247,.16),0 0 0 1px rgba(0,0,0,.32) !important;
  outline:none !important;
  transition:border-color .18s,box-shadow .18s;
}
.luori-saver-ta:focus{
  border-color:var(--lgs-p,#FF2E93) !important;
  box-shadow:0 0 0 1px var(--lgs-p,#FF2E93),0 0 16px rgba(255,46,147,.30),inset 0 0 14px rgba(139,47,247,.20) !important;
}
.luori-saver-ta::placeholder{color:#9A90C4 !important;}
`;

let cssDone = false;
let lastVars = "";

function injectCSS() {
  if (cssDone) return;
  cssDone = true;
  if (document.getElementById(CSS_ID)) return;
  const s = document.createElement("style");
  s.id = CSS_ID;
  s.textContent = CSS_TEXT;
  document.head.appendChild(s);
}

function palette() {
  try {
    const shared = window.__k2Shared;
    const list = shared && shared.themes;
    if (Array.isArray(list) && list.length) {
      const raw = Number(typeof shared.index === "function" ? shared.index() : 0);
      const i = Number.isFinite(raw) ? Math.max(0, Math.min(list.length - 1, Math.trunc(raw))) : 0;
      const t = list[i];
      if (t && t.orange && t.pink && t.purple && t.cyan) {
        return {
          orange: t.orange, pink: t.pink, purple: t.purple, cyan: t.cyan,
          bg1: t.bg1 || DEFAULT_THEME.bg1, bg2: t.bg2 || DEFAULT_THEME.bg2,
        };
      }
    }
  } catch (e) { }
  return DEFAULT_THEME;
}

function rgba(hex, a) {
  const h = String(hex || "").replace("#", "");
  if (h.length !== 6) return "rgba(255,46,147," + a + ")";
  const n = parseInt(h, 16);
  if (!Number.isFinite(n)) return "rgba(255,46,147," + a + ")";
  return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
}

function syncVars(t) {
  const key = t.orange + t.pink + t.purple + t.cyan + t.bg1 + t.bg2;
  if (key === lastVars) return;
  lastVars = key;
  try {
    const s = document.documentElement.style;
    s.setProperty("--lgs-o", t.orange);
    s.setProperty("--lgs-p", t.pink);
    s.setProperty("--lgs-v", t.purple);
    s.setProperty("--lgs-c", t.cyan);
    s.setProperty("--lgs-line", rgba(t.pink, 0.42));
    s.setProperty("--lgs-bg1", t.bg1);
    s.setProperty("--lgs-bg2", t.bg2);
  } catch (e) { }
}

function sizeOf(node) {
  const s = node.renderingSize || node.size || [400, 200];
  return [Number(s[0]) || 400, Number(s[1]) || 200];
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

function widgetOf(node, name) {
  const ws = node.widgets || [];
  for (const w of ws) if (w && w.name === name) return w;
  return null;
}

function stateOf(node) {
  const en = widgetOf(node, "启用");
  const v = en ? en.value : true;
  const on = v === true || v === 1 || String(v).toLowerCase() === "true";
  const p = widgetOf(node, "提示词");
  const auto = !(p && String(p.value == null ? "" : p.value).trim());
  return { on, auto };
}

function decorate(node) {
  const w = widgetOf(node, "提示词");
  const e = w && (w.element || w.domEl);
  if (e && e.classList && !e.__lgsTa) {
    e.__lgsTa = 1;
    e.classList.add("luori-saver-ta");
  }
}

function drawBackground(ctx) {
  const node = this;
  if (!node || (node.flags && node.flags.collapsed)) return;
  const t = palette();
  syncVars(t);
  const wh = sizeOf(node);
  const w = wh[0];
  const h = wh[1];
  ctx.save();
  const g = ctx.createLinearGradient(0, 0, w * 0.4, h);
  g.addColorStop(0, t.bg1);
  g.addColorStop(1, t.bg2);
  rr(ctx, 0, 0, w, h, 12);
  ctx.fillStyle = g;
  ctx.fill();

  const halo1 = ctx.createRadialGradient(w, 0, 0, w, 0, w * 0.9);
  halo1.addColorStop(0, rgba(t.pink, 0.18));
  halo1.addColorStop(1, rgba(t.pink, 0));
  rr(ctx, 0, 0, w, h, 12);
  ctx.fillStyle = halo1;
  ctx.fill();

  const halo2 = ctx.createRadialGradient(0, h, 0, 0, h, w * 0.9);
  halo2.addColorStop(0, rgba(t.purple, 0.22));
  halo2.addColorStop(1, rgba(t.purple, 0));
  rr(ctx, 0, 0, w, h, 12);
  ctx.fillStyle = halo2;
  ctx.fill();
  ctx.restore();
}

function drawForeground(ctx) {
  const node = this;
  if (!node) return;
  decorate(node);
  if (node.flags && node.flags.collapsed) return;
  const t = palette();
  syncVars(t);
  const st = stateOf(node);
  const wh = sizeOf(node);
  const w = wh[0];
  const h = wh[1];

  ctx.save();
  const edge = ctx.createLinearGradient(0, 0, w, 0);
  edge.addColorStop(0, t.orange);
  edge.addColorStop(0.46, t.pink);
  edge.addColorStop(0.78, t.purple);
  edge.addColorStop(1, t.cyan);
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = edge;
  ctx.fillRect(0, -2, w, 2);
  ctx.globalAlpha = 1;

  const g = ctx.createLinearGradient(0, -TITLE_H, w, h);
  g.addColorStop(0, t.orange);
  g.addColorStop(0.38, t.pink);
  g.addColorStop(0.74, t.purple);
  g.addColorStop(1, t.cyan);
  rr(ctx, -1, -TITLE_H - 1, w + 2, h + TITLE_H + 2, 13);
  ctx.strokeStyle = g;
  ctx.lineWidth = 1.6;
  if (st.on) {
    ctx.shadowColor = t.pink;
    ctx.shadowBlur = 12;
    ctx.globalAlpha = 0.95;
  } else {
    ctx.globalAlpha = 0.4;
  }
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  if (w >= 230) {
    const label = st.on ? (st.auto ? "自动读词 · 已启用" : "手填词 · 已启用") : "存档已停用";
    ctx.font = "700 10.5px 'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif";
    const tw = ctx.measureText(label).width;
    const capW = Math.round(tw + 26);
    const capH = 18;
    const capX = w - capW - 12;
    const capY = -TITLE_H + Math.round((TITLE_H - capH) / 2);
    rr(ctx, capX, capY, capW, capH, 9);
    ctx.fillStyle = "rgba(12,8,24,.82)";
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = st.on ? rgba(t.cyan, 0.75) : "rgba(255,255,255,.22)";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(capX + 10, capY + capH / 2, 3, 0, Math.PI * 2);
    ctx.fillStyle = st.on ? "#4ADE80" : "#8A84A8";
    ctx.fill();
    ctx.textBaseline = "middle";
    ctx.fillStyle = st.on ? "#F3EEFF" : "#A9A2C4";
    ctx.fillText(label, capX + 17, capY + capH / 2 + 0.5);
  }

  if (h > 260) {
    const tip = st.on
      ? "留空自动读取提示词 · 出图成功后写入词图库"
      : "存档已关闭 · 本次运行不写入词图库";
    ctx.font = "10px 'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "rgba(205,197,235,.62)";
    ctx.fillText(tip, 12, h - 10, Math.max(40, w - 24));
  }
  ctx.restore();
}

function chain(node, key, fn) {
  const prev = node[key];
  node[key] = function (...args) {
    let out;
    try { if (typeof prev === "function") out = prev.apply(this, args); } catch (e) { }
    try { fn.apply(this, args); } catch (e) { }
    return out;
  };
}

function install(node) {
  if (!node || node.__lgsSkin) return;
  if (node.comfyClass !== CLS && node.type !== CLS) return;
  node.__lgsSkin = true;
  injectCSS();
  try {
    node.bgcolor = palette().bg2;
    node.color = "#2A2140";
  } catch (e) { }
  chain(node, "onDrawBackground", drawBackground);
  chain(node, "onDrawForeground", drawForeground);
  decorate(node);
  setTimeout(() => decorate(node), 80);
  setTimeout(() => decorate(node), 320);
}

app.registerExtension({
  name: "luori.GallerySaverSkin",
  setup() {
    injectCSS();
  },
  nodeCreated(node) {
    install(node);
  },
  loadedGraphNode(node) {
    install(node);
  },
});

console.log("[GallerySaverSkin] 存档节点皮肤已加载 v" + SKIN_VERSION);
