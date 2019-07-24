
if(typeof zsi === "undefined") zsi = {}; 
zsi.localDb = function(){
    var _self= this; 
    var _readError = "Unable to retrieve daa from database!";
    this.db=null;
    this.loadJSON = async function(url) {
      var response = await fetch(url);
       return await response.json();
    }
    
    
    this.loadJSON = async function(url) {
      var response = await fetch(url);
       return await response.json();
    }
    this.openIDb = function(o){
        var _init = function(){
             window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
             window.IDBTransaction = window.IDBTransaction ||  window.webkitIDBTransaction || window.msIDBTransaction;
             window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
    
             if ( ! window.indexedDB) {
                window.alert("Your browser doesn't support a stable version of IndexedDB.");
             }
             var request = window.indexedDB.open("zsi-db", 1);
             
             request.onerror = function(event) {
                console.log("request.onerror");
             };
             
             request.onsuccess = function(event) {
                _self.db = request.result;
                if(o.onSuccess) { 
                    _self.onSuccess = o.onSuccess;
                    _self.onSuccess(o);
                }
             };
             request.onupgradeneeded = function(event) {
                console.log("request.onupgradeneeded");
                _self.db = event.target.result;
                _loadInitalData(_self.db);
             };
        }
        ,_loadInitalData = async function(db){
           if(o.onLoadInitialData) o.onLoadInitialData(db);
        }
        _init();
    };
    
    this.read = function(o,callBack) {
        var _selfRead= this;
        var transaction = _self.db.transaction(o.tableName);
        var objectStore = transaction.objectStore(o.tableName);
        
        if(typeof o.key === "undefined"){
             console.error("key not defined."); return;
        }
        
        var request = objectStore.get(o.key);
        
        request.onerror = function(event) {
           console.log(_readError);
        };
        request.onsuccess = function(event) {
           if(callBack) callBack(request.result);
        };
        
        
        return request;
    };
    
    this.readAll = function(o,callBack) {
        var objectStore = _self.db.transaction(o.tableName).objectStore(o.tableName);
        var request = objectStore.getAll();
        
        request.onerror = function(event) {
           console.log(_readError);
        };
        
        request.onsuccess = function(event) {
            if(callBack) callBack(request.result);
        };
    };
    
    this.add = function(o,callBack) {
        var request = _self.db.transaction(o.tableName, "readwrite").objectStore(o.tableName)
        .add(o.data);
        
        request.onsuccess = function(event) {
            if(callBack) callBack(true);
        };
        
        request.onerror = function(event) {
            if(callBack) callBack(false);
        };
    };
    
    this.delete = function (o) {
        var request = _self.db.transaction(o.tableName, "readwrite").objectStore(o.tableName);
        if(typeof o.key === "undefined"){
             console.error("key not defined."); return;
        }        
        request.delete( o.key);
        
        request.onsuccess = function(event) {
           if(callBack) callBack(true);
        };
    };    
};
