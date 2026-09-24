import { app } from "../../scripts/app.js";

const SKIN_VERSION = "1.1.1";

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
  SunsetNSPromptSelector: {
    tag: "NS MIXER",
    hue: ["#FF3D71", "#8B2FF7", "#22D3EE"],
    bg: ["rgba(255,61,113,.20)", "rgba(139,47,247,.20)", "#26081C", "#120814"],
  },
  SunsetLRPromptBuilder: {
    tag: "LR BUILDER",
    hue: ["#8B2FF7", "#22D3EE", "#FF8A3D"],
    bg: ["rgba(139,47,247,.20)", "rgba(34,211,238,.16)", "#1B1233", "#100B1F"],
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
const NS_MIN_W = 520;
const LR_MIN_W = 480;

const LR_GROUPS = [
  ["主题", ["画面比例", "成像媒介", "写真大类", "写真主题", "年龄阶段", "族裔大类", "地域族裔分支"]],
  ["人物", ["脸型", "轮廓细节", "眼型", "瞳色", "眼睑特征", "肤色", "肤质",
            "基础身形", "身量观感", "线条重点"]],
  ["妆发", ["妆容模式", "整体妆容预设", "底妆质感", "眼影色系", "眼线造型", "唇妆颜色", "唇面质感",
            "发色模式", "发色", "发色色调", "染色方式", "头发长度", "发质与卷度", "发型造型",
            "刘海", "头部配饰"]],
  ["服装", ["穿搭结构", "连衣裙类型", "连衣裙颜色", "连衣裙材质", "连衣裙图案",
            "连体服类型", "连体服颜色", "连体服材质", "连体服图案",
            "上装类型", "上装颜色", "上装材质", "上装图案",
            "下装类型", "下装颜色", "下装材质", "下装图案",
            "版型细节", "袜装", "鞋履", "服装配件"]],
  ["姿态", ["画面瞬间", "基础姿态", "身体方向", "身体重心", "肩颈状态", "手部动作", "腿部动作",
            "头部方向", "视线", "表情"]],
  ["场景", ["场景大类", "场景地点", "时间切片", "天气状态", "前景框景", "背景环境", "环境细节",
            "空间材质", "空间层次"]],
  ["光影", ["主光来源", "光线方向", "光线质地", "照明落点", "阴影表现",
            "主配色", "色温倾向", "画面对比"]],
  ["摄影", ["景别", "画面布局", "等效焦段", "拍摄距离", "机位", "景深", "对焦位置",
            "影像风格", "细节质地", "高光处理", "颗粒质感"]],
];

let NS_TRIGGERS = null;

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
  
  height:auto !important; min-height:0; overflow:hidden;
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


.zs-grp{margin-top:9px;}
.zs-gh{display:flex;align-items:center;gap:7px;margin:0 0 7px;
  font-size:9.5px;letter-spacing:.14em;color:var(--dim);text-transform:uppercase;}
.zs-gh i{width:3px;height:11px;border-radius:2px;background:var(--gc,${THEME.orange});
  box-shadow:0 0 8px var(--gc,${THEME.orange});flex:0 0 auto;}
.zs-gh b{font-weight:600;letter-spacing:.02em;font-size:10.5px;color:#C9C0EA;text-transform:none;}
.zs-gh::after{content:"";flex:1;height:1px;opacity:.5;
  background:linear-gradient(90deg,var(--gc,rgba(255,138,61,.5)),transparent);}

.zs-two{display:grid;grid-template-columns:1fr 1fr;gap:6px;}
.zs-two>*,.zs-four>*,.zs-five>*,.zs-ta2>*,.zs-wbox>*,.zs-w4>*{min-width:0;}
.zs-four{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;}
.zs-five{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;}
.zs-ta2{display:grid;grid-template-columns:1fr 1fr;gap:6px;}
.zs-pool.wide{grid-template-columns:1fr 1fr 1fr;max-height:110px;}
.zs-out{display:flex;flex-direction:column;gap:5px;}
.zs-out textarea{width:100%;resize:none;border-radius:7px;outline:none;overflow:auto;
  padding:6px 8px;font:10.5px/1.5 inherit;color:#D8D2F5;background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.1);}
.zs-out textarea::placeholder{color:#5F5880;}
.zs-one{margin-top:6px;}
.zs-tabs{display:grid;grid-template-columns:repeat(8,1fr);gap:4px;margin-top:9px;}
.zs-tabs>*{min-width:0;}
.zs-tab{height:26px;display:flex;align-items:center;justify-content:center;border-radius:7px;
  font-size:10.5px;color:var(--dim);cursor:pointer;user-select:none;white-space:nowrap;
  border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.03);
  transition:color .16s,border-color .16s,background .16s;}
.zs-tab:hover{color:#fff;border-color:rgba(255,255,255,.24);}
.zs-tab.on{color:#fff;border-color:transparent;
  background:linear-gradient(150deg,var(--c1),var(--c2));}
.zs-pane{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px;}
.zs-pane>*{min-width:0;}
.zs-pane.off{display:none;}
.zs-field input[type=number]{flex:1;min-width:0;background:transparent;border:none;outline:none;
  color:#D8D2F5;font:11px/1.2 inherit;padding:0 6px;}
.zs-btn{height:30px;padding:0 10px;border-radius:8px;cursor:pointer;font-size:10.5px;
  color:var(--dim);border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.03);
  transition:color .16s,border-color .16s;}
.zs-btn:hover{color:#fff;border-color:rgba(255,255,255,.24);}
.zs-size{margin-left:auto;flex:0 0 auto;padding:2px 9px;border-radius:99px;
  font:700 10px/1.35 inherit;color:#9FE1CB;border:1px solid rgba(29,158,117,.42);
  background:rgba(29,158,117,.13);}



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


.zs-seg{display:grid;grid-template-columns:repeat(5,1fr);gap:3px;height:30px;}
.zs-seg b{display:flex;align-items:center;justify-content:center;border-radius:7px;
  font:600 10px/1 inherit;color:var(--dim);cursor:pointer;user-select:none;
  border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.03);
  transition:all .16s;}
.zs-seg b:hover{color:#fff;border-color:rgba(255,255,255,.24);}
.zs-seg b.on{color:#fff;border-color:transparent;
  background:linear-gradient(150deg,var(--c1),var(--c2));
  box-shadow:0 3px 12px rgba(255,46,147,.4);}


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


.zs-cats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;}
.zs-cat{position:relative;height:60px;padding:0;border-radius:8px;cursor:pointer;overflow:hidden;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;
  border:1px solid rgba(255,255,255,.1);color:var(--dim);
  background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.015));
  font:600 10.5px/1 inherit;
  transition:transform .16s cubic-bezier(.4,0,.2,1),color .16s,border-color .16s;}
.zs-cat .zs-sym{font-size:13px;font-weight:800;line-height:1;}
.zs-cat .zs-nm{font-size:10.5px;letter-spacing:.02em;line-height:1.2;max-width:96%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
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


.zs-seedrow{display:flex;flex-wrap:nowrap;align-items:center;gap:6px;margin-top:9px;padding:7px 8px;
  border-radius:9px;border:1px solid rgba(255,255,255,.09);background:rgba(0,0,0,.22);}

.zs-seedrow .zs-lbl{flex:0 0 auto;font-size:9px;letter-spacing:.14em;color:var(--dim);
  text-transform:uppercase;cursor:pointer;user-select:none;border-radius:4px;padding:2px 4px;}
.zs-seedrow .zs-lbl:hover{color:#FF9A5C;background:rgba(255,138,61,.1);}
.zs-seedrow .zs-seedin{flex:1 1 auto;min-width:0;height:22px;padding:0 8px;
  border-radius:6px;font:700 12px/1 Consolas,monospace;color:#FFD08A;letter-spacing:.04em;
  text-align:center;outline:none;user-select:text;
  background:rgba(255,208,138,.08);border:1px solid rgba(255,208,138,.22);}
.zs-seedrow .zs-seedin:focus{border-color:rgba(255,208,138,.55);box-shadow:0 0 0 2px rgba(255,208,138,.18);}
.zs-seedrow .zs-seedin.zs-onfixed{color:#FFE0B0;border-color:rgba(255,208,138,.45);
  background:rgba(255,208,138,.12);}
.zs-seedrow .zs-mini{flex:0 0 auto;height:22px;padding:0 8px;border-radius:6px;cursor:pointer;
  font:700 10px/1 inherit;color:var(--dim);border:1px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.03);}
.zs-seedrow .zs-mini:hover{color:#fff;border-color:rgba(255,138,61,.55);}

.zs-seedrow.zs-narrow{position:relative;}
.zs-seedrow.zs-narrow .zs-mini{display:none;}
.zs-seedrow.zs-narrow .zs-lbl{cursor:pointer;color:#FF9A5C;border-radius:4px;
  padding:2px 5px;background:rgba(255,138,61,.1);
  border:1px solid rgba(255,138,61,.28);}
.zs-seedrow.zs-narrow .zs-lbl:hover{color:#fff;background:rgba(255,138,61,.22);}

.zs-seedrow .zs-fixbtn{flex:0 0 auto;margin-left:auto;position:static;min-width:auto;min-height:auto;
  height:22px;padding:0 8px;border-radius:99px;cursor:pointer;user-select:none;
  font:700 9.5px/1 Consolas,monospace;letter-spacing:.04em;
  color:#7DE3C0;border:1px solid rgba(125,227,192,.3);background:rgba(125,227,192,.08);}
.zs-seedrow .zs-fixbtn.zs-fixed{color:#FFD08A;border-color:rgba(255,208,138,.35);
  background:rgba(255,208,138,.09);}
.zs-seedrow .zs-fixbtn:hover{filter:brightness(1.25);}
.zs-seedrow .zs-fixbtn:active{transform:translateY(1px);}
.zs-seedrow .zs-fixbtn.zs-pending{color:#2A1A00;background:#FFD08A;border-color:#FFD08A;
  animation:zspending 1s ease-in-out infinite;}
@keyframes zspending{0%,100%{opacity:1}50%{opacity:.5}}


.zs-trig{margin-top:9px;padding:8px;border-radius:9px;
  border:1px solid rgba(255,255,255,.09);background:rgba(0,0,0,.2);}
.zs-ta{width:100%;height:44px;margin-top:6px;padding:6px 8px;border-radius:7px;resize:none;
  font:11px/1.45 inherit;color:var(--tx);outline:none;
  border:1px solid rgba(255,255,255,.11);background:rgba(255,255,255,.035);}
.zs-ta:focus{border-color:rgba(255,138,61,.55);}
.zs-ta::placeholder{color:#5F5880;}


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

.zs-gh.zs-click{cursor:pointer;user-select:none;}
.zs-gh.zs-click:hover b{color:#fff;}
.zs-arw{margin-left:auto;font:700 12px/1 Consolas,monospace;color:var(--dim);
  padding:2px 5px;border-radius:4px;background:rgba(255,255,255,.06);}
.zs-arw::after{content:"\\25B4";}
.zs-fold.closed .zs-arw::after{content:"\\25BE";}
.zs-fold.closed .zs-foldin{display:none;}

.zs-pick{margin-top:7px;}
.zs-pickbar{display:flex;align-items:center;gap:6px;}
.zs-search{flex:1;min-width:0;height:26px;padding:0 8px;border-radius:7px;outline:none;
  font:11px/1 inherit;color:var(--tx);
  border:1px solid rgba(255,255,255,.11);background:rgba(255,255,255,.04);}
.zs-search:focus{border-color:rgba(255,61,113,.55);}
.zs-search::placeholder{color:#5F5880;}
.zs-cnt{font:700 9.5px/1 inherit;color:#FFB7D0;flex:0 0 auto;
  border:1px solid rgba(255,183,208,.3);padding:4px 6px;border-radius:5px;}
.zs-chips{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;max-height:74px;overflow:auto;}
.zs-chipx{font:600 10px/1 inherit;padding:5px 7px;border-radius:99px;cursor:pointer;
  max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  border:1px solid rgba(255,61,113,.45);color:#FFB7D0;background:rgba(255,61,113,.12);
  transition:all .14s;}
.zs-chipx:hover{color:#fff;background:rgba(255,61,113,.5);}
.zs-chipx.on{color:#16060F;background:#FF5C8A;border-color:#FF5C8A;}
.zs-pool{margin-top:6px;max-height:132px;overflow:auto;padding-right:2px;
  display:grid;grid-template-columns:1fr 1fr;gap:4px;}
.zs-pool::-webkit-scrollbar{width:6px;}
.zs-pool::-webkit-scrollbar-thumb{background:rgba(255,255,255,.18);border-radius:3px;}
.zs-chips::-webkit-scrollbar{width:6px;}
.zs-chips::-webkit-scrollbar-thumb{background:rgba(255,255,255,.18);border-radius:3px;}
.zs-opt{font:10px/1.3 inherit;padding:5px 6px;border-radius:6px;cursor:pointer;
  color:#B9AFD8;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.025);}
.zs-opt:hover{color:#fff;border-color:rgba(255,255,255,.22);}
.zs-opt.on{color:#16060F;background:#FF5C8A;border-color:#FF5C8A;font-weight:700;}
.zs-nothing{grid-column:1/-1;padding:10px;text-align:center;font-size:10.5px;color:#6E6690;}

.zs-wbox{display:grid;grid-template-columns:1fr 1fr;gap:6px;}
.zs-w4{grid-template-columns:repeat(4,1fr);}
.zs-w{display:flex;align-items:center;height:28px;border-radius:8px;padding:0 8px;
  border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.035);}
.zs-w span{font-size:9px;color:var(--dim);flex:0 0 auto;}
.zs-w input{flex:1;min-width:0;width:100%;background:transparent;border:none;outline:none;
  -webkit-appearance:none;appearance:none;height:3px;border-radius:2px;cursor:pointer;
  background:linear-gradient(90deg,#FF3D71,#8B2FF7);margin-left:6px;}
.zs-w input::-webkit-slider-thumb{-webkit-appearance:none;width:11px;height:11px;
  border-radius:50%;background:#fff;box-shadow:0 0 6px rgba(255,61,113,.9);cursor:pointer;}
.zs-w b{font:700 10px/1 Consolas,monospace;color:#FFB7D0;flex:0 0 26px;text-align:right;}
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

  if (node.comfyClass === "SunsetNSPromptSelector") {
    root.style.width =
      Math.max(200, Math.round((Number(node.size?.[0]) || NS_MIN_W) - 12)) + "px";
  }
  if (node.comfyClass === "SunsetLRPromptBuilder") {
    root.style.width =
      Math.max(200, Math.round((Number(node.size?.[0]) || LR_MIN_W) - 12)) + "px";
  }

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
        ensureNSWidth(n);
        ensureLRWidth(n);
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
  wrap.__wname = wname;
  sel.__wname = wname;
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
  lbl.title = "点标签＝选中左边输入框，可直接手填种子";
  row.appendChild(lbl);

  const num = el("input", "zs-seedin");
  num.type = "text";
  num.inputMode = "numeric";
  num.spellcheck = false;
  num.value = String(Number(readW(node, "seed", 0)) || 0);
  num.title = "种子值：可直接手填；随机模式下每次运行会自动换";
  row.appendChild(num);

  const btn = el("button", "zs-mini", "随机");
  btn.type = "button";
  btn.title = "立刻换一颗随机种子";
  row.appendChild(btn);

  const tag = el("button", "zs-fixbtn", "随机中");
  tag.type = "button";
  row.appendChild(tag);

  const stopEvt = (e) => {
    if (!e) return;
    try { e.preventDefault(); } catch (_) { }
    try { e.stopPropagation(); } catch (_) { }
    try { e.stopImmediatePropagation && e.stopImmediatePropagation(); } catch (_) { }
  };
  const onDown = (e) => { stopEvt(e); };
  const onClick = (fn) => (e) => { stopEvt(e); fn(); };
  const syncNode = () => {
    if (typeof node.__zsCtx?.sync === "function") node.__zsCtx.sync();
  };

  const ctrlOf = () => (node.widgets || []).find((w) => w.name === "control_after_generate") || null;
  const isFixed = () => {
    const c = ctrlOf();
    if (c) return c.value === "fixed";
    return (Number(readW(node, "seed", 0)) || 0) > 0;
  };
  const setFixed = (on) => {
    const c = ctrlOf();
    if (c) {
      const v = on ? "fixed" : "randomize";
      if (c.value !== v) {
        c.value = v;
        try { c.callback?.(v, app.canvas, node); } catch (_) { }
      }
      return;
    }
    const cur = Number(readW(node, "seed", 0)) || 0;
    writeW(node, "seed", on ? (cur || Math.floor(Math.random() * 4294967295)) : 0);
  };

  num.addEventListener("input", () => {
    const raw = String(num.value || "").replace(/[^\d]/g, "");
    writeW(node, "seed", Math.min(4294967295, parseInt(raw || "0", 10) || 0));
    paint();
  });
  ["pointerdown", "mousedown", "wheel", "keydown", "keyup", "dblclick", "contextmenu"].forEach((t) =>
    num.addEventListener(t, (e) => { try { e.stopPropagation(); } catch (_) { } }));

  btn.addEventListener("pointerdown", onDown, true);
  btn.addEventListener("mousedown", onDown, true);
  btn.addEventListener("click", onClick(() => {
    writeW(node, "seed", Math.floor(Math.random() * 4294967295));
    paint();
  }));

  tag.addEventListener("pointerdown", onDown, true);
  tag.addEventListener("mousedown", onDown, true);
  tag.addEventListener("click", onClick(() => {
    setFixed(!isFixed());
    paint();
    syncNode();
  }));

  lbl.addEventListener("click", onClick(() => {
    try { num.focus(); num.select(); } catch (_) { }
  }));

  const layout = () => {
    const w = Number(node?.size?.[0]) || 0;
    row.classList.toggle("zs-narrow", w > 0 && w < SEEDROW_NARROW);
    lbl.textContent = row.classList.contains("zs-narrow") ? "S" : "SEED";
  };

  const paint = () => {
    layout();
    const v = Number(readW(node, "seed", 0)) || 0;
    if (document.activeElement !== num) num.value = String(v);
    const fixed = isFixed();
    tag.textContent = fixed ? "已固定" : "随机中";
    tag.classList.toggle("zs-fixed", fixed);
    num.classList.toggle("zs-onfixed", fixed);
    tag.title = fixed
      ? `已锁定：每次运行都用种子 ${v}\n点一下切回随机（每次运行自动换）`
      : `随机中：每次运行自动换种子\n点一下锁定当前值 ${v}`;
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

function ensureNSWidth(node) {
  if (node?.comfyClass !== "SunsetNSPromptSelector") return;
  if (!CONFIG.autoResize) return;
  try {
    const w = Math.round(Number(node.size?.[0]) || 0);
    const h = Math.round(Number(node.size?.[1]) || 0);
    if (w > 0 && w < NS_MIN_W) {
      node.setSize([NS_MIN_W, h]);
      node.graph?.setDirtyCanvas?.(true, true);
      node.setDirtyCanvas?.(true, true);
      console.log(`[ZImageSkin] NS节点宽度 ${w} -> ${NS_MIN_W}`);
    }
  } catch (e) {  }
}

function makeFold(title, color, open) {
  const g = section(title, color, "zs-fold" + (open ? "" : " closed"));
  const h = g.querySelector(".zs-gh");
  h.classList.add("zs-click");
  h.appendChild(el("span", "zs-arw"));
  const inner = el("div", "zs-foldin");
  g.appendChild(inner);
  h.addEventListener("click", () => {
    g.classList.toggle("closed");
    setTimeout(() => relayout(node, node.__zsCtx?.root), 0);
    setTimeout(() => relayout(node, node.__zsCtx?.root), 120);
  });
  return { g, inner };
}

function shortOf(s) {
  return String(s).replace(/\s*[（(][^）)]*[）)]\s*$/, "");
}

function makeWeight(node, wname, label) {
  const box = el("div", "zs-w");
  box.appendChild(el("span", null, label));
  const inp = el("input");
  inp.type = "range";
  inp.min = "0";
  inp.max = "2";
  inp.step = "0.1";
  const val = el("b", null, "1.0");
  const paint = () => {
    const v = Number(readW(node, wname, 1)) || 0;
    if (inp.value !== String(v)) inp.value = String(v);
    val.textContent = v.toFixed(1);
  };
  inp.addEventListener("input", () => {
    val.textContent = Number(inp.value).toFixed(1);
  });
  inp.addEventListener("change", () => {
    writeW(node, wname, Number(inp.value));
  });
  ["pointerdown", "mousedown", "wheel"].forEach((t) =>
    inp.addEventListener(t, (e) => e.stopPropagation()));
  box.appendChild(inp);
  box.appendChild(val);
  box.__paint = paint;
  paint();
  return box;
}

function makeText(node, wname, ph, h) {
  const ta = el("textarea", "zs-ta");
  ta.placeholder = ph || wname;
  ta.style.height = (h || 32) + "px";
  const paint = () => {
    const v = String(readW(node, wname, "") ?? "");
    if (document.activeElement !== ta && ta.value !== v) ta.value = v;
  };
  ta.addEventListener("input", () => writeW(node, wname, ta.value));
  ["pointerdown", "mousedown", "wheel", "keydown"].forEach((t) =>
    ta.addEventListener(t, (e) => e.stopPropagation()));
  const box = el("div");
  box.style.marginTop = "6px";
  box.appendChild(ta);
  box.__ta = ta;
  box.__paint = paint;
  paint();
  return box;
}

function makeTriggerMulti(node) {
  const box = el("div", "zs-pick");
  const bar = el("div", "zs-pickbar");
  const search = el("input", "zs-search");
  search.type = "text";
  search.placeholder = "搜触发词：猫女 / 女仆 / 1girl";
  const cnt = el("span", "zs-cnt", "0");
  bar.appendChild(search);
  bar.appendChild(cnt);
  box.appendChild(bar);

  const chips = el("div", "zs-chips");
  box.appendChild(chips);
  const pool = el("div", "zs-pool");
  box.appendChild(pool);

  const w = findW(node, "触发词");
  let all = (Array.isArray(w?.options?.values) ? w.options.values
    : Array.isArray(w?.options) ? w.options : []).filter((x) => x !== "——");
  if (!all.length && Array.isArray(NS_TRIGGERS) && NS_TRIGGERS.length) {
    all = NS_TRIGGERS.filter((x) => x !== "——");
  }

  const refreshAll = () => {
    if (all.length) return;
    const w2 = findW(node, "触发词");
    const list = (Array.isArray(w2?.options?.values) ? w2.options.values
      : Array.isArray(w2?.options) ? w2.options : []).filter((x) => x !== "——");
    if (list.length) all = list;
    else if (Array.isArray(NS_TRIGGERS) && NS_TRIGGERS.length) {
      all = NS_TRIGGERS.filter((x) => x !== "——");
    }
  };

  const cur = () => {
    const v = readW(node, "触发词", []);
    if (Array.isArray(v)) return v.filter((x) => x && x !== "——");
    const s = String(v ?? "").trim();
    if (!s || s === "——") return [];
    if (s.startsWith("[") && s.endsWith("]")) {
      try {
        const p = JSON.parse(s.replace(/'/g, '"'));
        if (Array.isArray(p)) return p.filter((x) => x && x !== "——");
      } catch (e) {  }
    }
    return [s];
  };

  const set = (arr) => writeW(node, "触发词", arr.length ? arr : ["——"]);

  let kw = "";

  const paintChips = () => {
    const sel = cur();
    cnt.textContent = String(sel.length);
    chips.textContent = "";
    if (!sel.length) {
      chips.appendChild(el("div", "zs-nothing", "还没选触发词，下面点几个"));
      return;
    }
    for (const s of sel) {
      const c = el("div", "zs-chipx on", shortOf(s));
      c.title = "点一下取消：" + s;
      c.addEventListener("click", () => { set(cur().filter((x) => x !== s)); paint(); });
      chips.appendChild(c);
    }
  };

  const paintPool = () => {
    refreshAll();
    const sel = cur();
    pool.textContent = "";
    const k = kw.trim().toLowerCase();
    let list = all;
    if (k) list = all.filter((x) => String(x).toLowerCase().indexOf(k) >= 0);
    if (!list.length) {
      pool.appendChild(el("div", "zs-nothing", "没匹配到"));
      return;
    }
    for (const o of list.slice(0, 400)) {
      const b = el("div", "zs-opt" + (sel.indexOf(o) >= 0 ? " on" : ""), shortOf(o));
      b.title = o;
      b.addEventListener("click", () => {
        const s2 = cur();
        set(s2.indexOf(o) >= 0 ? s2.filter((x) => x !== o) : s2.concat([o]));
        paint();
      });
      pool.appendChild(b);
    }
  };

  const paint = () => { paintChips(); paintPool(); };

  search.addEventListener("input", () => { kw = search.value; paintPool(); });
  ["pointerdown", "mousedown", "wheel", "keydown"].forEach((t) =>
    search.addEventListener(t, (e) => e.stopPropagation()));
  pool.addEventListener("wheel", (e) => e.stopPropagation());
  chips.addEventListener("wheel", (e) => e.stopPropagation());

  paint();
  box.__paint = paint;
  box.__count = () => cur().length;
  return box;
}

function buildNSPanel(node) {
  const body = el("div", "zs-body");
  const refs = {};

  const head = el("div", "zs-head");
  head.appendChild(el("div", "zs-dot"));
  head.appendChild(el("div", "zs-title", "NS MIXER"));
  const chip = el("div", "zs-chip", "27 参数");
  head.appendChild(chip);
  body.appendChild(head);

  const g0 = section("触发词 · 209 条可多选", "#FF3D71");
  const pick = makeTriggerMulti(node);
  refs.pick = pick;
  const poolEl = pick.querySelector(".zs-pool");
  if (poolEl) poolEl.classList.add("wide");
  g0.appendChild(pick);
  body.appendChild(g0);

  const g1 = section("场景 · 动作 · 服饰 · 情绪", "#FF8A3D");
  const two1 = el("div", "zs-two");
  two1.appendChild(makeSelect(node, "场景类型", "场景"));
  two1.appendChild(makeSelect(node, "服饰", "服饰"));
  two1.appendChild(makeSelect(node, "动作姿态", "动作"));
  two1.appendChild(makeSelect(node, "情绪氛围", "情绪"));
  g1.appendChild(two1);
  body.appendChild(g1);

  const g2 = section("镜头 · 画面 · 10 项", "#22D3EE");
  const two2 = el("div", "zs-two");
  const CAM = [["运镜方式", "运镜"], ["机位角度", "机位"], ["光源类型", "光源"],
               ["光线类型", "光线"], ["镜头类型", "镜头"], ["焦距", "焦距"],
               ["色调", "色调"], ["视觉风格", "风格"], ["特效镜头", "特效"],
               ["镜头滤镜", "滤镜"]];
  for (const [wn, lb] of CAM) two2.appendChild(makeSelect(node, wn, lb));
  g2.appendChild(two2);
  body.appendChild(g2);

  const g3 = section("质量 · 负面 · 随机 · 预设", "#8B2FF7");
  const two3 = el("div", "zs-two");
  two3.appendChild(makeSelect(node, "质量等级", "质量"));
  two3.appendChild(makeSelect(node, "负面提示词类型", "负面预设"));
  two3.appendChild(makeSelect(node, "随机选择", "随机"));
  two3.appendChild(makeSelect(node, "预设配置", "预设"));
  g3.appendChild(two3);
  body.appendChild(g3);

  const g4 = section("权重 · 自定义文本", "#FFB020");
  const wbox = el("div", "zs-wbox");
  const WN = [["权重_场景", "场景"], ["权重_动作", "动作"],
              ["权重_服饰", "服饰"], ["权重_情绪", "情绪"]];
  for (const [wn, lb] of WN) {
    const x = makeWeight(node, wn, lb);
    refs[wn] = x;
    wbox.appendChild(x);
  }
  g4.appendChild(wbox);
  g4.appendChild(makeText(node, "前置提示词", "前置：可接落日生成器的中文输出", 34));
  const tabox = el("div", "zs-ta2");
  tabox.appendChild(makeText(node, "自定义前缀", "自定义前缀（英文）", 30));
  tabox.appendChild(makeText(node, "自定义后缀", "自定义后缀（英文）", 30));
  tabox.appendChild(makeText(node, "自定义负面提示词", "自定义负面提示词", 30));
  g4.appendChild(tabox);
  body.appendChild(g4);

  const g5 = section("输出预览 · 运行后显示", "#22C55E");
  const outbox = el("div", "zs-out");
  const outPos = el("textarea");
  outPos.readOnly = true;
  outPos.placeholder = "正面提示词：运行一次后显示在这里";
  outPos.style.height = "72px";
  const outNeg = el("textarea");
  outNeg.readOnly = true;
  outNeg.placeholder = "负面提示词：运行一次后显示在这里";
  outNeg.style.height = "40px";
  outbox.appendChild(outPos);
  outbox.appendChild(outNeg);
  refs.outPos = outPos;
  refs.outNeg = outNeg;
  ["pointerdown", "mousedown", "wheel", "keydown"].forEach((t) => {
    outPos.addEventListener(t, (e) => e.stopPropagation());
    outNeg.addEventListener(t, (e) => e.stopPropagation());
  });
  g5.appendChild(outbox);
  body.appendChild(g5);

  body.appendChild(el("div", "zs-hint",
    "输出三个口：<b>正面</b> / <b>负面</b> / <b>完整</b>"));

  function sync() {
    try { refs.pick.__paint?.(); } catch (e) {  }
    for (const [wn] of WN) {
      try { refs[wn].__paint?.(); } catch (e) {  }
    }
    for (const f of body.querySelectorAll(".zs-field")) {
      const sel = f.__sel;
      if (!sel || document.activeElement === sel) continue;
      const nm = sel.__wname;
      if (!nm) continue;
      const v = String(readW(node, nm, "") ?? "");
      if (sel.value !== v) sel.value = v;
    }
    for (const t of body.querySelectorAll("textarea")) {
      void t;
    }
    const n = refs.pick.__count ? refs.pick.__count() : 0;
    chip.textContent = n > 0 ? `27 参数 · 触发词 ${n}` : "27 参数";
    const o = node.__zsNSOut;
    if (o) {
      const pv = String(o.pos ?? "");
      const nv = String(o.neg ?? "");
      if (document.activeElement !== outPos && outPos.value !== pv) outPos.value = pv;
      if (document.activeElement !== outNeg && outNeg.value !== nv) outNeg.value = nv;
    }
  }

  return { root: makeRoot(node), body, sync, refs };
}


function makeLRNum(node, wname, label, min, max, step) {
  const wrap = el("div", "zs-field");
  wrap.appendChild(el("span", "zs-k", label || wname));
  const input = el("input");
  input.type = "number";
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(readW(node, wname, 0) ?? 0);
  input.addEventListener("change", () => {
    const v = Number(input.value);
    writeW(node, wname, Number.isFinite(v) ? v : 0);
    node.__zsCtx?.sync?.();
  });
  ["pointerdown", "mousedown", "wheel", "keydown"].forEach((t) =>
    input.addEventListener(t, (e) => e.stopPropagation()));
  wrap.appendChild(input);
  wrap.__input = input;
  wrap.__wname = wname;
  return wrap;
}

function ensureLRWidth(node) {
  if (node?.comfyClass !== "SunsetLRPromptBuilder") return;
  if (!CONFIG.autoResize) return;
  try {
    const w = Math.round(Number(node.size?.[0]) || 0);
    const h = Math.round(Number(node.size?.[1]) || 0);
    if (w > 0 && w < LR_MIN_W) {
      node.setSize([LR_MIN_W, h]);
      node.graph?.setDirtyCanvas?.(true, true);
      node.setDirtyCanvas?.(true, true);
    }
  } catch (e) {  }
}

function lrPresetAPI() {
  const a = (typeof app !== "undefined" && app?.api?.apiURL) ? app.api.apiURL("/luori/lr_presets")
    : (typeof api !== "undefined" && api?.apiURL) ? api.apiURL("/luori/lr_presets")
      : "/luori/lr_presets";
  return a;
}

function lrCollectValues(node) {
  const vals = {};
  for (const w of node.widgets || []) {
    if (!w || !w.name) continue;
    vals[w.name] = w.value;
  }
  return vals;
}

function lrApplyValues(node, vals) {
  for (const k of Object.keys(vals || {})) {
    try { writeW(node, k, vals[k]); } catch (e) { }
  }
  node.__zsCtx?.sync?.();
}

function lrSetAllFields(node, value) {
  const names = [];
  for (const g of LR_GROUPS) names.push(...(g[1] || []));
  for (const n of names) {
    try { writeW(node, n, value); } catch (e) { }
  }
  node.__zsCtx?.sync?.();
}

function buildLRPresetBar(node) {
  const row = el("div", "zs-two");
  row.style.display = "grid";
  row.style.gridTemplateColumns = "1fr auto auto";
  row.style.gap = "6px";
  row.style.marginTop = "6px";
  const wrap = el("div", "zs-field");
  wrap.appendChild(el("span", "zs-k", "我的预设"));
  const sel = el("select");
  ["pointerdown", "mousedown", "wheel"].forEach((t) =>
    sel.addEventListener(t, (e) => e.stopPropagation()));
  wrap.appendChild(sel);
  const saveBtn = el("button", "zs-btn", "💾 保存");
  saveBtn.type = "button";
  saveBtn.title = "把当前全部选项保存为一个预设（自动命名：预设1、预设2…）";
  const delBtn = el("button", "zs-btn", "✕");
  delBtn.type = "button";
  delBtn.title = "删除当前选中的预设";
  row.appendChild(wrap);
  row.appendChild(saveBtn);
  row.appendChild(delBtn);

  let presets = {};
  const refresh = (pick) => {
    sel.textContent = "";
    const blank = el("option");
    blank.value = "__default__";
    blank.textContent = "默认（全部随机）";
    sel.appendChild(blank);
    for (const name of Object.keys(presets)) {
      const op = el("option");
      op.value = name;
      op.textContent = name;
      sel.appendChild(op);
    }
    const pickName = pick != null && Object.prototype.hasOwnProperty.call(presets, pick) ? pick : "__default__";
    sel.value = pickName;
  };
  const load = async (pick) => {
    try {
      const r = await fetch(lrPresetAPI(), { cache: "no-store" });
      if (r.ok) presets = (await r.json()) || {};
    } catch (e) { }
    refresh(pick);
  };
  sel.addEventListener("change", () => {
    const name = sel.value;
    if (name === "__default__") {
      lrSetAllFields(node, "随机抽取");
      return;
    }
    if (name && presets[name]) lrApplyValues(node, presets[name]);
  });
  saveBtn.addEventListener("click", async () => {
    let n = 1;
    while (Object.prototype.hasOwnProperty.call(presets, `预设${n}`)) n++;
    const name = `预设${n}`;
    try {
      const r = await fetch(lrPresetAPI(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", name, values: lrCollectValues(node) }),
      });
      if (r.ok) {
        presets = (await r.json()) || presets;
        refresh(name);
      }
    } catch (e) { }
  });
  delBtn.addEventListener("click", async () => {
    const name = sel.value;
    if (!name || name === "__default__") return;
    try {
      const r = await fetch(lrPresetAPI(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", name }),
      });
      if (r.ok) {
        presets = (await r.json()) || {};
        refresh("");
      }
    } catch (e) { }
  });
  load();
  return row;
}

function buildLRPanel(node) {
  const body = el("div", "zs-body");
  const refs = { panes: [], tabs: [], texts: [] };
  let active = 0;

  const head = el("div", "zs-head");
  head.appendChild(el("div", "zs-dot"));
  head.appendChild(el("div", "zs-title", "LR BUILDER"));
  const chip = el("div", "zs-chip", "落日提示词预设");
  head.appendChild(chip);
  body.appendChild(head);

  const gTop = section("预设 · 密度 · 随机 · 种子", "#FF8A3D");
  gTop.appendChild(makeSelect(node, "预设", "预设"));
  const topRow = el("div", "zs-four");
  topRow.appendChild(makeSelect(node, "提示词密度", "密度"));
  topRow.appendChild(makeSelect(node, "随机范围", "范围"));
  topRow.appendChild(makeLRNum(node, "随机种子", "种子", 0, 18446744073709551615, 1));
  const roll = el("button", "zs-btn", "随机");
  roll.type = "button";
  roll.title = "换一个随机种子，下一次运行用新种子重新抽";
  roll.addEventListener("click", () => {
    writeW(node, "随机种子", Math.floor(Math.random() * 4294967295));
    node.__zsCtx?.sync?.();
  });
  topRow.appendChild(roll);
  gTop.appendChild(topRow);
  gTop.appendChild(buildLRPresetBar(node));
  const modeRow = el("div");
  modeRow.style.display = "grid";
  modeRow.style.gridTemplateColumns = "1fr 1fr";
  modeRow.style.gap = "6px";
  modeRow.style.marginTop = "6px";
  const btnRnd = el("button", "zs-btn", "🎲 全部随机");
  btnRnd.type = "button";
  btnRnd.title = "92 项细分字段全部设为「随机抽取」（随机范围=局部微调/同主题重拍时围绕当前写真预设抽）";
  btnRnd.addEventListener("click", () => lrSetAllFields(node, "随机抽取"));
  const btnFollow = el("button", "zs-btn", "📌 跟随预设");
  btnFollow.type = "button";
  btnFollow.title = "92 项细分字段全部设为「跟随预设」，写真预设的具体值立刻生效";
  btnFollow.addEventListener("click", () => lrSetAllFields(node, "跟随预设"));
  modeRow.appendChild(btnRnd);
  modeRow.appendChild(btnFollow);
  gTop.appendChild(modeRow);
  body.appendChild(gTop);

  const gField = section("细化字段 · 92 项 · 点标签切换", "#8B2FF7");
  const tabs = el("div", "zs-tabs");
  LR_GROUPS.forEach((g, gi) => {
    const [name, names] = g;
    const tab = el("div", "zs-tab", name);
    tab.title = `${name} · ${names.length} 项`;
    tab.addEventListener("click", () => {
      active = gi;
      refs.tabs.forEach((t, i) => t.classList.toggle("on", i === gi));
      refs.panes.forEach((p, i) => p.classList.toggle("off", i !== gi));
      const fit = () => relayout(node, node.__zsCtx?.root);
      fit();
      [0, 60, 200].forEach((ms) => setTimeout(fit, ms));
    });
    tabs.appendChild(tab);
    refs.tabs.push(tab);

    const pane = el("div", "zs-pane");
    for (const wn of names) pane.appendChild(makeSelect(node, wn, wn));
    pane.classList.add("off");
    refs.panes.push(pane);
  });
  tabs.firstChild.classList.add("on");
  refs.panes[0].classList.remove("off");
  gField.appendChild(tabs);
  refs.panes.forEach((p) => gField.appendChild(p));
  body.appendChild(gField);

  const gOut = section("输出设置 · 拼接与尺寸", "#22D3EE");
  const outRow = el("div", "zs-two");
  outRow.appendChild(makeSelect(node, "拼接位置", "拼接"));
  outRow.appendChild(makeSelect(node, "输出排版", "排版"));
  outRow.appendChild(makeSelect(node, "分辨率模式", "尺寸"));
  outRow.appendChild(makeLRNum(node, "目标总像素（万）", "总像素(万)", 10, 1600, 10));
  gOut.appendChild(outRow);
  const free = makeText(node, "自由提示词", "自由提示词：按拼接位置与结构化提示词组合", 46);
  refs.texts.push(free);
  gOut.appendChild(free);
  body.appendChild(gOut);

  const gPrev = section("输出预览 · 运行后显示", "#22C55E");
  const sizeChip = el("div", "zs-size", "未运行");
  gPrev.firstChild.appendChild(sizeChip);
  const outbox = el("div", "zs-out");
  const outZh = el("textarea");
  outZh.readOnly = true;
  outZh.placeholder = "中文提示词：运行一次后显示在这里";
  outZh.style.height = "76px";
  const outEn = el("textarea");
  outEn.readOnly = true;
  outEn.placeholder = "English prompt: appears here after a run";
  outEn.style.height = "56px";
  outbox.appendChild(outZh);
  outbox.appendChild(outEn);
  refs.outZh = outZh;
  refs.outEn = outEn;
  ["pointerdown", "mousedown", "wheel", "keydown"].forEach((t) => {
    outZh.addEventListener(t, (e) => e.stopPropagation());
    outEn.addEventListener(t, (e) => e.stopPropagation());
  });
  gPrev.appendChild(outbox);
  body.appendChild(gPrev);

  body.appendChild(el("div", "zs-hint",
    "四个输出口：<b>中文提示词</b> / <b>推荐宽度</b> / <b>推荐高度</b> / <b>英文提示词</b>"));

  function sync() {
    for (const f of body.querySelectorAll(".zs-field")) {
      const sel = f.__sel;
      if (sel) {
        if (document.activeElement === sel) continue;
        const v = String(readW(node, sel.__wname, "") ?? "");
        if (sel.value !== v) sel.value = v;
        continue;
      }
      const inp = f.__input;
      if (inp) {
        if (document.activeElement === inp) continue;
        const v = String(readW(node, f.__wname, "") ?? "");
        if (inp.value !== v) inp.value = v;
      }
    }
    for (const t of refs.texts) {
      try { t.__paint?.(); } catch (e) {  }
    }
    const o = node.__zsLROut;
    if (o) {
      if (document.activeElement !== outZh && outZh.value !== o.zh) outZh.value = o.zh;
      if (document.activeElement !== outEn && outEn.value !== o.en) outEn.value = o.en;
      const txt = o.w && o.h ? `${o.w} × ${o.h}` : "未运行";
      if (sizeChip.textContent !== txt) sizeChip.textContent = txt;
    }
  }

  return { root: makeRoot(node), body, sync, refs };
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
  ensureNSWidth(node);
  ensureLRWidth(node);
  [0, 120, 400, 900, 1800].forEach((ms) =>
    setTimeout(() => { try { ensureHidden(node); } catch (e) { } }, ms));

  const built = cls === "ZImagePromptLoaderNode" ? buildDrawerPanel(node)
    : cls === "ZImageFashionPresetLoaderNode" ? buildWearPanel(node)
      : cls === "SunsetNSPromptSelector" ? buildNSPanel(node)
        : cls === "SunsetLRPromptBuilder" ? buildLRPanel(node)
          : buildGeneratorPanel(node);

  const root = built.root || makeRoot(node);
  if (!built.root) root.appendChild(el("div", "zs-head", "面板"));
  root.appendChild(built.body);

  node.__zsCtx = { root, sync: built.sync, cls };

  if (cls === "SunsetNSPromptSelector") {
    chain(node, "onExecuted", (out) => {
      try {
        node.__zsNSOut = {
          pos: out?.positive?.[0] ?? "",
          neg: out?.negative?.[0] ?? "",
        };
        built.sync?.();
        relayout(node, node.__zsCtx?.root);
      } catch (e) { }
    });
  }

  if (cls === "SunsetLRPromptBuilder") {
    chain(node, "onExecuted", (out) => {
      try {
        const src = (typeof app !== "undefined" && app?.nodeOutputs
          ? (app.nodeOutputs[String(node.id)] || app.nodeOutputs[node.id]) : null) || out || {};
        const pickv = (k) => (Array.isArray(src?.[k]) ? src[k][0] : src?.[k]);
        node.__zsLROut = {
          zh: String(pickv("中文提示词") ?? ""),
          en: String(pickv("英文提示词") ?? ""),
          w: Number(pickv("推荐宽度") ?? 0) || 0,
          h: Number(pickv("推荐高度") ?? 0) || 0,
        };
        built.sync?.();
        relayout(node, node.__zsCtx?.root);
      } catch (e) {  }
    });
  }

  let dm = null;
  if (typeof node.addDOMWidget === "function") {
    dm = node.addDOMWidget(DECK, "zimageui", root, {
      serialize: false,
      hideOnZoom: false,
      getHeight: () => root.offsetHeight,
    });
    if (dm) {
      dm.computeSize = () => [cls === "SunsetNSPromptSelector"
        ? Math.max(Number(node.size?.[0]) || CONFIG.width, NS_MIN_W)
        : cls === "SunsetLRPromptBuilder"
          ? Math.max(Number(node.size?.[0]) || CONFIG.width, LR_MIN_W)
          : CONFIG.width, root.offsetHeight];
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
      if (nodeData?.name === "SunsetNSPromptSelector" || nodeData?.name === "SunsetLRPromptBuilder") {
        const tspec = req["触发词"];
        if (Array.isArray(tspec) && Array.isArray(tspec[0])) {
          NS_TRIGGERS = tspec[0].filter((x) => x !== "——");
        }
        const opt = nodeData?.input?.optional || {};
        for (const key of Object.keys(opt)) {
          const s = opt[key];
          if (Array.isArray(s) && s[1] && typeof s[1] === "object") {
            s[1].hidden = true;
          }
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
        ensureNSWidth(node);
        ensureLRWidth(node);
        node.__zsCtx?.sync?.();
        relayout(node, node.__zsCtx?.root);
      } catch (e) { console.warn("[ZImageSkin] 恢复节点失败", e); }
    }, 60);
  },
});

console.log(`[ZImageSkin] 皮肤脚本已加载 v${SKIN_VERSION}（Z-image 落日三件套 · 霓虹外观）`);
