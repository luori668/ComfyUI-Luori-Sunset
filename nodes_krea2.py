import os
import glob
import random
import logging

try:
    from . import promptlib as PL
except ImportError:
    import promptlib as PL

LOG = logging.getLogger("Sunset.Krea2")

PACK_HINTS = ("part01.json", "part-zc.json", "part13.json")



def _looks_like_pack(d):
    if not d or not os.path.isdir(d):
        return False
    for h in PACK_HINTS:
        if os.path.isfile(os.path.join(d, h)):
            return True
    return bool(glob.glob(os.path.join(d, "part*.json")))


def _external_dir(raw):
    raw = (raw or "").strip()
    if not raw or raw in ("./part", "part", ".\\part", "./part/"):
        return None

    cands = []
    if os.path.isabs(raw):
        cands.append(os.path.normpath(raw))
    else:
        cands.append(os.path.normpath(os.path.join(PL.plugin_dir(), raw)))
        cands.append(os.path.normpath(os.path.join(PL.data_dir(), raw)))

    cn = os.path.dirname(PL.plugin_dir())
    try:
        names = sorted(os.listdir(cn))
    except OSError:
        names = []
    for n in names:
        low = n.lower()
        if ("krea2" in low) or ("luori" in low) or ("落日" in n):
            cands.append(os.path.join(cn, n, "part"))
    for n in names:
        cands.append(os.path.join(cn, n, "part"))

    for c in cands:
        if _looks_like_pack(c):
            LOG.info("[Sunset] 使用外部词库目录：%s", c)
            return c

    LOG.warning("[Sunset] prompt_dir 指向的位置没找到词库，改用插件自带的 data\\krea2")
    return None


def _pool_from_dir(ext, filename):
    if not ext:
        return []
    return PL.load_cleaned(os.path.join(ext, filename))



class Krea2PromptPicker:

    PART_COUNT = 12

    DESCRIPTION = (
        "落日提示词抽卡器：从选中的词库里随机抽提示词，输出一段可直接接 CLIP 的文本。"
        "界面由霓虹面板接管（原生控件已隐藏）。"
    )

    @classmethod
    def INPUT_TYPES(cls):
        required = {
            "prompt_dir": ("STRING", {
                "default": "./part",
                "multiline": False,
                "hidden": True,
            }),
            "seed": ("INT", {
                "default": 0,
                "min": 0,
                "max": 0xffffffffffffffff,
                "hidden": True,
            }),
            "mode": (["concat", "single"], {"default": "single", "hidden": True}),
            "separator": ("STRING", {"default": ", ", "hidden": True}),
            "触发词开关": ("BOOLEAN", {"default": True, "hidden": True}),
            "触发词内容": ("STRING", {"default": "", "multiline": True, "hidden": True}),
            "超强中文模式": ("BOOLEAN", {"default": True, "hidden": True}),
            "NSFW": ("BOOLEAN", {"default": False, "hidden": True}),
            "大呲花词库": ("BOOLEAN", {"default": False, "hidden": True}),
            "KOOK词库": ("BOOLEAN", {"default": False, "hidden": True}),
            "使用提示": ("STRING", {
                "default": "提示：开关互斥，多开无效（包括中文模式）此处勿动。",
                "multiline": True,
                "readonly": True,
                "hidden": True,
            }),
        }
        for i in range(1, cls.PART_COUNT + 1):
            required["提示词{}".format(i)] = ("BOOLEAN", {
                "default": False,
                "hidden": True,
            })
        return {"required": required}

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("prompt",)
    OUTPUT_TOOLTIPS = ("拼好的提示词文本，接到 CLIP 文本编码器的 text 输入",)
    FUNCTION = "pick"
    CATEGORY = "Krea2"


    def pick(self, prompt_dir, seed, mode, separator, **kw):
        rng = random.Random(seed if seed else None)
        ext = _external_dir(prompt_dir)

        active_pools = []

        if kw.get("超强中文模式", False):
            pool = _pool_from_dir(ext, "part-zc.json") or PL.load_super()
            if pool:
                active_pools.append(pool)

        if kw.get("NSFW", False):
            pool = _pool_from_dir(ext, "part13.json") or PL.load_krea2_nsfw()
            if pool:
                active_pools.append(pool)

        for tag, hzfile in (("大呲花词库", "part-hz1.json"), ("KOOK词库", "part-hz2.json")):
            if not kw.get(tag, False):
                continue
            pool = _pool_from_dir(ext, hzfile) or PL.load_cleaned(
                PL.find_file("krea2", hzfile))
            if pool:
                active_pools.append(pool)

        parts = None
        for i in range(1, self.PART_COUNT + 1):
            if not kw.get("提示词{}".format(i), False):
                continue
            name = "part{:02d}".format(i)
            pool = _pool_from_dir(ext, name + ".json")
            if not pool:
                if parts is None:
                    parts = PL.load_krea2_parts()
                pool = parts.get(name, [])
            if pool:
                active_pools.append(pool)

        if not active_pools:
            return ("（未开启任何提示词源）",)

        if mode == "single":
            result = rng.choice(rng.choice(active_pools))
        else:
            result = separator.join(rng.choice(p) for p in active_pools)

        if kw.get("触发词开关", False):
            trigger = str(kw.get("触发词内容", "")).strip()
            if trigger:
                result = trigger + separator + result if result else trigger

        return (result,)


def startup_check():
    miss = []
    if not PL.find_file("shared", "luori.json"):
        miss.append("data\\shared\\luori.json（超强词库）")
    for i in range(1, 14):
        if not PL.find_file("krea2", "part{:02d}.json".format(i)):
            miss.append("data\\krea2\\part{:02d}.json".format(i))
    for hz in ("part-hz1.json", "part-hz2.json"):
        if not PL.find_file("krea2", hz):
            miss.append("data\\krea2\\" + hz + "（汇总词库）")
    if miss:
        LOG.warning("[Sunset] 缺少这些词库文件，对应功能会没有词可选：%s", miss)
        return

    try:
        parts = PL.load_krea2_parts()
        nsfw = PL.load_krea2_nsfw()
        super_n = len(PL.load_super())
        hz1 = PL.load_cleaned(PL.find_file("krea2", "part-hz1.json"))
        hz2 = PL.load_cleaned(PL.find_file("krea2", "part-hz2.json"))
        cats, stats = PL.load_zimage_categories()
        extra = PL.load_extra_categories()
        split = sum(s.get("split_extra", 0) for s in stats.values())
        LOG.info("[Sunset] 词库就绪 · %s", PL.data_dir())
        LOG.info(
            "[Sunset]   Krea2 %d 池 + NSFW %d 条 / 超强 %d 条 / 汇总 %d+%d 条 / "
            "Z-image %d 分类（拆粘接 +%d 条，额外分类 %d 个）",
            len(parts), len(nsfw), super_n, len(hz1), len(hz2), len(cats), split, len(extra),
        )
    except Exception as e:
        LOG.warning("[Sunset] 词库统计跳过（不影响使用）：%s", e)
