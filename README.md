# nan · 英语学习记录

深色背景、荧光青主题的个人英语学习看板，记录《老友记》和英语原著学习。

## 公开网页

`docs/` 是可以直接托管的公开只读网页。GitHub 仓库的 Settings → Pages 中选择 Deploy from a branch，分支选择 `main`、目录选择 `/docs`，即可发布。

公开网页没有登录要求，也没有修改记录的接口。它展示 `public-site/records.json` 中的学习记录快照；管理版的飞书数据库更新不会自动同步到公开网页。

## 更新与预览

需要 Node.js 22 或更高版本。安装项目依赖后运行：

```sh
npm ci
npm run build:public
npm run preview:public
```

本地预览地址为 http://localhost:4173/ 。

编辑 `public-site/records.json` 后，重新构建并提交 `docs/` 和源码即可更新网页。`history` 单独记录历史估算，`days` 每天只保留一条记录；历史估算计入总时长，不计入单日峰值、连续天数和热力图。

## 项目结构

- `public-site/`：公开网页入口、公开学习数据。
- `client/src/pages/checkins/`：共用的热力图、统计和学习记录组件。
- `client/src/index.css`、`client/src/tailwind-theme.css`：荧光青配色与布局。
- `server/`、`shared/`：原管理版的后端和数据类型；公开网页不需要运行后端。
- `vite.public.config.mts`：独立的公开网页构建配置。

不要上传 `.env`、`.env.local`、`.spark/`、`.git/`、日志或登录凭据。公开学习数据仅保留自己打算展示的内容。
