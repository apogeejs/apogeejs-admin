import apogeeui from "/apogeeui/apogeeui.js";

/** This namespacve provides methods to create a status banner and icon overlay. */

//constants for the window banner bar
export let bannerConstants = {};

bannerConstants.BANNER_TYPE_ERROR = apogeeutil.STATE_ERROR;
bannerConstants.BANNER_BGCOLOR_ERROR = "red";
bannerConstants.BANNER_FGCOLOR_ERROR = "white";
bannerConstants.ERROR_ICON_IMAGE = "/error.png";

bannerConstants.BANNER_TYPE_PENDING = apogeeutil.STATE_PENDING;
bannerConstants.BANNER_BGCOLOR_PENDING = "yellow";
bannerConstants.BANNER_FGCOLOR_PENDING = "black";
bannerConstants.PENDING_ICON_IMAGE = "/pending.png";

bannerConstants.BANNER_TYPE_INVALID = apogeeutil.STATE_INVALID;
bannerConstants.BANNER_BGCOLOR_INVALID = "gray";
bannerConstants.BANNER_FGCOLOR_INVALID = "white";
bannerConstants.INVALID_ICON_IMAGE = "/invalid.png";

bannerConstants.BANNER_BGCOLOR_UNKNOWN = "yellow";
bannerConstants.BANNER_FGCOLOR_UNKNOWN = "black";

bannerConstants.BANNER_TYPE_NONE = apogeeutil.STATE_NORMAL;

bannerConstants.PENDING_MESSAGE = "Calculation pending...";;
bannerConstants.INVALID_MESSAGE = "Result not valid!";

/** This method returns a banner for the given state and message. This should 
 * not be called for banner state bannerConstants.BANNER_TYPE_NONE */
export function getBanner(text,bannerState) {
    
    //get banner colors and icon overlay resource
    var bgColor;
    var fgColor;
    if(bannerState == bannerConstants.BANNER_TYPE_INVALID) {
        bgColor = bannerConstants.BANNER_BGCOLOR_INVALID;
        fgColor = bannerConstants.BANNER_FGCOLOR_INVALID;
    }
    else if(bannerState == bannerConstants.BANNER_TYPE_ERROR) {
        bgColor = bannerConstants.BANNER_BGCOLOR_ERROR;
        fgColor = bannerConstants.BANNER_FGCOLOR_ERROR;
    }
    else if(bannerState == bannerConstants.BANNER_TYPE_PENDING) {
        bgColor = bannerConstants.BANNER_BGCOLOR_PENDING;
        fgColor = bannerConstants.BANNER_FGCOLOR_PENDING;
    }
    else {
        bgColor = bannerConstants.BANNER_BGCOLOR_UNKNOWN;
        fgColor = bannerConstants.BANNER_FGCOLOR_UNKNOWN;
    }
   
    //banner showing
    var bannerDiv = apogeeui.createElement("div",null,
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
 * not be called for banner state bannerConstants.BANNER_TYPE_NONE */
export function getIconOverlay(bannerState) {
    var resource;
    if(bannerState == bannerConstants.BANNER_TYPE_INVALID) {
        resource = bannerConstants.INVALID_ICON_IMAGE;
    }
    else if(bannerState == bannerConstants.BANNER_TYPE_ERROR) {
        resource = bannerConstants.ERROR_ICON_IMAGE;
    }
    else if(bannerState == bannerConstants.BANNER_TYPE_PENDING) {
        resource = bannerConstants.PENDING_ICON_IMAGE;
    }
    else {
        //unknown
        resource = null;
    }
    
    var iconOverlayElement = document.createElement("img");
    if(resource) {
        var url = apogeeui.getResourcePath(resource);
        iconOverlayElement.src = url;
    }
    return iconOverlayElement;
}

