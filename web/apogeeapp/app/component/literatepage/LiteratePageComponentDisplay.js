/** This component represents a json table object. 
 * The member argument is the main member for this component. The folder argument is 
 * the parent folde associated with this component, which may be different from the
 * main member, which is the case for the folder function. */
apogeeapp.app.LiteratePageComponentDisplay = function(component,member,folder) {
    
    //base init
    apogee.EventManager.init.call(this);
    
    if(!apogeeapp.app.LiteratePageComponentDisplay.quillInitialized()) {
        apogeeapp.app.LiteratePageComponentDisplay.initializeQuill();
    }
    
    this.component = component;
    this.member = member;
    this.folder = folder;
    
    this.isShowing = false;
    
    //these are the editor blots that represent components
    this.blotMap = {};
    
    this.loadTabEntry();
    
    //add a cleanup action to the base component - component must already be initialized
//    this.addCleanupAction(apogeeapp.app.EditDisplayContent.destroy);
};

//add components to this class
apogee.base.mixin(apogeeapp.app.LiteratePageComponentDisplay,apogee.EventManager);

/** This is the data to load an empty page. */
apogeeapp.app.LiteratePageComponentDisplay.EMPTY_PAGE_BODY = [];

apogeeapp.app.LiteratePageComponentDisplay.prototype.getTab = function() {
    return this.tab;
}

apogeeapp.app.LiteratePageComponentDisplay.prototype.closeTab = function() {
    if(this.tab) {
        this.tab.close();
        this.tab = null;
    }
}

apogeeapp.app.LiteratePageComponentDisplay.prototype.getIsShowing = function() {
    return this.isShowing;
}

apogeeapp.app.LiteratePageComponentDisplay.prototype.setBannerState = function(bannerState,bannerMessage) {
    if(bannerState == apogeeapp.app.banner.BANNER_TYPE_NONE) {
       this.tab.setHeaderContent(null);
    }
    else {
        var banner = apogeeapp.app.banner.getBanner(bannerMessage,bannerState);
        this.tab.setHeaderContent(banner);
    }
    
    if(this.tab) {
        var iconOverlay = apogeeapp.app.banner.getIconOverlay(bannerState);
        if(iconOverlay) {
            this.tab.setIconOverlay(iconOverlay);
        }
        else {
            this.tab.clearIconOverlay();
        }
    }
}

apogeeapp.app.LiteratePageComponentDisplay.prototype.updateData = function() {
    this.tab.setTitle(this.member.getName());
}

/** This method is used to bring the child component to the front. */
apogeeapp.app.LiteratePageComponentDisplay.prototype.showChildComponent = function(childComponent) {
    var childComponentDisplay = childComponent.getComponentDisplay();
    if(childComponentDisplay) {
        alert("Not implemented!");
    }
}

/** This creates and adds a display for the child component to the parent container. */
apogeeapp.app.LiteratePageComponentDisplay.prototype.addChildComponent = function(childComponent) {
    
    //-----------------
    // Get component display
    //-----------------
    var childComponentDisplay;
    var componentDisplayOptions = childComponent.getComponentDisplayOptions();
    
    //create a new component display for this child
    if(childComponent.isEditComponent) {
        childComponentDisplay = new apogeeapp.app.PageChildComponentDisplay(childComponent,this,componentDisplayOptions);
    }
    else if(childComponent.isParentComponent) {
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


/** This method creates a page entry for the child. */
apogeeapp.app.LiteratePageComponentDisplay.prototype.insertChildIntoDisplay = function(childName) {
    //this should be fixed - replace a range if there is one, add to end if no active range.
    var range = this.quill.getSelection();
    
if(!range) {
    //if range not set, put the cursor at the end
    var pageLength = this.quill.getLength();
    this.quill.setSelection(pageLength,0,'api');
    range = this.quill.getSelection();
}

    var value = { 
        name: childName,
        parent: this.folder.getFullName()
    };
    this.quill.insertText(range.index, '\n', Quill.sources.USER);
    this.quill.insertEmbed(range.index + 1, 'apogeedisplay', value, Quill.sources.USER);
    this.quill.insertText(range.index + 2, '\n', Quill.sources.USER);
    this.quill.setSelection(range.index + 3, Quill.sources.SILENT);
}

/** This is to record any state in the tab object. */
apogeeapp.app.LiteratePageComponentDisplay.prototype.registerBlot = function(blot, name) {
    this.blotMap[name] = blot;

    //if we already have the component and component display for this component, set it on the blot
    var childMember = this.folder.getChildMap()[name];
    if(childMember) {
        var workspaceUI = this.component.getWorkspaceUI();
        var childComponent = workspaceUI.getComponent(childMember);
        var childComponentDisplay;
        if((childComponent)&&(childComponentDisplay = childComponent.getComponentDisplay())) {
            blot.setComponentDisplay(childComponentDisplay);
        }
    }
}

/** This is to record any state in the tab object. */
apogeeapp.app.LiteratePageComponentDisplay.prototype.getStateJson = function() {
    var json;
    if(this.quill) {
        json = this.readStateJson();
    }
    else if(this.storedContent) {
        json = this.storedContent;
    }
    return json;
}

/** This is to restore any state in the tab object. */
apogeeapp.app.LiteratePageComponentDisplay.prototype.setStateJson = function(json) {
    if(this.quill) {
        this.applyStateJson(json);
    }
    else {
        this.storedContent = json;
    }
}

//===============================
// Private Functions
//===============================

/** @private */
apogeeapp.app.LiteratePageComponentDisplay.prototype.readStateJson = function() {
    var json = {};
    json.pageBody = this.quill.getContents().ops;
    return json;
}

/** This method loads the given state json into the page text editor
 * @private */
apogeeapp.app.LiteratePageComponentDisplay.prototype.applyStateJson = function(json) {
    if(this.quill) {
        var pageBody;
        if((json)&&(json.pageBody)) {
            pageBody = json.pageBody;
        }
        else {
            pageBody = apogeeapp.app.LiteratePageComponentDisplay.EMPTY_PAGE_BODY;
        }
        this.quill.setContents(pageBody,'api');
        
        //clear the stored content, since it will get out of date
        this.storedContent = null;
    }
}

/** @private */
apogeeapp.app.LiteratePageComponentDisplay.prototype.loadTabEntry = function() {
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
    var instance = this;
    var createMenuItemsCallback = function() {
        return instance.component.getMenuItems();
    }
    menu.setAsOnTheFlyMenu(createMenuItemsCallback);
    
    //-----------------
    //set the tab title
    //-----------------
    this.tab.setTitle(this.member.getName());
    
    //-----------------------------
    //add the handlers for the tab
    //-----------------------------
    var instance = this;
    var onClose = function() {
        instance.component.closeTabDisplay();
        instance.destroy();
    }
    this.tab.addListener(apogeeapp.ui.CLOSE_EVENT,onClose);
}

apogeeapp.app.LiteratePageComponentDisplay.PARENT_CONTAINER_STYLE = {
    "position":"relative",
    "display":"table",
    "width":"100%",
    "height":"100%",
    "top":"0px",
    "left":"0px"
}

 /** @private */
apogeeapp.app.LiteratePageComponentDisplay.prototype.createDisplayContent = function() {
   
    this.contentElement = apogeeapp.ui.createElement("div",null,apogeeapp.app.LiteratePageComponentDisplay.PARENT_CONTAINER_STYLE);

    //we ony use this context menu and child map for parents
    //modify if we use this elsewhere
    if(!this.folder.isParent) return;

    var container = document.createElement("div");
    this.contentElement.appendChild(container);
    var options = {};
    options.theme = 'snow';
    this.quill = new Quill(container,options);
    
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
    
    //add content if we have it
    if(this.storedContent) {
        this.applyStateJson(this.storedContent);
    }
}

/** This should be called by the parent component when it is discarding the 
 * page display.  
 * @protected */
apogeeapp.app.LiteratePageComponentDisplay.prototype.destroy = function() {
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
apogeeapp.app.LiteratePageComponentDisplay.prototype.tabShown = function() {
    this.isShowing = true;
    this.dispatchEvent(apogeeapp.ui.SHOWN_EVENT,this);
}

/** @protected */
apogeeapp.app.LiteratePageComponentDisplay.prototype.tabHidden = function() {
    this.isShowing = false;
    this.dispatchEvent(apogeeapp.ui.HIDDEN_EVENT,this);
}

apogeeapp.app.LiteratePageComponentDisplay.prototype.tabClosed = function() {
    //delete the page
    this.component.closeTabDisplay();
    this.dispatchEvent(apogeeapp.ui.CLOSE_EVENT,this);
}

//===========================
// Static methods for editor initialization
//===========================
apogeeapp.app.LiteratePageComponentDisplay.quillInitDone = false;
apogeeapp.app.LiteratePageComponentDisplay.quillInitialized = function() {
    return apogeeapp.app.LiteratePageComponentDisplay.quillInitDone;
}

/** Here we initialize quill, for one thing loading our custom component that
 * will represent the apogee component. */
apogeeapp.app.LiteratePageComponentDisplay.initializeQuill = function() {
    var BlockEmbed = Quill.import('blots/block/embed');
    //apogee custom  blot
    class ApogeeDisplayBlot extends BlockEmbed {
        static create(value) {
            var node = super.create();
            node.setAttribute('parent',value.parent);
            node.setAttribute('name',value.name);
                       
            try {
                //register this blot with the parent component
                var app = apogeeapp.app.Apogee.getInstance();
                var workspaceUI = app.getWorkspaceUI();
                var workspace = workspaceUI.getWorkspace();
                var parent = workspace.getMemberByFullName(value.parent);
                var parentComponent = workspaceUI.getComponent(parent);
                var parentTabDisplay = parentComponent.getTabDisplay();
                parentTabDisplay.registerBlot(node,value.name);
            }
            catch(error) {
                console.log("Error adding blot to component!")
                console.error(error.stack);
            }
            
            return node;
        }

        static value(node) {
            return {
                name: node.getAttribute('name'),
                parent: node.getAttribute('parent')
            };
        }    
    };
    ApogeeDisplayBlot.blotName = 'apogeedisplay';
    ApogeeDisplayBlot.tagName = 'apogee-element';
    Quill.register(ApogeeDisplayBlot);	
    
    apogeeapp.app.LiteratePageComponentDisplay.quillInitDone = true;
}



