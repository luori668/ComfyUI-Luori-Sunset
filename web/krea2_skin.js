import { app } from "../../scripts/app.js";

const SKIN_VERSION = "3.4";


const CONFIG = {
  autoResize: true,     
  width: 352,           
  hideNative: true,     
  paintNode: true,      
  glow: true,           
  syncInterval: 400,    
};

const THEME = {
  orange: "#FF8A3D",
  pink:   "#FF2E93",
  purple: "#8B2FF7",
  cyan:   "#22D3EE",
  danger: "#FF3D71",
  bgDeep: "#100B1F",
  bgMid:  "#1D1438",
};

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
  tip:    "使用提示",
};
const PART_COUNT = 12;
const partName = (i) => `提示词${i}`;

const PART_SIZES = [500, 500, 500, 500, 500, 500, 500, 500, 491, 247, 247, 1662];
const PART_TOTAL = PART_SIZES.reduce((a, b) => a + b, 0);


const HZ1_SIZE = 13430;
const HZ2_SIZE = 391;

const TITLE_H = 30;     


const findWidget = (node, name) => node?.widgets?.find((w) => w.name === name) ?? null;

function readW(node, name, fallback) {
  const w = findWidget(node, name);
  return w ? w.value : fallback;
}

function writeW(node, name, value) {
  const w = findWidget(node, name);
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
  box-sizing:border-box; width:100%; padding:10px;
  
  height:auto !important; min-height:0; overflow:visible;
  font:12px/1.45 "Segoe UI","PingFang SC","Microsoft YaHei",system-ui,sans-serif;
  color:var(--tx); border-radius:12px;
  background:
    radial-gradient(130% 90% at 100% 0%,  rgba(255,46,147,.18), transparent 58%),
    radial-gradient(120% 85% at 0% 100%,  rgba(139,47,247,.22), transparent 58%),
    linear-gradient(180deg,#191134,#100B1F);
  border:1px solid rgba(255,255,255,.075);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.07), 0 10px 30px rgba(0,0,0,.55);
}
.k2-root *{box-sizing:border-box;}


.k2-body{display:flex;flex-direction:column;flex:0 0 auto;width:100%;}


.k2-head{display:flex;align-items:center;gap:8px;padding-bottom:8px;border-bottom:1px solid var(--ln);}
.k2-dot{width:7px;height:7px;border-radius:50%;flex:0 0 auto;
  background:var(--o);box-shadow:0 0 9px var(--o);animation:k2pulse 2.6s ease-in-out infinite;}
@keyframes k2pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.82)}}
.k2-title{font-weight:800;font-size:12.5px;letter-spacing:.05em;
  background:linear-gradient(92deg,#FFC178,#FF2E93 52%,#8B2FF7);
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
  const chipTotal = el("div", "k2-sub", `0 / ${PART_COUNT + 4}`);
  head.append(el("div", "k2-dot"), el("div", "k2-title", "SOURCE DECK"), chipTotal);
  body.appendChild(head);

  body.appendChild(el("div", "k2-sech", "特殊模式 / MODE · 五选一"));
  const duo = el("div", "k2-duo");
  const bigCN = el("button", "k2-big k2-th");
  bigCN.type = "button";
  bigCN.title = "超强中文模式：追加 part-zc.json 的中文强化词库\n" +
                "五选一：开这个会自动关掉 NSFW、KOOK、大呲花和杂项(12 源)";
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
                "五选一：开这个会自动关掉超强中文模式、KOOK、大呲花和杂项(12 源)";
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
                  "五选一：开这个会自动关掉超强中文模式、NSFW、大呲花和杂项(12 源)";
  const kookTop = el("span", "k2-toprow");
  kookTop.append(el("span", "k2-sym", "KOOK"), el("span", "k2-count", HZ2_SIZE + " 条"));
  bigKOOK.append(kookTop, el("span", null, "提示词汇总"));
  bigKOOK.onclick = () => {
    const next = !readW(node, W_NAME.hz2, false);
    writeW(node, W_NAME.hz2, next);
    if (next) applyExclusive(node, "hz2");
    sync();
  };

  const bigMisc = el("button", "k2-big k2-src k2-half");
  bigMisc.type = "button";
  bigMisc.title =
    `杂项 = 12 个词库合一（part01..part12.json，共 ${PART_TOTAL} 条）\n` +
    `开启后：single 模式从这 ${PART_COUNT} 个词库里随机抽 1 条；` +
    `concat 模式这 ${PART_COUNT} 个词库各抽 1 条再拼接。\n` +
    `点一下 = 12 个全开；再点一下 = 全关。单独挑词库请展开下面的「细分 12 源」。\n` +
    `五选一：开这个会自动关掉超强中文模式、NSFW、KOOK 和大呲花`;
  const mMiscBadge = el("span", "k2-badge", `0 / ${PART_COUNT}`);
  bigMisc.append(el("span", "k2-sym", "MISC"),
                 el("span", null, `杂项 · ${PART_COUNT} 源合一`),
                 mMiscBadge);
  bigMisc.onclick = () => {
    const next = miscState(node) !== "all";
    for (let i = 1; i <= PART_COUNT; i++) writeW(node, partName(i), next);
    if (next) applyExclusive(node, "misc");  
    sync();
  };

  const bigHZ1 = el("button", "k2-big k2-hz k2-half");
  bigHZ1.type = "button";
  bigHZ1.title = "大呲花提示词汇总（纯抽卡模式）：加载 part-hz1.json（共 " + HZ1_SIZE + " 条）\n" +
                 "五选一：开这个会自动关掉超强中文模式、NSFW、KOOK 和杂项(12 源)";
  const dzTop = el("span", "k2-toprow");
  dzTop.append(el("span", "k2-sym", "大呲花"), el("span", "k2-count", HZ1_SIZE + " 条"));
  bigHZ1.append(dzTop, el("span", null, "提示词汇总（纯抽卡模式）"));
  bigHZ1.onclick = () => {
    const next = !readW(node, W_NAME.hz1, false);
    writeW(node, W_NAME.hz1, next);
    if (next) applyExclusive(node, "hz1");
    sync();
  };

  duo.append(bigCN, bigNS, bigKOOK, bigMisc, bigHZ1);
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
  seedInput.title = "种子值：可直接手填；随机模式下每次运行会自动换";
  seedInput.value = String(Number(readW(node, W_NAME.seed, 0)) || 0);
  seedInput.addEventListener("input", () => {
    const raw = String(seedInput.value || "").replace(/[^\d]/g, "");
    writeW(node, W_NAME.seed, Math.min(4294967295, parseInt(raw || "0", 10) || 0));
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
  const isFixed = () => {
    const c = ctrlOf();
    if (c) return c.value === "fixed";
    return (Number(readW(node, W_NAME.seed, 0)) || 0) > 0;
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
    const cur = Number(readW(node, W_NAME.seed, 0)) || 0;
    writeW(node, W_NAME.seed, on ? (cur || Math.floor(Math.random() * 0xFFFFFFFF)) : 0);
  };

  const btnRoll = el("button", "k2-mini", "\u21BB 随机");
  btnRoll.type = "button";
  btnRoll.title = "立刻换一颗随机种子";
  btnRoll.addEventListener("pointerdown", (e) => stopEvt(e), true);
  btnRoll.addEventListener("mousedown", (e) => stopEvt(e), true);
  btnRoll.addEventListener("click", (e) => {
    stopEvt(e);
    writeW(node, W_NAME.seed, Math.floor(Math.random() * 0xFFFFFFFF));
    paintSeed();
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
      ? `已锁定：每次运行都用种子 ${w}\n点一下切回随机（每次运行自动换）`
      : `随机中：每次运行自动换种子\n点一下锁定当前值 ${w}`;
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
    mMiscBadge.textContent = `${partsOn} / ${PART_COUNT}`;

    bigCN.classList.toggle("on", !!readW(node, W_NAME.cn, false));
    bigNS.classList.toggle("on", !!readW(node, W_NAME.nsfw, false));
    bigKOOK.classList.toggle("on", !!readW(node, W_NAME.hz2, false));
    bigHZ1.classList.toggle("on", !!readW(node, W_NAME.hz1, false));
    tgl.classList.toggle("on", !!readW(node, W_NAME.trigOn, false));

    const setIfIdle = (input, val) => {
      const v = val == null ? "" : String(val);
      if (document.activeElement === input) return;
      if (input.value !== v) input.value = v;
    };
    setIfIdle(trigInput, readW(node, W_NAME.trigTx, ""));
    setIfIdle(dirInput, readW(node, W_NAME.dir, ""));
    setIfIdle(sepInput, readW(node, W_NAME.sep, ""));
    paintSeed();

    const mode = String(readW(node, W_NAME.mode, "single"));
    segSingle.classList.toggle("on", mode === "single");
    segConcat.classList.toggle("on", mode === "concat");

    const n = countActive(node);
    const onlyMisc = ms === "all" && n === PART_COUNT;
    chipTotal.textContent = `${n} / ${PART_COUNT + 4}`;
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

  return { root, body, sync };
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
  for (let i = 1; i <= PART_COUNT; i++) if (readW(node, partName(i), false)) n++;
  return n;
}

function applyExclusive(node, group) {
  const killParts = () => {
    for (let i = 1; i <= PART_COUNT; i++) writeW(node, partName(i), false);
  };
  const killHz = () => {
    writeW(node, W_NAME.hz1, false);
    writeW(node, W_NAME.hz2, false);
  };
  if (group === "cn") {
    writeW(node, W_NAME.nsfw, false);
    killHz();
    killParts();
  } else if (group === "nsfw") {
    writeW(node, W_NAME.cn, false);
    killHz();
    killParts();
  } else if (group === "hz1") {
    writeW(node, W_NAME.cn, false);
    writeW(node, W_NAME.nsfw, false);
    writeW(node, W_NAME.hz2, false);
    killParts();
  } else if (group === "hz2") {
    writeW(node, W_NAME.cn, false);
    writeW(node, W_NAME.nsfw, false);
    writeW(node, W_NAME.hz1, false);
    killParts();
  } else if (group === "misc") {
    writeW(node, W_NAME.cn, false);
    writeW(node, W_NAME.nsfw, false);
    killHz();
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
    installPainting(node);
    applyTriggerDefault(node);   

    if (CONFIG.hideNative && Array.isArray(node.widgets)) {
      for (const w of node.widgets) hideWidget(w);
    }

    const { root, body, sync } = buildPanel(node);

    let domWidget = null;
    if (typeof node.addDOMWidget === "function") {
      domWidget = node.addDOMWidget("krea2_deck", "krea2ui", root, {
        serialize: false,     
        hideOnZoom: false,    
        getHeight: () => panelH,
      });
      if (domWidget) {
        domWidget.computeSize = () => [CONFIG.width, panelH];
        node.__k2dm = domWidget;   
      }
    } else {
      console.warn("[Krea2Skin] 当前前端不支持 addDOMWidget，已降级为独立浮层");
      root.style.position = "absolute";
      document.body.appendChild(root);
    }
    node.__k2ctx = { root, body };      
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

function contentHeight(body) {
  if (!body) return panelH;
  const h = Math.max(body.offsetHeight || 0, body.scrollHeight || 0);
  return h > 40 ? h : panelH;   
}

function widgetY(node, root) {
  const dm = node?.__k2dm;
  if (dm && typeof dm.y === "number" && dm.y >= 0) return dm.y;
  try {
    const cv = app?.canvas, ds = cv?.ds, el = cv?.canvas;
    if (!ds || !el || !root?.parentElement) return BOX_PAD;
    const cr = el.getBoundingClientRect();
    const scale = ds.scale || 1;
    const nodeTop = cr.top + ((node.pos?.[1] || 0) + (ds.offset?.[1] || 0)) * scale;
    const boxTop = root.parentElement.getBoundingClientRect().top;
    const v = Math.round((boxTop - nodeTop) / scale) - BOX_PAD;
    return v >= 0 ? v : BOX_PAD;
  } catch (e) { return BOX_PAD; }
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
  if (!CONFIG.autoResize) {
    if (changed) bumpCanvas(node);
    return false;
  }

  if (isDraggingNow(node)) { dbg(node, "skip: 指针按着，让位给用户拖"); return false; }

  clearStaleDragFlags(node);

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

console.log(`[Krea2Skin] 皮肤脚本已加载 v${SKIN_VERSION} (ComfyUI-Luori-Sunset · 落日提示词 · 霓虹外观)`);
