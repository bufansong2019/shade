# shade

```
               ██████  ██  █████  ██████  ███████
              ██      ██ ██   ██ ██   ██ ██
              ███████ ██ ███████ ██   ██ █████
                   ██ ██ ██   ██ ██   ██ ██
              ██████  ██ ██   ██ ██████  ███████
```

> 临时分享，用过即焚。无需注册，无需废话。

## 它能干啥

| 功能 | 说明 |
|---|---|
| 文本分享 | 上限 10,000 字 |
| 文件分享 | 最多 5 个文件，单个最大 200 MB |
| 密码锁 | SHA-256 加密 |
| 阅后即焚 | 查看一次自动销毁 |
| 有效期 | 30m / 1h / 6h / 12h 可选 |
| 暗色模式 | 手切 + 跟随系统 |

## 咋跑的

```
Cloudflare Workers  ---  响应请求
        |
        +---  KV  ---  存元数据、密码哈希
        |
        +---  R2  ---  存文件
```

## 上手指南

### 1. 搞资源

去 Cloudflare Dashboard 搞两个东西，扔进 `wrangler.toml`：

- KV Namespace -> `SHARES_KV`
- R2 Bucket -> `BUCKET_R2`

### 2. 跑起来

```bash
# 本地耍
npx wrangler dev

# 上线
npx wrangler deploy
```

## 配置一览

| 变量 | 默认 | 干啥的 |
|---|---|---|
| `MAX_UPLOAD_SIZE_MB` | `200` | 单文件上限（在 `[vars]` 里改） |

## 长啥样

```
+-- index.js           # 入口 + 路由
+-- src/
|   +-- handler.js     # 核心逻辑（创/读/校/删）
|   +-- html.js        # 前端 UI（HTML/CSS/JS 全家桶）
|   +-- lib.js         # 工具函数
+-- wrangler.toml      # Worker 配置
+-- LICENSE
```

## 许可

- 源码：MIT -- 随便玩，别找我麻烦
