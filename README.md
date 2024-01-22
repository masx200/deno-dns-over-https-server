# doh-cache-deno-deploy

doh-cache-deno-deploy

将需要反向代理的 doh 网址设定为环境变量 doh

```
npx -y cross-env "doh=https://doh.pub/dns-query"  deno run -A C:\Documents\doh-cache-deno-deploy\main.tsx
```
