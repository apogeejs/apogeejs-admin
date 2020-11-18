//This is a modified version of Micrsofts oauth example code.
// instructions:
// - host a copy of callback.html and odauth.js on your domain.
// - embed odauth.js in your app like this:
//     <script id="odauth" src="odauth.js"
//                     clientId="YourClientId" scopes="ScopesYouNeed"
//                     redirectUri="YourUrlForCallback.html"></script>
// - define the onAuthenticated(token) function in your app to receive the auth token.
// - call odauth() to begin, as well as whenever you need an auth token
//     to make an API call. if you're making an api call in response to a user's
//     click action, call odAuth(true), otherwise just call odAuth(). the difference
//     is that sometimes odauth needs to pop up a window so the user can sign in,
//     grant your app permission, etc. the pop up can only be launched in response
//     to a user click, otherwise the browser's popup blocker will block it. when
//     odauth isn't called in click mode, it'll put a sign-in button at the top of
//     your page for the user to click. when it's done, it'll remove that button.
//
// how it all works:
// when you call odauth(), we first check if we have the user's auth token stored
// in a cookie. if so, we read it and immediately call your onAuthenticated() method.
// if we can't find the auth cookie, we need to pop up a window and send the user
// to Microsoft Account so that they can sign in or grant your app the permissions
// it needs. depending on whether or not odauth() was called in response to a user
// click, it will either pop up the auth window or display a sign-in button for
// the user to click (which results in the pop-up). when the user finishes the
// auth flow, the popup window redirects back to your hosted callback.html file,
// which calls the onAuthCallback() method below. it then sets the auth cookie
// and calls your app's onAuthenticated() function, passing in the optional 'window'
// argument for the popup window. your onAuthenticated function should close the
// popup window if it's passed in.
//
// subsequent calls to odauth() will usually complete immediately without the
// popup because the cookie is still fresh.

//==============================
// Internal Functions
//==============================

/** This should be called to retrieve authentication.
 * It should only be called in response to a user action, since it can may trigger a popup. */
function oneDriveAuth(oneDriveAppInfo) {
    if(!isHttpsOrLocal) {
        alert("Can not authenticate One Drive from non-HTTPS site! (localhost and file sources are ok)");
        return;
    }
    var token = getTokenFromCookie();
    if (token) {
        onAuthenticated(token);
    }
    else {
        challengeForAuth(oneDriveAppInfo);
    }
}

function logoutOfAuth() {
    clearCookie();
}

/** This method is called when the micrsoft calls us back with auth information. */
function onAuthCallback() {
    var authInfo = getAuthInfoFromUrl();
    var token = authInfo["access_token"];
    var expiry = parseInt(authInfo["expires_in"]);
    if (token)
    {
        setCookie(token, expiry);
        window.opener.onAuthenticated(token, window);
    }
}

function getOneDriveToken() {
    return getTokenFromCookie();
}

//==============================
// Internal Functions
//==============================


function onAuthenticated(token, authWindow) {
    if(token) {
        if(authWindow) {
            authWindow.close();
        }
    }
    else {
        alert("error logging in!");
    }
}
    
// for added security we require https
function isHttpsOrLocal() {
    return (window.location.protocol == "https:" || window.location.protocol != "file:" || window.location.hostname != "localhost");
}



function getAuthInfoFromUrl() {
    if (window.location.hash) {
        var authResponse = window.location.hash.substring(1);
        var authInfo = JSON.parse(
            '{' + authResponse.replace(/([^=]+)=([^&]+)&?/g, '"$1":"$2",').slice(0,-1) + '}',
            function(key, value) { return key === "" ? value : decodeURIComponent(value); });
        return authInfo;
    }
    else {
        alert("failed to receive auth token");
    }
}

function getTokenFromCookie() {
    var cookies = document.cookie;
    var name = "odauth=";
    var start = cookies.indexOf(name);
    if (start >= 0) {
        start += name.length;
        var end = cookies.indexOf(';', start);
        if (end < 0) {
            end = cookies.length;
        }
        else {
            postCookie = cookies.substring(end);
        }

        var value = cookies.substring(start, end);
        return value;
    }

    return "";
}

function setCookie(token, expiresInSeconds) {
    var expiration = new Date();
    expiration.setTime(expiration.getTime() + expiresInSeconds * 1000);
    var cookie = "odauth=" + token +"; path=/; expires=" + expiration.toUTCString();

    if (document.location.protocol.toLowerCase() == "https") {
        cookie = cookie + ";secure";
    }

    document.cookie = cookie;
}

function clearCookie() {
    var expiration = new Date();
    var cookie = "odauth=; path=/; expires=" + expiration.toUTCString();
    document.cookie = cookie;
}

function challengeForAuth(oneDriveAppInfo) {
    var url =
    oneDriveAppInfo.authServiceUri +
        "?client_id=" + oneDriveAppInfo.clientId +
        "&response_type=token" +
        "&redirect_uri=" + encodeURIComponent(oneDriveAppInfo.redirectUri);

        if (oneDriveAppInfo.scopes)
            url = url + "&scope=" + encodeURIComponent(oneDriveAppInfo.scopes);
        if (oneDriveAppInfo.resourceUri)
            url = url + "&resource=" + encodeURIComponent(oneDriveAppInfo.resourceUri);

    popup(url);
}

/** This function creates the popup for OAuth login. */
function popup(url) {
    var width = 525,
            height = 525,
            screenX = window.screenX,
            screenY = window.screenY,
            outerWidth = window.outerWidth,
            outerHeight = window.outerHeight;

    var left = screenX + Math.max(outerWidth - width, 0) / 2;
    var top = screenY + Math.max(outerHeight - height, 0) / 2;

    var features = [
                            "width=" + width,
                            "height=" + height,
                            "top=" + top,
                            "left=" + left,
                            "status=no",
                            "resizable=yes",
                            "toolbar=no",
                            "menubar=no",
                            "scrollbars=yes"];
    var popup = window.open(url, "oauth", features.join(","));
    if (!popup) {
        alert("failed to pop up auth window");
    }

    popup.focus();
}
