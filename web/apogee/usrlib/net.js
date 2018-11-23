/** This namespace includes network request functions.
 * @namespace
 */
apogee.net = {};

/** 
 * This method does a standard callback request. It includes the following options:
 * - "method" - HTTP method, default value is "GET"
 * - "body" - HTTP body for the request
 * - "header" - HTTP headers, example: {"Content-Type":"text/plain","other-header":"xxx"}
 * @param {String} url - This is the url to be requested
 * @param {function} onSuccess - This is a callback that will be called if the request succeeds. It should take a String request body argument.
 * @param {function} onError - This is the callback that will be called it the request fails. It should take a String error message argument. 
 * @param {Object} options - These are options for the request.
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

/** 
 * This method returns a promise object for an HTTP request. The promist object
 * returns the text body of the URL if it resolves successfully.
 *  
 * @param {String} url - This is the url to be requested
 * @param {Object} options - These are options for the request. See {@link apogee.net.callbackRequest} for the options definition.
 * @return {Promise} This method returns a promise object with the URL body as text.
 */
apogee.net.textRequest = function(url,options) {
    return new Promise(function(onSuccess,onError) {
        apogee.net.callbackRequest(url,onSuccess,onError,options);
    });
}

/** 
 * This method returns a promise object for an HTTP request. The promist object
 * returns the JSON body of the URL if it resolves successfully.
 *  
 * @param {String} url - This is the url to be requested
 * @param {Object} options - These are options for the request. See {@link apogee.net.callbackRequest} for the options definition.
 * @return {Promise} This method returns a promise object with the URL body as text.
 */
apogee.net.jsonRequest = function(url,options) {
    return apogee.net.textRequest(url,options).then(JSON.parse);
}
