import random

class SunsetNSPromptSelector:
    CATEGORY = "prompt_generators"
    FUNCTION = "generate_nsfw_prompt"
    RETURN_TYPES = ("STRING", "STRING", "STRING")
    RETURN_NAMES = ("正面提示词", "负面提示词", "完整提示词")

    @classmethod
    def VALIDATE_INPUTS(cls, **kwargs):
        触发词 = kwargs.get("触发词", "——")

        if isinstance(触发词, str) and 触发词.startswith('[') and 触发词.endswith(']'):
            try:
                import ast
                parsed_triggers = ast.literal_eval(触发词)
                if isinstance(parsed_triggers, list):

                    for trigger in parsed_triggers:
                        if trigger not in cls.触发词选项:
                            return f"触发词 '{trigger}' 不在有效选项中"
                    return True
            except (ValueError, SyntaxError):
                pass

        if isinstance(触发词, str) and 触发词 not in cls.触发词选项:
            return f"触发词 '{触发词}' 不在有效选项中"

        if isinstance(触发词, list):
            for trigger in 触发词:
                if trigger not in cls.触发词选项:
                    return f"触发词 '{trigger}' 不在有效选项中"

        return True

    场景类型选项 = [
        "——",
        "豪华卧室，红色丝绒床单，镜面天花板",
        "蒸汽浴室，湿滑瓷砖，彩色霓虹光",
        "热带海滩，湿沙覆盖身体，波浪冲刷",
        "都市天台，夜景灯火，透明玻璃地板",
        "情趣套房，黑色皮质床具，心形镜子",
        "暗调夜店，闪烁镁光，舞池中央",
        "私人泳池，漂浮花瓣，夜间光晕",
        "更衣室，狭窄空间，镜面墙壁",
        "桑拿房，蒸汽弥漫，木质长椅",
        "按摩院，温暖烛光，香薰氛围",
        "成人用品店，情趣道具陈列",
        "野外，森林深处，月光洒落",
        "公共场所暴露，昏暗巷角，霓虹灯",
        "车内，皮质座椅，紧闭车窗",
        "办公室，凌乱桌面，夜间灯光",
        "教室，空旷课桌，粉笔痕迹",
        "废弃建筑，破旧墙壁，阴暗光线",
        "海洋场景，深蓝海水，珊瑚环绕",
        "沙漠场景，热浪升腾，金色沙丘",
        "冰雪场景，寒霜覆盖，雪花飘落",
        "科幻场景，金属舱室，闪烁仪表",
        "奇幻场景，迷雾森林，魔法光晕"
    ]

    动作姿态选项 = [
        "——",

        "缓慢脱下情趣内衣，赤裸挑逗，舔唇特写",
        "解开紧身皮裤，臀部慢摇，弯腰诱惑",
        "手指抚摸阴道，湿润眼神，身体颤抖",
        "赤裸身体扭动，湿身滴水，双手游走",
        "大胆揉捏乳房，呻吟低吟，眼神迷离",
        "裸露全身，挑逗姿势变换，臀部高翘",
        "跪姿挑逗，背部拱起，湿发垂落",
        "手指插入阴道，微张嘴唇，欲拒还迎",
        "赤裸倚靠墙壁，双手高举，身体拉伸",
        "低姿爬行，臀部摇摆，挑逗回头",
        "湿身淋浴，泡沫滑落，阴道特写",
        "情趣道具插入阴道，身体微颤，表情放纵",
        "裸露侧躺，腿部交叠，臀部曲线突出",
        "自慰抚摸阴茎，手指滑动，表情迷醉",
        "高潮瞬间，身体痉挛，喘息急促",
        "潮吹场景，水花四溅，阴道特写",

        "男女深吻，舌尖交缠，男抚摸女阴道",
        "男揉捏女乳房，女低吟，身体后仰",
        "女跨坐男腰部，阴道摩擦阴茎，眼神勾魂",
        "男从后拥抱女，舔舐女颈部，女轻喘",
        "男女站姿性爱，男阴茎插入女阴道，节奏强烈",
        "女口含男阴茎，湿润舔舐，男低吼",
        "男阴茎插入女阴道，女呻吟，肢体紧缠",
        "男女骑乘姿势，女阴道套弄阴茎，臀部起伏",
        "男轻拍女臀部，女挑逗呻吟，阴道湿润",
        "男女缠绵推拉，阴茎半进半退，节奏感强",
        "女跪姿，男从后阴茎插入阴道，女背部拱起",
        "男女侧躺性爱，男阴茎缓慢抽插，女轻喘",
        "男舔舐女阴道，女高潮痉挛，喘息急促",
        "女爱抚男阴茎，男紧握女腰，亲密低语",
        "男女捆绑互动，男束缚女手，女阴道挑逗",
        "男女多人性爱，阴茎与阴道交错，动态缠绵",
        "男支配女跪姿，女顺从舔舐阴茎，情趣鞭打",
        "男女浴室性爱，泡沫覆盖，阴茎插入阴道",
        "男女车内性爱，狭窄空间，阴道紧贴阴茎",
        "男抚摸女大腿，女张开双腿，阴道暴露挑逗",
        "男阴茎插入女肛门，女呻吟，节奏缓慢",
        "女舔舐男阴茎根部，男抚摸女头发，眼神对视",
        "男女69姿势，男舔阴道女含阴茎，同步快感"
    ]

    服饰选项 = [
        "——",
        "镂空情趣内衣，仅遮阴道与乳头",
        "透明黑色纱裙，完全暴露阴道曲线",
        "超短皮质热裤，搭配情趣项圈",
        "紧身乳胶装，闪亮贴合阴道轮廓",
        "仅蕾丝饰带缠绕，阴道无遮盖",
        "情趣渔网连体装，暴露乳房与阴道",
        "半裸湿透衬衫，紧贴阴道与乳房",
        "情趣吊带袜，搭配高跟鞋",
        "透明睡袍，阴道隐约可见",
        "无遮盖饰带，仅装饰性缠绕",
        "情趣制服，超短裙摆，敞开扣子",
        "皮质束缚装，金属铆钉装饰"
    ]

    情绪氛围选项 = [
        "——",
        "极致淫靡，眼神勾魂",
        "狂热欲念，身体颤抖",
        "露骨挑逗，喘息低吟",
        "放纵沉沦，迷乱表情",
        "禁忌诱惑，嘴角微翘",
        "赤裸渴望，湿润唇部",
        "危险情欲，肢体紧绷",
        "高潮迭起，表情痉挛",
        "羞耻顺从，低头轻喘",
        "支配快感，掌控姿态",
        "淫荡愉悦，肆意呻吟",
        "情欲迷醉，眼神迷离",
        "激情爆发，呼吸急促"
    ]

    运镜方式选项 = [
        "——",
        "快速推进至阴道特写，聚焦湿润细节",
        "360度旋转环绕，捕捉赤裸全身与阴茎",
        "低角度慢扫，从脚踝至阴道，节奏渐强",
        "脉动式快切，突出阴茎插入高潮瞬间",
        "柔焦跟随，锁定阴道与阴茎动作细节",
        "动态放大后拉远，强调淫靡身体曲线",
        "主观晃动视角，模拟阴茎插入沉浸感",
        "缓慢推进，聚焦阴道抽插节奏",
        "特写拉近，捕捉唇部与阴道细节",
        "晃动镜头，营造紧张挑逗氛围",
        "阴茎与阴道局部特写，突出互动细节",
        "镜头旋转，环绕性爱动作",
        "快速变焦，强调高潮瞬间"
    ]

    机位角度选项 = [
        "——",
        "胯下视角，聚焦阴道与阴茎",
        "床边视角，捕捉阴茎插入动作",
        "私密视角，模拟偷窥阴道互动",
        "地面视角，强调低姿阴道曲线",
        "天花板视角，俯视赤裸男女互动",
        "偷窥视角，隐藏式镜头效果",
        "低角度，突出臀部与阴道",
        "高角度，俯视挑逗性爱姿势",
        "过肩视角，聚焦男女亲密互动",
        "平视角度，强调表情与阴茎动作"
    ]

    光源类型选项 = [
        "——",
        "红色烛光，摇曳诱惑",
        "粉紫霓虹光，循环闪烁",
        "低调情趣灯光，晕染肌肤",
        "月光洒落，银色反光",
        "彩色欲念光，渐变流动",
        "暗调私密光，神秘勾勒",
        "暖色镁光，柔和晕染",
        "闪烁氛围光，节奏同步"
    ]

    光线类型选项 = [
        "——",
        "柔和情欲光，凸显阴道湿润肌肤",
        "强烈背光，勾勒阴茎与阴道轮廓",
        "边缘勾勒光，突出阴道曲线",
        "低对比淫靡光，营造禁忌感",
        "高对比戏剧光，强烈光影",
        "彩色光晕，环绕赤裸身体",
        "闪烁情欲光，与阴茎抽插节奏同步",
        "低角度光，强调阴道与阴茎曲线"
    ]

    镜头类型选项 = [
        "——",
        "单人阴道特写，聚焦裸露细节",
        "双人亲密接触，阴茎与阴道交缠特写",
        "动态局部特写，强调阴道湿润肌肤",
        "赤裸全身镜头，缓慢旋转",
        "快速场景切换，挑逗氛围定场",
        "多人镜头，阴茎与阴道交错捕捉"
    ]

    焦距选项 = [
        "——",
        "广角，展现场景与身体全貌",
        "中焦距，聚焦阴茎与阴道动作细节",
        "长焦，突出阴道与阴茎特写",
        "超广角，夸张阴道曲线与空间感",
        "鱼眼镜头，梦幻扭曲效果"
    ]

    色调选项 = [
        "——",
        "炽热红色调，情欲主导",
        "冷艳紫色调，淫靡氛围",
        "高饱和色欲调，鲜艳对比",
        "暗调禁忌感，深色渲染",
        "粉红淫靡调，柔和渐变",
        "深红挑逗调，浓烈感官",
        "金色调，奢华情欲感"
    ]

    视觉风格选项 = [
        "——",
        "情色电影风，高光泽淫靡感",
        "赛博情欲，霓虹高科技",
        "复古禁忌风，柔和颗粒感",
        "时尚挑逗风，杂志质感",
        "超现实淫靡，梦幻扭曲",
        "艺术情欲风，抽象光影",
        "日本AV风，细腻感官呈现"
    ]

    特效镜头选项 = [
        "——",
        "慢动作挑逗，放大阴道与阴茎细节",
        "光晕绽放，环绕裸露肌肤",
        "快速模糊转场，节奏高潮",
        "色欲渐变，色调动态过渡",
        "情趣耀斑，点缀淫靡画面",
        "水滴效果，模拟阴道湿润感",
        "烟雾弥漫，增添神秘氛围"
    ]

    镜头滤镜选项 = [
        "——",
        "柔光滤镜，肌肤光滑细腻",
        "高对比滤镜，强化光影",
        "暖色滤镜，增强情欲氛围",
        "冷色滤镜，营造禁忌感",
        "颗粒滤镜，复古情色质感",
        "模糊边缘滤镜，突出阴道与阴茎"
    ]

    随机选择选项 = ["关闭", "场景随机", "动作随机", "全部随机"]
    预设选项 = ["——", "经典情色", "野外激情", "浴室诱惑", "办公室秘密", "车内激情"]
    质量等级选项 = ["标准", "高质量", "超高质量", "大师级"]

    触发词选项 = [
        "——",
        "单女性 (1girl, solo)",
        "男女配对 (1boy, 1girl)",
        "双女性 (2girls)",
        "多女性 (multiple girls)",
        "多男性 (multiple boys)",
        "群体性爱 (group sex)",
        "三人行 (threesome)",
        "狂欢 (orgy)",
        "女同性恋 (lesbian)",
        "男同性恋 (yaoi)",
        "扶他 (futanari)",
        "怪物女孩 (monster girl)",
        "触手 (tentacles)",
        "机器人 (robot)",
        "仿生人 (android)",
        "半机械人 (cyborg)",
        "精灵 (elf)",
        "恶魔女孩 (demon girl)",
        "天使 (angel)",
        "吸血鬼 (vampire)",
        "女巫 (witch)",
        "女仆 (maid)",
        "护士 (nurse)",
        "教师 (teacher)",
        "学生 (student)",
        "办公室女士 (office lady)",
        "秘书 (secretary)",
        "警察 (police)",
        "军人 (military)",
        "偶像 (idol)",
        "魔法少女 (magical girl)",
        "公主 (princess)",
        "女王 (queen)",
        "女神 (goddess)",
        "魅魔 (succubus)",
        "猫女 (catgirl)",
        "兔女郎 (bunny girl)",
        "狐女 (fox girl)",
        "狼女 (wolf girl)",
        "龙女 (dragon girl)",
        "史莱姆女孩 (slime girl)",
        "幽灵 (ghost)",
        "僵尸女孩 (zombie girl)",
        "外星女孩 (alien girl)",
        "太空服 (space suit)",
        "比基尼 (bikini)",
        "内衣 (lingerie)",
        "裸体 (naked)",
        "裸体 (nude)",
        "上身裸体 (topless)",
        "下身裸体 (bottomless)",
        "透明 (see-through)",
        "透明 (transparent)",
        "湿衣服 (wet clothes)",
        "破损衣服 (torn clothes)",
        "无内裤 (no panties)",
        "无胸罩 (no bra)",
        "微型比基尼 (micro bikini)",
        "绳结比基尼 (string bikini)",
        "丁字裤 (thong)",
        "G弦裤 (g-string)",
        "渔网装 (fishnet)",
        "乳胶装 (latex)",
        "皮革装 (leather)",
        "束缚 (bondage)",
        "BDSM (BDSM)",
        "项圈 (collar)",
        "牵引绳 (leash)",
        "手铐 (handcuffs)",
        "绳子 (rope)",
        "口塞 (gag)",
        "眼罩 (blindfold)",
        "鞭子 (whip)",
        "假阳具 (dildo)",
        "震动器 (vibrator)",
        "性玩具 (sex toy)",
        "肛塞 (anal plug)",
        "乳夹 (nipple clamps)",
        "穿孔 (piercing)",
        "纹身 (tattoo)",
        "潮吹脸 (ahegao)",
        "高潮 (orgasm)",
        "顶点 (climax)",
        "精液 (cum)",
        "内射 (creampie)",
        "颜射 (bukkake)",
        "面部射精 (facial)",
        "吞咽 (swallow)",
        "深喉 (deepthroat)",
        "口交 (blowjob)",
        "手交 (handjob)",
        "足交 (footjob)",
        "乳交 (titjob)",
        "腿交 (thighjob)",
        "摩擦 (grinding)",
        "女上位 (cowgirl)",
        "反向女上位 (reverse cowgirl)",
        "传教士式 (missionary)",
        "后入式 (doggy style)",
        "站立式 (standing sex)",
        "69式 (69)",
        "肛交 (anal)",
        "双重插入 (double penetration)",
        "群交 (gangbang)",
        "公共性爱 (public sex)",
        "户外性爱 (outdoor sex)",
        "海滩性爱 (beach sex)",
        "淋浴性爱 (shower sex)",
        "浴缸性爱 (bath sex)",
        "车内性爱 (car sex)",
        "办公室性爱 (office sex)",
        "学校性爱 (school sex)",
        "医院性爱 (hospital sex)",
        "火车性爱 (train sex)",
        "飞机性爱 (airplane sex)",
        "酒店性爱 (hotel sex)",
        "情人酒店 (love hotel)",
        "温泉 (onsen)",
        "温泉 (hot spring)",
        "按摩 (massage)",
        "油压按摩 (oil massage)",
        "情色按摩 (erotic massage)",
        "脱衣舞 (strip tease)",
        "钢管舞 (pole dance)",
        "膝上舞 (lap dance)",
        "自慰 (masturbation)",
        "手指插入 (fingering)",
        "舔阴 (pussy licking)",
        "舔阴 (cunnilingus)",
        "舔肛 (rimming)",
        "接吻 (kissing)",
        "法式接吻 (french kiss)",
        "颈部接吻 (neck kiss)",
        "胸部接吻 (breast kiss)",
        "身体舔舐 (body licking)",
        "出汗 (sweating)",
        "喘息 (panting)",
        "呻吟 (moaning)",
        "尖叫 (screaming)",
        "脸红 (blushing)",
        "尴尬 (embarrassed)",
        "害羞 (shy)",
        "诱惑的 (seductive)",
        "充满欲望的 (lustful)",
        "兴奋的 (horny)",
        "被唤起的 (aroused)",
        "湿润 (wet)",
        "滴水 (dripping)",
        "喷射 (squirting)",
        "张开 (gaping)",
        "张开双腿 (spread legs)",
        "张开嘴巴 (open mouth)",
        "伸出舌头 (tongue out)",
        "唾液 (saliva)",
        "流口水 (drool)",
        "眼泪 (tears)",
        "汗水 (sweat)",
        "蒸汽 (steam)",
        "心形眼睛 (heart eyes)",
        "X光透视 (x-ray)",
        "内部视图 (internal view)",
        "横截面 (cross section)",
        "怀孕 (pregnant)",
        "腹部隆起 (belly bulge)",
        "充气 (inflation)",
        "扩张 (expansion)",
        "变身 (transformation)",
        "性别转换 (gender bender)",
        "扶他对女性 (futa on female)",
        "扶他对男性 (futa on male)",
        "扶他对扶他 (futa on futa)",
        "怪物对女孩 (monster on girl)",
        "触手性爱 (tentacle sex)",
        "外星人性爱 (alien sex)",
        "机器人性爱 (robot sex)",
        "机器性爱 (machine sex)",
        "催眠 (hypnosis)",
        "精神控制 (mind control)",
        "春药 (aphrodisiac)",
        "药物 (drug)",
        "醉酒 (drunk)",
        "睡眠性爱 (sleep sex)",
        "强奸 (rape)",
        "强迫 (forced)",
        "非自愿 (non-consensual)",
        "勒索 (blackmail)",
        "牛头人 (NTR)",
        "出轨 (cheating)",
        "婚外情 (affair)",
        "戴绿帽 (cuckold)",
        "偷窥者 (voyeur)",
        "暴露狂 (exhibitionist)",
        "暴露者 (flasher)",
        "裸奔 (streaking)",
        "裸体游泳 (skinny dipping)",
        "天体海滩 (nude beach)",
        "可选择服装 (clothing optional)",
        "服装故障 (wardrobe malfunction)",
        "内裤走光 (panty shot)",
        "裙底风光 (upskirt)",
        "胸部走光 (downblouse)",
        "乳沟 (cleavage)",
        "侧乳 (sideboob)",
        "下乳 (underboob)",
        "骆驼趾 (cameltoe)",
        "乳头滑出 (nipple slip)",
        "意外暴露 (accidental exposure)",
        "服装意外 (wardrobe accident)"
    ]

    触发词映射 = {
        "——": "",
        "单女性 (1girl, solo)": "1girl, solo",
        "男女配对 (1boy, 1girl)": "1boy, 1girl",
        "双女性 (2girls)": "2girls",
        "多女性 (multiple girls)": "multiple girls",
        "多男性 (multiple boys)": "multiple boys",
        "群体性爱 (group sex)": "group sex",
        "三人行 (threesome)": "threesome",
        "狂欢 (orgy)": "orgy",
        "女同性恋 (lesbian)": "lesbian",
        "男同性恋 (yaoi)": "yaoi",
        "扶他 (futanari)": "futanari",
        "怪物女孩 (monster girl)": "monster girl",
        "触手 (tentacles)": "tentacles",
        "机器人 (robot)": "robot",
        "仿生人 (android)": "android",
        "半机械人 (cyborg)": "cyborg",
        "精灵 (elf)": "elf",
        "恶魔女孩 (demon girl)": "demon girl",
        "天使 (angel)": "angel",
        "吸血鬼 (vampire)": "vampire",
        "女巫 (witch)": "witch",
        "女仆 (maid)": "maid",
        "护士 (nurse)": "nurse",
        "教师 (teacher)": "teacher",
        "学生 (student)": "student",
        "办公室女士 (office lady)": "office lady",
        "秘书 (secretary)": "secretary",
        "警察 (police)": "police",
        "军人 (military)": "military",
        "偶像 (idol)": "idol",
        "魔法少女 (magical girl)": "magical girl",
        "公主 (princess)": "princess",
        "女王 (queen)": "queen",
        "女神 (goddess)": "goddess",
        "魅魔 (succubus)": "succubus",
        "猫女 (catgirl)": "catgirl",
        "兔女郎 (bunny girl)": "bunny girl",
        "狐女 (fox girl)": "fox girl",
        "狼女 (wolf girl)": "wolf girl",
        "龙女 (dragon girl)": "dragon girl",
        "史莱姆女孩 (slime girl)": "slime girl",
        "幽灵 (ghost)": "ghost",
        "僵尸女孩 (zombie girl)": "zombie girl",
        "外星女孩 (alien girl)": "alien girl",
        "太空服 (space suit)": "space suit",
        "比基尼 (bikini)": "bikini",
        "内衣 (lingerie)": "lingerie",
        "裸体 (naked)": "naked",
        "裸体 (nude)": "nude",
        "上身裸体 (topless)": "topless",
        "下身裸体 (bottomless)": "bottomless",
        "透明 (see-through)": "see-through",
        "透明 (transparent)": "transparent",
        "湿衣服 (wet clothes)": "wet clothes",
        "破损衣服 (torn clothes)": "torn clothes",
        "无内裤 (no panties)": "no panties",
        "无胸罩 (no bra)": "no bra",
        "微型比基尼 (micro bikini)": "micro bikini",
        "绳结比基尼 (string bikini)": "string bikini",
        "丁字裤 (thong)": "thong",
        "G弦裤 (g-string)": "g-string",
        "渔网装 (fishnet)": "fishnet",
        "乳胶装 (latex)": "latex",
        "皮革装 (leather)": "leather",
        "束缚 (bondage)": "bondage",
        "BDSM (BDSM)": "BDSM",
        "项圈 (collar)": "collar",
        "牵引绳 (leash)": "leash",
        "手铐 (handcuffs)": "handcuffs",
        "绳子 (rope)": "rope",
        "口塞 (gag)": "gag",
        "眼罩 (blindfold)": "blindfold",
        "鞭子 (whip)": "whip",
        "假阳具 (dildo)": "dildo",
        "震动器 (vibrator)": "vibrator",
        "性玩具 (sex toy)": "sex toy",
        "肛塞 (anal plug)": "anal plug",
        "乳夹 (nipple clamps)": "nipple clamps",
        "穿孔 (piercing)": "piercing",
        "纹身 (tattoo)": "tattoo",
        "潮吹脸 (ahegao)": "ahegao",
        "高潮 (orgasm)": "orgasm",
        "顶点 (climax)": "climax",
        "精液 (cum)": "cum",
        "内射 (creampie)": "creampie",
        "颜射 (bukkake)": "bukkake",
        "面部射精 (facial)": "facial",
        "吞咽 (swallow)": "swallow",
        "深喉 (deepthroat)": "deepthroat",
        "口交 (blowjob)": "blowjob",
        "手交 (handjob)": "handjob",
        "足交 (footjob)": "footjob",
        "乳交 (titjob)": "titjob",
        "腿交 (thighjob)": "thighjob",
        "摩擦 (grinding)": "grinding",
        "女上位 (cowgirl)": "cowgirl",
        "反向女上位 (reverse cowgirl)": "reverse cowgirl",
        "传教士式 (missionary)": "missionary",
        "后入式 (doggy style)": "doggy style",
        "站立式 (standing sex)": "standing sex",
        "69式 (69)": "69",
        "肛交 (anal)": "anal",
        "双重插入 (double penetration)": "double penetration",
        "群交 (gangbang)": "gangbang",
        "公共性爱 (public sex)": "public sex",
        "户外性爱 (outdoor sex)": "outdoor sex",
        "海滩性爱 (beach sex)": "beach sex",
        "淋浴性爱 (shower sex)": "shower sex",
        "浴缸性爱 (bath sex)": "bath sex",
        "车内性爱 (car sex)": "car sex",
        "办公室性爱 (office sex)": "office sex",
        "学校性爱 (school sex)": "school sex",
        "医院性爱 (hospital sex)": "hospital sex",
        "火车性爱 (train sex)": "train sex",
        "飞机性爱 (airplane sex)": "airplane sex",
        "酒店性爱 (hotel sex)": "hotel sex",
        "情人酒店 (love hotel)": "love hotel",
        "温泉 (onsen)": "onsen",
        "温泉 (hot spring)": "hot spring",
        "按摩 (massage)": "massage",
        "油压按摩 (oil massage)": "oil massage",
        "情色按摩 (erotic massage)": "erotic massage",
        "脱衣舞 (strip tease)": "strip tease",
        "钢管舞 (pole dance)": "pole dance",
        "膝上舞 (lap dance)": "lap dance",
        "自慰 (masturbation)": "masturbation",
        "手指插入 (fingering)": "fingering",
        "舔阴 (pussy licking)": "pussy licking",
        "舔阴 (cunnilingus)": "cunnilingus",
        "舔肛 (rimming)": "rimming",
        "接吻 (kissing)": "kissing",
        "法式接吻 (french kiss)": "french kiss",
        "颈部接吻 (neck kiss)": "neck kiss",
        "胸部接吻 (breast kiss)": "breast kiss",
        "身体舔舐 (body licking)": "body licking",
        "出汗 (sweating)": "sweating",
        "喘息 (panting)": "panting",
        "呻吟 (moaning)": "moaning",
        "尖叫 (screaming)": "screaming",
        "脸红 (blushing)": "blushing",
        "尴尬 (embarrassed)": "embarrassed",
        "害羞 (shy)": "shy",
        "诱惑的 (seductive)": "seductive",
        "充满欲望的 (lustful)": "lustful",
        "兴奋的 (horny)": "horny",
        "被唤起的 (aroused)": "aroused",
        "湿润 (wet)": "wet",
        "滴水 (dripping)": "dripping",
        "喷射 (squirting)": "squirting",
        "张开 (gaping)": "gaping",
        "张开双腿 (spread legs)": "spread legs",
        "张开嘴巴 (open mouth)": "open mouth",
        "伸出舌头 (tongue out)": "tongue out",
        "唾液 (saliva)": "saliva",
        "流口水 (drool)": "drool",
        "眼泪 (tears)": "tears",
        "汗水 (sweat)": "sweat",
        "蒸汽 (steam)": "steam",
        "心形眼睛 (heart eyes)": "heart eyes",
        "X光透视 (x-ray)": "x-ray",
        "内部视图 (internal view)": "internal view",
        "横截面 (cross section)": "cross section",
        "怀孕 (pregnant)": "pregnant",
        "腹部隆起 (belly bulge)": "belly bulge",
        "充气 (inflation)": "inflation",
        "扩张 (expansion)": "expansion",
        "变身 (transformation)": "transformation",
        "性别转换 (gender bender)": "gender bender",
        "扶他对女性 (futa on female)": "futa on female",
        "扶他对男性 (futa on male)": "futa on male",
        "扶他对扶他 (futa on futa)": "futa on futa",
        "怪物对女孩 (monster on girl)": "monster on girl",
        "触手性爱 (tentacle sex)": "tentacle sex",
        "外星人性爱 (alien sex)": "alien sex",
        "机器人性爱 (robot sex)": "robot sex",
        "机器性爱 (machine sex)": "machine sex",
        "催眠 (hypnosis)": "hypnosis",
        "精神控制 (mind control)": "mind control",
        "春药 (aphrodisiac)": "aphrodisiac",
        "药物 (drug)": "drug",
        "醉酒 (drunk)": "drunk",
        "睡眠性爱 (sleep sex)": "sleep sex",
        "强奸 (rape)": "rape",
        "强迫 (forced)": "forced",
        "非自愿 (non-consensual)": "non-consensual",
        "勒索 (blackmail)": "blackmail",
        "牛头人 (NTR)": "NTR",
        "出轨 (cheating)": "cheating",
        "婚外情 (affair)": "affair",
        "戴绿帽 (cuckold)": "cuckold",
        "偷窥者 (voyeur)": "voyeur",
        "暴露狂 (exhibitionist)": "exhibitionist",
        "暴露者 (flasher)": "flasher",
        "裸奔 (streaking)": "streaking",
        "裸体游泳 (skinny dipping)": "skinny dipping",
        "天体海滩 (nude beach)": "nude beach",
        "可选择服装 (clothing optional)": "clothing optional",
        "服装故障 (wardrobe malfunction)": "wardrobe malfunction",
        "内裤走光 (panty shot)": "panty shot",
        "裙底风光 (upskirt)": "upskirt",
        "胸部走光 (downblouse)": "downblouse",
        "乳沟 (cleavage)": "cleavage",
        "侧乳 (sideboob)": "sideboob",
        "下乳 (underboob)": "underboob",
        "骆驼趾 (cameltoe)": "cameltoe",
        "乳头滑出 (nipple slip)": "nipple slip",
        "意外暴露 (accidental exposure)": "accidental exposure",
        "服装意外 (wardrobe accident)": "wardrobe accident"
    }

    负面提示词预设选项 = [
        "标准负面提示词",
        "WAN视频负面提示词",
        "文生图负面提示词",
        "高质量负面提示词",
        "自定义负面提示词"
    ]

    @classmethod
    def INPUT_TYPES(s):

        def ensure_default_in_options(options):
            if "——" not in options:
                return ["——"] + list(options)
            return options

        safe_光线类型选项 = ensure_default_in_options(s.光线类型选项)
        safe_镜头类型选项 = ensure_default_in_options(s.镜头类型选项)

        for 镜头值 in s.镜头类型选项:
            if 镜头值 in s.光线类型选项 and 镜头值 != "——":
                print(f"警告: 发现镜头类型值 '{镜头值}' 在光线类型选项中，这可能导致参数混乱")

        return {
            "required": {
                "触发词": (s.触发词选项, {"default": ["——"], "multi_select": True}),
                "场景类型": (s.场景类型选项, {"default": "——"}),
                "动作姿态": (s.动作姿态选项, {"default": "——"}),
                "服饰": (s.服饰选项, {"default": "——"}),
                "情绪氛围": (s.情绪氛围选项, {"default": "——"}),
                "运镜方式": (s.运镜方式选项, {"default": "——"}),
                "机位角度": (s.机位角度选项, {"default": "——"}),
                "光源类型": (s.光源类型选项, {"default": "——"}),
                "光线类型": (safe_光线类型选项, {"default": "——"}),
                "镜头类型": (safe_镜头类型选项, {"default": "——"}),
                "焦距": (s.焦距选项, {"default": "——"}),
                "色调": (s.色调选项, {"default": "——"}),
                "视觉风格": (s.视觉风格选项, {"default": "——"}),
                "特效镜头": (s.特效镜头选项, {"default": "——"}),
                "镜头滤镜": (s.镜头滤镜选项, {"default": "——"}),
            },
            "optional": {
                "随机选择": (s.随机选择选项, {"default": "关闭"}),
                "预设配置": (s.预设选项, {"default": "——"}),
                "质量等级": (s.质量等级选项, {"default": "高质量"}),
                "权重_场景": ("FLOAT", {"default": 1.0, "min": 0.0, "max": 2.0, "step": 0.1}),
                "权重_动作": ("FLOAT", {"default": 1.5, "min": 0.0, "max": 2.0, "step": 0.1}),
                "权重_服饰": ("FLOAT", {"default": 0.8, "min": 0.0, "max": 2.0, "step": 0.1}),
                "权重_情绪": ("FLOAT", {"default": 1.2, "min": 0.0, "max": 2.0, "step": 0.1}),
                "自定义前缀": ("STRING", {"default": "", "multiline": False}),
                "自定义后缀": ("STRING", {"default": "", "multiline": False}),
                "负面提示词类型": (s.负面提示词预设选项, {"default": "标准负面提示词"}),
                "自定义负面提示词": ("STRING", {"default": "", "multiline": True}),
                "前置提示词": ("STRING", {"default": "", "multiline": True}),
            }
        }

    def generate_nsfw_prompt(self, 触发词, 场景类型, 动作姿态, 服饰, 情绪氛围, 运镜方式, 机位角度,
                            光源类型, 光线类型, 镜头类型, 焦距, 色调, 视觉风格, 特效镜头, 镜头滤镜,
                            随机选择="关闭", 预设配置="——", 质量等级="高质量",
                            权重_场景=1.0, 权重_动作=1.5, 权重_服饰=0.8, 权重_情绪=1.2,
                            自定义前缀="", 自定义后缀="", 负面提示词类型="标准负面提示词", 自定义负面提示词="", 前置提示词=""):

        def clean_param(param):
            if param is None or param == "":
                return "——"
            return str(param).strip()

        def clean_trigger_param(param):
            if param is None:
                return ["——"]

            if isinstance(param, str):

                if param.startswith('[') and param.endswith(']'):
                    try:
                        import ast
                        parsed = ast.literal_eval(param)
                        if isinstance(parsed, list):
                            cleaned = [str(item).strip() for item in parsed if item is not None and str(item).strip() != ""]
                            return cleaned if cleaned else ["——"]
                    except (ValueError, SyntaxError):

                        pass

                cleaned = param.strip()
                return [cleaned] if cleaned != "" else ["——"]

            if isinstance(param, list):
                if len(param) == 0:
                    return ["——"]
                cleaned = [str(item).strip() for item in param if item is not None and str(item).strip() != ""]
                return cleaned if cleaned else ["——"]

            cleaned = str(param).strip()
            return [cleaned] if cleaned != "" else ["——"]

        触发词 = clean_trigger_param(触发词)

        场景类型 = clean_param(场景类型)
        动作姿态 = clean_param(动作姿态)
        服饰 = clean_param(服饰)
        情绪氛围 = clean_param(情绪氛围)
        运镜方式 = clean_param(运镜方式)
        机位角度 = clean_param(机位角度)
        光源类型 = clean_param(光源类型)
        光线类型 = clean_param(光线类型)
        镜头类型 = clean_param(镜头类型)
        焦距 = clean_param(焦距)
        色调 = clean_param(色调)
        视觉风格 = clean_param(视觉风格)
        特效镜头 = clean_param(特效镜头)
        镜头滤镜 = clean_param(镜头滤镜)

        def validate_param(param_value, valid_options, param_name):
            if param_value not in valid_options:
                print(f"警告: {param_name} 参数值 '{param_value}' 不在有效选项中，重置为默认值")
                return "——"
            return param_value

        def validate_trigger_param(param_list, valid_options, param_name):
            if not isinstance(param_list, list):
                param_list = [param_list]

            validated_list = []
            for item in param_list:
                if item in valid_options:
                    validated_list.append(item)
                else:
                    print(f"警告: {param_name} 参数值 '{item}' 不在有效选项中，已跳过")

            if not validated_list or (len(validated_list) == 1 and validated_list[0] == "——"):
                return ["——"]

            return validated_list

        触发词 = validate_trigger_param(触发词, self.触发词选项, "触发词")

        场景类型 = validate_param(场景类型, self.场景类型选项, "场景类型")
        动作姿态 = validate_param(动作姿态, self.动作姿态选项, "动作姿态")
        服饰 = validate_param(服饰, self.服饰选项, "服饰")
        情绪氛围 = validate_param(情绪氛围, self.情绪氛围选项, "情绪氛围")
        运镜方式 = validate_param(运镜方式, self.运镜方式选项, "运镜方式")
        机位角度 = validate_param(机位角度, self.机位角度选项, "机位角度")
        光源类型 = validate_param(光源类型, self.光源类型选项, "光源类型")
        光线类型 = validate_param(光线类型, self.光线类型选项, "光线类型")
        镜头类型 = validate_param(镜头类型, self.镜头类型选项, "镜头类型")
        焦距 = validate_param(焦距, self.焦距选项, "焦距")
        色调 = validate_param(色调, self.色调选项, "色调")
        视觉风格 = validate_param(视觉风格, self.视觉风格选项, "视觉风格")
        特效镜头 = validate_param(特效镜头, self.特效镜头选项, "特效镜头")
        镜头滤镜 = validate_param(镜头滤镜, self.镜头滤镜选项, "镜头滤镜")

        if 预设配置 != "——":
            预设字典 = self._get_preset_config(预设配置)
            if 预设字典:
                场景类型 = 预设字典.get("场景类型", 场景类型)
                动作姿态 = 预设字典.get("动作姿态", 动作姿态)
                服饰 = 预设字典.get("服饰", 服饰)
                情绪氛围 = 预设字典.get("情绪氛围", 情绪氛围)

        if 随机选择 == "场景随机":
            场景类型 = random.choice([x for x in self.场景类型选项 if x != "——"])
        elif 随机选择 == "动作随机":
            动作姿态 = random.choice([x for x in self.动作姿态选项 if x != "——"])
        elif 随机选择 == "全部随机":
            场景类型 = random.choice([x for x in self.场景类型选项 if x != "——"])
            动作姿态 = random.choice([x for x in self.动作姿态选项 if x != "——"])
            服饰 = random.choice([x for x in self.服饰选项 if x != "——"])
            情绪氛围 = random.choice([x for x in self.情绪氛围选项 if x != "——"])
            运镜方式 = random.choice([x for x in self.运镜方式选项 if x != "——"])
            机位角度 = random.choice([x for x in self.机位角度选项 if x != "——"])
            光源类型 = random.choice([x for x in self.光源类型选项 if x != "——"])
            光线类型 = random.choice([x for x in self.光线类型选项 if x != "——"])
            镜头类型 = random.choice([x for x in self.镜头类型选项 if x != "——"])
            焦距 = random.choice([x for x in self.焦距选项 if x != "——"])
            色调 = random.choice([x for x in self.色调选项 if x != "——"])
            视觉风格 = random.choice([x for x in self.视觉风格选项 if x != "——"])
            特效镜头 = random.choice([x for x in self.特效镜头选项 if x != "——"])
            镜头滤镜 = random.choice([x for x in self.镜头滤镜选项 if x != "——"])

            if len(触发词) == 0 or (len(触发词) == 1 and 触发词[0] == "——"):
                触发词 = [random.choice([x for x in self.触发词选项 if x != "——"])]

        scene_mapping = self._get_scene_mapping()
        action_mapping = self._get_action_mapping()
        clothing_mapping = self._get_clothing_mapping()
        mood_mapping = self._get_mood_mapping()
        camera_movement_mapping = self._get_camera_movement_mapping()
        camera_angle_mapping = self._get_camera_angle_mapping()
        light_source_mapping = self._get_light_source_mapping()
        light_type_mapping = self._get_light_type_mapping()
        lens_type_mapping = self._get_lens_type_mapping()
        focal_length_mapping = self._get_focal_length_mapping()
        color_tone_mapping = self._get_color_tone_mapping()
        visual_style_mapping = self._get_visual_style_mapping()
        effect_mapping = self._get_effect_mapping()
        filter_mapping = self._get_filter_mapping()

        weighted_elements = []

        if 前置提示词 and str(前置提示词).strip():
            weighted_elements.append(str(前置提示词).strip().rstrip(",，。、；;"))

        for trigger in 触发词:
            if trigger != "——":
                trigger_english = self.触发词映射.get(trigger, trigger)
                if trigger_english:
                    weighted_elements.append(trigger_english)

        if 自定义前缀.strip():
            weighted_elements.append(自定义前缀.strip())

        quality_tags = self._get_quality_tags(质量等级)
        if quality_tags:
            weighted_elements.extend(quality_tags)

        if 场景类型 and 场景类型 != "——":
            scene_text = scene_mapping.get(场景类型, "")
            if scene_text:
                if 权重_场景 != 1.0:
                    scene_text = f"({scene_text}:{权重_场景:.1f})"
                weighted_elements.append(scene_text)

        if 动作姿态 and 动作姿态 != "——":
            action_text = action_mapping.get(动作姿态, "")
            if action_text:
                if 权重_动作 != 1.0:
                    action_text = f"({action_text}:{权重_动作:.1f})"
                weighted_elements.append(action_text)

        if 服饰 and 服饰 != "——":
            clothing_text = clothing_mapping.get(服饰, "")
            if clothing_text:
                if 权重_服饰 != 1.0:
                    clothing_text = f"({clothing_text}:{权重_服饰:.1f})"
                weighted_elements.append(clothing_text)

        if 情绪氛围 and 情绪氛围 != "——":
            mood_text = mood_mapping.get(情绪氛围, "")
            if mood_text:
                if 权重_情绪 != 1.0:
                    mood_text = f"({mood_text}:{权重_情绪:.1f})"
                weighted_elements.append(mood_text)

        technical_elements = []

        if 运镜方式 and 运镜方式 != "——":
            mapped_value = camera_movement_mapping.get(运镜方式, "")
            if mapped_value:
                technical_elements.append(mapped_value)

        if 机位角度 and 机位角度 != "——":
            mapped_value = camera_angle_mapping.get(机位角度, "")
            if mapped_value:
                technical_elements.append(mapped_value)

        if 光源类型 and 光源类型 != "——":
            mapped_value = light_source_mapping.get(光源类型, "")
            if mapped_value:
                technical_elements.append(mapped_value)

        if 光线类型 and 光线类型 != "——":
            mapped_value = light_type_mapping.get(光线类型, "")
            if mapped_value:
                technical_elements.append(mapped_value)

        if 镜头类型 and 镜头类型 != "——":
            mapped_value = lens_type_mapping.get(镜头类型, "")
            if mapped_value:
                technical_elements.append(mapped_value)

        if 焦距 and 焦距 != "——":
            mapped_value = focal_length_mapping.get(焦距, "")
            if mapped_value:
                technical_elements.append(mapped_value)

        if 色调 and 色调 != "——":
            mapped_value = color_tone_mapping.get(色调, "")
            if mapped_value:
                technical_elements.append(mapped_value)

        if 视觉风格 and 视觉风格 != "——":
            mapped_value = visual_style_mapping.get(视觉风格, "")
            if mapped_value:
                technical_elements.append(mapped_value)

        if 特效镜头 and 特效镜头 != "——":
            mapped_value = effect_mapping.get(特效镜头, "")
            if mapped_value:
                technical_elements.append(mapped_value)

        if 镜头滤镜 and 镜头滤镜 != "——":
            mapped_value = filter_mapping.get(镜头滤镜, "")
            if mapped_value:
                technical_elements.append(mapped_value)

        weighted_elements.extend(technical_elements)

        if 自定义后缀.strip():
            weighted_elements.append(自定义后缀.strip())

        positive_prompt = ", ".join(weighted_elements) if weighted_elements else "extremely explicit NSFW short video"

        positive_prompt = f"{positive_prompt}, highly explicit, intensely provocative, Japanese AV style,"

        negative_prompt = self._generate_negative_prompt_by_type(负面提示词类型, 自定义负面提示词)

        full_prompt = f"POSITIVE: {positive_prompt}\n\nNEGATIVE: {negative_prompt}\n\nSETTINGS: Quality={质量等级}, Weights(Scene:{权重_场景}, Action:{权重_动作}, Clothing:{权重_服饰}, Mood:{权重_情绪})"

        return {
            "ui": {"positive": [positive_prompt], "negative": [negative_prompt], "full": [full_prompt]},
            "result": (positive_prompt, negative_prompt, full_prompt),
        }

    def _get_preset_config(self, preset_name):
        presets = {
            "经典情色": {
                "场景类型": "豪华卧室，红色丝绒床单，镜面天花板",
                "动作姿态": "男女深吻，舌尖交缠，男抚摸女阴道",
                "服饰": "镂空情趣内衣，仅遮阴道与乳头",
                "情绪氛围": "极致淫靡，眼神勾魂"
            },
            "野外激情": {
                "场景类型": "野外，森林深处，月光洒落",
                "动作姿态": "男女站姿性爱，男阴茎插入女阴道，节奏强烈",
                "服饰": "——",
                "情绪氛围": "激情爆发，呼吸急促"
            },
            "浴室诱惑": {
                "场景类型": "蒸汽浴室，湿滑瓷砖，彩色霓虹光",
                "动作姿态": "湿身淋浴，泡沫滑落，阴道特写",
                "服饰": "半裸湿透衬衫，紧贴阴道与乳房",
                "情绪氛围": "赤裸渴望，湿润唇部"
            },
            "办公室秘密": {
                "场景类型": "办公室，凌乱桌面，夜间灯光",
                "动作姿态": "男女缠绵推拉，阴茎半进半退，节奏感强",
                "服饰": "情趣制服，超短裙摆，敞开扣子",
                "情绪氛围": "禁忌诱惑，嘴角微翘"
            },
            "车内激情": {
                "场景类型": "车内，皮质座椅，紧闭车窗",
                "动作姿态": "男女车内性爱，狭窄空间，阴道紧贴阴茎",
                "服饰": "超短皮质热裤，搭配情趣项圈",
                "情绪氛围": "危险情欲，肢体紧绷"
            }
        }
        return presets.get(preset_name, {})

    def _get_quality_tags(self, quality_level):
        quality_mapping = {
            "标准": ["detailed", "high quality"],
            "高质量": ["masterpiece", "best quality", "ultra-detailed", "high resolution"],
            "超高质量": ["masterpiece", "best quality", "ultra-detailed", "extremely detailed", "8k", "photorealistic"],
            "大师级": ["masterpiece", "best quality", "ultra-detailed", "extremely detailed", "8k", "4k", "photorealistic", "professional photography", "studio lighting", "perfect anatomy"]
        }
        return quality_mapping.get(quality_level, [])

    def _generate_negative_prompt_by_type(self, negative_type, custom_negative=""):
        if negative_type == "标准负面提示词":
            return "low quality, worst quality, normal quality, lowres, pixelated, blurry, bad anatomy, bad hands, bad feet, missing fingers, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, ugly, bad proportions, extra limbs, malformed limbs, fused fingers, too many fingers, long neck, cross-eyed, mutated, bad body, unnatural body, long body, duplicate, morbid, mutilated, out of frame, disfigured, gross proportions, missing arms, missing legs, extra arms, extra legs, cloned face, username, watermark, signature, text"

        elif negative_type == "WAN视频负面提示词":
            return "色调艳丽，过曝，静态，细节模糊不清，字幕，风格，作品，画作，画面，静止，整体发灰，最差质量，低质量，JPEG压缩残留，丑陋的，残缺的，多余的手指，画得不好的手部，画得不好的脸部，畸形的，毁容的，形态畸形的肢体，手指融合，静止不动的画面，杂乱的背景，三条腿，背景人很多，倒着走"

        elif negative_type == "文生图负面提示词":
            return "(low quality:1.5), (worst quality:1.5), (normal quality:1.5), (lowres:1.5), (pixelated:1.5), (blurry:1.5), (bad anatomy:1.5), (bad hands:1.5), (bad feet:1.5), (missing fingers:1.5), (extra fingers:1.5), (mutated hands:1.5), (poorly drawn hands:1.5), (poorly drawn face:1.5), (mutation:1.5), (deformed:1.5), (ugly:1.5), (bad proportions:1.5), (extra limbs:1.5), (malformed limbs:1.5), (fused fingers:1.5), (too many fingers:1.5), (long neck:1.5), (cross-eyed:1.5), (mutated:1.5), (bad body:1.5), (unnatural body:1.5), (long body:1.5), (duplicate:1.5), (morbid:1.5), (mutilated:1.5), (out of frame:1.5), (disfigured:1.5), (gross proportions:1.5), (missing arms:1.5), (missing legs:1.5), (extra arms:1.5), (extra legs:1.5), (cloned face:1.5), (username:1.5), (watermark:1.5), (signature:1.5), (text:1.5)"

        elif negative_type == "高质量负面提示词":
            return "(worst quality:2.0), (low quality:2.0), (normal quality:1.8), (lowres:1.8), (bad anatomy:1.8), (bad hands:1.8), (text:1.8), (error:1.8), (missing fingers:1.8), (extra digit:1.8), (fewer digits:1.8), (cropped:1.8), (jpeg artifacts:1.8), (signature:1.8), (watermark:1.8), (username:1.8), (blurry:1.8), (artist name:1.8), (out of focus:1.8), (ugly:1.8), (duplicate:1.8), (morbid:1.8), (mutilated:1.8), (extra fingers:1.8), (mutated hands:1.8), (poorly drawn hands:1.8), (poorly drawn face:1.8), (mutation:1.8), (deformed:1.8), (bad proportions:1.8), (extra limbs:1.8), (cloned face:1.8), (disfigured:1.8), (gross proportions:1.8), (malformed limbs:1.8), (missing arms:1.8), (missing legs:1.8), (extra arms:1.8), (extra legs:1.8), (fused fingers:1.8), (too many fingers:1.8), (long neck:1.8), (cross-eyed:1.8)"

        elif negative_type == "自定义负面提示词":
            return custom_negative if custom_negative else "low quality, worst quality"

        else:
            return "low quality, worst quality, normal quality"

    def _get_scene_mapping(self):
        return {
            "豪华卧室，红色丝绒床单，镜面天花板": "luxurious bedroom, red velvet sheets, mirrored ceiling",
            "蒸汽浴室，湿滑瓷砖，彩色霓虹光": "steamy bathroom, wet tiles, colorful neon lights",
            "热带海滩，湿沙覆盖身体，波浪冲刷": "tropical beach, wet sand on body, waves crashing",
            "都市天台，夜景灯火，透明玻璃地板": "urban rooftop, city lights, transparent glass floor",
            "情趣套房，黑色皮质床具，心形镜子": "erotic suite, black leather bed, heart-shaped mirror",
            "暗调夜店，闪烁镁光，舞池中央": "dark nightclub, flashing strobes, center of dance floor",
            "私人泳池，漂浮花瓣，夜间光晕": "private pool, floating petals, nighttime glow",
            "更衣室，狭窄空间，镜面墙壁": "changing room, narrow space, mirrored walls",
            "桑拿房，蒸汽弥漫，木质长椅": "sauna, steamy air, wooden benches",
            "按摩院，温暖烛光，香薰氛围": "massage parlor, warm candlelight, aromatic ambiance",
            "成人用品店，情趣道具陈列": "adult store, erotic props displayed",
            "野外，森林深处，月光洒落": "wilderness, deep forest, moonlight glow",
            "公共场所暴露，昏暗巷角，霓虹灯": "public exposure, dim alley, neon lights",
            "车内，皮质座椅，紧闭车窗": "car interior, leather seats, closed windows",
            "办公室，凌乱桌面，夜间灯光": "office, messy desk, nighttime lighting",
            "教室，空旷课桌，粉笔痕迹": "classroom, empty desks, chalk marks",
            "废弃建筑，破旧墙壁，阴暗光线": "abandoned building, dilapidated walls, dim lighting",
            "海洋场景，深蓝海水，珊瑚环绕": "ocean scene, deep blue water, coral surroundings",
            "沙漠场景，热浪升腾，金色沙丘": "desert scene, heat waves, golden dunes",
            "冰雪场景，寒霜覆盖，雪花飘落": "icy scene, frost-covered, snowflakes falling",
            "科幻场景，金属舱室，闪烁仪表": "sci-fi scene, metallic cabin, flashing gauges",
            "奇幻场景，迷雾森林，魔法光晕": "fantasy scene, misty forest, magical glow"
        }

    def _get_action_mapping(self):
        return {
            "缓慢脱下情趣内衣，赤裸挑逗，舔唇特写": "slowly removing erotic lingerie, naked teasing, lip-licking close-up",
            "解开紧身皮裤，臀部慢摇，弯腰诱惑": "unfastening tight leather pants, slow hip sway, bending seduction",
            "手指抚摸阴道，湿润眼神，身体颤抖": "fingering vagina, wet gaze, trembling body",
            "赤裸身体扭动，湿身滴水，双手游走": "naked body writhing, wet dripping, hands roaming",
            "大胆揉捏乳房，呻吟低吟，眼神迷离": "boldly kneading breasts, moaning softly, dazed eyes",
            "裸露全身，挑逗姿势变换，臀部高翘": "fully exposed, teasing pose changes, raised hips",
            "跪姿挑逗，背部拱起，湿发垂落": "kneeling seduction, arched back, wet hair falling",
            "手指插入阴道，微张嘴唇，欲拒还迎": "inserting fingers into vagina, lips slightly parted, coy resistance",
            "赤裸倚靠墙壁，双手高举，身体拉伸": "naked leaning against wall, hands raised, body stretched",
            "低姿爬行，臀部摇摆，挑逗回头": "low crawling, hip swaying, teasing glance back",
            "湿身淋浴，泡沫滑落，阴道特写": "wet shower, foam sliding, vagina close-up",
            "情趣道具插入阴道，身体微颤，表情放纵": "erotic toy inserted in vagina, body trembling, indulgent expression",
            "裸露侧躺，腿部交叠，臀部曲线突出": "naked side-lying, legs crossed, pronounced hip curves",
            "自慰抚摸阴茎，手指滑动，表情迷醉": "masturbating penis, fingers sliding, entranced expression",
            "高潮瞬间，身体痉挛，喘息急促": "climax moment, body convulsing, rapid panting",
            "潮吹场景，水花四溅，阴道特写": "squirting scene, water splashing, vagina close-up",
            "男女深吻，舌尖交缠，男抚摸女阴道": "man and woman deep kissing, tongues entwined, man fingering woman's vagina",
            "男揉捏女乳房，女低吟，身体后仰": "man kneading woman's breasts, woman moaning, body arching back",
            "女跨坐男腰部，阴道摩擦阴茎，眼神勾魂": "woman straddling man's waist, vagina rubbing penis, seductive gaze",
            "男从后拥抱女，舔舐女颈部，女轻喘": "man embracing woman from behind, licking her neck, woman softly panting",
            "男女站姿性爱，男阴茎插入女阴道，节奏强烈": "man and woman standing sex, penis penetrating vagina, intense rhythm",
            "女口含男阴茎，湿润舔舐，男低吼": "woman orally taking man's penis, wet licking, man growling",
            "男阴茎插入女阴道，女呻吟，肢体紧缠": "man penetrating woman's vagina, woman moaning, limbs tightly entwined",
            "男女骑乘姿势，女阴道套弄阴茎，臀部起伏": "man and woman in riding position, woman's vagina enveloping penis, hips rising and falling",
            "男轻拍女臀部，女挑逗呻吟，阴道湿润": "man spanking woman's hips, woman teasingly moaning, wet vagina",
            "男女缠绵推拉，阴茎半进半退，节奏感强": "man and woman intimate push-pull, penis half in half out, strong rhythm",
            "女跪姿，男从后阴茎插入阴道，女背部拱起": "woman kneeling, man penetrating vagina from behind, woman's back arched",
            "男女侧躺性爱，男阴茎缓慢抽插，女轻喘": "man and woman side-lying sex, penis slowly thrusting, woman softly panting",
            "男舔舐女阴道，女高潮痉挛，喘息急促": "man licking woman's vagina, woman climaxing with spasms, rapid panting",
            "女爱抚男阴茎，男紧握女腰，亲密低语": "woman caressing man's penis, man gripping woman's waist, intimate whispers",
            "男女捆绑互动，男束缚女手，女阴道挑逗": "man and woman bondage play, man tying woman's hands, woman teasing with vagina",
            "男女多人性爱，阴茎与阴道交错，动态缠绵": "group sex, penises and vaginas intertwining, dynamic entanglement",
            "男支配女跪姿，女顺从舔舐阴茎，情趣鞭打": "man dominating woman in kneeling pose, woman submissively licking penis, erotic spanking",
            "男女浴室性爱，泡沫覆盖，阴茎插入阴道": "man and woman bathroom sex, foam-covered, penis penetrating vagina",
            "男女车内性爱，狭窄空间，阴道紧贴阴茎": "man and woman car sex, tight space, vagina clinging to penis",
            "男抚摸女大腿，女张开双腿，阴道暴露挑逗": "man caressing woman's thighs, woman spreading legs, vagina exposed teasingly",
            "男阴茎插入女肛门，女呻吟，节奏缓慢": "man penetrating woman's anus with penis, woman moaning, slow rhythm",
            "女舔舐男阴茎根部，男抚摸女头发，眼神对视": "woman licking base of man's penis, man stroking woman's hair, eye contact",
            "男女69姿势，男舔阴道女含阴茎，同步快感": "man and woman in 69 position, man licking vagina, woman sucking penis, synchronized pleasure"
        }

    def _get_clothing_mapping(self):
        return {
            "镂空情趣内衣，仅遮阴道与乳头": "lace erotic lingerie, barely covering vagina and nipples",
            "透明黑色纱裙，完全暴露阴道曲线": "transparent black sheer dress, fully exposing vagina curves",
            "超短皮质热裤，搭配情趣项圈": "ultra-short leather hot pants, paired with erotic collar",
            "紧身乳胶装，闪亮贴合阴道轮廓": "tight latex outfit, shiny and clinging to vagina contours",
            "仅蕾丝饰带缠绕，阴道无遮盖": "only lace ribbons wrapped, vagina uncovered",
            "情趣渔网连体装，暴露乳房与阴道": "erotic fishnet bodysuit, exposing breasts and vagina",
            "半裸湿透衬衫，紧贴阴道与乳房": "half-naked wet shirt, clinging to vagina and breasts",
            "情趣吊带袜，搭配高跟鞋": "erotic garter stockings, paired with high heels",
            "透明睡袍，阴道隐约可见": "transparent robe, vagina faintly visible",
            "无遮盖饰带，仅装饰性缠绕": "no-coverage ribbons, purely decorative wrapping",
            "情趣制服，超短裙摆，敞开扣子": "erotic uniform, ultra-short skirt, unbuttoned",
            "皮质束缚装，金属铆钉装饰": "leather bondage outfit, metal rivet decorations"
        }

    def _get_mood_mapping(self):
        return {
            "极致淫靡，眼神勾魂": "extreme lasciviousness, seductive gaze",
            "狂热欲念，身体颤抖": "frenzied desire, trembling body",
            "露骨挑逗，喘息低吟": "explicit teasing, soft panting moans",
            "放纵沉沦，迷乱表情": "indulgent surrender, dazed expression",
            "禁忌诱惑，嘴角微翘": "taboo temptation, slight smirk",
            "赤裸渴望，湿润唇部": "naked craving, moist lips",
            "危险情欲，肢体紧绷": "dangerous lust, tense limbs",
            "高潮迭起，表情痉挛": "repeated climaxes, convulsive expression",
            "羞耻顺从，低头轻喘": "shameful submission, head lowered with soft panting",
            "支配快感，掌控姿态": "dominant pleasure, controlling posture",
            "淫荡愉悦，肆意呻吟": "lewd pleasure, unrestrained moaning",
            "情欲迷醉，眼神迷离": "lustful intoxication, dreamy eyes",
            "激情爆发，呼吸急促": "passionate outburst, rapid breathing"
        }

    def _get_camera_movement_mapping(self):
        return {
            "快速推进至阴道特写，聚焦湿润细节": "quick zoom to vagina close-up, focusing on wet details",
            "360度旋转环绕，捕捉赤裸全身与阴茎": "360-degree rotating pan, capturing naked body and penis",
            "低角度慢扫，从脚踝至阴道，节奏渐强": "low-angle slow pan from ankles to vagina, increasing rhythm",
            "脉动式快切，突出阴茎插入高潮瞬间": "pulsating quick cuts, highlighting penis insertion climax",
            "柔焦跟随，锁定阴道与阴茎动作细节": "soft focus tracking, locking on vagina and penis action details",
            "动态放大后拉远，强调淫靡身体曲线": "dynamic zoom-in then pull-back, emphasizing lascivious body curves",
            "主观晃动视角，模拟阴茎插入沉浸感": "subjective shaky perspective, simulating penis insertion immersion",
            "缓慢推进，聚焦阴道抽插节奏": "slow zoom, focusing on vagina thrusting rhythm",
            "特写拉近，捕捉唇部与阴道细节": "close-up zoom, capturing lips and vagina details",
            "晃动镜头，营造紧张挑逗氛围": "shaky camera, creating tense teasing atmosphere",
            "阴茎与阴道局部特写，突出互动细节": "penis and vagina partial close-up, highlighting interaction details",
            "镜头旋转，环绕性爱动作": "camera rotation, circling sex actions",
            "快速变焦，强调高潮瞬间": "rapid zoom, emphasizing climax moment"
        }

    def _get_camera_angle_mapping(self):
        return {
            "胯下视角，聚焦阴道与阴茎": "crotch perspective, focusing on vagina and penis",
            "床边视角，捕捉阴茎插入动作": "bedside perspective, capturing penis insertion action",
            "私密视角，模拟偷窥阴道互动": "intimate perspective, simulating voyeuristic vagina interaction",
            "地面视角，强调低姿阴道曲线": "ground perspective, emphasizing low-pose vagina curves",
            "天花板视角，俯视赤裸男女互动": "ceiling perspective, overlooking naked man-woman interaction",
            "偷窥视角，隐藏式镜头效果": "voyeuristic perspective, hidden camera effect",
            "低角度，突出臀部与阴道": "low angle, highlighting hips and vagina",
            "高角度，俯视挑逗性爱姿势": "high angle, overlooking teasing sex poses",
            "过肩视角，聚焦男女亲密互动": "over-shoulder perspective, focusing on man-woman intimate interaction",
            "平视角度，强调表情与阴茎动作": "eye-level angle, emphasizing expressions and penis actions"
        }

    def _get_light_source_mapping(self):
        return {
            "红色烛光，摇曳诱惑": "red candlelight, flickering seduction",
            "粉紫霓虹光，循环闪烁": "pink-purple neon light, cycling flashes",
            "月光洒落，银色反光": "moonlight spilling, silvery reflections",
            "彩色欲念光，渐变流动": "colorful lustful light, gradient flow",
            "暗调私密光，神秘勾勒": "dark intimate light, mysterious outlines",
            "暖色镁光，柔和晕染": "warm magnesium light, soft glow",
            "闪烁氛围光，节奏同步": "flashing ambient light, rhythmically synced",
            "低调情趣灯光，晕染肌肤": "subtle erotic lighting, skin glow",
            "高对比戏剧光，强烈光影": "high-contrast dramatic light, strong shadows",
            "彩色光晕，环绕赤裸身体": "colorful halo, surrounding naked body",
            "闪烁情欲光，与阴茎抽插节奏同步": "flashing lustful light, synced with penis thrusting rhythm",
            "低角度光，强调阴道与阴茎曲线": "low-angle light, emphasizing vagina and penis curves"
        }

    def _get_light_type_mapping(self):
        return {
            "柔和情欲光，凸显阴道湿润肌肤": "soft lustful light, highlighting wet vagina skin",
            "强烈背光，勾勒阴茎与阴道轮廓": "strong backlight, outlining penis and vagina contours",
            "边缘勾勒光，突出阴道曲线": "edge lighting, emphasizing vagina curves",
            "低对比淫靡光，营造禁忌感": "low-contrast lascivious light, creating taboo atmosphere",
            "高对比戏剧光，强烈光影": "high-contrast dramatic light, strong shadows",
            "彩色光晕，环绕赤裸身体": "colorful halo, surrounding naked body",
            "闪烁情欲光，与阴茎抽插节奏同步": "flashing lustful light, synced with penis thrusting rhythm",
            "低角度光，强调阴道与阴茎曲线": "low-angle light, emphasizing vagina and penis curves"
        }

    def _get_lens_type_mapping(self):
        return {
            "单人阴道特写，聚焦裸露细节": "solo vagina close-up, focusing on exposed details",
            "双人亲密接触，阴茎与阴道交缠特写": "dual intimate contact, penis and vagina entwined close-up",
            "动态局部特写，强调阴道湿润肌肤": "dynamic partial close-up, emphasizing wet vagina skin",
            "赤裸全身镜头，缓慢旋转": "naked full-body shot, slow rotation",
            "快速场景切换，挑逗氛围定场": "rapid scene transition, setting teasing atmosphere",
            "多人镜头，阴茎与阴道交错捕捉": "multi-person shot, capturing intertwined penises and vaginas"
        }

    def _get_focal_length_mapping(self):
        return {
            "广角，展现场景与身体全貌": "wide-angle, showcasing scene and full body",
            "中焦距，聚焦阴茎与阴道动作细节": "medium focal length, focusing on penis and vagina action details",
            "长焦，突出阴道与阴茎特写": "telephoto, highlighting vagina and penis close-ups",
            "超广角，夸张阴道曲线与空间感": "ultra-wide angle, exaggerating vagina curves and spatial feel",
            "鱼眼镜头，梦幻扭曲效果": "fisheye lens, dreamy distortion effect"
        }

    def _get_color_tone_mapping(self):
        return {
            "炽热红色调，情欲主导": "fiery red tone, lust-driven",
            "冷艳紫色调，淫靡氛围": "cool purple tone, lascivious atmosphere",
            "高饱和色欲调，鲜艳对比": "high-saturation lust tone, vivid contrast",
            "暗调禁忌感，深色渲染": "dark taboo tone, deep rendering",
            "粉红淫靡调，柔和渐变": "pink lascivious tone, soft gradient",
            "深红挑逗调，浓烈感官": "deep red teasing tone, intense sensory",
            "金色调，奢华情欲感": "golden tone, luxurious lustful feel"
        }

    def _get_visual_style_mapping(self):
        return {
            "情色电影风，高光泽淫靡感": "erotic film style, high-gloss lascivious feel",
            "赛博情欲，霓虹高科技": "cyber-lust, neon high-tech",
            "复古禁忌风，柔和颗粒感": "retro taboo style, soft grainy texture",
            "时尚挑逗风，杂志质感": "fashion teasing style, magazine texture",
            "超现实淫靡，梦幻扭曲": "surreal lascivious, dreamy distortion",
            "艺术情欲风，抽象光影": "artistic lust style, abstract light and shadow",
            "日本AV风，细腻感官呈现": "Japanese AV style, delicate sensory presentation"
        }

    def _get_effect_mapping(self):
        return {
            "慢动作挑逗，放大阴道与阴茎细节": "slow-motion teasing, magnifying vagina and penis details",
            "光晕绽放，环绕裸露肌肤": "halo bloom, surrounding exposed skin",
            "快速模糊转场，节奏高潮": "rapid blur transition, rhythmic climax",
            "色欲渐变，色调动态过渡": "lustful gradient, dynamic color transition",
            "情趣耀斑，点缀淫靡画面": "erotic flare, embellishing lascivious scenes",
            "水滴效果，模拟阴道湿润感": "water droplet effect, simulating vagina wetness",
            "烟雾弥漫，增添神秘氛围": "smoke diffusion, adding mysterious atmosphere"
        }

    def _get_filter_mapping(self):
        return {
            "柔光滤镜，肌肤光滑细腻": "soft light filter, smooth and delicate skin",
            "高对比滤镜，强化光影": "high-contrast filter, enhancing light and shadow",
            "暖色滤镜，增强情欲氛围": "warm filter, intensifying lustful atmosphere",
            "冷色滤镜，营造禁忌感": "cool filter, creating taboo atmosphere",
            "颗粒滤镜，复古情色质感": "grainy filter, retro erotic texture",
            "模糊边缘滤镜，突出阴道与阴茎": "blurred edge filter, highlighting vagina and penis"
        }

NODE_CLASS_MAPPINGS = {
    "SunsetNSPromptSelector": SunsetNSPromptSelector
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "SunsetNSPromptSelector": "落日NS-提示词"
}
