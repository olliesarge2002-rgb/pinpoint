const CACHE="pinpoint-v45-steps";
const PHOTOS="pinpoint-photos-v1",PHOTO_MAX=600;
const CORE=["./","./index.html","./manifest.webmanifest","./pinpoint-wordmark.png","./icon-192.png","./icon-512.png","./apple-touch-icon.png","./world-110m.json","./privacy.html","./terms.html"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE).catch(()=>{})))});
self.addEventListener("activate",e=>{e.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE&&k!==PHOTOS).map(k=>caches.delete(k)))),self.clients.claim()]))});
// Photos never change once uploaded (each has its own file name), so they're kept on the device
// and reused even though the app asks Supabase for a fresh signed link each session.
// The cache key drops the link's ?token so a new link for the same photo still hits the cache.
async function trimPhotos(c){try{let ks=await c.keys();if(ks.length>PHOTO_MAX)await Promise.all(ks.slice(0,ks.length-PHOTO_MAX).map(k=>c.delete(k)))}catch(_){}}
async function photo(req,u){
  let key=u.pathname.includes("/object/sign/")?u.origin+u.pathname:u.href;
  let c=await caches.open(PHOTOS);
  let hit=await c.match(key);if(hit)return hit;
  let r;
  try{r=await fetch(u.href,{mode:"cors",credentials:"omit"})}catch(_){return fetch(req)}
  if(r.ok&&r.status===200){try{await c.put(key,r.clone());trimPhotos(c)}catch(_){}}
  return r;
}
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;let u;try{u=new URL(e.request.url)}catch(_){return}
if(/(^|\.)supabase\.(co|in)$/.test(u.hostname)){if(/\/storage\/v1\/object\/(sign\/place-photos|public\/avatars)\//.test(u.pathname)&&!e.request.headers.has("range"))e.respondWith(photo(e.request,u));return}
if(["nominatim.openstreetmap.org","photon.komoot.io","tiles.openfreemap.org"].includes(u.hostname))return;if(e.request.mode==="navigate"){e.respondWith(fetch(e.request).then(r=>{let x=r.clone();caches.open(CACHE).then(c=>c.put(e.request,x));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html"))));return}e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{let x=r.clone();caches.open(CACHE).then(c=>c.put(e.request,x));return r})))});
