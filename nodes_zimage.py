import os
import random

try:
    from . import promptlib as PL
except ImportError:
    import promptlib as PL


def _uniq(seq):
    seen, out = set(), []
    for x in seq:
        if x not in seen:
            seen.add(x)
            out.append(x)
    return out



class ZImagePromptGeneratorNode:

    CATEGORY = "prompt_generators"

    DESCRIPTION = ("按主题/人物/装扮/场景等维度逐词抽卡，拼成一段可直接接 CLIP 的"
                   "人像摄影提示词。界面由霓虹面板接管（原生控件已隐藏）。")

    @classmethod
    def _libs(cls):
        return PL.load_zimage_libraries()

    @classmethod
    def INPUT_TYPES(cls):
        libs = cls._libs()
        styles = libs.get("拍摄主题", {})
        model = libs.get("模特设定", {})
        wear = libs.get("服装造型", {})
        race = libs.get("人种类型", {})
        lens = libs.get("美瞳种类", {})
        stocking = libs.get("丝袜类型", {})
        head = libs.get("头部配饰", {})
        shoes = libs.get("鞋子类型", {})
        sexy = libs.get("情趣服装", {})
        framing = libs.get("景别", {})

        def L(group, sub, fallback=None):
            v = group.get(sub)
            return list(v) if isinstance(v, list) and v else (fallback or ["无"])

        age_options = ["无"] + ["{}岁".format(i) for i in range(16, 39)]
        body_options = ["无", "苗条修长", "S型火辣曲线", "丰满坚挺", "纤细腰肢蜜桃臀",
                        "高挑匀称", "肉感丰腴", "骨感模特身材", "舞蹈生紧致身材",
                        "健身型健康曲线"]

        all_headwear = _uniq([w for sub in head.values() if isinstance(sub, list)
                              for w in sub]) or ["无"]

        style_tpl = PL.load_style_templates()

        return {
            "required": {
                "风格主题": (list(style_tpl.keys()) + ["随机", "无"],
                             {"default": "高冷御姐", "hidden": True}),
                "拍摄风格": (L(styles, "风格") + ["随机", "无"],
                             {"default": "时尚艺术写真", "hidden": True}),
                "拍摄类型": (L(styles, "类型") + ["随机", "无"],
                             {"default": "小香风", "hidden": True}),
                "细节级别": (["简洁级", "普通级", "详细级", "大师级", "极致级", "无"],
                             {"default": "大师级", "hidden": True}),
                "触发词开关": ("BOOLEAN", {"default": False, "hidden": True}),
                "触发词内容": ("STRING", {"default": "", "multiline": True,
                                          "hidden": True}),
                "动作": (PL.load_action_options() or ["无"],
                         {"default": "无", "hidden": True}),
                "年龄": (age_options, {"default": "23岁", "hidden": True}),
                "身材": (body_options, {"default": "舞蹈生紧致身材", "hidden": True}),
                "种族选择": (L(race, "人种") + ["随机", "无"],
                             {"default": "亚洲人", "hidden": True}),
                "美瞳选择": (L(lens, "美瞳") + ["随机"],
                             {"default": "蓝灰色", "hidden": True}),
                "丝袜类型": (L(stocking, "丝袜种类"), {"default": "无", "hidden": True}),
                "头部配饰": (all_headwear, {"default": "无", "hidden": True}),
                "鞋子类型": (L(shoes, "鞋类"), {"default": "无", "hidden": True}),
                "情趣衣服": (L(sexy, "情趣衣服"), {"default": "无", "hidden": True}),
                "景别": (L(framing, "类型"), {"default": "全身照", "hidden": True}),
                "NSFW": ("BOOLEAN", {"default": False, "label": "NSFW（漏骨模式）",
                                     "hidden": True}),
                "包含姿势描述": ("BOOLEAN", {"default": True, "hidden": True}),
                "包含高级细节": ("BOOLEAN", {"default": True, "hidden": True}),
                "包含画质参数": ("BOOLEAN", {"default": True, "hidden": True}),
                "包含后缀参数": ("BOOLEAN", {"default": True, "hidden": True}),
                "启用前景特效": ("BOOLEAN", {"default": False, "hidden": True}),
                "seed": ("INT", {"default": 0, "min": 0, "max": 0xffffffffffffffff,
                                 "hidden": True}),
            },
            "optional": {
                "prompt_input": ("STRING", {"forceInput": True}),
            },
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("prompt",)
    FUNCTION = "generate"
    OUTPUT_NODE = True


    def generate(self, **kw):
        libs = PL.load_zimage_libraries()
        if not libs:
            return ("词库没有加载成功：请确认插件目录下存在 data\\zimage\\libraries.json",)

        rng = random.Random(kw.get("seed", 0) or None)

        style_theme = kw.get("风格主题", "高冷御姐")
        style = kw.get("拍摄风格", "时尚艺术写真")
        type_val = kw.get("拍摄类型", "小香风")
        detail_level = kw.get("细节级别", "大师级")
        action = kw.get("动作", "无")
        selected_age = kw.get("年龄", "23岁")
        selected_body = kw.get("身材", "舞蹈生紧致身材")
        nsfw = kw.get("NSFW", False)

        race_choice = kw.get("种族选择", "亚洲人")
        contact_lens_choice = kw.get("美瞳选择", "蓝灰色")
        stocking = kw.get("丝袜类型", "无")
        headwear = kw.get("头部配饰", "无")
        shoes = kw.get("鞋子类型", "无")
        sexy_clothing = kw.get("情趣衣服", "无")
        framing = kw.get("景别", "全身照")

        include_pose = kw.get("包含姿势描述", True)
        include_details = kw.get("包含高级细节", True)
        include_quality = kw.get("包含画质参数", True)
        include_suffix = kw.get("包含后缀参数", True)
        enable_foreground = kw.get("启用前景特效", False)

        trigger_enabled = kw.get("触发词开关", False)
        trigger_text = str(kw.get("触发词内容", "") or "").strip()

        def resolve(value, group, sub):
            if value == "随机":
                pool = libs.get(group, {}).get(sub) or []
                return rng.choice(pool) if pool else ""
            if value == "无":
                return ""
            return value

        style = resolve(style, "拍摄主题", "风格")
        type_val = resolve(type_val, "拍摄主题", "类型")
        race_choice = resolve(race_choice, "人种类型", "人种")
        contact_lens_choice = resolve(contact_lens_choice, "美瞳种类", "美瞳")
        stocking = resolve(stocking, "丝袜类型", "丝袜种类")
        shoes = resolve(shoes, "鞋子类型", "鞋类")
        sexy_clothing = resolve(sexy_clothing, "情趣服装", "情趣衣服")
        framing = resolve(framing, "景别", "类型")

        coherent = self._coherent(style_theme, rng)

        prompt = self._compose(
            libs, rng,
            style, type_val, detail_level, action, race_choice, contact_lens_choice,
            stocking, headwear, shoes, sexy_clothing, framing, include_pose,
            include_details, include_quality, include_suffix, enable_foreground,
            coherent, nsfw, selected_age, selected_body,
        )

        prompt_input = kw.get("prompt_input", "")
        if prompt_input:
            prompt = prompt_input + "\n" + prompt

        if trigger_enabled and trigger_text:
            prompt = trigger_text + " " + prompt

        return (prompt,)


    @staticmethod
    def _coherent(style_theme, rng):
        tpl = PL.load_style_templates()
        if not tpl:
            return {"风格主题": style_theme, "气质": "", "表情": "", "眼神": "",
                    "光线": "", "氛围": ""}
        if style_theme == "随机" or style_theme not in tpl:
            style_theme = rng.choice(list(tpl.keys()))
        t = tpl[style_theme]

        def one(key):
            v = t.get(key)
            return rng.choice(v) if isinstance(v, list) and v else ""

        return {
            "风格主题": style_theme,
            "气质": one("气质"),
            "表情": one("表情"),
            "眼神": one("眼神"),
            "光线": one("光线"),
            "氛围": one("氛围"),
        }


    def _compose(self, libs, rng, style, type_val, detail_level, action, race_choice,
                 contact_lens_choice, stocking, headwear, shoes, sexy_clothing,
                 framing, include_pose, include_details, include_quality,
                 include_suffix, enable_foreground, coherent, nsfw=False,
                 selected_age="23岁", selected_body="舞蹈生紧致身材"):

        def pool(group, sub):
            v = libs.get(group, {}).get(sub)
            return list(v) if isinstance(v, list) else []

        def pick(group, sub):
            p = pool(group, sub)
            return rng.choice(p) if p else ""

        nsfw_body = (rng.choice(pool("NSFW元素", "身体强调")) + "，") if nsfw else ""
        if nsfw and (not sexy_clothing or sexy_clothing == "无"):
            cand = [x for x in pool("情趣服装", "情趣衣服") if x not in ("无", "随机")]
            if cand:
                sexy_clothing = rng.choice(cand)
        if nsfw and stocking == "无":
            cand = [s for s in pool("丝袜类型", "丝袜种类") if s not in ("无", "随机")]
            if cand:
                stocking = rng.choice(cand)

        age_str = "{}的".format(selected_age) if selected_age != "无" else ""
        body_str = "{}，".format(selected_body) if selected_body != "无" else ""

        race_desc = race_choice or pick("模特设定", "人种特征")
        face1 = pick("模特设定", "面部特征")
        face2 = pick("模特设定", "面部特征")
        guard = 0
        while face2 == face1 and guard < 20:
            face2 = pick("模特设定", "面部特征")
            guard += 1
        hair = pick("模特设定", "发型发色")

        if type_val == "古装":
            clothing_type = pick("服装造型", "古装")
        else:
            clothing_type = rng.choice([pick("服装造型", "上衣"),
                                        pick("服装造型", "连衣裙"),
                                        pick("服装造型", "制服校服")])

        material_pool = pool("服装造型", "材质")
        material = PL.pick_compatible(
            material_pool, lambda m: PL.material_fits(m, clothing_type), rng
        )
        color = pick("服装造型", "颜色")

        scene_group = rng.choice(["室内场景", "室外场景"])
        scene = pick("场景环境", scene_group)
        atmosphere = coherent["氛围"]

        weather_pool = pool("场景环境", "时间天气")
        time_weather = PL.pick_compatible(
            weather_pool, lambda w: PL.weather_fits(w, scene), rng
        )
        scene_phrase = self._scene_phrase(time_weather, scene, atmosphere)

        lens = pick("拍摄参数", "镜头")
        composition = pick("构图光影", "构图")
        depth = pick("构图光影", "景深")
        light_type = coherent["光线"] or pick("构图光影", "光线")
        light_effect = pick("构图光影", "光影效果")
        tone = pick("色彩色调", "色调")
        color_style = pick("色彩色调", "色彩风格")
        expression = coherent["表情"]
        eyes = coherent["眼神"]

        pose = action if action != "无" else (
            pick("姿势动作", "全身姿势") if include_pose else "")

        framing_desc = {
            "全身照": "全身像，从头到脚完整呈现，",
            "七分照": "七分身像，膝盖以上，",
            "半身照": "半身肖像，腰部以上，",
            "特写": "面部特写，胸部以上，",
            "局部特写": "局部细节特写，",
        }.get(framing, "半身肖像，")

        parts = []
        if style:
            parts.append(style)
        if type_val:
            parts.append(type_val)
        lens_txt = lens if "镜头" in str(lens) else "{}镜头".format(lens)
        parts.append("，使用{}拍摄。".format(lens_txt))
        parts.append(framing_desc)

        parts.append("一位{}{}年轻女性，{}拥有{}，{}，{}，气质{}。"
                     .format(age_str, race_desc, body_str, face1, face2, hair,
                             coherent["气质"]))

        if contact_lens_choice and contact_lens_choice != "无":
            parts.append("佩戴{}美瞳，".format(contact_lens_choice))
        if sexy_clothing and sexy_clothing != "无":
            parts.append("穿着{}，".format(sexy_clothing))

        clothing_desc = "身着{}{}{}，{}".format(color, material, clothing_type, nsfw_body)
        if stocking and stocking != "无":
            clothing_desc += "搭配{}，".format(stocking)
        parts.append(clothing_desc)

        if headwear and headwear != "无":
            parts.append("佩戴{}，".format(headwear))
        if shoes and shoes != "无":
            parts.append("脚穿{}，".format(shoes))

        if pose:
            parts.append("{}，表情{}，{}。".format(pose, expression, eyes))
        else:
            parts.append("表情{}，{}。".format(expression, eyes))

        parts.append(scene_phrase)
        parts.append("采用{}，景深为{}。画面色调为{}，{}。"
                     .format(composition, depth, tone, color_style))
        parts.append("光线为{}，形成{}效果。".format(light_type, light_effect))

        if include_details:
            parts.append("肌肤细腻，发丝清晰，眼神有神，服装材质层次丰富。")
        if detail_level in ("大师级", "极致级"):
            parts.append("电影级光影，极致细节渲染，故事感强。")

        if enable_foreground:
            fx = pick("后期处理", "特效")
            if fx:
                parts.append("前景加入{}。".format(fx))

        if include_quality:
            parts.append("8K超高清，锐利清晰，电影感调色。")

        if include_suffix:
            parts.append(rng.choice([" --ar 9:16 --s 750 --v 6",
                                     " --ar 3:4 --stylize 650",
                                     " --ar 2:3 --style raw"]))

        return "".join(parts).strip("，") + "。"

    @staticmethod
    def _scene_phrase(time_weather, scene, atmosphere):
        w = str(time_weather or "")
        s = str(scene or "")
        verb = {"晴天": "窗外阳光正好", "阴天": "窗外天色阴沉", "雨天": "窗外正下着雨",
                "雪天": "窗外飘着雪", "雾天": "窗外起了薄雾", "彩虹天": "窗外天边挂着彩虹",
                "台风天": "窗外风雨交加", "雷雨天": "窗外雷雨交加",
                "沙尘天": "窗外沙尘漫天", "极光夜": "窗外夜空泛着极光"}.get(w)
        if verb and PL.looks_indoor(s):
            return "置身于{}，{}，氛围{}。".format(s, verb, atmosphere)
        return "置身于{}{}，氛围{}。".format(w, s, atmosphere)



BUILTIN_CATEGORIES = ["古装", "古风", "艺术摄影", "cos", "糖水少女", "NSFW", "抽卡"]


class ZImagePromptLoaderNode:

    CATEGORY = "prompt_generators"

    DESCRIPTION = ("从整句词库里随机抽一条提示词。分类可扩展："
                   "data\\zimage\\extra 下每放一个 json 就多一个分类。")

    @classmethod
    def category_names(cls):
        builtin_cats, _ = PL.load_zimage_categories()
        names = [c for c in BUILTIN_CATEGORIES if c in builtin_cats]
        for c in builtin_cats:
            if c not in names:
                names.append(c)
        for c in PL.load_extra_categories():
            if c not in names:
                names.append(c)
        return names

    @classmethod
    def INPUT_TYPES(cls):
        required = {
            "文件路径": ("STRING", {"default": "prompt_library.json",
                                    "multiline": False, "hidden": True}),
            "超强模式": ("BOOLEAN", {"default": True, "label": "超强模式（专属词库）",
                                     "hidden": True}),
        }
        for c in cls.category_names():
            required[c] = ("BOOLEAN", {"default": False, "label": c, "hidden": True})
        required.update({
            "随机模式": ("BOOLEAN", {"default": False,
                                     "label": "随机模式（忽略开关，从全部抽取）",
                                     "hidden": True}),
            "seed": ("INT", {"default": 0, "min": 0, "max": 0xffffffffffffffff,
                             "hidden": True}),
            "触发词开关": ("BOOLEAN", {"default": False, "hidden": True}),
            "触发词内容": ("STRING", {"default": "", "multiline": True,
                                      "hidden": True}),
        })
        return {"required": required}

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("prompt",)
    FUNCTION = "load_prompt"
    OUTPUT_NODE = True

    def _resolve_library(self, filename):
        fn = str(filename or "").strip()
        if fn and os.path.isabs(fn) and os.path.isfile(fn):
            return fn
        return PL.find_file("zimage", fn or "prompt_library.json")

    def load_prompt(self, **kw):
        rng = random.Random(kw.get("seed", 0) or None)
        trigger_on = kw.get("触发词开关", False)
        trigger_tx = str(kw.get("触发词内容", "") or "").strip()

        def finish(text):
            if trigger_on and trigger_tx:
                return trigger_tx + " " + text
            return text

        if kw.get("超强模式", True):
            sup = PL.load_super()
            if not sup:
                return (finish("超强词库没有加载成功：请确认 data\\shared\\luori.json 存在"),)
            return (finish(rng.choice(sup)),)

        cats, _stats = PL.load_zimage_categories()
        for k, v in PL.load_extra_categories().items():
            cats.setdefault(k, v)

        p = self._resolve_library(kw.get("文件路径"))
        data = PL.load_json(p)
        if data is None and not cats:
            return (finish("词库不存在！请确认插件目录 data\\zimage\\prompt_library.json"),)

        if kw.get("随机模式", False):
            allp = []
            for v in cats.values():
                allp.extend(v)
            if not allp:
                return (finish("JSON中没有提示词"),)
            return (finish(rng.choice(allp)),)

        selected = []
        for name, pool in cats.items():
            if kw.get(name, False):
                selected.extend(pool)

        if not selected:
            return (finish("请至少开启一个分类开关，或打开随机模式"),)
        return (finish(rng.choice(selected)),)



class ZImageFashionPresetLoaderNode:

    CATEGORY = "prompt_generators"

    DESCRIPTION = ("从穿搭预设里取一套完整描述，智能润色会按标题里的风格自动"
                   "追加质感词。界面由霓虹面板接管。")

    DEFAULT_ENHANCE = ["顶级摄影质感", "超写实渲染", "丰富细节层次", "电影级光影",
                       "8K超高清", "色彩精准", "构图考究", "艺术感染力"]

    @classmethod
    def _enhance_table(cls):
        return PL.load_style_enhance() or {}

    @classmethod
    def INPUT_TYPES(cls):
        presets = PL.load_presets()
        names = ["随机"] + [str(p.get("title", "")) for p in presets
                            if isinstance(p, dict) and p.get("title")]
        if len(names) == 1:
            names = ["随机"]
        return {
            "required": {
                "预设选择": (names, {"default": "随机", "hidden": True}),
                "润色模式": ("BOOLEAN", {"default": True, "label": "智能风格润色",
                                         "hidden": True}),
                "seed": ("INT", {"default": 0, "min": 0,
                                 "max": 18446744073709551615, "hidden": True}),
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("prompt",)
    FUNCTION = "load_preset"
    OUTPUT_NODE = True

    def load_preset(self, 预设选择, 润色模式, seed):
        rng = random.Random(seed or None)
        data = PL.load_presets()
        if not isinstance(data, list) or not data:
            return ("错误：未找到 data\\zimage\\fashion_presets.json，或格式不对",)

        if 预设选择 == "随机":
            chosen = rng.choice(data)
        else:
            chosen = next((x for x in data
                           if isinstance(x, dict) and x.get("title") == 预设选择), None)
            if chosen is None:
                chosen = rng.choice(data)

        content = chosen.get("content", "无内容")
        title = chosen.get("title", "")
        if 润色模式:
            content = self._polish(content, title, rng)
        return (content,)

    def _polish(self, raw_text, title, rng):
        table = self._enhance_table()
        text_for_scan = (str(title) + " " + str(raw_text)).lower()
        matched = [s for s in table if s.lower() in text_for_scan]
        words = table.get(matched[0]) if matched else self.DEFAULT_ENHANCE
        if not isinstance(words, list) or not words:
            words = self.DEFAULT_ENHANCE
        picked = rng.sample(words, min(3, len(words)))
        for w in picked:
            if w not in raw_text:
                if raw_text.endswith(("。", ".", "！", "!")):
                    raw_text += " " + w + "。"
                else:
                    raw_text += "。" + w + "。"
        if "光线" not in raw_text and "光" not in raw_text:
            raw_text += "采用" + rng.choice(
                ["自然柔光", "侧逆光", "伦勃朗光", "轮廓光", "漫射光"]) + "，塑造立体感。"
        return raw_text
