# doh-cache-deno-deploy

doh-cache-deno-deploy

### 使用方法

将需要反向代理的 dns over https 网址设定为环境变量 doh,

将需要反向代理的缓存时间设定为环境变量 ttl,

启动

```
npx -y cross-env "doh=https://dns.alidns.com/dns-query" 'ttl=180'  deno run --unsatble -A ./main.tsx
```

访问`http://localhost:8000/dns-query`使用 dns over https
