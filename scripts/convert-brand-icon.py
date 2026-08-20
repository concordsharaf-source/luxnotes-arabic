from pathlib import Path

from PIL import Image

root = Path(__file__).resolve().parents[1] / "assets" / "images"
for filename in ["icon.png", "splash-icon.png", "favicon.png", "android-icon-foreground.png"]:
    path = root / filename
    with Image.open(path) as image:
        output = image.convert("RGBA")
        output.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
        output.save(path, format="PNG", optimize=True, compress_level=9)
    print(f"Optimized {path.name} as a {output.width}×{output.height} PNG")
