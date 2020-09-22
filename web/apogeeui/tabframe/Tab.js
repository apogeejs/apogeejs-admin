import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import {EventManager} from "/apogeeutil/apogeeBaseLib.js";
import DisplayAndHeader from "/apogeeui/displayandheader/DisplayAndHeader.js";
import uiutil from "/apogeeui/uiutil.js";

export default class Tab {

    constructor(id) {
        //mixin initialization
        this.eventManagerMixinInit();
        
        this.tabFrame = null;
        this.id = id;
        this.tabLabelElement = uiutil.createElementWithClass("div","visiui-tf-tab-base visiui-tf-tab-inactive");
        
        this.iconContainerElement = uiutil.createElementWithClass("div", "visiui-tf-tab-icon-container",this.tabLabelElement);
        this.icon = uiutil.createElementWithClass("img", "visiui-tf-tab-icon",this.iconContainerElement);
        this.iconOverlayElement = uiutil.createElementWithClass("div","visiui_tf_tab_icon_overlay",this.iconContainerElement);
        
        this.titleElement = uiutil.createElementWithClass("div","visiui_tf_tab_title",this.tabLabelElement);
        
        this.closeButton = uiutil.createElementWithClass("img","visiui_tf_tab_cmd_button",this.tabLabelElement);
        this.closeButton.src = uiutil.getResourcePath(uiutil.CLOSE_CMD_IMAGE);
        
        this.closeButton.onclick = () => {
            this.close();
        };
        
        //create the tab element
        this.displayFrame = uiutil.createElementWithClass("div","visiui-tf-tab-window");
        this.tabInsideContainer = new DisplayAndHeader(DisplayAndHeader.FIXED_PANE,
                null,
                DisplayAndHeader.FIXED_PANE,
                null
            );
        this.displayFrame.appendChild(this.tabInsideContainer.getOuterElement());
        
        this.headerContainer = this.tabInsideContainer.getHeaderContainer();
        this.bodyContainer = this.tabInsideContainer.getBodyContainer();
        
        this.isShowing = false;
    }

    //---------------------------
    // WINDOW CONTAINER
    //---------------------------

    /** This is called by the tab frame. */
    setTabFrame(tabFrame) {
        this.tabFrame = tabFrame;
        var instance = this;
        //attach to listeners to forward show and hide events
        this.tabShownListener = (tab) => {
            if(tab == instance) {
                this.isShowing = true;
                instance.dispatchEvent(uiutil.SHOWN_EVENT,instance);
            }
        };
        this.tabFrame.addListener(uiutil.SHOWN_EVENT, this.tabShownListener);
        this.tabHiddenListener = (tab) => {
            if(tab == instance) {
                this.isShowing = false;
                instance.dispatchEvent(uiutil.HIDDEN_EVENT,instance);
            }
        };
        this.tabFrame.addListener(uiutil.HIDDEN_EVENT, this.tabHiddenListener);
    }

    /** This sets the tab as the active tab. It returns true if it can do this. In the case
     * it does not have an active frame, it returns false. */
    makeActive() {
        if(this.tabFrame) {
            this.tabFrame.setActiveTab(this.id);
            return true;
        }
        else {
            return false;
        }
    }

    /** This method must be implemented in inheriting objects. */
    getId() {
        return this.id;
    }

    /** This returns true if the tab is showing in the display. */
    getIsShowing() {
        return this.isShowing;
    }

    /** This method must be implemented in inheriting objects. */
    setTitle(title) {
        this.titleElement.innerHTML = title;
        this.title = title;
    }

    /** This method shows the window. */
    setIconUrl(iconUrl) {
        if(!iconUrl) {
            iconUrl = uiutil.getResourcePath(uiutil.GENERIC_CELL_ICON);
        }

        this.icon.src = iconUrl; 
    }

    /** This sets the content for the window. If null (or otherwise false) is passed
     * the content will be set to empty.*/
    setHeaderContent(contentElement) {
        uiutil.removeAllChildren(this.headerContainer);
        if(contentElement) {
            this.headerContainer.appendChild(contentElement);
        }
    }

    /** This sets the content for the window. */
    setContent(contentElement) {
        if(!this.contentContainer) {
            this.contentContainer = uiutil.createElement("div");
            uiutil.removeAllChildren(this.bodyContainer);
            this.bodyContainer.appendChild(this.contentContainer);
        }
        this.contentContainer.className = "visiui_tf_tab_container";
        
        uiutil.removeAllChildren(this.contentContainer);
        this.contentContainer.appendChild(contentElement);
        
        this.content = contentElement;
    }

    /** This method must be implemented in inheriting objects. */
    getTitle() {
        return this.title;
    }

    /** This sets the given element as the icon overlay. If null or other [false} is passed
     * this will just clear the icon overlay. */
    setIconOverlay(element) {
        if(this.iconOverlayElement) {
            this.clearIconOverlay();
            if(element) {
                this.iconOverlayElement.appendChild(element);
            }
        }
    }

    clearIconOverlay() {
        if(this.iconOverlayElement) {
            uiutil.removeAllChildren(this.iconOverlayElement);
        }
    }

    /** This method closes the window. */
    close(forceClose) {
        if(!this.tabFrame) return;
        
        if(!forceClose) {
            //make a close request
            var requestResponse = this.callHandler(uiutil.REQUEST_CLOSE,this);
            if(requestResponse == uiutil.DENY_CLOSE) {
                //do not close the window
                return;
            }
        }
        
        this.tabFrame.closeTab(this.id);
        this.tabFrame.removeListener(uiutil.SHOWN_EVENT, this.tabShownListener);
        this.tabFrame.removeListener(uiutil.HIDDEN_EVENT, this.tabHiddenListener);
        this.tabFrame = null;
        
        this.dispatchEvent(uiutil.CLOSE_EVENT,this);
        
        
    }

    //---------------------------
    // GUI ELEMENT
    //---------------------------

    /** This method must be implemented in inheriting objects. */
    getMainElement() {
        return this.displayFrame;
    }

    /** This method must be implemented in inheriting objects. */
    getLabelElement() {
        return this.tabLabelElement;
    }

}

//add mixins to this class
apogeeutil.mixin(Tab,EventManager);