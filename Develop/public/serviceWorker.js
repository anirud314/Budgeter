/// Service worker file
const appPrefix = 'my-site-cache-';
const version = 'v1';
const dCacheName = "data-cache-"+version;
const cName = appPrefix + version;

const filesToC = [
    //Files
    "./index.html",
    "./css/styles.css",
    "./js/indexDb.js",
    "./js/index.js",
    "./manifest.json",
    //Icons
    "./icons/icon-72x72.png",
    "./icons/icon-96x96.png",
    "./icons/icon-128x128.png",
    "./icons/icon-144x144.png",
    "./icons/icon-152x152.png",
    "./icons/icon-192x192.png",
    "./icons/icon-384x384.png",
    "./icons/icon-512x512.png"
];

self.addEventListener("install", function(e){
    e.waitUntil(
        caches.open(cName)
            .then(function(c){
                console.log('installing : ' + cName)
                return c.addAll(filesToC);
            })
    );
});

self.addEventListener("fetch", function(e){
    if (e.request.url.includes("/api/")) {
        e.respondWith(
            caches.open(dCacheName).then(c =>{
                return fetch(e.request)
                    .then(response =>{
                        if(response.status === 200){
                            c.put(e.request.url, response.clone());
                        }
                        return response;
                    })
                    .catch(err =>{
                        return c.match(e.request);
                    });
            })
            .catch(err => console.log("ERR->> " + err))
        );
        return;
    }
    else{
        e.respondWith(
            fetch(e.request).catch(function(){
                return caches.match(e.request).then(function(response){
                    if(response) {
                        return response;
                    }
                    else if(e.request.headers.get("accept").includes("text/html")){
                        return caches.match("/");
                    }
                });
            })
        );
    }
    
});

self.addEventListener('activate', function(e){
    e.waitUntil(
        caches.keys().then(function (kList){
            let cKList = kList.filter(function(k){
                return k.indexOf(appPrefix);
            })
            cKList.push(cName);

            return Promise.all(kList.map(function (k,i){
                if(cKList.indexOf(k) === -1){
                    console.log("emptying cache: " + kList[i]);
                    return caches.delete(kList[i]);
                }
            }));
        })
    );
});