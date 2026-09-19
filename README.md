# ComfyUI-Luori-Sunset

> 落日系列 · 提示词节点合集（Krea2 + Z-image）

把两个本地在用的提示词插件融合成一个：**一套词库、四个节点、零依赖**（no dependencies）。
原生控件收进折叠面板，画布更干净；

---
新增内容： 「致谢与转载说明」

落日提示词预设—— 原作者/仓库/许可证 + 你这边做的改动清单（内联 resolution、去注释、词库迁移、8 标签面板、预设存取、默认值改随机），并声明生成逻辑未改动
原作者节点：https://github.com/VividMuse-AGI/ComfyUI-Z-Image-Prompt-Builder
落日提示词选择（NS 节点）—— weekii8282/ComfyUI-NSFW-PromptSelector，只改 UI
大呲花 / KOOK 词库 —— 公开词库，感谢大佬们。
顺手把之前缺的两个节点（落日提示词选择、落日提示词预设）补进了「节点一览」表格。

---

## 特性

- **零依赖**：`dependencies = []`，只用 ComfyUI 自带环境，不需要 `pip install` 任何东西。
- **词库内置**：约 23 MB 词库随插件走，开箱可用；也可用环境变量指向你自己的词库。
- **组合矛盾率 0%**：原始词库 1200 轮抽卡有 8.3% 会抽出互相打架的组合
  （面料 × 款式、天气 × 室内），本插件内置兼容性过滤 → 实测 **0.0%**。
- **分类可扩展**：往 `data/zimage/extra/` 丢一个 `.json` 就多一个分类。
- **霓虹面板外观**：纯前端皮肤（`web/*.js`），不改任何节点逻辑；不想要外观删掉 `web/` 即可退化为原版控件。
- **原生控件默认隐藏**（`"hidden": True`）：加号收起、面板清爽，节点搜索预览卡片同步变干净。

## 节点一览

| 类名（Class） | 显示名 | 作用 |
|---|---|---|
| `Krea2PromptPicker` | 落日提示词 | Krea2 提示词抽卡，12 个词库池 |
| `ZImagePromptGeneratorNode` | ✨ 落日-提示词生成器 | 按分类/模式生成完整提示词 |
| `ZImagePromptLoaderNode` | ✨ 落日-提示词抽取器 | 超强模式 / 随机模式 / 单分类，三选一 |
| `ZImageFashionPresetLoaderNode` | 👗 落日-穿搭预设选择器 | 45 套穿搭预设（含「随机」） |


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

词库与节点结构源自本机在用的 Krea2 / Z-image 提示词插件。
