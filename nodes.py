class AnimaBrowser:
    """Browse Anima artist styles and output selected artist tag."""

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "artist_slug": (
                    "STRING",
                    {"default": "", "multiline": False},
                ),
            },
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("artist_tag",)
    FUNCTION = "get_tag"
    CATEGORY = "Anima"

    def get_tag(self, artist_slug):
        if not artist_slug or not artist_slug.strip():
            return ("",)
        tags = []
        for line in artist_slug.strip().split("\n"):
            slug = line.strip()
            if slug:
                tags.append(f"artist:{slug}")
        return ("\n".join(tags),)


NODE_CLASS_MAPPINGS = {"AnimaBrowser": AnimaBrowser}
NODE_DISPLAY_NAME_MAPPINGS = {"AnimaBrowser": "Anima Browser"}
