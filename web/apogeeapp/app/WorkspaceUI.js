/** This class manages the user interface for a workspace object. */
apogeeapp.app.WorkspaceUI = class {

    constructor() {

        this.workspace = null;
        this.fileMetadata = null;

        //properties
        this.app = null;
        this.tabFrame = null;
        this.tree = null;
        this.treeEntry = null;
        this.componentMap = {};
        this.referencesManager = new apogeeapp.app.ReferenceManager();
    }

    //====================================
    // Workspace Management
    //====================================

    /** This sets the application. It must be done before the workspace is set. */
    setApp(app,tabFrame,treePane) {
        this.app = app;
        this.tabFrame = tabFrame;

        //omit tree if tree pane is missing 
        if(treePane) {
            this.tree = new apogeeapp.ui.treecontrol.TreeControl();
            apogeeapp.ui.removeAllChildren(treePane);
            treePane.appendChild(this.tree.getElement());
        }

        this.treeEntry = null;
        
        //listen to the workspace dirty event from the app
        this.app.addListener("workspaceDirty",() => this.setIsDirty());
    }

    /** This gets the application instance. */
    getApp() {
        return this.app;
    }

     /** This method sets the workspace. The argument workspaceJson should be included
      * if the workspace is not empty, such as when opening a existing workspace. It
      * contains the data for the component associated with each workspace member. For 
      * a new empty workspace the workspaceJson should be omitted. */
    load(workspaceJson) { 

        var workspaceComponentsJson;
        var actionResult;

        //create workspace
        this.workspace = new apogee.Workspace(workspaceDataJson);
        if(workspaceJson) {
            actionResult = this.workspace.loadFromJson(workspaceJson.data);
            workspaceComponentsJson = workspaceJson.components;
        }
        else {
            actionResult = this.workspace.initializeNewWorkspace();
            workspaceComponentsJson = apogeeapp.app.FolderComponent.EMPTY_FOLDER_COMPONENT_JSON;
        }

        //set up the root folder conmponent, with children if applicable
        var rootFolder = this.workspace.getRoot();
        var success = apogeeapp.app.addcomponent.createComponentFromMember(workspaceUI,actionResult,workspaceComponentsJson);
        var rootFolderComponent = this.getComponent(rootFolder);

        //set up the tree (if tree in use)
        if(this.tree) {
            this.treeEntry = this.createTreeEntry();
            this.treeEntry.setState(apogeeapp.ui.treecontrol.EXPANDED);
            this.tree.setRootEntry(this.treeEntry);
            this.treeEntry.addChild(rootFolderComponent.getTreeEntry(true));
            this.treeEntry.addChild(this.referencesManager.getTreeEntry(true));
        }

        //add listeners
        //this.workspace.addListener(apogee.createmember.MEMBER_CREATED_EVENT, eventInfo => this.memberCreated(eventInfo));
        this.workspace.addListener(apogee.updatemember.MEMBER_UPDATED_EVENT, eventInfo => this.memberUpdated(eventInfo));
        this.workspace.addListener(apogee.deletemember.MEMBER_DELETED_EVENT, eventInfo => this.memberDeleted(eventInfo));
        this.workspace.addListener(apogee.updateworkspace.WORKSPACE_UPDATED_EVENT, () => this.workspaceUpdated());

        //process the workspace state - open tabs
        if(workspaceJson) {
            if(this.tabFrame) {
                if(workspaceJson.openTabs) {
                    workspaceJson.openTabs.map(memberName => {
                        var openTabMember = this.workspace.getMemberByFullName(memberName);
                        if(openTabMember) {
                            var openTabComponent = this.getComponent(openTabMember);
                            openTabComponent.createTabDisplay();
                        }
                    });
                    if(workspaceJson.activeTabMember) {
                        var activeTabMember = this.workspace.getMemberByFullName(workspaceJson.activeTabMember);
                        if(activeTabMember) {
                           this.tabFrame.setActiveTab(activeTabMember.getId());
                        }
                    }
                }
            }
        }
    }

    /** This method gets the workspace object. */
    getWorkspace() {
        return this.workspace;
    }

    getTabFrame() {
        return this.tabFrame;
    }


    /** This method gets the workspace object. */
    close() {
        //delete all the components - to make sure the are cleaned up
        for(var key in this.componentMap) {
            var componentInfo = this.componentMap[key];
            if((componentInfo)&&(componentInfo.component)&&(!componentInfo.componentMember)) {
                componentInfo.component.onDelete();
            }
        }

        //remove tree entry (if tree active)
        if(this.tree) {
            this.tree.clearRootEntry();
        }

        //remove links
        this.referencesManager.close();
    }
    
    getIsDirty() {
        return this.isDirty;
        
    }
    
    setIsDirty() {
        this.isDirty = true;
    }
    
    clearIsDirty() {
        this.isDirty = false;
    }

    //====================================
    // Component Management
    //====================================

    /** This method gets the component associated with a member object. */
    getComponent(member) {
        var componentInfo = this.componentMap[member.getId()];
        if(componentInfo) {
            return componentInfo.component;
        }
        else {
            return null;
        }
    }

    /** This method gets the component associated with a member object. */
    getComponentById(memberId) {
        var componentInfo = this.componentMap[memberId];
        if(componentInfo) {
            return componentInfo.component;
        }
        else {
            return null;
        }
    }

    /** This returns the map of folder objects. */
    getFolders() {
        var folders = {}
        for(var key in this.componentMap) {
            var componentInfo = this.componentMap[key];
            var member = componentInfo.member;
            if((member.isParent)&&(member.getChildrenWriteable())) { 
                folders[member.getFullName()] = member;
            }
        }
        return folders;
    }

    /** This method registers a member data object and its associated component object.
     * If the member is not the main member assoicated with component but instead an included
     * member, the main componentMember should be passed in also. Otherwise it should be left 
     * undefined. */
    registerMember(member,component,mainComponentMember) {

        //make sure this is for us
        if(member.getWorkspace() !== this.workspace) {
            throw apogee.base.createError("Component registered in wrong workspace: " + member.getFullName());
        }

        //store the ui object
        var memberId = member.getId();

        if(this.componentMap[memberId]) {
            //already exists! (we need to catch this earlier if we want it to not be fatal. But we should catch it here too.)
            throw apogee.base.createError("There is already a member with the given ID.",true);
        }

        var componentInfo = {};
        componentInfo.member = member;
        componentInfo.component = component;
        if(mainComponentMember) componentInfo.componentMember = mainComponentMember;

        this.componentMap[memberId] = componentInfo;

    }
    
    testPrint(eventInfo) {
        console.log("Event: " + eventInfo.event + "; Name: " + eventInfo.member.getFullName());
        if(eventInfo.updated) {
            console.log(JSON.stringify(eventInfo.updated));
        }
    }
    
    /** This method responds to a member updated. */
    memberCreated(eventInfo) {
        
        this.testPrint(eventInfo);
        
        //store the ui object
        var member = eventInfo.member;
        var key = member.getId();

//        var componentInfo = this.componentMap[key];
//        if((componentInfo)&&(componentInfo.component)) {
//            componentInfo.component.memberCreated();
//        }
    }


    /** This method responds to a member updated. */
    memberUpdated(eventInfo) {
        
        this.testPrint(eventInfo);
        
        //store the ui object
        var member = eventInfo.member;
        if(member) {
            var key = member.getId();

            var componentInfo = this.componentMap[key];
            if((componentInfo)&&(componentInfo.component)) {
                componentInfo.component.memberUpdated(eventInfo);
            }
        }
    }

    /** This method responds to a "new" menu event. */
    memberDeleted(eventInfo) {
        
        this.testPrint(eventInfo);

        //store the ui object
        var member = eventInfo.member;
        var memberId = member.getId();

        var componentInfo = this.componentMap[memberId];
        delete this.componentMap[memberId];

        if((componentInfo)&&(componentInfo.component)) {
            //do any needed cleanup
            componentInfo.component.onDelete();
        }
    }

    /** This method extends the member udpated function from the base.
     * @protected */    
    workspaceUpdated() {

        //update name
        if(this.treeEntry) {
            this.treeEntry.setLabel(this.workspace.getName());
        }
    }

    //====================================
    // open and save methods
    //====================================

    /** This should be set to store file source info, for saving the file. 
     * The format is arbitrary except it should hold one field "saveOK, which 
     * will be used to enable the menu option to save the file to the same source from
     * which it was opened.*/
    setFileMetadata(fileMetadata) {
        this.fileMetadata = fileMetadata;
    }

    /** This retrieves the file metadata used to save the file. */
    getFileMetadata() {
        return this.fileMetadata;
    }

    /** This saves the workspace. It the optionalSavedRootFolder is passed in,
     * it will save a workspace with that as the root folder. */
    toJson(optionalSavedRootFolder) {
        var json = {};
        json.fileType = "apogee app js workspace";

        json.version = "0.40";

        json.references = this.referencesManager.saveEntries();

        json.workspace = this.workspace.toJson(optionalSavedRootFolder);

        var rootFolder;
        if(optionalSavedRootFolder) {
            rootFolder = optionalSavedRootFolder;
        }
        else {
            rootFolder = this.workspace.getRoot();
        }

        var rootFolderComponent = this.getComponent(rootFolder);
        json.components = rootFolderComponent.toJson();

        if(this.tabFrame) {
            var openTabs = this.tabFrame.getOpenTabs();
            if(openTabs.length > 0) {
                json.openTabs = openTabs.map(tabId => this.getMemberNameFromId(tabId));
            }
            var activeTabId = this.tabFrame.getActiveTab();
            if(activeTabId) {
                json.activeTabMember = this.getMemberNameFromId(activeTabId);
            }
        }

        return json;
    }

    /** This is used in saving the active tab 
     * @private */
    getMemberNameFromId(activeTabId) {
        var component = this.getComponentById(activeTabId);
        if(component) {
            var member = component.getMember();
            if(member) {
                return member.getFullName();
            }
        }
        return undefined;
    }

    //================================
    // Folder child methods
    // The following methods are standard methods to serialize and deserialize the children in a folder. This
    // can be used by different folder component representations.
    //================================

    getFolderComponentContentJson(folder) {
        var json = {};
        var tableMap = folder.getChildMap();
        for(var key in tableMap) {
            var child = tableMap[key];

            //get the object map for the workspace
            var childComponent = this.getComponent(child);

            //get the component for this child
            var name = child.getName();
            json[name] = childComponent.toJson();
        }
        return json;
    }
    
    loadFolderComponentContentFromJson(actionResults,childrenJson) {
        for(var childName in childrenJson) {
            var childComponentJson = childrenJson[childName];
            var childActionResult = actionResults[childName];

            var childSuccess = apogeeapp.app.addcomponent.createComponentFromMember(workspaceUI,childActionResult,childComponentJson);
            if(!childSuccess) return false;
        }
    }

    //====================================
    // properties and display
    //====================================

    createTreeEntry() {
        //menu item callback
        var labelText = this.workspace.getName(); //add the name
        var iconUrl = this.getIconUrl();
        var menuItemCallback = () => this.getMenuItems();
        var isRoot = true;
        return new apogeeapp.ui.treecontrol.TreeEntry(labelText, iconUrl, null, menuItemCallback,isRoot);
    }

    /** This method returns the icon url for the component. */
    getIconUrl() {
        return apogeeapp.ui.getResourcePath(apogeeapp.app.WorkspaceUI.ICON_RES_PATH);
    }

    getMenuItems() {
        //menu items
        var menuItemList = [];

        //add the standard entries
        var itemInfo = {};
        itemInfo.title = "Edit Properties";
        itemInfo.callback = () => apogeeapp.app.updateworkspaceseq.updateWorkspaceProperties(this);
        menuItemList.push(itemInfo);

        //DEV ENTRY
        itemInfo = {};
        itemInfo.title = "Print Dependencies";
        itemInfo.callback = () => this.showDependencies();
        menuItemList.push(itemInfo);

        return menuItemList;
    }

    //========================================
    // Links
    //========================================

    getLoadReferencesPromise(referencesJson) {
        return this.referencesManager.getOpenEntriesPromise(referencesJson);
    }

    //==================================
    // DEV FUNCTION
    //==================================

    showDependencies() {
        console.log(JSON.stringify(this.createDependencies()));
    }

    createDependencies() {
        var memberInfo = {};

        for(var key in this.componentMap) {
            var componentInfo = this.componentMap[key];
            if((componentInfo)&&(componentInfo.member)) {


                var member = componentInfo.member;

                var memberStruct = {};
                memberStruct.type = member.generator.type;
                var parent = member.getParent();
                memberStruct.parent = parent ? parent.getFullName() : null;

                if(member.isDependent) {
                    if(member.getDependsOn().length > 0) {
                        memberStruct.dep = member.getDependsOn().map(dependency => dependency.getFullName());
                    }
                }

                memberInfo[member.getFullName()] = memberStruct;
            }
        }

        return memberInfo;
    }

}

apogeeapp.app.WorkspaceUI.ICON_RES_PATH = "/componentIcons/workspace.png";   