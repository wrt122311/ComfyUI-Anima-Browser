from .data_manager import data_manager

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

    RETURN_TYPES = ("STRING", "STRING")
    RETURN_NAMES = ("artist_tag", "prompt")
    FUNCTION = "get_tag"
    CATEGORY = "Anima"

    def get_tag(self, artist_slug):
        if not artist_slug or not artist_slug.strip():
            return ("", "")
        tags = []
        prompts = []
        for line in artist_slug.strip().split("\n"):
            slug = line.strip()
            if slug:
                tags.append(f"artist:{slug},")
                actual_tag = data_manager.get_tag_by_slug(slug)
                prompts.append(actual_tag if actual_tag else slug)
        return ("\n".join(tags), "\n".join(prompts))


NODE_CLASS_MAPPINGS = {"AnimaBrowser": AnimaBrowser}
NODE_DISPLAY_NAME_MAPPINGS = {"AnimaBrowser": "Anima Browser"}
