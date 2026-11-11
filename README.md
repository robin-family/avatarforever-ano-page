# Avatar-Forever Project Page

Official project page for **Avatar-Forever: Decoupled Parallel Training for High-Quality Real-Time Infinite Avatars**.

The page presents:

- 67 model inference results spanning talking, emotion, cinematic shots, singing, conversation, animals, and general scenes;
- three short-video and three long-video comparison cases across six methods;
- an extended 11-minute continuous generation result;
- rebuttal videos for five training variants and one long comparison with 1-, 5-, and 10-minute playback options;
- the method overview and headline streaming results.

Videos are rendered from an embedded copy of `assets/videos/manifest.json`. The videos themselves load only after the viewer presses play; poster images keep the initial page load lightweight.

## Refreshing the video library

Place MP4 files under the matching folders in `assets/videos/`, then run:

```powershell
python tools/build_video_library.py
```

The script rebuilds the manifest and extracts a JPEG poster for each video. Then update the copy embedded in `index.html`:

```bash
python3 tools/embed_video_manifest.py
```

The inline copy avoids an extra JSON request that may be blocked by anonymous website mirrors. Keep filenames and paths URL-safe because static hosts are case-sensitive.
