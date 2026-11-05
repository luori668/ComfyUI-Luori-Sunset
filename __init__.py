from .nodes_krea2 import Krea2PromptPicker, startup_check
from .nodes_zimage import (
    ZImagePromptGeneratorNode,
    ZImagePromptLoaderNode,
    ZImageFashionPresetLoaderNode,
)
from .nodes_nsfw import SunsetNSPromptSelector
from .nodes_lr import SunsetLRPromptBuilder

__version__ = "1.1.0"

NODE_CLASS_MAPPINGS = {
    "Krea2PromptPicker": Krea2PromptPicker,
    "ZImagePromptGeneratorNode": ZImagePromptGeneratorNode,
    "ZImagePromptLoaderNode": ZImagePromptLoaderNode,
    "ZImageFashionPresetLoaderNode": ZImageFashionPresetLoaderNode,
    "SunsetNSPromptSelector": SunsetNSPromptSelector,
    "SunsetLRPromptBuilder": SunsetLRPromptBuilder,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "Krea2PromptPicker": "✨落日-最强-文生图",
    "ZImagePromptGeneratorNode": "✨ 落日-倾向摄影提示词-搭配",
    "ZImagePromptLoaderNode": "✨ 落日-提示词抽取",
    "ZImageFashionPresetLoaderNode": "👗 落日-穿搭预设选择",
    "SunsetNSPromptSelector": "✨落日-19+提示词自选-搭配",
    "SunsetLRPromptBuilder": "✨ 落日-权威摄影-提示词自选搭配",
}

WEB_DIRECTORY = "./web"

try:
    startup_check()
except Exception as _e:
    print("[Sunset] 词库自检跳过了：%s" % _e)

__all__ = [
    "NODE_CLASS_MAPPINGS",
    "NODE_DISPLAY_NAME_MAPPINGS",
    "WEB_DIRECTORY",
    "__version__",
]
