import uiutil from "/apogeeui/uiutil.js";

//---------------------------------
// Link Element Management - This manages DOM elements for links
//---------------------------------
class LinkLoader {
    /** 
     * This is a singleton and the constructor should not be called.
     * @private
     */
    constructor() {          
        this.scriptElements = [];
        this.cssElements = [];
        this.nextLinkCallerId = 1;
    }
    
    /** This returns a unique caller id which should bbe used when adding or removing
     * a link. This is done to allow mulitple callers to share a link.
     */
    createLinkCallerId() {
        return this.nextLinkCallerId++;
    }

    /** 
     * This method adds a link element to a page, supporting 'css' and 'script'. 
     * The caller identifer should be a unique identifier among people
     * requesting links of this given type. It cna be requested from
     * ReferenceEntry._createId
     * @protected
     */
    addLinkElement(type,url,linkCallerId,onLoad,onError) {
        try {
            var addElementToPage = false;
            var elementType;

            var elementList;
            if(type == "css") {
                elementList = this.cssElements
                elementType = "link";
            }
            else if(type == "script") {
                elementList = this.scriptElements;
                elementType = "script";
            }
            else throw new Error("Unknown link type: " + type);

            var elementEntry = elementList[url];
            if(!elementEntry) {
                //create script element reference
                elementEntry = {};
                elementEntry.url = url;
                elementEntry.callerInfoList = [];

                //create script element
                var element = document.createElement(elementType);

                if(type == "css") {
                    element.href = url;
                    element.rel = "stylesheet";
                    element.type = "text/css";
                }
                else if(type == "script") {
                    element.src = url;
                }

                element.onload = () => {
                    elementEntry.callerInfoList.forEach(callerInfo => {if(callerInfo.onLoad) callerInfo.onLoad()});
                }
                element.onerror = (error) => {
                    elementEntry.callerInfoList.forEach(callerInfo => {if(callerInfo.onError) callerInfo.onError(error)});
                }

                elementEntry.element = element;
                elementList[url] = elementEntry;

                addElementToPage = true;  
            }

            //add this to the caller info only if it is not there
            if(!elementEntry.callerInfoList.some(callerInfo => (callerInfo.id == linkCallerId))) {
                var callerInfo = {};
                callerInfo.id = linkCallerId;
                if(onLoad) callerInfo.onLoad = onLoad;
                if(onError) callerInfo.onError = onError;

                elementEntry.callerInfoList.push(callerInfo);
            }

            if(addElementToPage) {
                document.head.appendChild(elementEntry.element);
            }
        }
        catch(error) {
            if(error.stack) console.error(error.stack);
            
            //error loading link  
            if(onError) {
                onError(error);
            }
            else {
                console.error(error.stack);
            }
        }

    }

    /** This method removes a link element from the page.
     * @protected */
    removeLinkElement(type,url,linkCallerId) {
        var elementList;
        if(type == "css") elementList = this.cssElements
        else if(type == "script") elementList = this.scriptElements;
        else throw new Error("Unknown link type: " + type);

        var elementEntry = elementList[url];
        if(elementEntry) {
            //remove this caller from caller list
            elementEntry.callerInfoList = elementEntry.callerInfoList.filter(callerInfo => callerInfo.id != linkCallerId);

            //remove link if there are no people left using it
            if(elementEntry.callerInfoList.length === 0) {
                if(elementEntry.element) document.head.removeChild(elementEntry.element);
                delete elementList[url];
            }
        }
    }
}

//======================================
// static singleton methods
//======================================

/** @private */
let instance = null;

/** This retrieves the link loader instance. */
export function getLinkLoader() {
    if(!instance) {
        instance = new LinkLoader();
    }
    return instance;
}


