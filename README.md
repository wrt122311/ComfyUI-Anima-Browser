# ComfyUI-Anima-Browser

在 ComfyUI 中浏览 [Anima](https://anima.mooshieblob.com/) 的 42,866 个艺术家风格，选中后输出 `artist:slug` 标签供工作流使用。

## 功能

- **图片浏览** — 内联画廊，直接显示在节点内部
- **单选/多选** — 点击切换多选模式，选中的艺术家标签输出到工作流
- **收藏** — 点击 ❤️ 收藏，支持仅显示收藏
- **搜索** — 实时搜索，防抖 250ms
- **随机** — 🎲 按钮随机跳转页面
- **滚动条** — 右侧可拖拽进度条，快速定位
- **懒加载** — 启动仅下载 2KB 索引，打开节点后才加载数据
- **本地缓存** — 数据和图片自动缓存，切换工作流无需重新下载

## 安装

```bash
cd ComfyUI/custom_nodes
git clone https://github.com/wrt122311/ComfyUI-Anima-Browser.git
```

重启 ComfyUI 即可。节点位于 `Anima` 分类下，名称为 **Anima Browser**。

## 使用

1. 将 **Anima Browser** 节点拖入画布
2. 节点内即显示画廊，等待数据首次下载完成（约 30 秒，仅一次）
3. 搜索或浏览艺术家，点击图片即可选中
4. 节点输出 `artist:slug` 格式字符串，连接至 prompt 节点使用
5. 开启多选时，多个标签以换行分隔输出

## 依赖

- `requests` — 用于下载数据（ComfyUI 环境通常已预装）

## 文件结构

```
ComfyUI-Anima-Browser/
├── __init__.py           # API 路由 + 节点注册
├── nodes.py              # 节点类定义
├── data_manager.py       # CDN 数据下载 + 本地缓存
├── js/
│   └── anima-browser.js  # 前端画廊 UI
├── requirements.txt
└── cache/                # 运行时自动创建
    ├── manifest.json
    ├── artists.json
    └── images/
```

## 数据来源

艺术家数据来自 [anima.mooshieblob.com](https://anima.mooshieblob.com/)，图片托管于 cdn.mooshieblob.com。
