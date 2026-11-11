import argparse
import json
import re
import shutil
import subprocess
from pathlib import Path


DURATION_RE = re.compile(r"Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)")
VIDEO_RE = re.compile(r"Video:.*?(\d{2,5})x(\d{2,5})")
COMPARISON_GROUPS = {"short_comparisons", "long_comparisons"}
METHOD_GROUPS = COMPARISON_GROUPS | {"ablation_decouple", "10min_compare"}


def probe(ffmpeg: Path, video: Path):
    proc = subprocess.run(
        [str(ffmpeg), "-hide_banner", "-i", str(video)],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
        text=True,
        errors="replace",
    )
    duration_match = DURATION_RE.search(proc.stderr)
    video_match = VIDEO_RE.search(proc.stderr)
    if not duration_match or not video_match:
        raise RuntimeError(f"Could not probe {video}")
    duration = (
        int(duration_match.group(1)) * 3600
        + int(duration_match.group(2)) * 60
        + float(duration_match.group(3))
    )
    return duration, int(video_match.group(1)), int(video_match.group(2))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--repo",
        type=Path,
        default=Path(__file__).resolve().parents[1],
        help="Project-page repository root (defaults to the parent of tools/).",
    )
    parser.add_argument(
        "--ffmpeg",
        type=Path,
        help="Path to ffmpeg (defaults to the ffmpeg executable on PATH).",
    )
    args = parser.parse_args()

    ffmpeg = args.ffmpeg or shutil.which("ffmpeg")
    if not ffmpeg:
        parser.error("ffmpeg was not found. Install it or pass --ffmpeg PATH.")
    ffmpeg = Path(ffmpeg)

    video_root = args.repo / "assets" / "videos"
    poster_root = args.repo / "assets" / "posters"
    videos = sorted(video_root.rglob("*.mp4"))
    manifest = []

    for index, video in enumerate(videos, start=1):
        relative = video.relative_to(video_root)
        duration, width, height = probe(ffmpeg, video)
        poster_relative = relative.with_suffix(".jpg")
        poster = poster_root / poster_relative
        poster.parent.mkdir(parents=True, exist_ok=True)
        seek = min(max(duration * 0.12, 0.8), 4.0)
        cmd = [
            str(ffmpeg),
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-ss",
            f"{seek:.3f}",
            "-i",
            str(video),
            "-frames:v",
            "1",
            "-vf",
            "scale='min(720,iw)':-2",
            "-q:v",
            "4",
            str(poster),
        ]
        proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, errors="replace")
        if proc.returncode != 0 or not poster.exists():
            raise RuntimeError(f"Could not create poster for {video}: {proc.stderr}")

        parts = relative.parts
        manifest.append(
            {
                "group": parts[0],
                "category": parts[1] if len(parts) > 2 else parts[0],
                "case": parts[1] if parts[0] in COMPARISON_GROUPS else None,
                "method": video.stem if parts[0] in METHOD_GROUPS else None,
                "file": video.stem,
                "src": "assets/videos/" + relative.as_posix(),
                "poster": "assets/posters/" + poster_relative.as_posix(),
                "duration": round(duration, 3),
                "width": width,
                "height": height,
            }
        )
        print(f"[{index:03d}/{len(videos):03d}] {relative.as_posix()}")

    output = video_root / "manifest.json"
    output.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"VIDEOS={len(manifest)} MANIFEST={output}")


if __name__ == "__main__":
    main()
