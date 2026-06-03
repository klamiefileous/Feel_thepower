# 本地演示文件夹说明

除了 MkDocs 页面外，本仓库还按项目在根目录提供了独立演示页（便于直接打开或托管）：

- `project-a/` → 包含 `bbq-leadgen.html` 与 `assets/`（放置 `1.png`, `demo.mp4`）
- `project-b/` → 包含 `webui-demo.html` 与 `assets/`
- `project-c/` → 包含 `youtube-painpoints.html` 与 `assets/`

你可以直接在浏览器打开这些 `project-*/` 下的 HTML，或将 `assets/` 中的 `1.png` 与 `demo.mp4` 上传后通过 Live Server 预览。

示例：

```
project-a/
  assets/
    1.png
    demo.mp4
  bbq-leadgen.html
```

如果要在 MkDocs 中展示这些媒体，请把 `assets/` 中的媒体复制到 `docs/` 下的静态目录（例如 `docs/media/`），并在页面中使用相对路径引用。

当前演示站已包含以下文件：

- `docs/media/project-a/fast uvicore与supabase连接教程（对应工程facebook商家爬取）.mp4`
- `docs/media/project-a/使用说明.docx`
- `docs/media/project-c/实际最终效果.doc`