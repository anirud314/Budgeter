const indexedDB = 
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    window.shimIndexedDB;

let db;
const req = indexedDB.open("budget", 1);

//Requests 
req.onupgradeneeded = ({ target }) => {
    let db = target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

req.onsuccess = ({ target }) => {
    db = target.result;
    if(navigator.onLine){ //checks to see if app is online 
        checkDB();//read db
    }
};

req.onerror = function(e){ // sends error response
    console.log("ERR ---> "+ e.target.errorCode);
};


//functions
function saveRecord(rec) { // saves item into the db
    const transaction = db.transaction(["pending"], "readwrite");
    const record = transaction.objectStore("pending");
    record.add(rec) // adds rec to the store
}

function checkDB() { // checks db for record
    const transaction = db.transaction(["pending"], "readwrite");
    const record = transaction.objectStore("pending");
    const getAllRec = record.getAll();

    getAllRec.onsuccess = function(){ // shows all results if successful
        if(getAllRec.result.length > 0){
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAllRec.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
            .then(res =>{
                return res.json();
            })
            .then(() =>{
                const transaction = db.transaction(["pending"], "readwrite");
                const record = transaction.objectStore("pending");
                record.clear(); // delete item if successful
            });
        }
    };  
}

window.addEventListener("online", checkDB); // listener to check if app came back online