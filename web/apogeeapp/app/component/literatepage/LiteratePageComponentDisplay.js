import base from "/apogeeutil/base.js";
import EventManager from "/apogeeutil/EventManagerClass.js";
import proseMirror from "/apogeeapp/app/component/literatepage/proseMirrorSetup.js";

import {addComponent, addAdditionalComponent} from "/apogeeapp/app/commandseq/addcomponentseq.js";
import {bannerConstants,getBanner,getIconOverlay} from "/apogeeapp/app/component/banner.js"; 
import PageChildComponentDisplay from "/apogeeapp/app/component/literatepage/PageChildComponentDisplay.js"

/** This component represents a json table object. 
 * The member argument is the main member for this component. The folder argument is 
 * the parent folde associated with this component, which may be different from the
 * main member, which is the case for the folder function. */
export default class LiteratePageComponentDisplay extends EventManager {
    
    constructor(component,member,folder) {
        super();

        this.component = component;
        this.member = member;
        this.folder = folder;

        this.isShowing = false;

        this.loadTabEntry();

        //add a cleanup action to the base component - component must already be initialized
    //    this.addCleanupAction(LiteratePageComponentDisplay.destroy);
    };


    getTab() {
        return this.tab;
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

    setBannerState(bannerState,bannerMessage) {
        apogeeapp.ui.removeAllChildren(this.bannerElement);
        if(bannerState == bannerConstants.BANNER_TYPE_NONE) {
           //no action
        }
        else {
            var banner = getBanner(bannerMessage,bannerState);
            this.bannerElement.appendChild(banner);
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

    updateData() {
        this.tab.setTitle(this.member.getName());
    }
    
    updateDocumentData(editorData) {
        this.editorView.updateState(editorData);
    }

    /** This method is used to bring the child component to the front. */
    showChildComponent(childComponent) {
        //########################################
        //NOTE - this will change if we get rid of child entries in the tree
        //########################################
        
        var childComponentDisplay = childComponent.getComponentDisplay();
        if(childComponentDisplay) {
            alert("Not implemented!");
        }
    }

    /** This creates and adds a display for the child component to the parent container. */
    addChildComponent(childComponent) {

        //-----------------
        // Get component display
        //-----------------
        var childComponentDisplay;
        var childDisplayState = childComponent.getChildDisplayState();

        //create a new component display for this child
        if(childComponent.componentGenerator.isEditComponent) {
            childComponentDisplay = new PageChildComponentDisplay(childComponent,this,childDisplayState);
        }
        else if(childComponent.componentGenerator.isParentComponent) {
            //don't display the child parents!
        }
        else {
            throw new Error("Unrecognized child component type! " + childComponent.constructor)
        }

        //------------------
        // add to editor
        //------------------
        if(childComponentDisplay) {
            //set the component display
            childComponent.setComponentDisplay(childComponentDisplay);
        }
    }

    /** This is to record any state in the tab object. */
    getStateJson() {
        return null;
//        return this.editorView.state.toJSON();
    }

    /** This is to restore any state in the tab object. */
    setStateJson(json) {
        return null
//        var editorState = proseMirror.createEditorState(json.doc);
//        this.editorView.updateState(editorState);
    }

    //===============================
    // Private Functions
    //===============================

    /** @private */
    loadTabEntry() {
        this.tab = new apogeeapp.ui.Tab(this.member.getId());    

        //-----------------------
        //set the content
        //-----------------------
        this.createDisplayContent();
        this.tab.setContent(this.contentElement,apogeeapp.ui.FIXED_SIZE);

        if(this.tab.getIsShowing()) {
            this.tabShown()
        }
        else {
            this.tabHidden()
        }
        this.tab.addListener(apogeeapp.ui.SHOWN_EVENT,() => this.tabShown());
        this.tab.addListener(apogeeapp.ui.HIDDEN_EVENT,() => this.tabHidden());
        this.tab.addListener(apogeeapp.ui.CLOSE_EVENT,() => this.tabClosed());

        //------------------
        // set menu
        //------------------
        var menu = this.tab.createMenu(this.component.getIconUrl());
        var createMenuItemsCallback = () => {
            return this.component.getMenuItems();
        }
        menu.setAsOnTheFlyMenu(createMenuItemsCallback);

        //-----------------
        //set the tab title
        //-----------------
        this.tab.setTitle(this.member.getName());

        //-----------------------------
        //add the handlers for the tab
        //-----------------------------
        var onClose = () => {
            this.component.closeTabDisplay();
            this.destroy();
        }
        this.tab.addListener(apogeeapp.ui.CLOSE_EVENT,onClose);
    }

     /** @private */
    createDisplayContent() {

        //-----------
        //page header
        //------------
        this.headerElement = apogeeapp.ui.createElementWithClass("div","visiui_litPage_header",null);
        this.tab.setHeaderContent(this.headerElement);

        this.bannerElement = apogeeapp.ui.createElementWithClass("div","visiui_litPage_banner",this.headerElement);
//        this.editorToolbarElement = apogeeapp.ui.createElementWithClass("div","visiui_litPage_editorToolbar",this.headerElement);
        this.componentToolbarElement = apogeeapp.ui.createElementWithClass("div","visiui_litPage_componentToolbar",this.headerElement);

//        this.initEditorToolbar();
        this.initComponentToolbar();

        //-------------------
        //page body
        //-------------------
        this.contentElement = apogeeapp.ui.createElementWithClass("div","visiui_litPage_body",null);
        this.tab.setContent(this.contentElement,apogeeapp.ui.FIXED_SIZE);

        //we ony use this context menu and child map for parents
        //modify if we use this elsewhere
        if(!this.folder.isParent) return;

        this.initEditor();

        //show all children
        var workspaceUI = this.component.getWorkspaceUI();
        var children = this.folder.getChildMap();
        for(var childName in children) {
            var child = children[childName];
            var childComponent = workspaceUI.getComponent(child);
            if(childComponent) {
                this.addChildComponent(childComponent);
            }
        }
        
        var editorData = this.component.getEditorData();
        this.editorView.updateState(editorData);
    }

    initComponentToolbar() {
        
        //########################################
        // rewrite this for prosemirror
        //########################################
        //
        //we will add a button for each standard component, and a button for the additional components

        //THIS IS BAD - IT IS ONLY TO GET THIS WORKING AS A TRIAL
        //MAKE A WAY TO GET COMPONENT GENERATORS FOR BUTTONS RATHER THAN READING A PRIVATE VARIABLE FROM APP
        var workspaceUI = this.component.getWorkspaceUI();
        var app = workspaceUI.getApp();

        for(var i = 0; i < app.standardComponents.length; i++) {
            let key = app.standardComponents[i];
            let generator = app.componentGenerators[key];

            var buttonElement = document.createElement("button");
            buttonElement.innerHTML = generator.displayName;
            buttonElement.onclick = () => {

                var initialValues = {};
                initialValues.parentName = this.member.getFullName();

                addComponent(app,generator,initialValues,null,null);
            }
            this.componentToolbarElement.appendChild(buttonElement);
        }

        //add the additional component item
        var buttonElement = document.createElement("button");
        buttonElement.innerHTML = "Additional Components";
        buttonElement.onclick = () => {

            var initialValues = {};
            initialValues.parentName = this.member.getFullName();

            //I tacked on a piggyback for testing!!!
            addAdditionalComponent(app,initialValues,null,null);
        }
        this.componentToolbarElement.appendChild(buttonElement);
    }


    initEditor() {
        
        //########################################
        // rewrite this for prosemirror
        //########################################

        var container = document.createElement("div");
        this.contentElement.appendChild(container);
        
        //start with an empty component display
        var emptyEditorState = proseMirror.createEditorState();
        
        this.editorView = proseMirror.createEditorView(container,this.component, this.member, emptyEditorState);
        
    }

    /** This should be called by the parent component when it is discarding the 
     * page display.  
     * @protected */
    destroy() {
        var children = this.folder.getChildMap();
        var workspaceUI = this.component.getWorkspaceUI();

        for(var childName in children) {
            var child = children[childName];
            var childComponent = workspaceUI.getComponent(child);
            if(childComponent) {
                childComponent.closeComponentDisplay();
            }
        }

        if(this.tab) this.closeTab();
    }

    /** @protected */
    tabShown() {
        this.isShowing = true;
        this.dispatchEvent(apogeeapp.ui.SHOWN_EVENT,this);
    }

    /** @protected */
    tabHidden() {
        this.isShowing = false;
        this.dispatchEvent(apogeeapp.ui.HIDDEN_EVENT,this);
    }

    tabClosed() {
        //delete the page
        this.component.closeTabDisplay();
        this.dispatchEvent(apogeeapp.ui.CLOSE_EVENT,this);
    }
    
}

/** This is the data to load an empty page. */
LiteratePageComponentDisplay.EMPTY_PAGE_BODY = [];
