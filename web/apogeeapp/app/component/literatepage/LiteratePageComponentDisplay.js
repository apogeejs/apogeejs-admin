import base from "/apogeeutil/base.js";
import EventManager from "/apogeeutil/EventManagerClass.js";

import {addComponent, addAdditionalComponent} from "/apogeeapp/app/commandseq/addcomponentseq.js";
import {bannerConstants,getBanner,getIconOverlay} from "/apogeeapp/app/component/banner.js"; 
import PageChildComponentDisplay from "/apogeeapp/app/component/literatepage/PageChildComponentDisplay.js"

import {selectionBetween} from "/prosemirror/lib/prosemirror-view/src/selection.js";

import apogeeui from "/apogeeapp/ui/apogeeui.js";
import Tab from "/apogeeapp/ui/tabframe/Tab.js";

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

        this.editorManager = this.component.getEditorManager();

        this.loadTabEntry();

        //add a cleanup action to the base component - component must already be initialized
    //    this.addCleanupAction(LiteratePageComponentDisplay.destroy);
    };


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

    setBannerState(bannerState,bannerMessage) {
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

    updateData() {
        this.tab.setTitle(this.member.getName());
    }
    
    updateDocumentData(editorData) {
        this.editorView.updateState(editorData);
    }

    /** This creates and adds a display for the child component to the parent container. */
    addChildComponent(childComponent) {

        //-----------------
        // Get component display
        //-----------------
        var childComponentDisplay;

        //create a new component display for this child
        if(childComponent.componentGenerator.hasChildEntry) {
            childComponentDisplay = new PageChildComponentDisplay(childComponent,this);
        }

        //------------------
        // add to editor
        //------------------
        if(childComponentDisplay) {
            //set the component display
            childComponent.setComponentDisplay(childComponentDisplay);
        }
    }

    // /** This will scroll so the current selection is in view. */
    // issueScrollToViewCommand() {
    //     let state = this.component.getEditorData();
    //     let transaction = state.tr.scrollIntoView();
    //     this.component.applyTransaction(transaction); 
    // }

    /** This will move the selection to the end of the document. */
    selectStartOfDocument() {
        let state = this.component.getEditorData();
        let $startPos = state.doc.resolve(0);
        let selection = selectionBetween(this.editorView, $startPos, $startPos);
        let transaction = state.tr.setSelection(selection).scrollIntoView();
        this.component.applyTransaction(transaction);

        this.component.giveEditorFocusIfShowing();
    }

    /** This will move the selection to the end of the document. */
    selectEndOfDocument() {
        let state = this.component.getEditorData();
        let endPos = state.doc.content.size;
        let $endPos = state.doc.resolve(endPos);
        let selection = selectionBetween(this.editorView, $endPos, $endPos);
        let transaction = state.tr.setSelection(selection).scrollIntoView();
        this.component.applyTransaction(transaction);

        this.component.giveEditorFocusIfShowing();
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
        this.tab = new Tab(this.member.getId());    

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
        this.tab.addListener(apogeeui.CLOSE_EVENT,onClose);
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

        //set the selection to the end of the view
        this.selectEndOfDocument();
    }

    initComponentToolbar() {

        //THIS IS BAD - IT IS ONLY TO GET THIS WORKING AS A TRIAL
        //MAKE A WAY TO GET COMPONENT GENERATORS FOR BUTTONS RATHER THAN READING A PRIVATE VARIABLE FROM APP
        var workspaceUI = this.component.getWorkspaceUI();
        var app = workspaceUI.getApp();

        for(var i = 0; i < app.standardComponents.length; i++) {
            let key = app.standardComponents[i];
            let generator = app.componentGenerators[key];
            if(generator.hasChildEntry) {

                var buttonElement = apogeeui.createElementWithClass("div","visiui_litPage_componentButton",this.componentToolbarContainer);
                //make the idon
                var imageElement = document.createElement("img")
                imageElement.src = apogeeui.getResourcePath(generator.ICON_RES_PATH);
                var iconElement = apogeeui.createElementWithClass("div","visiui_litPage_componentButtonIcon",buttonElement);
                iconElement.appendChild(imageElement);
                //label
                var textElement = apogeeui.createElementWithClass("div","visiui_litPage_componentButtonText",buttonElement);
                textElement.innerHTML = generator.displayName;
                //add handler
                buttonElement.onclick = () => {

                    this.editorView.dom.focus();

                    var initialValues = {};
                    initialValues.parentName = this.member.getFullName();

                    addComponent(app,generator,initialValues,null,null);
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
            initialValues.parentName = this.member.getFullName();

            //I tacked on a piggyback for testing!!!
            addAdditionalComponent(app,initialValues,null,null);
        }
        this.componentToolbarContainer.appendChild(buttonElement);
    }


    initEditor() {
        
        //start with an empty component display
        var emptyEditorState = this.editorManager.createEditorState();
        
        this.editorView = this.editorManager.createEditorView(this.contentElement,this.component, this.member, emptyEditorState);

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
        this.dispatchEvent(apogeeui.SHOWN_EVENT,this);
    }

    /** @protected */
    tabHidden() {
        this.isShowing = false;
        this.dispatchEvent(apogeeui.HIDDEN_EVENT,this);
    }

    tabClosed() {
        //delete the page
        this.component.closeTabDisplay();
        this.dispatchEvent(apogeeui.CLOSE_EVENT,this);
    }
    
}

/** This is the data to load an empty page. */
LiteratePageComponentDisplay.EMPTY_PAGE_BODY = [];
