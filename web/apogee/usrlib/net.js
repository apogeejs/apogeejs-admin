/** This namespace includes network request functions. */
apogee.net = {};

/** This method creates an integer has value for a string. 
 * options:
 * "method" - HTTP method, default value is "GET"
 * "body" - HTTP body
 * "header" - HTTP headers, example: {"Content-Type":"text/plain","other-header":"xxx"}
 */
apogee.net.callbackRequest = function(url,onSuccess,onError,options) {
    
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
 * See apogee.net.callbackRequest for a list of options. */
apogee.net.textRequest = function(url,options) {
    return new Promise(function(onSuccess,onError) {
        apogee.net.callbackRequest(url,onSuccess,onError,options);
    });
}

/** This method creates an integer has value for a string.
 * See apogee.net.callbackRequest for a list of options. */
apogee.net.jsonRequest = function(url,options) {
    return apogee.net.textRequest(url,options).then(JSON.parse);
}
