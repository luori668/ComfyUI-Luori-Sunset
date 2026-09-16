import { app } from "../../scripts/app.js";

const SKIN_VERSION = "1.0.5";

const NODES = {
  ZImagePromptGeneratorNode: {
    tag: "SOURCE MIXER",
    hue: ["#FF8A3D", "#FF2E93", "#8B2FF7"],
    bg: ["rgba(255,46,147,.18)", "rgba(139,47,247,.22)", "#191134", "#100B1F"],
  },
  ZImagePromptLoaderNode: {
    tag: "CARD DRAW",
    hue: ["#22D3EE", "#3B82F6", "#8B2FF7"],
    bg: ["rgba(34,211,238,.16)", "rgba(59,130,246,.20)", "#0F1A2E", "#0A0F1E"],
  },
  ZImageFashionPresetLoaderNode: {
    tag: "STYLE PRESET",
    hue: ["#FF2E93", "#FF7A9C", "#FF8A3D"],
    bg: ["rgba(255,46,147,.20)", "rgba(255,122,156,.15)", "#2A0F22", "#160A18"],
  },
};

const CAT_COLOR = {
  "超强模式": "#FFB020",
  "古装": "#14B8A6",
  "古风": "#3B82F6",
  "艺术摄影": "#8B2FF7",
  "cos": "#FF2E93",
  "糖水少女": "#FF7A9C",
  "NSFW": "#FF3D71",
  "抽卡": "#F59E0B",
  "随机模式": "#22D3EE",
};
const EXTRA_PALETTE = ["#10B981", "#06B6D4", "#6366F1", "#D946EF", "#F43F5E",
                       "#84CC16", "#0891B2", "#7C3AED", "#EA580C", "#0EA5E9"];

const NOT_CATEGORY = ["超强模式", "随机模式", "触发词开关"];

const CAT_SIZE = {
  "古装": 70, "古风": 159, "艺术摄影": 73, "cos": 106,
  "糖水少女": 106, "NSFW": 73, "抽卡": 112,
};

const STYLE_TAG_COLOR = {
  "日系": "#A5F3FC", "韩系": "#F0ABFC", "法式": "#FCD34D", "美式": "#60A5FA",
  "森系": "#86EFAC", "纯欲": "#FDA4AF", "极简": "#94A3B8", "暗黑": "#7C3AED",
  "复古港风": "#FB7185", "运动": "#4ADE80", "洛丽塔": "#F9A8D4", "中性": "#A1A1AA",
  "度假": "#FDBA74", "盐系": "#8DD3C7", "破碎": "#C4B5FD", "甜辣": "#FB923C",
  "复古": "#D6BCFA", "未来": "#22D3EE", "国风": "#F87171", "职业": "#93C5FD",
};

const CONFIG = {
  autoResize: true,
  width: 352,
  panelPad: 10,
  edgeGap: 2,
  syncInterval: 300,
  minDragMs: 1500,
  hideNative: true,
  paintNode: true,
  glow: true,
};

const WEAR_MIN_W = 400;

const TITLE_H = 30;

const NODE_INK = {
  deep: "#100B1F",
  head: "#3A2A6A",
};

const DECK = "zs_deck";


const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

const findW = (node, name) => node?.widgets?.find((w) => w.name === name) ?? null;

function readW(node, name, fallback) {
  const w = findW(node, name);
  return w ? w.value : fallback;
}

function writeW(node, name, value) {
  const w = findW(node, name);
  if (!w) return;
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
    try { fn.apply(this, args); } catch (e) { console.warn("[ZImageSkin]", e); }
    return out;
  };
}

function dbg(node, msg) {
  try {
    if (!node.__zsDbg) node.__zsDbg = [];
    const a = node.__zsDbg;
    const last = a[a.length - 1];
    if (last && last.msg === msg && Date.now() - last.t < 900) return;
    a.push({ t: Date.now() % 100000, msg });
    if (a.length > 8) a.shift();
  } catch (e) {  }
}


const THEME = {
  orange: "#FF8A3D", pink: "#FF2E93", purple: "#8B2FF7", cyan: "#22D3EE",
  danger: "#FF3D71", gold: "#FFB020",
  tx: "#EDE9FE", dim: "#9A90C4", ln: "rgba(255,255,255,.09)",
};

let cssDone = false;
function injectCSS() {
  if (cssDone) return;
  cssDone = true;
  const s = document.createElement("style");
  s.id = "zimage-skin-css";
  s.textContent = `
@property --zsa { syntax:'<angle>'; initial-value:0deg; inherits:false; }

.zs-root{
  --o:${THEME.orange}; --p:${THEME.pink}; --v:${THEME.purple}; --cy:${THEME.cyan};
  --dg:${THEME.danger}; --gd:${THEME.gold};
  --c1:${THEME.orange}; --c2:${THEME.pink}; --c3:${THEME.purple};
  --bg1:rgba(255,46,147,.18); --bg2:rgba(139,47,247,.22);
  --bgtop:#191134; --bgbtm:#100B1F;
  --ln:${THEME.ln}; --tx:${THEME.tx}; --dim:${THEME.dim};
  box-sizing:border-box; width:100%; padding:${CONFIG.panelPad}px;
  /* 高度必须由内容决定：ComfyUI 会给这个元素加 h-full 类，
     一旦跟着父盒子走 → 面板被压扁 → 内容被裁。!important 用来压过 h-full */
  height:auto !important; min-height:0; overflow:visible;
  font:12px/1.45 "Segoe UI","PingFang SC","Microsoft YaHei",system-ui,sans-serif;
  color:var(--tx); border-radius:12px;
  background:
    radial-gradient(130% 90% at 100% 0%, var(--bg1), transparent 58%),
    radial-gradient(120% 85% at 0% 100%, var(--bg2), transparent 58%),
    linear-gradient(180deg,var(--bgtop),var(--bgbtm));
  border:1px solid rgba(255,255,255,.075);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 10px 30px rgba(0,0,0,.55);
}
.zs-root *{box-sizing:border-box;}
.zs-body{display:flex;flex-direction:column;flex:0 0 auto;width:100%;}

.zs-head{display:flex;align-items:center;gap:8px;padding-bottom:8px;border-bottom:1px solid var(--ln);}
.zs-dot{width:7px;height:7px;border-radius:50%;flex:0 0 auto;
  background:var(--c1);box-shadow:0 0 9px var(--c1);animation:zspulse 2.6s ease-in-out infinite;}
@keyframes zspulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.82)}}
.zs-title{font-weight:800;font-size:12.5px;letter-spacing:.05em;white-space:nowrap;
  background:linear-gradient(92deg,var(--c1),var(--c2) 52%,var(--c3));
  -webkit-background-clip:text;background-clip:text;color:transparent;}
.zs-chip{margin-left:auto;flex:0 0 auto;padding:3px 9px;border-radius:99px;font-size:10px;
  font-weight:700;letter-spacing:.06em;color:var(--dim);white-space:nowrap;
  border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.035);
  transition:color .18s,border-color .18s,background .18s;}
.zs-chip.hot{color:#FFD8A8;border-color:rgba(255,138,61,.4);background:rgba(255,138,61,.1);}
.zs-chip.zero{color:#FF9BAE;border-color:rgba(255,61,113,.4);background:rgba(255,61,113,.09);}

/* 分组：左侧一条主题色竖条 */
.zs-grp{margin-top:9px;}
.zs-gh{display:flex;align-items:center;gap:7px;margin:0 0 7px;
  font-size:9.5px;letter-spacing:.14em;color:var(--dim);text-transform:uppercase;}
.zs-gh i{width:3px;height:11px;border-radius:2px;background:var(--gc,${THEME.orange});
  box-shadow:0 0 8px var(--gc,${THEME.orange});flex:0 0 auto;}
.zs-gh b{font-weight:600;letter-spacing:.02em;font-size:10.5px;color:#C9C0EA;text-transform:none;}
.zs-gh::after{content:"";flex:1;height:1px;opacity:.5;
  background:linear-gradient(90deg,var(--gc,rgba(255,138,61,.5)),transparent);}

.zs-two{display:grid;grid-template-columns:1fr 1fr;gap:6px;}
.zs-one{margin-top:6px;}

/* 下拉：外面套一层壳，好看又能放箭头 */
.zs-field{position:relative;display:flex;align-items:center;height:30px;border-radius:8px;
  border:1px solid rgba(255,255,255,.1);
  background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.018));
  transition:border-color .16s,background .16s;}
.zs-field:hover{border-color:rgba(255,255,255,.24);}
.zs-field .zs-k{font-size:9px;letter-spacing:.04em;color:var(--dim);flex:0 0 auto;padding-left:8px;}
.zs-field select{flex:1;min-width:0;appearance:none;-webkit-appearance:none;
  background:transparent;border:none;outline:none;cursor:pointer;
  color:#D8D2F5;font:11px/1.2 inherit;padding:0 16px 0 6px;}
.zs-field select:hover{color:#fff;}
.zs-field::after{content:"\\25BE";position:absolute;right:7px;font-size:8px;
  color:var(--dim);pointer-events:none;}
.zs-field select option{background:#191134;color:#EDE9FE;}

/* 细节级别：5 段进度条 */
.zs-seg{display:grid;grid-template-columns:repeat(5,1fr);gap:3px;height:30px;}
.zs-seg b{display:flex;align-items:center;justify-content:center;border-radius:7px;
  font:600 10px/1 inherit;color:var(--dim);cursor:pointer;user-select:none;
  border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.03);
  transition:all .16s;}
.zs-seg b:hover{color:#fff;border-color:rgba(255,255,255,.24);}
.zs-seg b.on{color:#fff;border-color:transparent;
  background:linear-gradient(150deg,var(--c1),var(--c2));
  box-shadow:0 3px 12px rgba(255,46,147,.4);}

/* 开关 */
.zs-flags{display:grid;grid-template-columns:1fr 1fr;gap:5px;}
.zs-sw{position:relative;display:flex;align-items:center;gap:7px;height:29px;padding:0 8px;
  border-radius:8px;cursor:pointer;font-size:10.5px;color:var(--dim);user-select:none;
  border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.028);
  transition:color .16s,border-color .16s,background .16s;}
.zs-sw .zs-pg{width:22px;height:12px;border-radius:99px;flex:0 0 auto;position:relative;
  background:rgba(255,255,255,.13);transition:background .18s;}
.zs-sw .zs-pg::after{content:"";position:absolute;left:1.5px;top:1.5px;width:9px;height:9px;
  border-radius:50%;background:#8b83a8;transition:transform .18s,background .18s;}
.zs-sw.on{color:#fff;}
.zs-sw.on .zs-pg{background:linear-gradient(90deg,var(--c1),var(--c2));}
.zs-sw.on .zs-pg::after{transform:translateX(10px);background:#fff;}
.zs-sw .zs-tx{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.zs-sw.zs-danger.on{border-color:rgba(255,61,113,.6);background:rgba(255,61,113,.1);
  animation:zsflash 1.1s ease-in-out infinite;}
.zs-sw.zs-danger.on .zs-pg{background:${THEME.danger};}
@keyframes zsflash{
  0%,100%{box-shadow:0 0 0 1px rgba(255,61,113,.35),0 0 14px rgba(255,61,113,.35)}
  50%{box-shadow:0 0 0 1px rgba(255,61,113,.9),0 0 22px rgba(255,61,113,.75)}}

/* 分类方块 */
.zs-cats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;}
.zs-cat{position:relative;height:46px;padding:0;border-radius:9px;cursor:pointer;overflow:hidden;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;
  border:1px solid rgba(255,255,255,.1);color:var(--dim);
  background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.015));
  font:600 10.5px/1.15 inherit;
  transition:transform .16s cubic-bezier(.4,0,.2,1),color .16s,border-color .16s;}
.zs-cat .zs-sym{font-size:13px;font-weight:800;}
.zs-cat .zs-nm{letter-spacing:.02em;max-width:96%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.zs-cat .zs-n{font:700 8.5px/1 Consolas,monospace;opacity:.6;}
.zs-cat:hover{transform:translateY(-1px);color:#fff;border-color:var(--c);}
.zs-cat:active{transform:translateY(0) scale(.97);}
.zs-cat.on{color:#fff;border-color:transparent;
  background:linear-gradient(150deg,var(--c),rgba(0,0,0,.55));
  box-shadow:0 4px 16px var(--c),inset 0 0 0 1px rgba(255,255,255,.18);}
.zs-cat.on::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1.6px;
  background:conic-gradient(from var(--zsa),
    transparent 0deg 248deg, var(--c) 288deg, #fff 318deg, transparent 348deg 360deg);
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;
  animation:zsspin 3.2s linear infinite;pointer-events:none;}
.zs-cat.zs-wide{grid-column:1 / -1;height:42px;flex-direction:row;gap:8px;}
.zs-cat.zs-aurora.on::before{animation-duration:4.4s;padding:2px;
  background:conic-gradient(from var(--zsa),#FF8A3D,#FF2E93,#8B2FF7,#22D3EE,#FF8A3D);}
.zs-cat.zs-danger.on{background:linear-gradient(150deg,#FF3D71,#8B1030);
  animation:zsflash .95s ease-in-out infinite;}
.zs-cat.zs-danger.on::before{background:none;}
@keyframes zsspin{to{--zsa:360deg;}}

/* 超强模式大按钮 */
.zs-mega{position:relative;width:100%;height:46px;border-radius:10px;cursor:pointer;overflow:hidden;
  border:1px solid rgba(255,255,255,.12);color:var(--dim);
  background:linear-gradient(180deg,rgba(255,208,138,.06),rgba(255,255,255,.015));
  font:700 12px/1.2 inherit;display:flex;align-items:center;justify-content:center;gap:9px;
  transition:all .18s;}
.zs-mega .zs-k{font:800 10px/1 Consolas,monospace;letter-spacing:.1em;opacity:.75;
  border:1px solid currentColor;border-radius:5px;padding:3px 5px;}
.zs-mega .zs-n{font:700 10px/1 Consolas,monospace;opacity:.7;}
.zs-mega:hover{color:#fff;border-color:rgba(255,176,32,.6);}
.zs-mega.on{color:#fff;border-color:transparent;
  background:linear-gradient(115deg,#FFB020,#FF7A1F 55%,#FF2E93);
  box-shadow:0 5px 20px rgba(255,176,32,.42),inset 0 0 0 1px rgba(255,255,255,.2);}
.zs-mega.on::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1.6px;
  background:conic-gradient(from var(--zsa),transparent 0 246deg,#FFF3D0 300deg,#FFB020 326deg,transparent 352deg 360deg);
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;
  animation:zsspin 3s linear infinite;pointer-events:none;}

/* 种子行 —— 一行四件：标签 / 数字 / 随机按钮 / 状态胶囊（固定·随机，靠 margin-left:auto 顶到最右）。
   行内四件的伸缩权限是刻意配的：标签、按钮、胶囊一律 flex:0 0 auto 不许被压缩，
   只有数字框能收缩，且收缩时用省略号降级 —— 这样 15~20 位的长种子最坏也只是
   "数字尾巴变省略号"，绝不会把邻居挤变形或压到按钮上。 */
.zs-seedrow{display:flex;flex-wrap:nowrap;align-items:center;gap:6px;margin-top:9px;padding:7px 8px;
  border-radius:9px;border:1px solid rgba(255,255,255,.09);background:rgba(0,0,0,.22);}
/* 标签用缩写 "S"（完整词靠 title 提示）：只在窄节点下生效。节点被拖到 270px 时
   行内可用宽仅 84px，写全 "SEED" 要多吃 ~20px，14 位种子就放不下了。 */
.zs-seedrow .zs-lbl{flex:0 0 auto;font-size:9px;letter-spacing:.14em;color:var(--dim);
  text-transform:uppercase;cursor:help;}
.zs-seedrow .zs-num{flex:0 1 auto;font:700 13px/1 Consolas,monospace;color:#FFD08A;letter-spacing:.04em;
  min-width:56px;text-align:center;padding:3px 6px;border-radius:6px;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  background:rgba(255,208,138,.08);border:1px solid rgba(255,208,138,.22);}
.zs-seedrow .zs-mini{flex:0 0 auto;height:22px;padding:0 8px;border-radius:6px;cursor:pointer;
  font:700 10px/1 inherit;color:var(--dim);border:1px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.03);}
.zs-seedrow .zs-mini:hover{color:#fff;border-color:rgba(255,138,61,.55);}
/* 窄节点时藏掉「随机」胶囊按钮，把空间留给种子数字。
   功能不丢：左边的 S 标签本身就是"点一下换随机数"的按钮，且它不吃额外宽度。
   阈值 300px 按实测定（270 窄 / 400 宽）—— 正常不会触发（穿搭节点已被
   ensureWearWidth 抬到 400），这是用户手动拖窄时的兜底。 */
.zs-seedrow.zs-narrow{position:relative;}
.zs-seedrow.zs-narrow .zs-mini{display:none;}
.zs-seedrow.zs-narrow .zs-lbl{cursor:pointer;color:#FF9A5C;border-radius:4px;
  padding:2px 5px;background:rgba(255,138,61,.1);
  border:1px solid rgba(255,138,61,.28);}
.zs-seedrow.zs-narrow .zs-lbl:hover{color:#fff;background:rgba(255,138,61,.22);}
/* ⚠ 状态类名必须带 zs- 前缀！宿主页面（ComfyUI 用的是 Tailwind 工具类）里
   存在一批"裸类名"，挂到任何元素上都会立刻改布局，实测有效的是：
     .fixed{position:fixed;min-width:0;min-height:0}  .hidden{display:none}
     .relative .absolute .sticky（改 position）/ .flex .grid .table（改 display）
     .grow{flex-grow:1}  .truncate{overflow:hidden;white-space:nowrap}
   反面教材（2026-09-16 修的 bug）：.zs-tag 在"固定态"加了裸的 fixed 类，
   position 被顶成 fixed → 胶囊被踢出 flex 流、按视口定位，正好砸在左边的
   SEED 标签上，看起来就是"种子行重叠了"。现在改成 zs-fixed，并在基础样式里
   显式钉住 position/min-width（选择器权重 0,2,0 > 工具类的 0,1,0，双保险）。 */
.zs-seedrow .zs-tag{flex:0 0 auto;margin-left:auto;position:static;min-width:auto;min-height:auto;
  font:700 9.5px/1 Consolas,monospace;letter-spacing:.06em;
  color:#7DE3C0;border:1px solid rgba(125,227,192,.3);background:rgba(125,227,192,.08);
  padding:3px 7px;border-radius:99px;}
.zs-seedrow .zs-tag.zs-fixed{color:#FFD08A;border-color:rgba(255,208,138,.35);
  background:rgba(255,208,138,.09);}

/* 触发词 */
.zs-trig{margin-top:9px;padding:8px;border-radius:9px;
  border:1px solid rgba(255,255,255,.09);background:rgba(0,0,0,.2);}
.zs-ta{width:100%;height:44px;margin-top:6px;padding:6px 8px;border-radius:7px;resize:none;
  font:11px/1.45 inherit;color:var(--tx);outline:none;
  border:1px solid rgba(255,255,255,.11);background:rgba(255,255,255,.035);}
.zs-ta:focus{border-color:rgba(255,138,61,.55);}
.zs-ta::placeholder{color:#5F5880;}

/* 穿搭预览卡 */
.zs-pcard{margin-top:9px;padding:10px;border-radius:10px;
  border:1px solid rgba(255,255,255,.11);
  background:linear-gradient(160deg,rgba(255,46,147,.16),rgba(255,255,255,.02));}
.zs-pcard .zs-pt{display:flex;align-items:center;gap:8px;}
.zs-pcard .zs-id{font:700 9px/1 Consolas,monospace;color:#FFB7D0;letter-spacing:.08em;
  border:1px solid rgba(255,183,208,.3);padding:3px 6px;border-radius:5px;}
.zs-pcard .zs-pn{font-weight:700;font-size:12.5px;color:#fff;}
.zs-pcard .zs-pc{margin-top:7px;font-size:11px;line-height:1.6;color:#CDBED8;
  max-height:56px;overflow:hidden;}
.zs-tags{display:flex;flex-wrap:wrap;gap:5px;margin-top:9px;}
.zs-tagx{font:600 10px/1 inherit;padding:5px 8px;border-radius:99px;cursor:pointer;
  border:1px solid var(--c);color:var(--c);background:transparent;transition:all .16s;}
.zs-tagx:hover{color:#fff;background:var(--c);}
.zs-tagx.on{color:#111;background:var(--c);border-color:var(--c);}

.zs-hint{margin-top:7px;padding:6px 9px;border-radius:8px;font-size:10.5px;
  color:#C4BBE8;background:rgba(255,255,255,.03);border:1px dashed rgba(255,255,255,.12);}
.zs-hint b{color:#FFD08A;font-weight:700;}
.zs-empty{padding:14px 8px;text-align:center;font-size:11px;color:#FF9BAE;
  background:rgba(255,61,113,.08);border:1px dashed rgba(255,61,113,.35);border-radius:9px;}
`;
  document.head.appendChild(s);
}


let ptrDown = false;
let ptrLast = 0;

function bindPointerWatch() {
  if (bindPointerWatch.done) return;
  bindPointerWatch.done = true;
  const win = (t, f) => window.addEventListener(t, f, true);
  win("pointerdown", () => { ptrDown = true; ptrLast = Date.now(); });
  win("pointermove", () => { if (ptrDown) ptrLast = Date.now(); });
  const up = () => { ptrDown = false; };
  win("pointerup", up);
  win("pointercancel", up);
  window.addEventListener("blur", up);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) ptrDown = false;
  });
}

function clearStaleDrag(node) {
  if (ptrDown) return;
  try {
    const cv = app?.canvas;
    if (!cv) return;
    const did = [];
    if (cv.resizing_node === node) { cv.resizing_node = null; did.push("resizing_node"); }
    if (cv.resizingNode === node) { cv.resizingNode = null; did.push("resizingNode"); }
    if (cv.pointerIsDown === true) { cv.pointerIsDown = false; did.push("pointerIsDown"); }
    if (did.length) console.log(`[ZImageSkin] 清残留拖拽状态(${did.join("+")})`);
  } catch (e) {  }
}

function isDragging() {
  return ptrDown || (Date.now() - ptrLast) < CONFIG.minDragMs;
}

function widgetY(node) {
  const w = node.widgets?.find((x) => x.name === DECK);
  return w ? (w.y ?? 0) : 0;
}

function relayout(node, root) {
  if (!CONFIG.autoResize) return false;
  if (!node.graph || node.__zsGone) return false;
  if (!root || !root.offsetHeight) return false;

  if (isDragging()) { dbg(node, "skip: 指针按着"); return false; }

  clearStaleDrag(node);

  const h = root.offsetHeight;
  const goal = Math.round(h + widgetY(node) + CONFIG.panelPad + CONFIG.edgeGap);
  const cur = Math.round(node.size?.[1] ?? 0);
  if (Math.abs(goal - cur) <= 2) { dbg(node, `ok ${cur}`); return true; }

  dbg(node, `set ${cur}->${goal} (面板 ${h} 偏移 ${widgetY(node)})`);
  try {
    node.setSize([Math.round(node.size?.[0] ?? CONFIG.width), goal]);
    node.graph?.setDirtyCanvas?.(true, true);
    node.setDirtyCanvas?.(true, true);
  } catch (e) { console.warn("[ZImageSkin] setSize 失败", e); }
  return true;
}

let wdTimer = null;

function startWatchdog() {
  if (wdTimer) return;
  wdTimer = setInterval(() => {
    const nodes = app?.graph?._nodes;
    if (!Array.isArray(nodes)) return;
    for (const n of nodes) {
      const ctx = n.__zsCtx;
      if (!ctx || n.__zsGone) continue;
      try {
        ensureHidden(n);
        if (typeof ctx.sync === "function") ctx.sync();
        relayout(n, ctx.root);
      } catch (e) { console.error("[ZImageSkin] 巡检失败:", e); }
    }
  }, CONFIG.syncInterval);
}

function hideWidget(w) {
  if (!w || w.__zshidden) return;
  w.__zshidden = true;
  w.__zsorig = {
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

function ensureHidden(node) {
  try {
    for (const w of node.widgets || []) {
      if (w.name === DECK) continue;
      hideWidget(w);
    }
  } catch (e) {  }
}


const fadeOf = (c) => String(c).replace(/,\s*[\d.]+\s*\)$/, ",0)");

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

function anyActive(node) {
  for (const w of node.widgets || []) {
    if (typeof w.value === "boolean" && w.value) return true;
  }
  return false;
}

function paintBackground(ctx, node) {
  const N = NODES[node.comfyClass];
  if (!N) return;
  const [w, h] = nodeSize(node);
  const th = TITLE_H;

  ctx.save();

  const g = ctx.createLinearGradient(0, 0, w * 0.4, h);
  g.addColorStop(0, N.bg[2]);
  g.addColorStop(1, N.bg[3]);
  rr(ctx, 0, 0, w, h, 12);
  ctx.fillStyle = g;
  ctx.fill();

  const halo1 = ctx.createRadialGradient(w, 0, 0, w, 0, w * 0.9);
  halo1.addColorStop(0, N.bg[0]);
  halo1.addColorStop(1, fadeOf(N.bg[0]));
  rr(ctx, 0, 0, w, h, 12);
  ctx.fillStyle = halo1;
  ctx.fill();

  const halo2 = ctx.createRadialGradient(0, h, 0, 0, h, w * 0.9);
  halo2.addColorStop(0, N.bg[1]);
  halo2.addColorStop(1, fadeOf(N.bg[1]));
  rr(ctx, 0, 0, w, h, 12);
  ctx.fillStyle = halo2;
  ctx.fill();

  const tg = ctx.createLinearGradient(0, 0, w, 0);
  tg.addColorStop(0, N.hue[0]);
  tg.addColorStop(0.48, N.hue[1]);
  tg.addColorStop(1, N.hue[2]);
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(0, -th, w, th, [12, 12, 0, 0]);
  } else {
    ctx.beginPath();
    ctx.rect(0, -th, w, th);
  }
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = tg;
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();
}

function paintFrame(ctx, node) {
  const N = NODES[node.comfyClass];
  if (!N) return;
  const [w, h] = nodeSize(node);
  const th = TITLE_H;
  const active = anyActive(node);

  ctx.save();
  const g = ctx.createLinearGradient(0, -th, w, h);
  g.addColorStop(0.0, N.hue[0]);
  g.addColorStop(0.38, N.hue[1]);
  g.addColorStop(0.74, N.hue[2]);
  g.addColorStop(1.0, "#22D3EE");

  rr(ctx, -1, -th - 1, w + 2, h + th + 2, 13);
  ctx.strokeStyle = g;
  ctx.lineWidth = 1.6;
  if (CONFIG.glow && active) {
    ctx.shadowColor = N.hue[1];
    ctx.shadowBlur = 15;
    ctx.globalAlpha = 1;
  } else {
    ctx.globalAlpha = 0.5;
  }
  ctx.stroke();
  ctx.restore();
}

function installPainting(node) {
  if (!CONFIG.paintNode || node.__zspainted) return;
  node.__zspainted = true;

  const N = NODES[node.comfyClass];
  try {
    node.bgcolor = (N && N.bg[3]) || NODE_INK.deep;
    node.color = NODE_INK.head;
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


function makeSelect(node, wname, shortLabel) {
  const wrap = el("div", "zs-field");
  wrap.appendChild(el("span", "zs-k", shortLabel || wname));
  const sel = el("select");
  const w = findW(node, wname);
  const opts = Array.isArray(w?.options?.values) ? w.options.values
    : (Array.isArray(w?.options) ? w.options : []);
  for (const o of opts) {
    const op = el("option");
    op.value = String(o);
    op.textContent = String(o);
    sel.appendChild(op);
  }
  sel.value = String(readW(node, wname, "") ?? "");
  sel.addEventListener("change", () => {
    writeW(node, wname, sel.value);
    if (typeof node.__zsCtx?.sync === "function") node.__zsCtx.sync();
  });
  ["pointerdown", "mousedown", "wheel"].forEach((t) =>
    sel.addEventListener(t, (e) => e.stopPropagation()));
  wrap.appendChild(sel);
  wrap.__sel = sel;
  return wrap;
}

function makeSwitch(node, wname, text, danger) {
  const b = el("div", "zs-sw" + (danger ? " zs-danger" : ""));
  b.appendChild(el("span", "zs-pg"));
  b.appendChild(el("span", "zs-tx", text || wname));
  b.__wname = wname;
  const paint = () => b.classList.toggle("on", !!readW(node, wname, false));
  b.addEventListener("click", () => {
    writeW(node, wname, !readW(node, wname, false));
    paint();
    if (typeof node.__zsCtx?.sync === "function") node.__zsCtx.sync();
  });
  paint();
  b.__paint = paint;
  return b;
}

function makeCatTile(node, wname, color, symbol, count, extraCls, pick) {
  const b = el("button", "zs-cat" + (extraCls ? " " + extraCls : ""));
  b.type = "button";
  b.style.setProperty("--c", color);
  b.__wname = wname;
  b.appendChild(el("span", "zs-sym", symbol || "·"));
  b.appendChild(el("span", "zs-nm", wname));
  if (count) b.appendChild(el("span", "zs-n", String(count)));
  b.title = `${wname}${count ? ` · ${count} 条` : ""}\n点它就选它，其它分类自动关掉`;
  const paint = () => b.classList.toggle("on", !!readW(node, wname, false));
  b.addEventListener("click", () => {
    if (typeof pick === "function") pick(wname);
    else writeW(node, wname, !readW(node, wname, false));
    paint();
    if (typeof node.__zsCtx?.sync === "function") node.__zsCtx.sync();
  });
  paint();
  b.__paint = paint;
  return b;
}

const SEEDROW_NARROW = 300;

function makeSeedRow(node) {
  const row = el("div", "zs-seedrow");
  const lbl = el("span", "zs-lbl", "SEED");
  lbl.title = "点一下换一个随机种子";
  row.appendChild(lbl);
  const num = el("span", "zs-num", "0");
  row.appendChild(num);
  const btn = el("button", "zs-mini", "随机");
  btn.type = "button";
  const tag = el("span", "zs-tag", "随机");

  const roll = () => {
    writeW(node, "seed", Math.floor(Math.random() * 4294967295));
    if (typeof node.__zsCtx?.sync === "function") node.__zsCtx.sync();
  };
  btn.addEventListener("click", roll);
  lbl.addEventListener("click", () => {
    if (row.classList.contains("zs-narrow")) roll();
  });

  row.appendChild(btn);
  row.appendChild(tag);

  const layout = () => {
    const w = Number(node?.size?.[0]) || 0;
    row.classList.toggle("zs-narrow", w > 0 && w < SEEDROW_NARROW);
    lbl.textContent = row.classList.contains("zs-narrow") ? "S" : "SEED";
  };

  const paint = () => {
    layout();
    const v = Number(readW(node, "seed", 0)) || 0;
    num.textContent = v > 0 ? String(v) : "0";
    tag.textContent = v > 0 ? "固定" : "随机";
    tag.classList.toggle("zs-fixed", v > 0);
  };
  paint();
  row.__paint = paint;
  return row;
}

function makeTrigger(node) {
  const box = el("div", "zs-trig");
  const sw = makeSwitch(node, "触发词开关", "触发词 / TRIGGER", false);
  sw.style.border = "none";
  sw.style.background = "none";
  sw.style.padding = "0";
  sw.style.height = "auto";
  box.appendChild(sw);
  const ta = el("textarea", "zs-ta");
  ta.placeholder = "填在这里，会拼到提示词最前面";
  ta.value = String(readW(node, "触发词内容", "") ?? "");
  ta.addEventListener("input", () => writeW(node, "触发词内容", ta.value));
  ["pointerdown", "mousedown", "wheel", "keydown"].forEach((t) =>
    ta.addEventListener(t, (e) => e.stopPropagation()));
  box.appendChild(ta);
  box.__ta = ta;
  return box;
}

function section(title, color, cls) {
  const g = el("div", "zs-grp " + (cls || ""));
  g.style.setProperty("--gc", color);
  const h = el("div", "zs-gh");
  h.appendChild(el("i"));
  h.appendChild(el("b", null, title));
  g.appendChild(h);
  return g;
}


function buildGeneratorPanel(node) {
  const body = el("div", "zs-body");
  const refs = {};

  const head = el("div", "zs-head");
  head.appendChild(el("div", "zs-dot"));
  head.appendChild(el("div", "zs-title", "SOURCE MIXER"));
  const chip = el("div", "zs-chip", "23 参数");
  head.appendChild(chip);
  body.appendChild(head);

  const g1 = section("主题 · 风格", "#FF8A3D");
  const two1 = el("div", "zs-two");
  two1.appendChild(makeSelect(node, "风格主题", "主题"));
  two1.appendChild(makeSelect(node, "拍摄风格", "风格"));
  two1.appendChild(makeSelect(node, "拍摄类型", "类型"));
  two1.appendChild(makeSelect(node, "种族选择", "种族"));
  g1.appendChild(two1);
  const segWrap = el("div", "zs-one");
  const seg = el("div", "zs-seg");
  const LEVELS = ["简洁级", "普通级", "详细级", "大师级", "极致级"];
  const SHORT = ["简洁", "普通", "详细", "大师", "极致"];
  const segBtns = [];
  LEVELS.forEach((lv, i) => {
    const b = el("b", null, SHORT[i]);
    b.title = lv;
    b.addEventListener("click", () => {
      writeW(node, "细节级别", lv);
      segBtns.forEach((x) => x.classList.toggle("on", x.__lv === lv));
    });
    b.__lv = lv;
    segBtns.push(b);
    seg.appendChild(b);
  });
  refs.seg = segBtns;
  segWrap.appendChild(seg);
  g1.appendChild(segWrap);
  body.appendChild(g1);

  const g2 = section("人物 · MODEL", "#8B2FF7");
  const two2 = el("div", "zs-two");
  two2.appendChild(makeSelect(node, "年龄", "年龄"));
  two2.appendChild(makeSelect(node, "美瞳选择", "美瞳"));
  g2.appendChild(two2);
  const one2 = el("div", "zs-one");
  one2.appendChild(makeSelect(node, "身材", "身材"));
  g2.appendChild(one2);
  body.appendChild(g2);

  const g3 = section("装扮 · WARDROBE", "#FF2E93");
  const two3 = el("div", "zs-two");
  two3.appendChild(makeSelect(node, "丝袜类型", "丝袜"));
  two3.appendChild(makeSelect(node, "头部配饰", "头饰"));
  two3.appendChild(makeSelect(node, "鞋子类型", "鞋类"));
  two3.appendChild(makeSelect(node, "情趣衣服", "情趣"));
  g3.appendChild(two3);
  body.appendChild(g3);

  const g4 = section("动作 · 景别", "#22D3EE");
  const two4 = el("div", "zs-two");
  two4.appendChild(makeSelect(node, "动作", "动作"));
  two4.appendChild(makeSelect(node, "景别", "景别"));
  g4.appendChild(two4);
  body.appendChild(g4);

  const g5 = section("内容开关 · FLAGS", "#FF7A9C");
  const flags = el("div", "zs-flags");
  const flagDefs = [
    ["NSFW", "NSFW", true],
    ["包含姿势描述", "姿势描述", false],
    ["包含高级细节", "高级细节", false],
    ["包含画质参数", "画质参数", false],
    ["包含后缀参数", "后缀参数", false],
    ["启用前景特效", "前景特效", false],
  ];
  const flagRefs = [];
  for (const [wn, tx, dg] of flagDefs) {
    const s = makeSwitch(node, wn, tx, dg);
    flagRefs.push(s);
    flags.appendChild(s);
  }
  refs.flags = flagRefs;
  g5.appendChild(flags);
  body.appendChild(g5);

  const trig = makeTrigger(node);
  refs.trig = trig;
  body.appendChild(trig);

  const seedRow = makeSeedRow(node);
  refs.seed = seedRow;
  body.appendChild(seedRow);

  body.appendChild(el("div", "zs-hint", "输出 prompt → 接 CLIP 文本编码器"));

  function sync() {
    for (const f of body.querySelectorAll(".zs-field")) {
      const sel = f.__sel;
      if (!sel || document.activeElement === sel) continue;
      const w = sel.__wname ? findW(node, sel.__wname) : null;
      void w;
    }
    for (const f of body.querySelectorAll(".zs-field")) {
      const sel = f.querySelector("select");
      if (!sel || document.activeElement === sel) continue;
      const m = f.__forName || sel.dataset.for;
      if (m) {
        const v = String(readW(node, m, "") ?? "");
        if (sel.value !== v) sel.value = v;
      }
    }
    refs.seg.forEach((b) =>
      b.classList.toggle("on", String(readW(node, "细节级别", "")) === b.__lv));
    refs.flags.forEach((f) => f.__paint());
    refs.seed.__paint();
    const lv = String(readW(node, "细节级别", "大师级"));
    const extra = lv === "无" ? "" : ` · ${lv.replace("级", "")}`;
    chip.textContent = `23 参数${extra}`;
    chip.className = "zs-chip hot";
    if (trig.__ta && document.activeElement !== trig.__ta) {
      const v = String(readW(node, "触发词内容", "") ?? "");
      if (trig.__ta.value !== v) trig.__ta.value = v;
    }
  }

  return { root: makeRoot(node), body, sync, refs };
}

function buildDrawerPanel(node) {
  const body = el("div", "zs-body");
  const refs = { tiles: [] };

  const head = el("div", "zs-head");
  head.appendChild(el("div", "zs-dot"));
  head.appendChild(el("div", "zs-title", "CARD DRAW"));
  const chip = el("div", "zs-chip", "0 / 0");
  head.appendChild(chip);
  body.appendChild(head);

  function pick(name) {
    writeW(node, "超强模式", name === "超强模式");
    for (const t of refs.tiles) writeW(node, t.__wname, t.__wname === name);
  }

  const gSuper = section("超强模式 · SUPER（三选一）", "#FFB020");
  const mega = el("button", "zs-mega");
  mega.type = "button";
  mega.appendChild(el("span", "zs-k", "SUPER"));
  mega.appendChild(el("span", null, "超强模式 · 专属词库"));
  const supN = el("span", "zs-n", "—");
  mega.appendChild(supN);
  mega.__wname = "超强模式";
  mega.title = "超强模式：从 5501 条专属词库抽\n和下面每个分类互斥 —— 点它会关掉已选的分类";
  const paintMega = () => mega.classList.toggle("on", !!readW(node, "超强模式", false));
  mega.addEventListener("click", () => {
    pick("超强模式");
    paintMega();
    if (typeof node.__zsCtx?.sync === "function") node.__zsCtx.sync();
  });
  mega.__paint = paintMega;
  paintMega();
  gSuper.appendChild(mega);
  body.appendChild(gSuper);

  const catNames = (node.widgets || [])
    .filter((w) => typeof w.value === "boolean" && !NOT_CATEGORY.includes(w.name))
    .map((w) => w.name);
  const gCat = section("分类 · 每类一色（同一时刻只生效一个）", "#14B8A6");
  const grid = el("div", "zs-cats");
  let extraIdx = 0;
  for (const name of catNames) {
    const isAurora = name === "随机模式";
    const isDanger = name === "NSFW";
    let color = CAT_COLOR[name];
    if (!color) {
      color = EXTRA_PALETTE[extraIdx % EXTRA_PALETTE.length];
      extraIdx++;
    }
    const sym = { "古装": "古", "古风": "风", "艺术摄影": "艺", "cos": "C",
      "糖水少女": "糖", "NSFW": "18", "抽卡": "抽" }[name] || name.slice(0, 1);
    const count = CAT_SIZE[name];
    const tile = makeCatTile(node, name, color, sym, count,
      (isAurora ? "zs-wide zs-aurora" : "") + (isDanger ? " zs-danger" : ""), pick);
    refs.tiles.push(tile);
    grid.appendChild(tile);
  }
  const rnd = (node.widgets || []).find((w) => w.name === "随机模式");
  if (rnd) {
    const tile = makeCatTile(node, "随机模式", CAT_COLOR["随机模式"], "∞", null,
      "zs-wide zs-aurora", pick);
    tile.querySelector(".zs-nm").textContent = "随机模式 · 从全部分类抽取";
    refs.tiles.push(tile);
    grid.appendChild(tile);
  }
  gCat.appendChild(grid);
  body.appendChild(gCat);

  const trig = makeTrigger(node);
  refs.trig = trig;
  body.appendChild(trig);

  const seedRow = makeSeedRow(node);
  refs.seed = seedRow;
  body.appendChild(seedRow);

  body.appendChild(el("div", "zs-hint", "输出 prompt → 接 CLIP 文本编码器"));

  function sync() {
    for (const t of refs.tiles) t.__paint();
    mega.__paint();
    const act = [mega.__wname, ...refs.tiles.map((t) => t.__wname)]
      .filter((n) => !!readW(node, n, false));
    chip.textContent = act.length
      ? (act.length > 1 ? `${act[0]} +${act.length - 1}` : act[0])
      : "未选择";
    chip.className = "zs-chip" + (act.length ? " hot" : " zero");
    refs.seed.__paint();
    if (trig.__ta && document.activeElement !== trig.__ta) {
      const v = String(readW(node, "触发词内容", "") ?? "");
      if (trig.__ta.value !== v) trig.__ta.value = v;
    }
  }

  return { root: makeRoot(node), body, sync, refs };
}

function buildWearPanel(node) {
  const body = el("div", "zs-body");
  const refs = {};

  const head = el("div", "zs-head");
  head.appendChild(el("div", "zs-dot"));
  head.appendChild(el("div", "zs-title", "STYLE PRESET"));
  const chip = el("div", "zs-chip", "预设");
  head.appendChild(chip);
  body.appendChild(head);

  const g1 = section("预设 · PRESET", "#FF2E93");
  const selField = makeSelect(node, "预设选择", "预设");
  selField.__forName = "预设选择";
  refs.sel = selField;
  g1.appendChild(selField);
  body.appendChild(g1);

  const card = el("div", "zs-pcard");
  const pt = el("div", "zs-pt");
  const pid = el("span", "zs-id", "#—");
  const pname = el("span", "zs-pn", "读取中…");
  pt.appendChild(pid);
  pt.appendChild(pname);
  card.appendChild(pt);
  const pcont = el("div", "zs-pc", "");
  card.appendChild(pcont);
  refs.card = { pid, pname, pcont };
  body.appendChild(card);

  const g2 = section("风格标签 · STYLE", "#FF8A3D");
  const tags = el("div", "zs-tags");
  refs.tags = tags;
  g2.appendChild(tags);
  body.appendChild(g2);

  const g3 = section("润色 · POLISH", "#8B2FF7");
  const sw = makeSwitch(node, "润色模式", "智能风格润色（按标题匹配风格并补质感词）", false);
  refs.polish = sw;
  g3.appendChild(sw);
  body.appendChild(g3);

  const seedRow = makeSeedRow(node);
  refs.seed = seedRow;
  body.appendChild(seedRow);
  body.appendChild(el("div", "zs-hint", "输出 prompt → 接 CLIP 文本编码器"));

  const state = { data: null, styleOf: new Map() };
  fetch(`/extensions/ComfyUI-Luori-Sunset/presets.json`, { cache: "force-cache" })
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      if (!Array.isArray(d)) return;
      state.data = d;
      const byStyle = new Map();
      d.forEach((it, i) => {
        const title = String(it.title || "");
        const hit = Object.keys(STYLE_TAG_COLOR).find((s) => title.includes(s));
        if (hit) {
          if (!byStyle.has(hit)) byStyle.set(hit, title);
          state.styleOf.set(title, hit);
        }
        void i;
      });
      const frag = document.createDocumentFragment();
      for (const [style, firstTitle] of byStyle) {
        const t = el("span", "zs-tagx", style);
        t.style.setProperty("--c", STYLE_TAG_COLOR[style]);
        t.title = `跳到「${firstTitle}」`;
        t.addEventListener("click", () => {
          writeW(node, "预设选择", firstTitle);
          if (refs.sel.__sel) refs.sel.__sel.value = firstTitle;
          paintPreview();
        });
        frag.appendChild(t);
      }
      tags.appendChild(frag);
      chip.textContent = `44 套 · ${byStyle.size} 种风格`;
      paintPreview();
    })
    .catch(() => { chip.textContent = "预设数据未加载"; });

  function paintPreview() {
    const cur = String(readW(node, "预设选择", "随机") ?? "随机");
    const d = state.data;
    if (!d) { pname.textContent = cur; return; }
    let item = d.find((x) => String(x.title) === cur);
    if (!item) item = d[Math.floor(Math.random() * d.length)];
    if (!item) return;
    pid.textContent = item.id != null ? `#${String(item.id).padStart(3, "0")}` : "#—";
    pname.textContent = String(item.title || "");
    const c = String(item.content || "");
    pcont.textContent = c.length > 150 ? c.slice(0, 150) + "…" : c;
    const st = state.styleOf.get(String(item.title));
    for (const t of tags.querySelectorAll(".zs-tagx")) {
      t.classList.toggle("on", !!st && t.textContent === st);
    }
  }

  function sync() {
    const cur = String(readW(node, "预设选择", "随机") ?? "随机");
    if (refs.sel.__sel && document.activeElement !== refs.sel.__sel
        && refs.sel.__sel.value !== cur) {
      refs.sel.__sel.value = cur;
      paintPreview();
    }
    refs.polish.__paint();
    refs.seed.__paint();
  }

  paintPreview();
  return { root: makeRoot(node), body, sync, refs };
}


function makeRoot(node) {
  const t = NODES[node.comfyClass] || NODES.ZImagePromptGeneratorNode;
  const root = el("div", "zs-root");
  root.style.setProperty("--c1", t.hue[0]);
  root.style.setProperty("--c2", t.hue[1]);
  root.style.setProperty("--c3", t.hue[2]);
  root.style.setProperty("--bg1", t.bg[0]);
  root.style.setProperty("--bg2", t.bg[1]);
  root.style.setProperty("--bgtop", t.bg[2]);
  root.style.setProperty("--bgbtm", t.bg[3]);
  return root;
}

function ensureWearWidth(node) {
  if (node?.comfyClass !== "ZImageFashionPresetLoaderNode") return;
  if (!CONFIG.autoResize) return;
  try {
    const w = Math.round(Number(node.size?.[0]) || 0);
    const h = Math.round(Number(node.size?.[1]) || 0);
    if (w > 0 && w < WEAR_MIN_W) {
      node.setSize([WEAR_MIN_W, h]);
      node.graph?.setDirtyCanvas?.(true, true);
      node.setDirtyCanvas?.(true, true);
      console.log(`[ZImageSkin] 穿搭节点宽度 ${w} -> ${WEAR_MIN_W}`);
    }
  } catch (e) {  }
}

function install(node) {
  if (node.__zsCtx || node.__zsGone) return;
  const cls = node.comfyClass;
  if (!NODES[cls]) return;

  injectCSS();
  bindPointerWatch();
  installPainting(node);
  ensureHidden(node);
  ensureWearWidth(node);
  [0, 120, 400, 900, 1800].forEach((ms) =>
    setTimeout(() => { try { ensureHidden(node); } catch (e) { } }, ms));

  const built = cls === "ZImagePromptLoaderNode" ? buildDrawerPanel(node)
    : cls === "ZImageFashionPresetLoaderNode" ? buildWearPanel(node)
      : buildGeneratorPanel(node);

  const root = built.root || makeRoot(node);
  if (!built.root) root.appendChild(el("div", "zs-head", "面板"));
  root.appendChild(built.body);

  node.__zsCtx = { root, sync: built.sync, cls };

  let dm = null;
  if (typeof node.addDOMWidget === "function") {
    dm = node.addDOMWidget(DECK, "zimageui", root, {
      serialize: false,
      hideOnZoom: false,
      getHeight: () => root.offsetHeight,
    });
    if (dm) {
      dm.computeSize = () => [CONFIG.width, root.offsetHeight];
      node.__zsDm = dm;
    }
  } else {
    console.warn("[ZImageSkin] 当前前端不支持 addDOMWidget，面板退化为浮层");
  }

  const fit = () => relayout(node, root);
  fit();
  requestAnimationFrame(fit);
  [120, 400, 900, 1800, 3000].forEach((ms) => setTimeout(fit, ms));
  startWatchdog();

  if (typeof ResizeObserver === "function") {
    let last = 0;
    const ro = new ResizeObserver(() => {
      const now = Date.now();
      if (now - last < 60) return;
      last = now;
      fit();
    });
    try { ro.observe(built.body); } catch (e) {  }
    chain(node, "onRemoved", () => { try { ro.disconnect(); } catch (e) { } });
  }

  chain(node, "onResize", () => { fit(); });
  chain(node, "onRemoved", () => {
    node.__zsGone = true;
    node.__zsCtx = null;
  });
  chain(node, "onConfigure", () => {
    setTimeout(() => { built.sync?.(); fit(); }, 30);
    setTimeout(() => { built.sync?.(); fit(); }, 400);
  });

  console.log(`[ZImageSkin] 面板已挂载: ${node.title || cls}`);
}


app.registerExtension({
  name: "luori.SunsetZImageSkin",

  beforeRegisterNodeDef(nodeType, nodeData) {
    if (!NODES[nodeData?.name]) return;
    try {
      const req = nodeData?.input?.required || {};
      const spec = req["触发词开关"];
      if (Array.isArray(spec) && spec[1] && typeof spec[1] === "object") {
        spec[1].default = true;
      }
      for (const key of Object.keys(req)) {
        const s = req[key];
        if (Array.isArray(s) && s[1] && typeof s[1] === "object" && s[1].hidden === undefined) {
          s[1].hidden = true;
        }
      }
    } catch (e) { console.warn("[ZImageSkin] 节点定义补丁失败", e); }
  },

  nodeCreated(node) {
    if (!NODES[node.comfyClass]) return;
    const go = () => {
      try { install(node); } catch (e) { console.error("[ZImageSkin] 挂载失败", e); }
    };
    if (node.graph) go();
    else setTimeout(go, 0);
  },

  loadedGraphNode(node) {
    if (!NODES[node.comfyClass]) return;
    setTimeout(() => {
      try {
        install(node);
        ensureWearWidth(node);
        node.__zsCtx?.sync?.();
        relayout(node, node.__zsCtx?.root);
      } catch (e) { console.warn("[ZImageSkin] 恢复节点失败", e); }
    }, 60);
  },
});

console.log(`[ZImageSkin] 皮肤脚本已加载 v${SKIN_VERSION}（Z-image 落日三件套 · 霓虹外观）`);
