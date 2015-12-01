if(!visicomp.app) visicomp.app = {};
if(!visicomp.app.visiui) visicomp.app.visiui = {};
if(!visicomp.app.visiui.dialog) visicomp.app.visiui.dialog = {};

/** This is the main class of the visicomp application. */
visicomp.app.visiui.VisiComp = function(containerId) {
    
    //temp - until we figure out what to do with menu and events
    //for now we have application events, using the EventManager mixin below.
    visicomp.core.EventManager.init.call(this);
    
    //external links (empty for now)
    this.jsLinksText = "";
    this.jsLinkArray = [];
    this.cssLinksText = "";
    this.cssLinkArray = [];

    //create menus
    var menuBar = new visicomp.visiui.MenuBar(containerId);
    var menu;

    menu = menuBar.addMenu("File");
    menu.addEventMenuItem("New","menuFileNew",null,this);
    menu.addEventMenuItem("Open","menuFileOpen",null,this);
    menu.addEventMenuItem("Save","menuFileSave",null,this);
    menu.addEventMenuItem("Close","menuFileClose",null,this);

    menu = menuBar.addMenu("Workspace");
    menu.addEventMenuItem("Add&nbsp;Folder","workspaceAddFolder",null,this);
    menu.addEventMenuItem("Add&nbsp;Table","folderAddTable",null,this);
    menu.addEventMenuItem("Add&nbsp;Function","folderAddFunction",null,this);
    menu.addEventMenuItem("Add&nbsp;Control","folderAddControl",null,this);
    
    menu = menuBar.addMenu("Libraries");
    menu.addEventMenuItem("Update&nbsp;Links","externalLinks",null,this);

    //create the tab frame - this puts a tab for each workspace, even though
    //for now you can only make one workspace.
    this.tabFrame = new visicomp.visiui.TabFrame(containerId);
    this.workspaceUI = null;
    
    //add menu listeners
    var instance = this;
    
    //create new listener
    var newListener = function() {
        if(instance.workspaceUI) {
            //one workspace for now
            alert("You must close the existing workspace before opening another.");
            return;
        }
        
        var onCreate = function(name) {
            return instance.createWorkspace(name);
        }
        visicomp.app.visiui.dialog.showCreateWorkspaceDialog(onCreate); 
    }
    this.addListener("menuFileNew",newListener);
    
    //open listener
    var openListener = function() {
        if(instance.workspaceUI) {
            //one workspace for now
            alert("You must close the existing workspace before opening another.");
            return;
        }
        
        var onOpen = function(workspaceData) {
            return instance.openWorkspace(workspaceData);
        }
        visicomp.app.visiui.dialog.showOpenWorkspaceDialog(onOpen); 
    }
    this.addListener("menuFileOpen",openListener);
    
    //save listener
    var saveListener = function() {
        if(!instance.workspaceUI) {
            alert("There is no open workspace.");
            return;
        }
        
        visicomp.app.visiui.dialog.showSaveWorkspaceDialog(instance, instance.workspaceUI); 
    }
    this.addListener("menuFileSave",saveListener);
    
    //close listener
    var closeListener = function() {
        if(!instance.workspaceUI) {
            alert("There is no open workspace.");
            return;
        }
        
        //add a "are you sure" dialog!!
        instance.closeWorkspace();
    }
    this.addListener("menuFileClose",closeListener);
    
    //workspace menu
     //add folder listener
    var addFolderListener = function() {
        if(!instance.workspaceUI) {
            alert("There is no workspace open");
            return;
        }
        
        var onCreate = function(parent,folderName) {
            return instance.workspaceUI.addFolder(parent,folderName,false);
        }
        visicomp.app.visiui.dialog.showCreateChildDialog("folder",instance.workspaceUI.objectUIMap,instance.activeFolderName,onCreate);
    }
    this.addListener("workspaceAddFolder",addFolderListener);

    //add table listener
    var addTableListener = function() {
        if(!instance.workspaceUI) {
            alert("There is no workspace open");
            return;
        }
        
        var onCreate = function(parent,tableName) {
            return instance.workspaceUI.addTable(parent,tableName);
        }
        visicomp.app.visiui.dialog.showCreateChildDialog("table",instance.workspaceUI.objectUIMap,instance.activeFolderName,onCreate);
    }
    this.addListener("folderAddTable",addTableListener);
    
    //add function listener
    var addFunctionListener = function() {
        if(!instance.workspaceUI) {
            alert("There is no workspace open");
            return;
        }
        
        var onCreate = function(parent,functionName) {
            return instance.workspaceUI.addFunction(parent,functionName);
        }
        visicomp.app.visiui.dialog.showCreateChildDialog("function",instance.workspaceUI.objectUIMap,instance.activeFolderName,onCreate);
    }
    this.addListener("folderAddFunction",addFunctionListener);
    
    //add control listener
    var addControlListener = function() {
        if(!instance.workspaceUI) {
            alert("There is no workspace open");
            return;
        }
        
        var onCreate = function(parent,controlName) {
            return instance.workspaceUI.addControl(parent,controlName);
        }
        visicomp.app.visiui.dialog.showCreateChildDialog("table",instance.workspaceUI.objectUIMap,instance.activeFolderName,onCreate);
    }
    this.addListener("folderAddControl",addControlListener);
    
    //external menu
    //add links listener
    var udpateLinksListener = function() {
        visicomp.app.visiui.dialog.showUpdateLinksDialog(instance);
    }
    this.addListener("externalLinks",udpateLinksListener);
}

//add components to this class
visicomp.core.util.mixin(visicomp.app.visiui.VisiComp,visicomp.core.EventManager);

/** This method creates a new workspace. */
visicomp.app.visiui.VisiComp.prototype.createWorkspace = function(name) {
    var workspace = new visicomp.core.Workspace(name);
    var tab = this.tabFrame.addTab(workspace.getName());
    this.workspaceUI = new visicomp.app.visiui.WorkspaceUI(workspace,tab);
    return {"success":true};
}

/** This method opens an workspace, from the text file. */
visicomp.app.visiui.VisiComp.prototype.openWorkspace = function(workspaceText) {
	var workspaceJson = JSON.parse(workspaceText);
	return visicomp.app.visiui.workspaceFromJson(this,workspaceJson);
}

/** This method closes a workspace. */
visicomp.app.visiui.VisiComp.prototype.closeWorkspace = function() {
    location.reload();
}

visicomp.app.visiui.VisiComp.prototype.getWorkspace = function() {
    if(this.workspaceUI) {
        return this.workspaceUI.getWorkspace();
    }
    else {
        return null;
    }
}

visicomp.app.visiui.VisiComp.prototype.getWorkspaceUI = function() {
	return this.workspaceUI;
}

visicomp.app.visiui.VisiComp.prototype.getJsLinks = function() {
	return this.jsLinks;
}

visicomp.app.visiui.VisiComp.prototype.setJsLinks = function(jsLinks) {
	this.jsLinks = jsLinks;
    
    //update the page links
    var newLinkArray = this.createLinkArray(jsLinks);
    var oldLinkArray = this.jsLinkArray;
    this.updateLinkArray(newLinkArray,oldLinkArray,visicomp.app.visiui.VisiComp.setJsLink);
    this.jsLinkArray = newLinkArray;
}

visicomp.app.visiui.VisiComp.prototype.getCssLinks = function() {
	return this.cssLinks;
}

visicomp.app.visiui.VisiComp.prototype.setCssLinks = function(cssLinks) {
	this.cssLinks = cssLinks;
    
    //update the page links
    var newLinkArray = this.createLinkArray(cssLinks);
    var oldLinkArray = this.cssLinkArray;
    this.updateLinkArray(newLinkArray,oldLinkArray,visicomp.app.visiui.VisiComp.setCssLink);
    this.cssLinkArray = newLinkArray;
}

////////////////////////////////////////////////////////////////////////////////


/** @private */
visicomp.app.visiui.VisiComp.prototype.createLinkArray = function(linkText) {
    if((!linkText)||(linkText.length === 0)) {
        return [];
    }
    else {
        return linkText.split(/\s/);
    }
}

/** @private */
visicomp.app.visiui.VisiComp.prototype.updateLinkArray = function(linkArray,oldLinkArray,setLinkFunction) { 
    
    var newLinks = {};
    var i;
    var link;
    
    //add the new links
    for(i = 0; i < linkArray.length; i++) {
        //create the link
        link = linkArray[i];
        if(link.length > 0) {
            setLinkFunction(link);
        }
        
        newLinks[link] = true;
    }
    
    //delete unused old links
    for(i = 0; i < oldLinkArray.length; i++) {
        link = oldLinkArray[i];
        if(!newLinks[i]) {
            //delete this link
            var element = document.getElementById(link);
            document.head.removeChild(element);
        }
    }
}

/** @private */
visicomp.app.visiui.VisiComp.setJsLink = function(link) {
    //set the link as the element id
    var element = document.getElementById(link);
    if(!element) {
        element = visicomp.visiui.createElement("script",{"id":link,"src":link});
        document.head.appendChild(element);
    }
}

/** @private */
visicomp.app.visiui.VisiComp.setCssLink = function(link) {
    //set the link as the element id
    var element = document.getElementById(link);
    if(!element) {
        element = visicomp.visiui.createElement("link",{"id":link,"rel":"stylesheet","type":"text/css","href":link});
        document.head.appendChild(element);
    }
}
