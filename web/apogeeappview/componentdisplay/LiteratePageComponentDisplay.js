import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import {EventManager} from "/apogeeutil/apogeeBaseLib.js";
import {componentInfo} from "/apogeeapp/apogeeAppLib.js";

import {addComponent, addAdditionalComponent} from "/apogeeview/commandseq/addcomponentseq.js";
import PageChildComponentDisplay from "/apogeeappview/componentdisplay/PageChildComponentDisplay.js"
import {getComponentViewClass} from "/apogeeview/componentViewInfo.js";

import {uiutil,Tab,bannerConstants,getBanner,getIconOverlay} from "/apogeeui/apogeeUiLib.js";

/** This component represents a json table object. */
export default class LiteratePageComponentDisplay {
    
    constructor(componentView) {
        //mixin initialization
        this.eventManagerMixinInit();

        this.componentView = componentView;

        this.childDisplayMap = {};
        this.editModeComponentInfos = [];
        this.inEditMode = false;

        this.isShowing = false;

        this.editorManager = this.componentView.getEditorManager();
        this.editorView = null;
        this.editorToolbarView = null;

        //elements
        this.contentElement = null;
        this.editorToolbarContainer = null;
        this.componentToolbarContainer = null;
        this.bannerContainer = null;
        this.editNoticeContainer = null;
        this.headerElement = null;

        //this is used if we have to prepopolate and child component displays
        this.standInChildComponentDisplays = {};

        //for cleanup
        this.elementsWithOnclick = [];
        this.isDestroyed = false;

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

        if(component.isFieldUpdated("editorState")) {
            let editorData = this.componentView.getEditorState();
            this.editorView.updateState(editorData);
            this._checkSelectionForNodeHighlights(editorData);
        }

        if(component.isStateUpdated()) {
            this._setBannerState();
        }
    }

    getChildComponentDisplay(name,createIfMissing) {
        //get id
        let folderComponent = this.componentView.getComponent();
        let folderMember = folderComponent.getParentFolderForChildren();
        let memberId = folderMember.lookupChildId(name);

        //lookup component
        if (memberId) {
            var modelManager = this.componentView.getApp().getModelManager();
            var childComponentId = modelManager.getComponentIdByMemberId(memberId);
            let childComponentDisplay = this.childDisplayMap[childComponentId];
            if((!childComponentDisplay)&&(createIfMissing)) {
                //we don't haven't added it yet, but we will pre-create it
                childComponentDisplay = new PageChildComponentDisplay(null, this);
                this.childDisplayMap[childComponentId] = childComponentDisplay;
            }
            return childComponentDisplay;
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
        let componentId = childComponentView.getComponent().getId();

        //create a new component display for this child
        if(childComponentView.constructor.hasChildEntry) {
            //check if there is a component display already waiting, pre-created
            childComponentDisplay = this.childDisplayMap[componentId];
            if(childComponentDisplay) {
                //set up the standin component display
                childComponentDisplay.setComponentView(childComponentView);
            }
            else {
                childComponentDisplay = new PageChildComponentDisplay(childComponentView,this);
                this.childDisplayMap[componentId] = childComponentDisplay;
            }
        }

        if(childComponentDisplay) {
            //set the child's component display
            childComponentView.setComponentDisplay(childComponentDisplay);
        }
    }

    removeChild(childComponentView) {
        let componentId = childComponentView.getComponent().getId();
        delete this.childDisplayMap[componentId];

        //make sure this isn't listed as being in edit mode
        this.notifyEditMode(false,childComponentView);
    }


    /** This is to record any state in the tab object. */
    getStateJson() {
        return null;
    }

    /** This is to restore any state in the tab object. */
    setStateJson(json) {
    }

    /** This should be called when a child display enters or leaves edit mode. */
    notifyEditMode(viewInEditMode,componentView) {
        let componentId = componentView.getComponent().getId();
        let index = this.editModeComponentInfos.findIndex( editInfo => editInfo.id == componentId );
        if(viewInEditMode) {
            if(index < 0) {
                this.editModeComponentInfos.push(this._getEditInfo(componentView));
            }
        }
        else {
            if(index >= 0) {
                this.editModeComponentInfos.splice(index,1);
            }
        }
        let inEditMode = (this.editModeComponentInfos.length > 0);

        this._setEditMode(inEditMode);
    }

    //===============================
    // Private Functions
    //===============================

    /** This retrieves the format of data to store for tracking edit mode in cells. */
    _getEditInfo(componentView) {
        let component = componentView.getComponent();
        return {id: component.getId(), name: component.getName()}
    }

    /** This sets edit mode in the display. */
    _setEditMode(inEditMode) {
        //set component edit mode
        this.inEditMode = inEditMode;

        if(inEditMode) {
            let msg = "Cells being edited: " + this._getNameListFromEditInfos();
            this.editNoticeContainer.innerHTML = msg;
        }
        else {
            this.editNoticeContainer.innerHTML = "";
        }
            
    }

    /** This constructs the name list for the current edito components. */
    _getNameListFromEditInfos() {
        return this.editModeComponentInfos.map(editInfo => editInfo.name).join(", ");
    }


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

        this.tabShownListener = () => this.tabShown();
        this.tabHiddenListener = () => this.tabHidden();
        this.tabClosedListener = () => this.tabClosed();
        this.beforeTabCloseHandler = () => this.beforeTabClose();
        this.tab.addListener(uiutil.SHOWN_EVENT,this.tabShownListener);
        this.tab.addListener(uiutil.HIDDEN_EVENT,this.tabHiddenListener);
        this.tab.addListener(uiutil.CLOSE_EVENT,this.tabClosedListener);
        this.tab.addHandler(uiutil.REQUEST_CLOSE,this.beforeTabCloseHandler);

        //------------------
        // set icon
        //------------------
        this.tab.setIconUrl(this.componentView.getIconUrl());

        //-----------------
        //set the tab title
        //-----------------
        this.tab.setTitle(this.componentView.getName());

        //-----------------
        // apply the banner state
        //-----------------
        this._setBannerState();
    }

    _setBannerState() {
        let bannerState = this.componentView.getBannerState();
        let bannerMessage = this.componentView.getBannerMessage();

        uiutil.removeAllChildren(this.bannerContainer);
        if(bannerState == bannerConstants.BANNER_TYPE_NONE) {
           //no action
        }
        else {
            var banner = getBanner(bannerMessage,bannerState);
            this.bannerContainer.appendChild(banner);
        }

        if(this.tab) {
            var iconOverlay = getIconOverlay(bannerState,bannerMessage);
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
        this.headerElement = uiutil.createElementWithClass("div","visiui_litPage_header",null);
        this.tab.setHeaderContent(this.headerElement);

        this.editorToolbarContainer = uiutil.createElementWithClass("div","visiui_litPage_editorToolbar",this.headerElement);
        this.componentToolbarContainer = uiutil.createElementWithClass("div","visiui_litPage_componentToolbar",this.headerElement);
        this.bannerContainer = uiutil.createElementWithClass("div","visiui_litPage_banner",this.headerElement);
        this.editNoticeContainer = uiutil.createElementWithClass("div","visiui_litPage_editNotice",this.headerElement);
        this.initComponentToolbar();

        //-------------------
        //page body
        //-------------------
        this.contentElement = uiutil.createElementWithClass("div","visiui_litPage_body",null);
        this.tab.setContent(this.contentElement);

        let pageComponent = this.componentView.getComponent();
        let folder = pageComponent.getParentFolderForChildren();

        //show all children
        var appViewInterface = this.componentView.getAppViewInterface();
        var childrenIds = folder.getChildIdMap();
        for(var childName in childrenIds) {
            var childMemberId = childrenIds[childName];
            var childComponentView = appViewInterface.getComponentViewByMemberId(childMemberId);
            if(childComponentView) {
                this.addChild(childComponentView);
            }
        }
        
        this.initEditor();
    }

    initComponentToolbar() {

        //THIS IS BAD - IT IS ONLY TO GET THIS WORKING AS A TRIAL
        //MAKE A WAY TO GET COMPONENT GENERATORS FOR BUTTONS RATHER THAN READING A PRIVATE VARIABLE FROM APP
        let pageComponent = this.componentView.getComponent();
        var app = this.componentView.getApp();
        var appViewInterface = this.componentView.getAppViewInterface();
        

        let standardComponentNames = componentInfo.getStandardComponentNames();
        for(var i = 0; i < standardComponentNames.length; i++) {
            let componentName = standardComponentNames[i];

            let componentClass = componentInfo.getComponentClass(componentName);
            let componentViewClass = getComponentViewClass(componentClass.uniqueName);
            if(componentViewClass.hasChildEntry) {

                var buttonElement = uiutil.createElementWithClass("div","visiui_litPage_componentButton",this.componentToolbarContainer);
                //make the idon
                var imageElement = document.createElement("img")
                imageElement.src = uiutil.getResourcePath(componentViewClass.ICON_RES_PATH);
                var iconElement = uiutil.createElementWithClass("div","visiui_litPage_componentButtonIcon",buttonElement);
                iconElement.appendChild(imageElement);
                //label
                var textElement = uiutil.createElementWithClass("div","visiui_litPage_componentButtonText",buttonElement);
                textElement.innerHTML = componentClass.displayName;
                buttonElement.title = "Insert " + componentClass.displayName;
                //add handler
                buttonElement.onclick = () => {

                    this.editorView.focus();

                    var initialValues = {};
                    var parentMember = pageComponent.getParentFolderForChildren();
                    initialValues.parentId = parentMember.getId();

                    addComponent(appViewInterface,app,componentClass,initialValues,null,null);
                }

                //for cleanup
                this.elementsWithOnclick.push(buttonElement);
            }
        }

        //add the additional component item
        var buttonElement = uiutil.createElementWithClass("div","visiui_litPage_componentButton",this.componentToolbarContainer);
        var textElement = uiutil.createElementWithClass("div","visiui_litPage_componentButtonText",buttonElement);
        textElement.innerHTML = "Additional Components...";
        buttonElement.title = "Additional Cells to Insert"
        buttonElement.onclick = () => {

            this.editorView.focus();

            var initialValues = {};
            var parentMember = pageComponent.getParentFolderForChildren();
            initialValues.parentId = parentMember.getId();

            let appViewInterface = this.componentView.getAppViewInterface();

            //I tacked on a piggyback for testing!!!
            addAdditionalComponent(appViewInterface,app,initialValues,null,null);
        }
        //for cleanup
        this.elementsWithOnclick.push(buttonElement);

        this.componentToolbarContainer.appendChild(buttonElement);
    }


    initEditor() {
        
        //start with an empty component display
        var initialEditorState = this.componentView.getEditorState();
        
        let { editorView, toolbarView, plugins } = this.editorManager.createEditorView(this.contentElement,this,initialEditorState);
        this.editorView = editorView;
        this.editorToolbarView = toolbarView;

        this.contentElement.onclick = event => this.onClickContentElement(event);
        this.elementsWithOnclick.push(this.contentElement);

        //add the editor toolbar
        this.editorToolbarContainer.appendChild(this.editorToolbarView.getElement());

        //we need to call a command to set the plugins on the editor state
        let pageComponent = this.componentView.getComponent();
        var app = this.componentView.getApp();

        //we need to initialize the components in the editor state for this component
        let command = {};
        command.type = "literatePagePlugins";
        command.componentId = pageComponent.getId();
        command.plugins = plugins;

        //execute the command asynchronously - this may be triggered by another command (such as open workspace)
        setTimeout(() => app.executeCommand(command));
        
        
    }

    /** This is used to select the end of the document if the page is clicked below the document end. */
    onClickContentElement(event) {
        if(event.target == this.contentElement) {
            this.componentView.giveEditorFocusIfShowing();
            let command = this.componentView.getSelectEndOfDocumentCommand();
            let app = this.componentView.getApp();
            app.executeCommand(command);
        }    
    }

    /** This function sets any apogee nodes included in the selection to be highlighted. */
    _checkSelectionForNodeHighlights(editorData) {
        let { empty, from, to } = editorData.selection;
        if(empty) {
            from = -1;
            to = -1;
        }
 
        let document = editorData.doc;
        let schema = editorData.schema;
        //travers doc, finding apogee nodes and setting their selection state
        document.forEach( (node,offset) => {
            if(node.type === schema.nodes.apogeeComponent) {
                let inSelection = ((offset >= from)&&(offset < to));
                let nodeName = node.attrs["name"];
                this._setApogeeNodeHighlight(nodeName,inSelection);
            }
            //do not recurse into children
            return false;
        });

    }

    /** This function sets the highlight state for the given node. */
    _setApogeeNodeHighlight(childName,inSelection) {
        let childComponentDisplay = this.getChildComponentDisplay(childName,false);
        if(childComponentDisplay) childComponentDisplay.setHighlight(inSelection); 
    }
    

    /** This should be called by the parent component when it is discarding the 
     * page display.  
     * @protected */
    destroy() {
        if(this.isDestroyed) return;

        //close tab if it is still present
        if(this.tab) this.closeTab();

        //child components
        //we should probably have a less cumbesome way of doing this
        let pageComponent = this.componentView.getComponent();
        let folder = pageComponent.getParentFolderForChildren();
        var childIdMap = folder.getChildIdMap();
        var appViewInterface = this.componentView.getAppViewInterface();
        for(var childName in childIdMap) {
            var childMemberId = childIdMap[childName];
            var childComponentView = appViewInterface.getComponentViewByMemberId(childMemberId);
            if(childComponentView) {
                childComponentView.closeComponentDisplay();
            }
        }

        for(let memberId in this.childDisplayMap) {
            let childDisplay = this.childDisplayMap[memberId];
            let childComponentView = childDisplay.getComponentView();
            childComponentView.closeComponentDisplay();
        }
        this.childDisplayMap = [];

        //we need to initialize the components in the editor state for this component
        let command = {};
        command.type = "literatePagePlugins";
        command.componentId = pageComponent.getId();
        command.plugins = [];
        
        //execute the command asynchronously - this may be triggered by another command (such as close workspace)
        setTimeout(() => this.componentView.getApp().executeCommand(command));
        
        //editor view
        if(this.editorView) {
            this.editorView.destroy();
            this.editorView = null;
        }

        //editor toolbar
        if(this.editorToolbarView) {
            this.editorToolbarView.destroy();
            this.editorToolbarView = null;
        }

        //handler cleanmup
        this.elementsWithOnclick.forEach( element => {
            element.onclick = null;
        })

        //remove elements
        if(this.contentElement) this.contentElement.remove();
        if(this.editorToolbarContainer) this.editorToolbarContainer.remove();
        if(this.componentToolbarContainer) this.componentToolbarContainer.remove();
        if(this.bannerContainer) this.bannerContainer.remove();
        if(this.headerElement) this.headerElement.remove();

        this.isDestroyed = true;
    }

    /** @protected */
    tabShown() {
        this.isShowing = true;
        if(this.editorView) {
            this.editorView.focus();
            if(this.editorView.state) {
                let tr = this.editorView.state.tr;
                tr.scrollIntoView();
                setTimeout(() => {
                    //make sure editor view is still here
                    if(this.editorView) this.editorView.dispatch(tr)
                },0);
            }
        }
        this.dispatchEvent(uiutil.SHOWN_EVENT,this);
    }

    /** @protected */
    tabHidden() {
        this.isShowing = false;
        this.dispatchEvent(uiutil.HIDDEN_EVENT,this);
    }

    tabClosed() {
        //delete the page
        if(this.tabShownListener) {
            this.tab.removeListener(uiutil.SHOWN_EVENT,this.tabShownListener);
            this.tabShownListener = null;
        }
        if(this.tabHiddenListener) {
            this.tab.removeListener(uiutil.HIDDEN_EVENT,this.tabHiddenListener);
            this.tabHiddenListener = null;
        }
        if(this.tabClosedListener) {
            this.tab.removeListener(uiutil.CLOSE_EVENT,this.tabClosedListener);
            this.tabClosedListener = null;
        }
        this.componentView.closeTabDisplay();
        this.dispatchEvent(uiutil.CLOSE_EVENT,this);
    }

    beforeTabClose() {
        if(this.inEditMode) {
            let msg = "Please save or cancel the following cells: " + this._getNameListFromEditInfos();
            apogeeUserAlert(msg);
            return uiutil.DENY_CLOSE;
        }
        
        //anything besides deny close is ok
        return true;
    }
    
}

//add mixins to this class
apogeeutil.mixin(LiteratePageComponentDisplay,EventManager);

/** This is the data to load an empty page. */
LiteratePageComponentDisplay.EMPTY_PAGE_BODY = [];
