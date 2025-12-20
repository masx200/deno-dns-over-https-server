# DNS 记录导入 MongoDB 工具使用说明

## 概述

`import-hosts-to-mongodb.ts` 是一个用于将 hosts.log 文件中的 DNS 记录导入到
MongoDB 数据库的 Deno
程序。该程序支持批量导入、重复记录检测、错误处理和详细的进度显示。

## 功能特性

- ✅ 支持批量导入 DNS 记录到 MongoDB
- ✅ 智能合并记录（域名+记录类型为唯一标识）
- ✅ 自动检测并更新内容不同的记录
- ✅ 支持 A 记录和 AAAA 记录
- ✅ 详细的错误处理和日志输出
- ✅ 命令行参数配置
- ✅ 进度显示和统计信息
- ✅ 自动添加创建和更新时间戳

## 环境要求

- Deno 运行时环境
- MongoDB 数据库服务器
- hosts.log 文件（JSON 格式）

## 使用方法

### 基本语法

```bash
deno run --allow-read --allow-net --allow-env import-hosts-to-mongodb.ts [选项]
```

### 必需参数

| 参数                   | 说明             | 示例                        |
| ---------------------- | ---------------- | --------------------------- |
| `--mongodb_url`        | MongoDB 连接 URL | `mongodb://localhost:27017` |
| `--mongodb_db`         | 数据库名称       | `dns_db`                    |
| `--mongodb_collection` | 集合名称         | `dns_records`               |

### 可选参数

| 参数     | 说明           | 默认值      |
| -------- | -------------- | ----------- |
| `--file` | hosts 文件路径 | `hosts.log` |
| `--help` | 显示帮助信息   | -           |

### 使用示例

#### 1. 基本导入

```bash
deno run --allow-read --allow-net --allow-env import-hosts-to-mongodb.ts \
  --mongodb_url "mongodb://localhost:27017" \
  --mongodb_db "dns_db" \
  --mongodb_collection "dns_records"
```

#### 2. 使用自定义文件路径

```bash
deno run --allow-read --allow-net --allow-env import-hosts-to-mongodb.ts \
  --mongodb_url "mongodb://localhost:27017" \
  --mongodb_db "dns_db" \
  --mongodb_collection "dns_records" \
  --file "custom_hosts.log"
```

#### 3. 连接到需要认证的 MongoDB

```bash
deno run --allow-read --allow-net --allow-env import-hosts-to-mongodb.ts \
  --mongodb_url "mongodb://username:password@host:port/authdb" \
  --mongodb_db "dns_db" \
  --mongodb_collection "dns_records"
```

#### 4. 连接到 MongoDB Atlas

```bash
deno run --allow-read --allow-net --allow-env import-hosts-to-mongodb.ts \
  --mongodb_url "mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net" \
  --mongodb_db "dns_db" \
  --mongodb_collection "dns_records"
```

## 输入文件格式

hosts.log 文件必须是 JSON 格式，包含 DNS 记录数组：

```json
[
    {
        "name": "example.com",
        "content": "192.168.1.1",
        "type": "A"
    },
    {
        "name": "example.com",
        "content": "2001:db8::1",
        "type": "AAAA"
    }
]
```

### 记录字段说明

- `name` - 域名
- `content` - IP 地址（IPv4 或 IPv6）
- `type` - 记录类型（A 或 AAAA）

## 输出信息

程序运行时会显示以下信息：

### 1. 连接信息

```
连接到 MongoDB...
准备导入 3137 条记录...
```

### 2. 进度显示

```
已处理 1000/3137 条记录...
已处理 2000/3137 条记录...
已处理 3137/3137 条记录...
```

### 3. 导入结果统计

```
合并完成！
- 新增记录: 2500
- 合并更新记录: 500
- 跳过相同记录: 137
- 总处理记录数: 3137

集合 "dns_records" 总记录数: 3000
MongoDB 连接已关闭
```

### 4. 错误信息

- 如果记录格式不正确，会显示警告信息
- 如果文件不存在或格式错误，会显示错误信息
- 如果 MongoDB 连接失败，会显示详细的错误信息

## 记录合并逻辑

程序使用以下字段组合作为唯一标识：

- `name`（域名）
- `type`（记录类型）

### 合并策略

1. **新增记录**：如果域名+记录类型组合不存在，直接插入新记录
2. **合并更新**：如果域名+记录类型组合存在但IP地址不同，更新IP地址
3. **跳过相同**：如果域名+记录类型和IP地址都完全相同，跳过处理

### 处理示例

```
新增记录: example.com (A)
合并记录: example.com (AAAA) ::1 -> 2001:db8::1
跳过相同记录: example.com (A)
```

## 数据存储格式

导入到 MongoDB 的记录会自动添加时间戳：

```json
{
  "_id": ObjectId("..."),
  "name": "example.com",
  "content": "192.168.1.1",
  "type": "A",
  "createdAt": ISODate("2025-12-20T12:00:00Z"),
  "updatedAt": ISODate("2025-12-20T13:00:00Z")
}
```

### 时间戳说明

- `createdAt`：记录首次创建时间（新增记录时设置）
- `updatedAt`：记录最后更新时间（合并更新时设置）

## 批量处理

- 程序采用批量处理机制，每批最多处理 1000 条记录
- 这样可以优化内存使用和数据库性能
- 大文件会被自动分割成多个批次处理

## 错误处理

### 常见错误及解决方案

1. **文件不存在**
   ```
   ❌ 导入失败: 文件不存在: hosts.log
   ```
   解决方案：确保 hosts.log 文件存在，或使用 `--file` 参数指定正确的路径

2. **JSON 格式错误**
   ```
   ❌ 导入失败: JSON 格式错误: Unexpected token in JSON at position 0
   ```
   解决方案：检查 hosts.log 文件是否为有效的 JSON 格式

3. **MongoDB 连接失败**
   ```
   MongoDB 操作失败: failed to connect to server
   ```
   解决方案：检查 MongoDB 服务器是否运行，连接 URL 是否正确

4. **权限不足**
   ```
   MongoDB 操作失败: not authorized on dns_db
   ```
   解决方案：确保 MongoDB 用户有相应的读写权限

5. **必需参数缺失**
   ```
   错误: 缺少必需参数
   请提供 --mongodb_url, --mongodb_db, 和 --mongodb_collection
   ```
   解决方案：提供所有必需的命令行参数

## 性能优化建议

1. **网络优化**
   - 尽量使用本地 MongoDB 服务器以提高导入速度
   - 如果使用远程 MongoDB，确保网络连接稳定

2. **批量大小**
   - 默认批量大小为 1000 条，可根据服务器性能调整
   - 对于性能较弱的机器，可以考虑减少批量大小

3. **索引优化**
   - 导入前可以在 MongoDB 中创建索引以提高查询速度
   ```javascript
   // 针对合并逻辑优化索引
   db.dns_records.createIndex({ "name": 1, "type": 1 }, { unique: true });
   db.dns_records.createIndex({ "content": 1 }); // 可选：用于IP地址查询
   ```

## 替代方案

如果遇到 MongoDB 驱动兼容性问题，可以使用简化版本：

```bash
deno run --allow-read --allow-net --allow-env import-hosts-simple.ts \
  --mongodb_url "mongodb://localhost:27017" \
  --mongodb_db "dns_db" \
  --mongodb_collection "dns_records"
```

这个版本会生成一个 JSON 文件和 mongoimport 命令，可以手动执行导入操作。

## 注意事项

1. 确保运行程序的用户有访问 MongoDB 的权限
2. 首次导入可能需要较长时间，请耐心等待
3. 导入过程中不要关闭终端或中断程序
4. 建议在导入前备份重要数据
5. 程序会自动关闭 MongoDB 连接，无需手动关闭

## 帮助信息

查看完整的帮助信息：

```bash
deno run --allow-read --allow-net --allow-env import-hosts-to-mongodb.ts --help
```

这将显示所有可用的参数和使用示例。
