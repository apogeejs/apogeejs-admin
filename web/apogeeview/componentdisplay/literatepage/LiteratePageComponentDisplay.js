import base from "/apogeeutil/base.js";
import EventManager from "/apogeeutil/EventManagerClass.js";

import {addComponent, addAdditionalComponent} from "/apogeeview/commandseq/addcomponentseq.js";
import {bannerConstants,getBanner,getIconOverlay} from "/apogeeview/componentdisplay/banner.js"; 
import PageChildComponentDisplay from "/apogeeview/componentdisplay/literatepage/PageChildComponentDisplay.js"

import {selectionBetween} from "/prosemirror/lib/prosemirror-view/src/selection.js";

import ModelView from "/apogeeview/ModelView.js";

import apogeeui from "/apogeeui/apogeeui.js";
import Tab from "/apogeeui/tabframe/Tab.js";

/** This component represents a json table object. */
export default class LiteratePageComponentDisplay extends EventManager {
    
    constructor(componentView) {
        super();

        this.componentView = componentView;

        this.isShowing = false;

        this.editorManager = this.componentView.getEditorManager();

        //this is used if we have to prepopolate and child component displays
        this.standInChildComponentDisplays = {};

        this.loadTabEntry();
    };

    getComponentView() {
        return this.componentView;
    }


    getTab() {
        return this.tab;
    }

    getEditorView() {
        return this.editorView;
    }

    closeTab() {
        if(this.tab) {
            this.tab.close();
            this.tab = null;
        }
    }

    getIsShowing() {
        return this.isShowing;
    }

    componentUpdated(component) {

        if(component.isMemberFieldUpdated("member","name")) {
            this.tab.setTitle(this.componentView.getName());
        }

        if(component.isFieldUpdated("document")) {
            let editorData = this.componentView.getEditorData();
            this.editorView.updateState(editorData);
        }

        if(component.isMemberFieldUpdated("member","state")) {
            this._setBannerState();
        }
    }

    //#############################################################################
    //Argh! See ntoes and fix this
    nonComponentDocumentUpdate() {
        let editorData = this.componentView.getEditorData();
        this.editorView.updateState(editorData);
    }
    //##############################################################################

    getChildComponentDisplay(name) {
        let folderComponent = this.componentView.getComponent();
        let folderMember = folderComponent.getParentFolderForChildren();

        //lookup component
        var memberId = folderMember.lookupChildId(name);
        if (memberId) {
            var modelView = this.componentView.getModelView();
            var modelManager = modelView.getModelManager();
            var childComponentId = modelManager.getComponentIdByMemberId(memberId);
            var childComponentView = modelView.getComponentViewByComponentId(childComponentId);
            let childComponentDisplay;
            if (childComponentView) {
                childComponentDisplay = childComponentView.getComponentDisplay();
                //   //CLUDGE ALERT - fix this when I reorganize the code
                //   var tabDisplay = this.folderComponentView.getTabDisplay();
                //   tabDisplay.addChild(componentView);
                //   componentDisplay = componentView.getComponentDisplay();
            }
            else {
                //this component view has not been created yet. Make a standing
                childComponentDisplay = new PageChildComponentDisplay(null, this);
                this.standInChildComponentDisplays[name] = childComponentDisplay;
            }

            return childComponentDisplay
        }
        else {
            return null;
        }
    }

    /** This creates and adds a display for the child component to the parent container. */
    addChild(childComponentView) {

        //-----------------
        // Get component display
        //-----------------
        let childComponentDisplay;

        //create a new component display for this child
        if(childComponentView.constructor.hasChildEntry) {
            //check if there is a component display already waiting
            childComponentDisplay = this.standInChildComponentDisplays[childComponentView.getName()];
            if(childComponentDisplay) {
                //set up the standin component display
                childComponentDisplay.setComponentView(childComponentView);
                delete this.standInChildComponentDisplays[childComponentView.getName()];
            }
            else {
                childComponentDisplay = new PageChildComponentDisplay(childComponentView,this);
            }
        }

        //set this on the child
        if(childComponentDisplay) {
            //set the component display
            childComponentView.setComponentDisplay(childComponentDisplay);
        }
    }

    /** This will move the selection to the end of the document. */
    selectStartOfDocument() {
        let state = this.componentView.getEditorData();
        let $startPos = state.doc.resolve(0);
        let selection = selectionBetween(this.editorView, $startPos, $startPos);
        let transaction = state.tr.setSelection(selection).scrollIntoView();
        this.componentView.applyTransaction(transaction);

        this.componentView.giveEditorFocusIfShowing();
    }

    /** This will move the selection to the end of the document. */
    selectEndOfDocument() {
        let state = this.componentView.getEditorData();
        let endPos = state.doc.content.size;
        let $endPos = state.doc.resolve(endPos);
        let selection = selectionBetween(this.editorView, $endPos, $endPos);
        let transaction = state.tr.setSelection(selection).scrollIntoView();
        this.componentView.applyTransaction(transaction);

        this.componentView.giveEditorFocusIfShowing();
    }

////////////////////////////////////////////////////////////////////////////////////////////////

    /** This is to record any state in the tab object. */
    getStateJson() {
        return null;
    }

    /** This is to restore any state in the tab object. */
    setStateJson(json) {
    }

    //===============================
    // Private Functions
    //===============================

    /** @private */
    loadTabEntry() {
        let component = this.componentView.getComponent();
        this.tab = new Tab(component.getId());    

        //-----------------------
        //set the content
        //-----------------------
        this.createDisplayContent();

        if(this.tab.getIsShowing()) {
            this.tabShown()
        }
        else {
            this.tabHidden()
        }
        this.tab.addListener(apogeeui.SHOWN_EVENT,() => this.tabShown());
        this.tab.addListener(apogeeui.HIDDEN_EVENT,() => this.tabHidden());
        this.tab.addListener(apogeeui.CLOSE_EVENT,() => this.tabClosed());

        //------------------
        // set menu
        //------------------
        var menu = this.tab.createMenu(this.componentView.getIconUrl());
        var createMenuItemsCallback = () => {
            return this.componentView.getMenuItems();
        }
        menu.setAsOnTheFlyMenu(createMenuItemsCallback);

        //-----------------
        //set the tab title
        //-----------------
        this.tab.setTitle(this.componentView.getName());

        //-----------------
        // apply the banner state
        //-----------------
        this._setBannerState();

        //-----------------------------
        //add the handlers for the tab
        //-----------------------------
        var onClose = () => {
            this.componentView.closeTabDisplay();
            this.destroy();
        }
        this.tab.addListener(apogeeui.CLOSE_EVENT,onClose);
    }

    _setBannerState() {
        let bannerState = this.componentView.getBannerState();
        let bannerMessage = this.componentView.getBannerMessage();

        apogeeui.removeAllChildren(this.bannerContainer);
        if(bannerState == bannerConstants.BANNER_TYPE_NONE) {
           //no action
        }
        else {
            var banner = getBanner(bannerMessage,bannerState);
            this.bannerContainer.appendChild(banner);
        }

        if(this.tab) {
            var iconOverlay = getIconOverlay(bannerState);
            if(iconOverlay) {
                this.tab.setIconOverlay(iconOverlay);
            }
            else {
                this.tab.clearIconOverlay();
            }
        }
    }

     /** @private */
    createDisplayContent() {

        //-----------
        //page header
        //------------
        this.headerElement = apogeeui.createElementWithClass("div","visiui_litPage_header",null);
        this.tab.setHeaderContent(this.headerElement);

        this.editorToolbarContainer = apogeeui.createElementWithClass("div","visiui_litPage_editorToolbar",this.headerElement);
        this.componentToolbarContainer = apogeeui.createElementWithClass("div","visiui_litPage_componentToolbar",this.headerElement);
        this.bannerContainer = apogeeui.createElementWithClass("div","visiui_litPage_banner",this.headerElement);

        this.initComponentToolbar();

        //-------------------
        //page body
        //-------------------
        this.contentElement = apogeeui.createElementWithClass("div","visiui_litPage_body",null);
        this.tab.setContent(this.contentElement);

        let pageComponent = this.componentView.getComponent();
        let folder = pageComponent.getParentFolderForChildren();

        //show all children
        var modelView = this.componentView.getModelView();
        var modelManager = modelView.getModelManager();
        var childrenIds = folder.getChildIdMap();
        for(var childName in childrenIds) {
            var childMemberId = childrenIds[childName];
            var childComponentId = modelManager.getComponentIdByMemberId(childMemberId);
            var childComponentView = modelView.getComponentViewByComponentId(childComponentId);
            if(childComponentView) {
                this.addChild(childComponentView);
            }
        }
        
        // var editorData = this.componentView.getEditorData();
        // this.editorView.updateState(editorData);
        this.initEditor();

        //set the selection to the end of the view
        this.selectEndOfDocument();
    }

    initComponentToolbar() {

        //THIS IS BAD - IT IS ONLY TO GET THIS WORKING AS A TRIAL
        //MAKE A WAY TO GET COMPONENT GENERATORS FOR BUTTONS RATHER THAN READING A PRIVATE VARIABLE FROM APP
        let pageComponent = this.componentView.getComponent();
        var appView = this.componentView.getModelView().getWorkspaceView().getAppView();
        var app = appView.getApp();

        for(var i = 0; i < app.standardComponents.length; i++) {
            let key = app.standardComponents[i];

            let componentClass = app.componentClasses[key];
            let componentViewClass = appView.constructor.getComponentViewClass(componentClass.uniqueName);
            if(componentViewClass.hasChildEntry) {

                var buttonElement = apogeeui.createElementWithClass("div","visiui_litPage_componentButton",this.componentToolbarContainer);
                //make the idon
                var imageElement = document.createElement("img")
                imageElement.src = apogeeui.getResourcePath(componentViewClass.ICON_RES_PATH);
                var iconElement = apogeeui.createElementWithClass("div","visiui_litPage_componentButtonIcon",buttonElement);
                iconElement.appendChild(imageElement);
                //label
                var textElement = apogeeui.createElementWithClass("div","visiui_litPage_componentButtonText",buttonElement);
                textElement.innerHTML = componentClass.displayName;
                //add handler
                buttonElement.onclick = () => {

                    this.editorView.dom.focus();

                    var initialValues = {};
                    var parentMember = pageComponent.getParentFolderForChildren();
                    initialValues.parentId = parentMember.getId();

                    addComponent(appView,app,componentClass,initialValues,null,null);
                }
            }
        }

        //add the additional component item
        var buttonElement = apogeeui.createElementWithClass("div","visiui_litPage_componentButton",this.componentToolbarContainer);
        var textElement = apogeeui.createElementWithClass("div","visiui_litPage_componentButtonText",buttonElement);
        textElement.innerHTML = "Additional Components...";
        buttonElement.onclick = () => {

            this.editorView.dom.focus();

            var initialValues = {};
            initialValues.parentId = this.componentView.getComponent().getId();

            let appView = this.componentView.getModelView().getWorkspaceView().getAppView();

            //I tacked on a piggyback for testing!!!
            addAdditionalComponent(appView,app,initialValues,null,null);
        }
        this.componentToolbarContainer.appendChild(buttonElement);
    }


    initEditor() {
        
        //start with an empty component display
        var initialEditorState = this.componentView.getEditorData();
        
        this.editorView = this.editorManager.createEditorView(this.contentElement,this,initialEditorState);

        this.contentElement.addEventListener("click",event => this.onClickContentElement(event));

        //add the editor toolbar
        this.editorToolbarContainer.appendChild(this.editorManager.editorToolbarElement);
        
    }

    /** This is used to select the end of the document if the page is clicked below the document end. */
    onClickContentElement(event) {
        if(event.target == this.contentElement) {
            this.selectEndOfDocument();    
        }    
    }

    /** This should be called by the parent component when it is discarding the 
     * page display.  
     * @protected */
    destroy() {
        //we should probably have a less cumbesome way of doing this
        let pageComponent = this.componentView.getComponent();
        let folder = pageComponent.getParentFolderForChildren();
        var childIdMap = folder.getChildIdMap();
        var modelView = this.componentView.getModelView();
        var modelManager = modelView.getModelManager();

        for(var childName in childIdMap) {
            var childMemberId = childIdMapv[childName];
            var childComponentId = modelManager.getComponentIdByMemberId(childMemberId);
            var childComponentView = modelView.getComponentViewByComponentId(childComponentId);
            if(childComponentView) {
                childComponentView.closeComponentDisplay();
            }
        }

        if(this.tab) this.closeTab();
    }

    /** @protected */
    tabShown() {
        this.isShowing = true;
        this.dispatchEvent(apogeeui.SHOWN_EVENT,this);
    }

    /** @protected */
    tabHidden() {
        this.isShowing = false;
        this.dispatchEvent(apogeeui.HIDDEN_EVENT,this);
    }

    tabClosed() {
        //delete the page
        this.componentView.closeTabDisplay();
        this.dispatchEvent(apogeeui.CLOSE_EVENT,this);
    }
    
}

/** This is the data to load an empty page. */
LiteratePageComponentDisplay.EMPTY_PAGE_BODY = [];
