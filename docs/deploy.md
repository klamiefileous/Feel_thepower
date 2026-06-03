# 部署说明

以下步骤可以把这个 MkDocs 工程发布到 GitHub Pages：

## 1. 安装 MkDocs 和主题

建议安装 `mkdocs-material`：

```bash
pip install mkdocs-material
```

如果你只想先预览，也可以直接安装基础 MkDocs：

```bash
pip install mkdocs
```

## 2. 运行本地预览

在 `github-pages-portfolio` 目录下运行：

```bash
mkdocs serve
```

然后打开浏览器：

```text
http://127.0.0.1:8000
```

如果你使用 VS Code 的 Live Server 插件，也可以继续打开 `docs/index.md` 进行编辑预览。

## 3. 构建静态站点

```bash
mkdocs build
```

构建后的静态文件会生成在 `site/` 目录。

## 4. 推送到 GitHub Pages

1. 在 GitHub 上创建仓库。
2. 将这个目录内容推送到仓库。
3. 在仓库设置中启用 GitHub Pages，选择 `gh-pages` 分支或 `main` 分支的 `site/` 目录。

::: tip
如果你使用 `mkdocs gh-deploy`，可以直接把站点发布到 GitHub Pages：

```bash
mkdocs gh-deploy
```
:::
