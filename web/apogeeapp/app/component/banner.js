/** This namespacve provides methods to create a status banner and icon overlay. */
apogeeapp.app.banner = {};

//constants for the window banner bar
apogeeapp.app.banner.BANNER_TYPE_ERROR = "error";
apogeeapp.app.banner.BANNER_BGCOLOR_ERROR = "red";
apogeeapp.app.banner.BANNER_FGCOLOR_ERROR = "white";
apogeeapp.app.banner.ERROR_ICON_IMAGE = "/error.png";

apogeeapp.app.banner.BANNER_TYPE_PENDING = "pending";
apogeeapp.app.banner.BANNER_BGCOLOR_PENDING = "yellow";
apogeeapp.app.banner.BANNER_FGCOLOR_PENDING = "black";
apogeeapp.app.banner.PENDING_ICON_IMAGE = "/pending.png";

apogeeapp.app.banner.BANNER_TYPE_INVALID = "invalid";
apogeeapp.app.banner.BANNER_BGCOLOR_INVALID = "gray";
apogeeapp.app.banner.BANNER_FGCOLOR_INVALID = "white";
apogeeapp.app.banner.INVALID_ICON_IMAGE = "/invalid.png";

apogeeapp.app.banner.BANNER_BGCOLOR_UNKNOWN = "yellow";
apogeeapp.app.banner.BANNER_FGCOLOR_UNKNOWN = "black";

apogeeapp.app.banner.BANNER_TYPE_NONE = "none";

apogeeapp.app.banner.PENDING_MESSAGE = "Calculation pending...";
apogeeapp.app.banner.INVALID_MESSAGE = "Result not valid!";

/** This method returns a banner for the given state and message. This should 
 * not be called for banner state apogeeapp.app.banner.BANNER_TYPE_NONE */
apogeeapp.app.banner.getBanner = function(text,bannerState) {
    
    //get banner colors and icon overlay resource
    var bgColor;
    var fgColor;
    if(bannerState == apogeeapp.app.banner.BANNER_TYPE_INVALID) {
        bgColor = apogeeapp.app.banner.BANNER_BGCOLOR_INVALID;
        fgColor = apogeeapp.app.banner.BANNER_FGCOLOR_INVALID;
    }
    else if(bannerState == apogeeapp.app.banner.BANNER_TYPE_ERROR) {
        bgColor = apogeeapp.app.banner.BANNER_BGCOLOR_ERROR;
        fgColor = apogeeapp.app.banner.BANNER_FGCOLOR_ERROR;
    }
    else if(bannerState == apogeeapp.app.banner.BANNER_TYPE_PENDING) {
        bgColor = apogeeapp.app.banner.BANNER_BGCOLOR_PENDING;
        fgColor = apogeeapp.app.banner.BANNER_FGCOLOR_PENDING;
    }
    else {
        bgColor = apogeeapp.app.banner.BANNER_BGCOLOR_UNKNOWN;
        fgColor = apogeeapp.app.banner.BANNER_FGCOLOR_UNKNOWN;
    }
   
    //banner showing
    var bannerDiv = apogeeapp.ui.createElement("div",null,
        {
            //"display":"block",
            //"position":"relative",
            //"top":"0px",
            "backgroundColor":bgColor,
            "color":fgColor
        });
    bannerDiv.innerHTML = text;
    
    return bannerDiv;
}

/** This method creates an icon overlay for a given banner state. This should 
 * not be called for banner state apogeeapp.app.banner.BANNER_TYPE_NONE */
apogeeapp.app.banner.getIconOverlay = function(bannerState) {
    var resource;
    if(bannerState == apogeeapp.app.banner.BANNER_TYPE_INVALID) {
        resource = apogeeapp.app.banner.INVALID_ICON_IMAGE;
    }
    else if(bannerState == apogeeapp.app.banner.BANNER_TYPE_ERROR) {
        resource = apogeeapp.app.banner.ERROR_ICON_IMAGE;
    }
    else if(bannerState == apogeeapp.app.banner.BANNER_TYPE_PENDING) {
        resource = apogeeapp.app.banner.PENDING_ICON_IMAGE;
    }
    else {
        //unknown
        resource = null;
    }
    
    var iconOverlayElement = document.createElement("img");
    if(resource) {
        var url = apogeeapp.ui.getResourcePath(resource);
        iconOverlayElement.src = url;
    }
    return iconOverlayElement;
}

