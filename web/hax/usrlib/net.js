/** This namespace includes network request functions. */
hax.net = {};

/** This method creates an integer has value for a string. 
 * options:
 * "method" - HTTP method, default value is "GET"
 * "body" - HTTP body
 * "header" - HTTP headers, example: {"Content-Type":"text/plain","other-header":"xxx"}
 */
hax.net.makeRequest = function(url,onSuccess,onError,options) {
    
    var xmlhttp=new XMLHttpRequest();

    xmlhttp.onreadystatechange=function() {
        var msg;
        if(xmlhttp.readyState==4) {
            if(xmlhttp.status==200) {
                try {
                    onSuccess(xmlhttp.responseText);
                }
                catch(error) {
                    onError(error.message);
                }

            }
            else if(xmlhttp.status >= 400)  {
                msg = "Error in http request. Status: " + xmlhttp.status;
                onError(msg);
            }
            else if(xmlhttp.status == 0) {
                msg = "Preflight error in request. See console";
                onError(msg);
            }
        }
    }

    if(!options) options = {};
    
    var method = options.method ? options.method : "GET";
    xmlhttp.open(method,url,true);
    
    if(options.header) {
        for(var key in options.header) {
            xmlhttp.setRequestHeader(key,options.header[key]);
        }
    }
    
    xmlhttp.send(options.body);
}

/** This method creates an integer has value for a string. 
 * See hax.net.makeRequest for a list of options. */
hax.net.promiseRequest = function(url,options) {
    return new Promise(function(onSuccess,onError) {
        hax.net.makeRequest(url,onSuccess,onError,options);
    });
}

/** This method creates an integer has value for a string.
 * See hax.net.makeRequest for a list of options. */
hax.net.promiseJsonRequest = function(url,options) {
    return hax.net.promiseRequest(url,options).then(JSON.parse);
}
