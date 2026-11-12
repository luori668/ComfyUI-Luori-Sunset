class LuoriGallerySaver:

    DESCRIPTION = "接在保存图像后面，留空自动读取本次出图的提示词，连成图与全部生成参数一起存进落日词图库。"

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "images": ("IMAGE",),
                "提示词": ("STRING", {
                    "default": "",
                    "multiline": True,
                    "placeholder": "留空自动读取本次出图用的提示词（也可手填覆盖）",
                }),
            },
            "optional": {
                "种子": ("STRING", {"default": ""}),
                "来源": ("STRING", {"default": "手动存档"}),
                "启用": ("BOOLEAN", {"default": True}),
            },
            "hidden": {"unique_id": "UNIQUE_ID"},
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("prompt",)
    OUTPUT_TOOLTIPS = ("透传手填或自动读取的提示词",)
    FUNCTION = "save"
    OUTPUT_NODE = True
    CATEGORY = "落日/词图库"

    def save(self, images, 提示词, 种子="", 来源="手动存档", 启用=True, unique_id=None):
        text = str(提示词 or "").strip()
        if not 启用:
            return {"ui": {"gallery_text": []}, "result": (text,)}
        return {
            "ui": {
                "gallery_text": [text],
                "gallery_auto": ["1" if not text else "0"],
                "gallery_seed": [str(种子 or "")],
                "gallery_source": [str(来源 or "手动存档")],
                "gallery_node": [str(unique_id or "")],
            },
            "result": (text,),
        }
