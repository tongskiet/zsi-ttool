var  ua = navigator.userAgent;

setTimeout(function(){  
    localStorage.clear();
    
    if ( ua.match(/msie/i) || ua.match(/pc/i)) {
        console.log("msie");
        document.execCommand('ClearAuthenticationCache', 'false');
        window.location.replace(base_url);      
    } 
    else if ( ua.match(/chrome/i)) {
        console.log("webkit");
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", base_url, true);
        xmlhttp.setRequestHeader("Authorization", "Basic logout");
        xmlhttp.send();
        setTimeout(function () {
            window.location.replace(base_url);      
        }, 100);
    
    } 
    else if (ua.match(/gecko/i)) {
        console.log("gecko");
        $.ajax({
           async: true,
            url: base_url,
            type: 'GET',
            username: 'logout'
        });
        setTimeout(function () {
            window.location.replace(base_url);      
        }, 300);        

    } 
    else {
        console.log("else");
        alert("Logging out automatically is unsupported for this current browser"
            + "\nYou must close the browser to log out.");
    }
    
}, 3500); 
       