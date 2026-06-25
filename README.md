# 古诗文刷题 (Poetry Quiz)

专为小学生古诗文大会备赛设计的刷题网站。

## 功能特色

- �� 按年级 / 题型分类练习
- 📝 错题本（游客本地 + 登录云端）
- ⭐ 收藏题目
- 🔐 标准邮箱+密码登录/注册 + GitHub 登录，进度云端同步
- 📱 移动端优先设计
- 🔄 游客进度一键同步到账号

## 技术栈

- **框架**: Next.js 15.5 (App Router)
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: Auth.js v5
- **状态管理**: Zustand
- **样式**: Tailwind CSS
- **部署**: Docker / Docker Compose

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 启动数据库

```bash
docker compose up -d postgres
```

### 3. 配置环境变量

```bash
cp .env.example .env.local
# 编辑 .env.local，填入本地数据库连接信息和 Auth.js 配置
```

`.env.local` 示例：

```env
DATABASE_URL="postgresql://poetry_user:change_me@localhost:5432/poetry_quiz"
AUTH_SECRET="your-random-secret"
AUTH_GITHUB_ID="your-github-app-id"
AUTH_GITHUB_SECRET="your-github-app-secret"
```

### 4. 初始化数据库

```bash
npx prisma migrate dev
npx prisma db seed
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 生产部署

### 使用 Docker Compose

```bash
cp .env.example .env.production
# 编辑 .env.production，填入生产环境配置

docker compose up -d --build
```

### 数据库迁移

```bash
npx prisma migrate deploy
```

## 导入题库

管理员登录后，访问 `/admin/import` 页面，粘贴以下 JSON 格式的题目：

```json
[
  {
    "type": "SINGLE_CHOICE",
    "stem": ""欲穷千里目，更上一层楼"的作者是谁？",
    "options": [
      { "label": "A", "content": "王之涣" },
      { "label": "B", "content": "李白" },
      { "label": "C", "content": "杜甫" },
      { "label": "D", "content": "白居易" }
    ],
    "answer": ["A"],
    "explanation": "这句诗出自王之涣的《登鹳雀楼》。",
    "grade": 3,
    "difficulty": 1,
    "tags": ["唐诗", "王之涣", "名句"]
  }
]
```

## 题型说明

| 题型 | type 值 | 说明 |
|------|---------|------|
| 单选题 | SINGLE_CHOICE | answer: ["A"] |
| 多选题 | MULTIPLE_CHOICE | answer: ["A", "C"] |
| 填空题 | BLANK | answer: { answers: ["答案1", "答案2"], mode: "any" } |
| 判断题 | JUDGE | answer: "true" 或 "false" |
| 排序题 | ORDERING | answer: ["A", "B", "C"] |

## 环境变量

| 变量 | 说明 |
|------|------|
| DATABASE_URL | PostgreSQL 连接字符串 |
| AUTH_SECRET | Auth.js 密钥（随机字符串） |
| AUTH_GITHUB_ID | GitHub OAuth App Client ID |
| AUTH_GITHUB_SECRET | GitHub OAuth App Client Secret |
| NEXT_PUBLIC_APP_NAME | 网站名称（默认：古诗文刷题） |
| NEXT_PUBLIC_APP_URL | 网站域名 |
