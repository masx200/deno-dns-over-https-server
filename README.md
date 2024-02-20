# deno-ddns-over-https-server

deno-ddns-over-https-server

### 使用方法

将需要反向代理的 dns over https 网址设定为环境变量 doh,

将需要反向代理的最小缓存时间设定为环境变量 ttl,

启动

```
npx -y cross-env "doh=https://dns.alidns.com/dns-query" 'ttl=180'  deno run --unstable -A ./main.tsx
```

访问`http://localhost:8000/dns-query`使用 dns over https

也可以设置`doh`环境变量为一个`json`数组,使用负载均衡

例如设置 `doh`为
`["https://doh.pub/dns-query","https://security.cloudflare-dns.com/dns-query"]`
