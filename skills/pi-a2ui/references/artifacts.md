# Local artifacts/media — requires v0.1.4 and a2ui_register_artifact

Register an existing workspace file **through Pi**, then use exactly the returned `src`. The helper cannot register files, manufacture a capability, or certify that an opaque URL exists. [artifacts.express](../examples/artifacts.express) contains syntax-only placeholders; it is not a playable artifact and must not be rendered unchanged as if it were registered.

1. `a2ui_register_artifact({path:"outputs/preview.png",kind:"image"})` returns `{artifactId,src,kind,mime,size,name}`. Path is relative to Pi's current workspace, no absolute/.. /symlink segments. Contents are not returned to the model.
2. Substitute the exact returned `src` into `ArtifactPreview(src=...,kind="image",label="Preview")` / `Image(url=...,description="Preview")`. label is presentation; preview HEAD supplies actual filename/MIME/size.
3. For video/audio register the right kind first, then `Video(url=...)` / `AudioPlayer(url=...,description="Audio")`. Optional Video.posterUrl must also be a registered local artifact src.

| Component | Props / supported source | Failure and lifecycle |
| --- | --- | --- |
| ArtifactPreview | `src`, `kind` image/video/audio, `label`1–256 | Verifies actual HEAD metadata/kind. Expired/busy/unsupported shows Unavailable. |
| Image | `url`, optional static description/fit/variant per active tool | PNG/JPEG/WebP signature classes only. Native image decode failure visible. No SVG. |
| Video | `url`, optional registered `posterUrl` | WebM/MP4; actual browser codec support matters. Native controls, metadata preload, no autoplay. |
| AudioPlayer | `url`, optional static description | WAV; actual browser decoding required. Native controls, no autoplay/microphone. |

At most16 registered+pending files/128MiB. Each image<=10MiB; each audio/video<=64MiB. Registration reads a checked immutable memory copy; modifying original files later does not update it. HTTP is authenticated loopback, two active body responses, bounded chunks and single byte ranges. No external/file/data/blob URLs, arbitrary file server, browser path input or direct execution.

Pause/reset/shutdown revokes future access and cancels owned work. Restoring a snapshot never reopens old files; register again and publish new references if the user still needs the artifact. Do not repeatedly reload expired URLs or claim the browser can remotely erase bytes already delivered. Preserve unrelated UI/input while reporting an unavailable artifact.
