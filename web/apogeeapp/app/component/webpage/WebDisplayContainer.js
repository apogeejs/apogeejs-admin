import {getSaveBar} from "/apogeeapp/app/component/toolbar.js";

/** This is a standin for the display conatiner for the literate page
 * 
 * @class 
 */
export default class WebDisplayContainer {

    constructor(component, viewType) {
        
        this.mainElement = null;
        this.headerContainer = null;
        this.viewContainer = null;
        
        this.isShowing = false;
        this.isContentLoaded = false;
        
        this.inEditMode = false;
        
        this.content = null;
        
        this.component = component;
        this.viewType = viewType;
        this.dataDisplay = null;
        
        //initialize
        this.initUI();
    }

    //-------------------
    // state management
    //-------------------

    /** This method should be called whent the frame parent is loaded or unloaded from the DOM. */
    setIsShowing(isShowing) {
        this.isShowing = isShowing;
        this.updateDataDisplayLoadedState();
    }

    /** This returns the isShowing status of the display. */
    getIsShowing() {
        return this.isShowing;
    }

    /** This method should be called if the data display is resized. */
    onResize() {
        if(this.dataDisplay) {
            this.dataDisplay.onResize();
        }
    }

    /** This method closes the window. If the argument forceClose is not
     * set to true the "request_close" handler is called to check if
     * it is ok to close the window. */
    close(forceClose) {

        if(!forceClose) {
            //make a close request
            var requestResponse = this.callHandler(apogeeapp.ui.REQUEST_CLOSE,this);
            if(requestResponse == apogeeapp.ui.DENY_CLOSE) {
                //do not close the window
                return;
            }
        }

        this.dispatchEvent(apogeeapp.ui.CLOSE_EVENT,this);
    }

    //---------------------------
    // GUI ELEMENT
    //---------------------------

    /** This method returns the main dom element for the window frame. */
    getDisplayElement() {
        return this.mainElement;
    }

    //====================================
    // Initialization Methods
    //====================================

    /** @private */
    initUI() {
        
        //make the container
        this.mainElement = apogeeapp.ui.createElementWithClass("div","visiui_displayContainer_mainClass",null);
        
        //add the header elment (for the save bar)
        this.headerContainer = apogeeapp.ui.createElementWithClass("div","visiui_displayContainer_headerContainerClass",this.mainElement);
        
        //add the view container
        this.viewContainer = apogeeapp.ui.createElementWithClass("div","visiui_displayContainer_viewContainerClass",this.mainElement);

    }

    /** This method shold be called when the content loaded or frame visible state 
     * changes to manage the data display.
     * private */
    updateDataDisplayLoadedState() {
        
        if(this.isShowing) {
            if(!this.dataDisplayLoaded) {
                if(!this.dataDisplay) {
                    //the display should be created only when it is made visible
                    this.dataDisplay =  this.component.getDataDisplay(this,this.viewType);
                    this.setContent(this.dataDisplay.getContent(),this.dataDisplay.getContentType());
                    this.dataDisplay.showData();
                }
            
                if(this.dataDisplay.onLoad) this.dataDisplay.onLoad();
                this.dataDisplayLoaded = true;
            }
        }
        else {
            if(this.dataDisplay) {
                if(this.dataDisplayLoaded) {
                    this.dataDisplayLoaded = false;
                    if(this.dataDisplay.onUnload) this.dataDisplay.onUnload();
                }
            }  
        }
        
            
        //fyi - this is remove code, when we need to add it
        //[]
    }

    //------------------------------
    // standard methods
    //------------------------------

    /** The displayDestroyFlags indicate when the display for this view mode will be destroyed,
     * refering to times it is not visible to the user. See further notes in the constructor
     * description. */
    setDisplayDestroyFlags(displayDestroyFlags) {
        
        //in web view, view is alwasy active
    }   

    /** This method cleasr the data display. It should only be called when the data display is not showing. 
     * maybe allow this when the display is showing - unload and reload it*/
    forceClearDisplay() {
        //this destrpys the data display, not the container - bad name
        this.destroy();

        //reload display
        this.updateDataDisplayLoadedState();
    }

    /** This method destroys the data display. */
    destroy() {
        if((this.dataDisplay)&&(this.dataDisplay.destroy)) {
            this.dataDisplay.destroy();
            this.dataDisplay = null;
            this.dataDisplayLoaded = false;
        }
    }

    /** This method should be called called before the view mode is closed. It should
     * return true or false. NO - IT RETURNS SOMETHING ELSE! FIX THIS! */
    isCloseOk() {
        if(this.dataDisplay) {
            if(this.dataDisplay.isCloseOk) {
                return this.dataDisplay.isCloseOk();
            }
            
            if(this.inEditMode) {
                return DisplayContainer.UNSAVED_DATA;
            }
        }
        
        return DisplayContainer.CLOSE_OK;
    }
        
    /** This method is called when the member is updated, to make sure the 
    * data display is up to date. */
    memberUpdated() {
        //update the data display
        if((this.dataDisplay)&&(!this.inEditMode)) {
            this.dataDisplay.showData();
        }
    }
        
    //------------------------------
    // Accessed by the Editor, if applicable
    //------------------------------

    onCancel() {
        //reload old data
        this.dataDisplay.showData();
        
        return true;
    }

    startEditMode(onSave,onCancel) {
        if(!this.inEditMode) {
            this.inEditMode = true;
            var saveBar = getSaveBar(onSave,onCancel);
            this.setHeaderContent(saveBar);
        }
    }

    endEditMode() {
        //exit edit mode
        if(this.inEditMode) {
            this.inEditMode = false;
            this.setHeaderContent(null);
        }
        //select the associated node in the document.
        let parentComponent = this.component.getParentComponent();
        if(parentComponent) {
            let name = this.component.getMember().getName();
            parentComponent.selectApogeeNode(name);
        }
        //give the editor focus
        parentComponent.giveEditorFocusIfShowing();

    }

    isInEditMode() {
        return this.inEditMode;
    }


    //====================================
    // Internal Methods
    //====================================

    /** This sets the content for the window. If null (or otherwise false) is passed
     * the content will be set to empty.*/
    setHeaderContent(contentElement) {
        apogeeapp.ui.removeAllChildren(this.headerContainer);
        if(contentElement) {
            this.headerContainer.appendChild(contentElement);
        }
    }

    /** This sets the content for the window. The content type
     *  can be:
     *  apogeeapp.ui.RESIZABLE - for this content, the content is resized to fit the plane frame. The place frame should be initialized with a size.
     *  apogeeapp.ui.FIXED_SIZE - for this content, the plain frame is sized to fit the content. ITs size should not be externally set.
     *  apogeeapp.ui.SIZE_WINDOW_TO_CONTENT - this is not a content type but a input option for content FIXED_SIZE that shrinks the window to fit the content. It is typically only used for dialog boxes so isn't really relevent here.
     */
    setContent(contentElement,elementType) {
        
        apogeeapp.ui.removeAllChildren(this.viewContainer);
        
    //    //set the body type
    //    var bodyClassName;
    //    if(elementType == apogeeapp.ui.RESIZABLE) {
    //       bodyClassName = "visiui-dnh-fixed";
    //    }
    //    else if(elementType == apogeeapp.ui.FIXED_SIZE) {
    //        bodyClassName = "visiui-dnh-shrink-to-fit";
    //    }
    //    else if(elementType == apogeeapp.ui.SIZE_WINDOW_TO_CONTENT) {
    //        bodyClassName = "visiui-dnh-shrink-to-fit";
    //    }
    //    else {
    //        throw new Error("Unknown content type: " + elementType);
    //    }
    //    this.displayAndHeader.setBodyType(bodyClassName);
        
        //set the content
        this.viewContainer.appendChild(contentElement);
        this.content = contentElement;
    }

    /** This method removes the given element from the content display. If the element
     * is not in the content display, no action is taken. */
    safeRemoveContent() {
        for(var i = 0; i < this.viewContainer.childNodes.length; i++) {
            var node = this.viewContainer.childNodes[i];
            if(node === this.content) {
                this.viewContainer.removeChild(this.content);
                this.content = null;
            }
        }
    }

}


