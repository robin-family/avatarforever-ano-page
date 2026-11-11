"""Embed the video index in index.html for mirrors that block JSON requests."""

from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
START = "<!-- VIDEO_LIBRARY_DATA_START -->"
END = "<!-- VIDEO_LIBRARY_DATA_END -->"
FIELDS = ("group", "category", "case", "method", "src", "poster", "duration")


def main():
    html_path = ROOT / "index.html"
    html = html_path.read_text(encoding="utf-8")
    if html.count(START) != 1 or html.count(END) != 1:
        raise ValueError("Expected exactly one video library marker pair")

    manifest = json.loads((ROOT / "assets/videos/manifest.json").read_text(encoding="utf-8"))
    library = [{field: item[field] for field in FIELDS} for item in manifest]
    for item in library:
        for field in ("src", "poster"):
            if not (ROOT / item[field]).is_file():
                raise FileNotFoundError(item[field])

    payload = json.dumps(library, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")
    script = f'    <script id="video-library-data" type="application/json">{payload}</script>'
    before, tail = html.split(START, 1)
    _, after = tail.split(END, 1)
    html_path.write_text(f"{before}{START}\n{script}\n    {END}{after}", encoding="utf-8")
    print(f"Embedded {len(library)} videos in {html_path.name}")


if __name__ == "__main__":
    main()
