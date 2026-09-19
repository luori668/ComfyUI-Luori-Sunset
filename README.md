# ComfyUI-Luori-Sunset

> 落日系列 · 提示词节点合集（Krea2 + Z-image）

把两个本地在用的提示词插件融合成一个：**一套词库、六个节点、零依赖**（no dependencies）。
原生控件收进折叠面板，画布更干净；画布搜索「落日」即可看到六个节点。


---

## 特性

- **零依赖**：`dependencies = []`，只用 ComfyUI 自带环境，不需要 `pip install` 任何东西。
- **词库内置**：约 23 MB 词库随插件走，开箱可用；也可用环境变量指向你自己的词库。
- **组合矛盾率 0%**：原始词库 1200 轮抽卡有 8.3% 会抽出互相打架的组合
  （面料 × 款式、天气 × 室内），本插件内置兼容性过滤 → 实测 **0.0%**。
- **分类可扩展**：往 `data/zimage/extra/` 丢一个 `.json` 就多一个分类。
- **霓虹面板外观**：纯前端皮肤（`web/*.js`），不改任何节点逻辑；不想要外观删掉 `web/` 即可退化为原版控件。
- **原生控件默认隐藏**（`"hidden": True`）：加号收起、面板清爽，节点搜索预览卡片同步变干净。
- **说明**融合了大呲花大佬，KOOK大佬，的提示词，感谢大佬们的付出。
 
## 节点一览

| 类名（Class） | 显示名 | 作用 |
|---|---|---|
| `Krea2PromptPicker` | 落日提示词 | Krea2 提示词抽卡，12 个词库池 |
| `ZImagePromptGeneratorNode` | ✨ 落日-提示词生成器 | 按分类/模式生成完整提示词 |
| `ZImagePromptLoaderNode` | ✨ 落日-提示词抽取器 | 超强模式 / 随机模式 / 单分类，三选一 |
| `ZImageFashionPresetLoaderNode` | 👗 落日-穿搭预设选择器 | 45 套穿搭预设（含「随机」） |
| `SunsetNSPromptSelector` | 落日提示词选择 | NS 方向提示词选择（正面 / 负面 / 完整） |
| `SunsetLRPromptBuilder` | 落日提示词预设 | 92 项写真字段 + 预设保存，中英文双语输出 |


## 用法

1. 搜索 `落日`，拖出需要的节点。
2. 节点底部面板点开分组，选分类 / 模式。
3. 节点输出 `prompt`（STRING）→ 接到 **CLIP Text Encode（CLIP 文本编码器）** 的 `text` 输入。
4. 连线后正常 Queue Prompt 即可。


## 自定义词库

**方式一：加分类**（推荐）
把符合格式的 `.json` 丢进 `data/zimage/extra/`，重启后即多一个分类。
格式说明见 `data/zimage/extra/_怎么加分类.txt`。



## 兼容性

- ComfyUI：`0.36.0`（实测版本）/ 前端 `1.52.7
- 平台：Windows / Linux / macOS 通用，无平台相关代码
- Python：`>= 3.9`


## 致谢与转载说明

本仓库部分代码与词库移植自第三方开源项目，版权归原作者所有，在此一并致谢。

### 落日提示词预设（SunsetLRPromptBuilder）

- 原作者：VividMuse-AGI
- 原仓库：<https://github.com/VividMuse-AGI/ComfyUI-Z-Image-Prompt-Builder>
- 原许可证：MIT License
- 本仓库的修改：`resolution.py` 内联为单文件；去除代码注释；词库迁移至 `data/lr/`（9 个 JSON 内容未改动）；界面重排为 8 标签分页面板；新增预设保存/恢复与运行结果回显；92 项字段默认值改为「随机抽取」。
- 提示词生成逻辑未改动。`nodes_lr.py` 头部保留原始 MIT 归属声明，转载时请勿删除。

### 落日提示词选择（SunsetNSPromptSelector）

- 原作者：weekii8282
- 原仓库：<https://github.com/weekii8282/ComfyUI-NSFW-PromptSelector>
- 本仓库的修改：仅调整布局外观与面板 UI，核心逻辑未改动。

### 大呲花 / KOOK 词库（data/krea2/）

- 来自社区整理的公开词库（`part-hz1.json` / `part-hz2.json`），仅做格式转换与清洗，感谢原作者。

---

二次发布请保留以上项目链接与 MIT 声明；如原作者希望调整或移除相关内容，请提 Issue，会第一时间处理。
