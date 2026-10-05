const CACHE="pinpoint-v33";
const CORE=["./","./index.html","./manifest.webmanifest","./pinpoint-wordmark.png","./icon-192.png","./icon-512.png","./apple-touch-icon.png"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE).catch(()=>{})))});
self.addEventListener("activate",e=>{e.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()]))});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;if(e.request.mode==="navigate"){e.respondWith(fetch(e.request).then(r=>{let x=r.clone();caches.open(CACHE).then(c=>c.put(e.request,x));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html"))));return}e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{let x=r.clone();caches.open(CACHE).then(c=>c.put(e.request,x));return r})))});
