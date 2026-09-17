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


# ============================================================================
# 以下常量只服务 ZImagePromptGeneratorNode（✨ 落日-提示词生成器）
# 作用：把「拍摄风格 / 拍摄类型 / 情趣衣服 / NSFW」收敛成一个统一风格桶，
#       再让 服装-材质-颜色-丝袜-鞋子-头饰-场景 全部跟着这个桶走，
#       消除「两套衣服」「类型与服装不搭」这类互相打架的输出。
# ============================================================================

# 顺序 = 优先级。命中靠关键词包含匹配。
BUCKET_RULES = (
    ("情趣", ("情趣", "内衣", "睡裙", "睡衣", "丁字", "开裆", "胸衣", "束身",
              "纯欲", "私房", "漏骨", "乳胶", "透明", "透视", "网衣", "露乳",
              "性感", "魅惑", "诱惑", "妩媚", "肉体")),
    ("泳装", ("泳装", "比基尼", "沙滩", "海边", "冲浪", "潜水", "温泉",
              "泡汤", "水上乐园", "泳池", "热带度假", "深海")),
    ("古风", ("古装", "汉服", "唐装", "宋制", "明制", "魏晋", "国风", "敦煌",
              "武侠", "仙女", "神仙", "旗袍", "和服", "韩服", "奥黛", "纱丽",
              "蒙古袍", "藏袍", "苗银", "彝族", "西域", "丝路", "新中式",
              "禅意", "唐卡", "汉元素", "戏曲", "清汉", "襦裙", "深衣",
              "婚服", "霞帔", "云肩", "马面", "袄裙", "氅", "道袍", "飞天",
              "民国", "旗装", "工笔", "水墨", "浮世绘", "藏装", "维吾尔",
              "民族", "敦煌壁画", "长衫")),
    ("制服", ("JK", "校服", "水手", "学院", "制服", "护士", "空姐", "女警",
              "军装", "女仆", "OL", "职场", "秘书", "兔女郎", "猫娘", "体操",
              "拉拉队", "警服", "白大褂", "服务员", "快递员", "厨师服",
              "cosplay", "军官", "飞行员", "赛车手", "骑手", "乘务", "列车员",
              "律师", "教师", "医生", "教练", "白领", "警官", "特警", "海关",
              "安检", "仪仗", "执事", "管家", "侍者", "咖啡师", "烘焙师",
              "花艺师", "理发师", "调酒师", "保安", "空乘", "士兵", "机长",
              "练习生", "图书管理员", "电竞")),
    ("运动", ("运动", "健身", "瑜伽", "跑步", "舞蹈", "田径", "骑行", "网球",
              "篮球", "芭蕾", "国标", "民族舞", "古典舞", "现代舞", "街舞",
              "爵士", "探戈", "滑雪", "登山", "攀岩", "拳击", "搏击",
              "跆拳道", "柔道", "击剑", "射箭", "马术", "滑板", "马拉松",
              "运动员", "舞者")),
    ("甜系", ("洛丽塔", "哥特", "公主", "甜美", "糖果", "少女", "初恋",
              "糖水", "森系", "田园", "波西米亚", "软萌", "童话", "草莓",
              "奶油", "马卡龙", "芭蕾风", "棉花糖", "甜品", "玩偶", "兔子",
              "猫咪", "花房", "野餐", "游乐园", "旋转木马", "摩天轮",
              "甜心", "幼态", "精灵", "魔法少女")),
    ("高定", ("晚宴", "礼服", "婚纱", "红毯", "高级时装", "杂志封面",
              "品牌广告", "商业人像", "名媛", "小香风", "英伦", "法式",
              "老钱", "静奢", "贵气", "秀场", "T台", "颁奖", "沙龙",
              "酒会", "宴会", "高定", "晚装", "奢华", "贵妇", "夫人",
              "富家千金", "大小姐", "优雅", "知性", "轻熟", "御姐")),
    ("街头", ("街头", "嘻哈", "朋克", "机能", "Y2K", "千禧", "赛博", "废土",
              "蒸汽", "暗黑", "街拍", "机车", "工装", "中性", "涂鸦",
              "说唱", "乐队", "DJ", "音乐节", "livehouse", "机甲",
              "仿生人", "未来", "太空", "废墟", "工业", "公路", "沙漠",
              "丛林", "星河", "程序员", "摄影师", "导演", "演员", "模特",
              "偶像", "舞台", "电竞选手", "酷飒")),
    ("复古", ("复古", "港风", "胶片", "80年代", "90年代", "怀旧", "老上海",
              "月份牌", "迪斯科", "摇滚", "老照片", "宝丽来", "CCD", "DV",
              "老电影", "老街", "弄堂", "石库门", "绿皮火车", "千禧风",
              "油画", "蒸汽波")),
)

BUCKET_CFG = {
    "古风": {
        "garment": (("服装造型", "古装"),),
        "shoes": ("鞋子类型", "古风鞋"),
        "headwear": ("头部配饰", "古风头饰"),
        "scene": (("场景环境", "古风场景"),),
        "material": ("丝绸", "缎", "真丝", "雪纺", "纱", "棉麻", "亚麻",
                     "丝绒", "天鹅绒", "金丝绒", "绒面", "织锦", "提花",
                     "刺绣", "欧根", "毛呢", "羊毛", "薄纱", "醋酸", "棉",
                     "宋锦", "香云纱"),
        "plain_color": True,
        "stockings": False,
        "force_shoes": True,
        "type_override": "国风",
    },
    "制服": {
        "garment": (("服装造型", "制服校服"),),
        "shoes": ("鞋子类型", "制服鞋"),
        "headwear": ("头部配饰", "制服头饰"),
        "scene": (("场景环境", "制服场景"),),
        "material": ("棉", "针织", "罗纹", "羊毛", "羊绒", "毛呢", "灯芯绒",
                     "牛仔", "皮革", "纳帕", "漆皮", "雪纺", "真丝", "缎",
                     "粗花呢", "千鸟格", "威尔士格", "苏格兰格", "人字纹",
                     "PVC", "麂皮"),
        "plain_color": True,
        "stockings": True,
        "force_shoes": True,
        "type_override": "学院风",
    },
    "泳装": {
        "garment": (("服装造型", "泳装"),),
        "shoes": ("鞋子类型", "泳装鞋"),
        "headwear": ("头部配饰", "头饰"),
        "scene": (("场景环境", "泳装场景"),),
        "material": ("冰丝", "莫代尔", "人棉", "天丝", "网眼", "针织",
                     "罗纹", "亮片", "珠片", "烫钻", "水钻", "PVC", "镭射",
                     "反光", "液态金属", "网纱", "蕾丝", "雪纺", "弹力"),
        "plain_color": False,
        "stockings": False,
        "force_shoes": True,
        "type_override": "泳装",
    },
    "运动": {
        "garment": (("服装造型", "运动服装"),),
        "shoes": ("鞋子类型", "运动鞋类"),
        "headwear": ("头部配饰", "运动头饰"),
        "scene": (("场景环境", "运动场景"),),
        "material": ("冰丝", "莫代尔", "人棉", "天丝", "网眼", "针织",
                     "罗纹", "棉", "弹力", "防水", "反光", "夜光"),
        "plain_color": True,
        "stockings": False,
        "force_shoes": True,
        "type_override": "运动风",
    },
    "甜系": {
        "garment": (("服装造型", "甜系服装"),),
        "shoes": ("鞋子类型", "甜系鞋"),
        "headwear": ("头部配饰", "甜系头饰"),
        "scene": (("场景环境", "甜系场景"),),
        "material": ("蕾丝", "雪纺", "纱", "欧根", "针织", "棉", "绒",
                     "丝绒", "天鹅绒", "缎", "真丝", "亮片", "珠片",
                     "烫钻", "羽毛", "立体花", "3D压花", "荷叶边", "褶皱",
                     "毛呢", "羊毛", "羊羔绒", "刺绣"),
        "plain_color": False,
        "stockings": True,
        "type_override": "甜美风",
    },
    "高定": {
        "garment": (("服装造型", "高定服装"),),
        "shoes": ("鞋子类型", "高定鞋"),
        "headwear": ("头部配饰", "高定头饰"),
        "scene": (("场景环境", "高定场景"),),
        "material": ("缎", "真丝", "丝绸", "丝绒", "天鹅绒", "绒", "蕾丝",
                     "纱", "欧根", "薄纱", "织锦", "提花", "刺绣", "珠片",
                     "亮片", "钉珠", "烫钻", "水钻", "羽毛", "立体花",
                     "3D压花", "粗花呢", "千鸟格", "金属", "液态金属",
                     "皮革", "麂皮", "雪纺", "醋酸"),
        "plain_color": True,
        "stockings": True,
        "force_shoes": True,
        "type_override": "高级时装",
    },
    "街头": {
        "garment": (("服装造型", "街头服装"),),
        "shoes": ("鞋子类型", "街头鞋"),
        "headwear": ("头部配饰", "街头头饰"),
        "scene": (("场景环境", "街头场景"),),
        "material": ("牛仔", "皮革", "纳帕", "磨砂皮", "漆皮", "鳄鱼",
                     "压纹", "网纱", "网眼", "针织", "罗纹", "棉麻",
                     "灯芯绒", "麂皮", "PVC", "反光", "夜光", "镭射",
                     "液态金属", "金属丝", "防水", "迷彩", "牛皮"),
        "plain_color": False,
        "stockings": True,
        "type_override": "街头风",
    },
    "复古": {
        "garment": (("服装造型", "复古服装"),),
        "shoes": ("鞋子类型", "复古鞋"),
        "headwear": ("头部配饰", "复古头饰"),
        "scene": (("场景环境", "复古场景"),),
        "material": ("粗花呢", "千鸟格", "人字纹", "威尔士格", "苏格兰格",
                     "灯芯绒", "丝绒", "天鹅绒", "金丝绒", "雪尼尔", "毛呢",
                     "羊毛", "羊绒", "皮革", "麂皮", "棉麻", "亚麻", "针织",
                     "蕾丝", "雪纺", "缎", "真丝", "牛仔", "珠片", "亮片",
                     "烫钻", "丝绒压花"),
        "plain_color": False,
        "stockings": True,
        "type_override": "复古风",
    },
    "情趣": {
        "garment": (),
        "shoes": ("鞋子类型", "情趣鞋"),
        "headwear": ("头部配饰", "情趣头饰"),
        "scene": (("场景环境", "情趣场景"),),
        "material": (),
        "plain_color": True,
        "stockings": True,
        "force_shoes": True,
        "type_override": "私房",
    },
    "通用": {
        "garment": (("服装造型", "上衣"), ("服装造型", "连衣裙"),
                    ("服装造型", "制服校服")),
        "shoes": ("鞋子类型", "鞋类"),
        "headwear": ("头部配饰", "头饰"),
        "scene": (("场景环境", "室内场景"), ("场景环境", "室外场景")),
        "material": (),
        "plain_color": False,
        "stockings": True,
        "type_override": "",
    },
}

# 自带图案感的颜色 / 材质：二者不能同时出现（"格纹材质 + 印花颜色"会打架）
PATTERN_COLOR = ("印花", "格纹", "条纹", "波点", "撞色", "拼色", "渐变",
                 "扎染", "鎏金", "描金", "烫银", "晕染")
PATTERN_MATERIAL = ("格", "纹", "印花", "提花", "织锦", "千鸟", "人字",
                    "3D压花", "褶皱", "亮片", "珠片", "钉珠", "烫钻",
                    "水钻", "羽毛", "立体花", "渐变", "扎染", "刺绣")

# 情趣向丝袜（NSFW 自动补丝袜时优先用这些）
SEXY_STOCKINGS = ("渔网袜", "网格袜", "菱形网袜", "大网格袜", "细网格袜",
                  "吊带丝袜", "开裆丝袜", "大腿袜", "过膝丝袜", "长筒丝袜",
                  "蕾丝丝袜", "花边丝袜", "亮丝丝袜", "破洞丝袜", "彩色丝袜",
                  "红色丝袜", "黑色丝袜", "分段式丝袜")

# 头部配饰的动词：原逻辑一律写"佩戴XX"，遇到"手表/围巾/项链"就很别扭
HEADWEAR_VERB_RULES = (
    ("搭配", ("丝巾", "围巾", "披肩", "披帛", "手套", "腰", "包", "链",
              "香囊", "挂件", "工牌", "胸卡", "耳机", "面具", "眼罩",
              "口塞", "臂环", "脚链", "踝链", "对讲机", "耳麦", "香薰")),
    ("颈间佩戴", ("项链", "颈环", "颈饰", "choker", "项圈", "领结", "领带",
                  "领花", "领巾", "长命锁", "平安扣", "铃铛choker")),
    ("耳畔戴着", ("耳环", "耳钉", "耳坠", "耳线", "耳夹", "耳骨", "耳饰",
                  "耳扣", "耳挂", "耳链", "耳圈", "耳廓")),
    ("戴着", ("口罩", "眼镜", "墨镜", "面纱", "蒙眼", "面罩", "护目",
              "镜框", "镜片")),
    ("头戴", ("帽", "发", "簪", "钗", "冠", "环", "箍", "夹", "绳",
              "圈", "梳", "钿", "胜", "步摇", "抹额", "纱", "巾", "笠")),
)

FRAMING_RULES = (
    ("全身", "全身像，从头到脚完整呈现，"),
    ("七分", "七分身像，膝盖以上，"),
    ("半身", "半身肖像，腰部以上，"),
    ("胸像", "半身肖像，胸部以上，"),
    ("特写", "面部特写，胸部以上，"),
    ("脸", "面部特写，胸部以上，"),
    ("头", "面部特写，胸部以上，"),
    ("眼", "眼部特写，只呈现眉眼，"),
    ("唇", "唇部特写，只呈现唇部，"),
    ("手", "手部特写，只呈现手部，"),
    ("局部", "局部细节特写，"),
    ("背影", "全身背影，从头到脚完整呈现，"),
)


# 只能在室外成立的天气/天象。promptlib 里那套按"雨天/雪天"整词匹配，
# 词库扩充后新增的"暴雨/阵雨/落雪/扬沙"等漏掉了，这里按关键词兜住。
OUTDOOR_WEATHER_KEYS = (
    "雨", "雪", "雾", "霾", "沙", "风", "雷", "雹", "霜", "冰",
    "彩虹", "极光", "银河", "星空", "满月", "日出", "日落", "破晓", "暮色",
)

# promptlib 的 INDOOR_HINTS 没覆盖词库扩充后新增的场景（"水晶酒柜"之类），
# 这里在节点内补一层，避免室内场景配上"暴雨/落雪"这种天气。
INDOOR_HINTS_EXT = (
    "酒柜", "书柜", "柜", "沙龙", "会所", "大堂", "包厢", "套房", "公寓",
    "客房", "试衣间", "更衣室", "化妆间", "壁炉", "剧院", "音乐厅", "拍卖",
    "琴房", "禅房", "闺", "绣楼", "殿", "佛塔", "石窟", "吧台", "吧",
    "柜台", "收银", "走廊", "楼道", "电梯", "玄关", "阁", "寮", "舱",
    "舷窗", "影厅", "影院", "棚", "仓库", "车间", "作坊", "工坊", "室",
    "房", "厅", "馆", "店", "屋", "榻", "床", "镜前", "窗前", "楼梯",
)

# 各桶不合适的丝袜（给高定/制服这类场合挡掉荧光、破洞、彩色这类）
STOCKING_BLOCK = {
    "高定": ("荧光", "破洞", "做旧", "磨损", "补丁", "彩色", "红色", "蓝色",
             "紫色", "绿色", "黄色", "橙色", "渐变", "开裆", "吊带", "渔网",
             "虎纹", "豹纹", "蛇纹", "奶牛", "斑马", "菱形", "网格", "字母",
             "logo", "卡通", "爱心", "星星", "佩斯利", "千鸟", "苏格兰"),
    "制服": ("荧光", "破洞", "开裆", "吊带", "做旧", "磨损", "补丁"),
    "甜系": ("开裆", "破洞", "做旧", "磨损", "补丁", "荧光"),
    "复古": ("荧光", "破洞"),
    "通用": ("荧光",),
}


def _is_outdoor_weather(w):
    s = str(w or "")
    return any(k in s for k in OUTDOOR_WEATHER_KEYS)


def _looks_indoor(scene):
    s = str(scene or "")
    if PL.looks_indoor(s):
        return True
    return any(k in s for k in INDOOR_HINTS_EXT)


def _bucket_of(text):
    s = str(text or "")
    if not s:
        return ""
    for name, keys in BUCKET_RULES:
        for k in keys:
            if k in s:
                return name
    return ""


def _headwear_verb(word):
    s = str(word or "")
    for verb, keys in HEADWEAR_VERB_RULES:
        for k in keys:
            if k in s:
                return verb
    # 兜底用"搭配"：比一律"佩戴"自然，"佩戴手表/佩戴勋章"读着别扭
    return "搭配"


def _framing_desc(value):
    s = str(value or "")
    for key, desc in FRAMING_RULES:
        if key in s:
            return desc
    return "半身肖像，腰部以上，"


def _age_title(age_text):
    digits = "".join(ch for ch in str(age_text or "") if ch.isdigit())
    if not digits:
        return "年轻女性"
    try:
        n = int(digits)
    except ValueError:
        return "年轻女性"
    if n <= 19:
        return "少女"
    if n <= 26:
        return "年轻女性"
    if n <= 32:
        return "轻熟女性"
    return "成熟女性"


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
                # 排除占位项，否则会真的生成"穿着随机，""景别：随机"这种句子
                p = [x for x in (libs.get(group, {}).get(sub) or [])
                     if x not in ("无", "随机", "")]
                return rng.choice(p) if p else ""
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


    # 戴帽子时不宜同时出现的发型（丸子头/高马尾上面再扣顶帽子会很怪）
    HAIR_BLOCK_WITH_HAT = ("丸子头", "高马尾", "双马尾", "公主头", "花苞头",
                           "盘发", "低盘发", "发髻", "编发", "麻花辫",
                           "拳击辫", "蜈蚣辫", "丝带编发", "盘发插梳",
                           "垂鬟", "半扎发", "低马尾")

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

        def pick_multi(refs):
            """从多组候选池里随机挑一组再抽一条（池级别随机，不是条目级别）。"""
            filled = [(g, s) for g, s in refs if pool(g, s)]
            if not filled:
                return ""
            return pick(*rng.choice(filled))

        def is_on(v):
            return bool(v) and v != "无"

        # --------------------------------------------------------------
        # 1) 定风格桶：情趣衣服 > NSFW > 拍摄类型 > 拍摄风格
        #    桶一旦定下，服装/材质/颜色/丝袜/鞋子/头饰/场景全部跟着它走
        # --------------------------------------------------------------
        sexy_on = is_on(sexy_clothing)
        if nsfw and not sexy_on:
            cand = [x for x in pool("情趣服装", "情趣衣服")
                    if x not in ("无", "随机")]
            if cand:
                sexy_clothing = rng.choice(cand)
                sexy_on = True

        if sexy_on:
            bucket = "情趣"
        else:
            bucket = (_bucket_of(type_val) or _bucket_of(style) or "通用")
        cfg = BUCKET_CFG.get(bucket, BUCKET_CFG["通用"])

        # 情趣桶下，如果「拍摄类型」还指向别的风格（比如古装/制服），
        # 就换成私房——否则开头写"古装"、身上是情趣内衣，前后打架。
        if bucket == "情趣" and type_val:
            tb = _bucket_of(type_val)
            if tb and tb != "情趣":
                type_val = cfg.get("type_override") or "私房"

        # --------------------------------------------------------------
        # 2) 头部配饰：用户显式选的尊重；选"随机"时按桶抽
        # --------------------------------------------------------------
        if headwear == "随机":
            headwear = pick(*cfg["headwear"]) or pick("头部配饰", "头饰")
        headwear_on = is_on(headwear)
        headwear_verb = _headwear_verb(headwear) if headwear_on else ""

        # --------------------------------------------------------------
        # 3) 鞋子：用户显式选的尊重；选"随机"时按桶抽
        # --------------------------------------------------------------
        if shoes == "随机":
            shoes = pick(*cfg["shoes"]) or pick("鞋子类型", "鞋类")
        elif cfg.get("force_shoes") and is_on(shoes):
            # 情趣/古风这类强风格桶：用户选的鞋若不在这个桶的鞋池里就换掉，
            # 免得出现"情趣内衣 + 劳保鞋""汉服 + 篮球鞋"这种组合
            allowed = set(pool(*cfg["shoes"]))
            if allowed and shoes not in allowed:
                shoes = rng.choice(sorted(allowed))
        shoes_on = is_on(shoes)

        # --------------------------------------------------------------
        # 4) 人物
        # --------------------------------------------------------------
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
        if headwear_on and headwear_verb == "头戴" and "帽" in str(headwear):
            for _ in range(12):
                if not any(k in str(hair) for k in self.HAIR_BLOCK_WITH_HAT):
                    break
                hair = pick("模特设定", "发型发色")

        # --------------------------------------------------------------
        # 5) 主服装：全场只有一套。情趣衣服与常规服装二选一，情趣优先。
        # --------------------------------------------------------------
        garment = ""
        material = ""
        color = ""
        if sexy_on:
            # 情趣衣服自带完整描述，不再叠材质/颜色，也不再叠常规服装
            outfit = "穿着{}，".format(sexy_clothing)
        else:
            garment = pick_multi(cfg["garment"]) or pick_multi(
                BUCKET_CFG["通用"]["garment"])
            if garment:
                mpool = pool("服装造型", "材质")
                keys = cfg.get("material") or ()
                if keys:
                    narrowed = [m for m in mpool
                                if any(k in str(m) for k in keys)]
                    if narrowed:
                        mpool = narrowed
                material = PL.pick_compatible(
                    mpool, lambda m: PL.material_fits(m, garment), rng)

                cpool = pool("服装造型", "颜色")
                block_pattern = bool(cfg.get("plain_color")) or any(
                    k in str(material) for k in PATTERN_MATERIAL)
                if block_pattern:
                    narrowed = [c for c in cpool
                                if not any(k in str(c) for k in PATTERN_COLOR)]
                    if narrowed:
                        cpool = narrowed
                color = rng.choice(cpool) if cpool else ""
            outfit = "身着{}{}{}，".format(color, material, garment) if garment else ""

        # --------------------------------------------------------------
        # 6) 丝袜：与服装重复就不再叠加（情趣衣服自带袜、长裤等）
        # --------------------------------------------------------------
        lower_cloth = str(sexy_clothing or "") + str(garment)
        has_legwear = any(k in lower_cloth for k in
                          ("丝袜", "网袜", "袜", "裤", "连体", "裙裤"))
        if not cfg.get("stockings", True) or has_legwear:
            stocking = "无"
        block = STOCKING_BLOCK.get(bucket, ())
        if block and is_on(stocking):
            if any(k in str(stocking) for k in block):
                cand = [s for s in pool("丝袜类型", "丝袜种类")
                        if not any(k in str(s) for k in block)]
                stocking = rng.choice(cand) if cand else "无"
        if nsfw and (not is_on(stocking)) and not has_legwear:
            cand = [s for s in SEXY_STOCKINGS if s in pool("丝袜类型", "丝袜种类")]
            if cand:
                stocking = rng.choice(cand)
        if is_on(stocking):
            outfit += "搭配{}，".format(stocking)

        # --------------------------------------------------------------
        # 7) 场景 / 天气：按桶取场景，时间天气再做室内外过滤
        # --------------------------------------------------------------
        scene = pick_multi(cfg["scene"])
        if not scene:
            scene = pick("场景环境", rng.choice(["室内场景", "室外场景"]))

        atmosphere = coherent["氛围"]
        if nsfw:
            ero = pick("NSFW元素", "情色氛围")
            if ero:
                atmosphere = "{}，{}".format(atmosphere, ero).strip("，")

        def weather_ok(w):
            if not _is_outdoor_weather(w):
                return True
            return not _looks_indoor(scene)

        weather_pool = pool("场景环境", "时间天气")
        time_weather = PL.pick_compatible(weather_pool, weather_ok, rng)
        scene_phrase = self._scene_phrase(time_weather, scene, atmosphere)

        # --------------------------------------------------------------
        # 8) 镜头 / 构图 / 光线 / 色调
        # --------------------------------------------------------------
        lens = pick("拍摄参数", "镜头")
        composition = pick("构图光影", "构图")
        depth = pick("构图光影", "景深")
        light_type = coherent["光线"] or pick("构图光影", "光线")
        light_effect = pick("构图光影", "光影效果")
        tone = pick("色彩色调", "色调")
        color_style = pick("色彩色调", "色彩风格")
        expression = coherent["表情"]
        eyes = coherent["眼神"]

        # --------------------------------------------------------------
        # 9) 姿势：NSFW 走性感姿势池，否则走全身姿势池
        # --------------------------------------------------------------
        if is_on(action):
            pose = action
        elif nsfw:
            pose = pick("NSFW元素", "性感姿势") if include_pose else ""
        else:
            pose = pick("姿势动作", "全身姿势") if include_pose else ""

        nsfw_body = pick("NSFW元素", "身体强调") if nsfw else ""

        # --------------------------------------------------------------
        # 10) 拼装
        # --------------------------------------------------------------
        parts = []
        if style:
            parts.append(style)
        if type_val:
            parts.append(type_val)
        lens_txt = lens if "镜头" in str(lens) else "{}镜头".format(lens)
        parts.append("，使用{}拍摄。".format(lens_txt))
        parts.append(_framing_desc(framing))

        parts.append("一位{}{}{}，{}拥有{}，{}，{}，气质{}。"
                     .format(age_str, race_desc, _age_title(selected_age),
                             body_str, face1, face2, hair, coherent["气质"]))

        if nsfw_body:
            parts.append("{}。".format(nsfw_body))

        if is_on(contact_lens_choice):
            parts.append("佩戴{}美瞳，".format(contact_lens_choice))
        if outfit:
            parts.append(outfit)
        if headwear_on:
            verb = headwear_verb
            # 丝袜已经用过"搭配"了，头饰换个说法，避免一句话里两个"搭配"
            if verb == "搭配" and "搭配" in outfit:
                verb = "另有"
            parts.append("{}{}，".format(verb, headwear))
        if shoes_on:
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

        text = "".join(parts).strip("，").strip()
        # 关掉后缀参数时最后一句已经带句号了，再补一个会变成"。。"
        if not text.endswith(("。", "！", "!", ".", "；", ";")):
            text += "。"
        return text

    @staticmethod
    def _scene_phrase(time_weather, scene, atmosphere):
        w = str(time_weather or "")
        s = str(scene or "")
        verb = {"晴天": "窗外阳光正好", "阴天": "窗外天色阴沉", "雨天": "窗外正下着雨",
                "雪天": "窗外飘着雪", "雾天": "窗外起了薄雾", "彩虹天": "窗外天边挂着彩虹",
                "台风天": "窗外风雨交加", "雷雨天": "窗外雷雨交加",
                "沙尘天": "窗外沙尘漫天", "极光夜": "窗外夜空泛着极光"}.get(w)
        # 室内场景配天气词会变成"置身于暴雨水晶酒柜"，这里直接丢掉天气
        if w and _looks_indoor(s) and _is_outdoor_weather(w):
            return "置身于{}，氛围{}。".format(s, atmosphere)
        if verb and _looks_indoor(s):
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
