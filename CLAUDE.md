# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## 项目概述

这是一个基于 Deno 的 DNS over HTTPS (DoH) 服务器，支持反向代理上游 DoH
服务和动态 DNS (DDNS) 管理。

## 开发命令

### 基础开发

```bash
# 开发模式运行（监听 8000 端口）
deno run -A --allow-net=:8000 ./main.tsx

# 完整启动命令（包含环境变量）
npx -y cross-env "doh=https://dns.alidns.com/dns-query" 'ttl=180' token=token deno run --unstable -A ./main.tsx
```

### 使用 Deno 任务

```bash
# 构建前端资源
deno task build

# 代码格式化（4空格缩进，双引号）
deno task fmt

# 代码检查
deno task lint

# 类型检查
deno task check
```

### 工具命令

```bash
# 导出系统 hosts 文件为 JSON
deno run -A getHostEntry.ts > hosts.log
deno run -A getHostEntry.ts --o=hosts.log
```

## 核心架构

### 中间件架构

项目采用中间件管道模式（middlewares.tsx），按顺序执行：

1. **error_handler** - 错误处理
2. **logger** - 请求/响应日志
3. **Strict_Transport_Security** - HSTS 安全头
4. **loop_detection_prevent_forwarded** - 防止请求循环
5. **parse_dns_message** - 解析 DNS 消息
6. **dns_query_set_cache_control_max_age_greater_than** - 缓存控制
7. **cache_dns_query_post_and_get_method** - DNS 缓存
8. **resolve_dns_query** - DNS 查询处理
9. **dns_records_authentication** - DDNS 认证
10. **dns_records_middleware** - DDNS 记录管理
11. **mainMiddleware** - 主要业务逻辑
12. **staticHandler** - 静态资源服务

### 关键组件

- **resolve_dns_query.ts** - 处理 DNS 查询解析，支持负载均衡和故障转移
- **reply_dns_query.ts** - 处理 DNS 查询响应，支持泛域名解析
- **dns_records_middleware.tsx** - DDNS 记录管理，使用 JSON-RPC 2.0 接口
- **cache_dns_query_post.tsx** - DNS 查询缓存系统
- **config.ts** - DNS 记录默认配置（内存存储）

## 环境变量配置

| 变量名               | 说明                                      | 类型               |
| -------------------- | ----------------------------------------- | ------------------ |
| `doh`                | 上游 DoH 服务 URL（支持数组实现负载均衡） | string 或 string[] |
| `ttl`                | 最小缓存时间（秒）                        | number             |
| `DOH_PATHNAME`       | DoH 服务路径（默认: /dns-query）          | string             |
| `token`              | DDNS 管理认证密钥                         | string             |
| `mongodb_url`        | MongoDB 连接 URL                          | string             |
| `mongodb_db`         | MongoDB 数据库名                          | string             |
| `mongodb_collection` | MongoDB 集合名                            | string             |
| `DNS_INTERCEPTOR`    | DNS 拦截器配置（域名后缀和上游服务器）    | Array              |

## 特色功能

### 负载均衡和故障转移

- 支持多个上游 DoH 服务
- 自动故障转移机制
- DNS 记录随机排序实现负载均衡

### DNS 拦截器

- 通过 `DNS_INTERCEPTOR` 环境变量配置
- 支持特定域名后缀的请求拦截
- 可配置使用 UDP/TCP 或 HTTP/HTTPS 协议的上游服务器

### 泛域名解析

- 支持通配符域名（如 *.example.com）
- 在 reply_dns_query.ts 中实现

### 缓存策略

- 可配置最小缓存时间
- 优先从缓存读取，过期后重新查询

## API 接口

### DoH 服务

- **端点**: `http://localhost:8000/dns-query`
- **方法**: GET/POST
- **协议**: DNS over HTTPS (RFC 8484)

### DDNS 管理

- **端点**: `http://localhost:8000/dns_records`
- **协议**: JSON-RPC 2.0
- **认证**: Bearer Token
- **接口定义**: DNSRecordsInterface.ts

## 数据存储

### 内存存储（默认）

- 配置文件：config.ts
- 重启后数据丢失

### MongoDB 存储

- 需配置 mongodb_url、mongodb_db、mongodb_collection
- 数据持久化保存

## 前端开发

前端资源位于 `static/` 目录，使用 Vite 构建：

```bash
cd static
npm install
npm run build
```

## 注意事项

1. **端口**: 默认监听 8000 端口，可通过命令行参数修改
2. **权限**: 需要使用 `-A` 参数允许所有权限
3. **不稳定特性**: 使用 `--unstable` 标志启用 Deno 的不稳定功能
4. **故障转移**: MongoDB 连接可能导致超时，已配置 uncaughtException 处理器
