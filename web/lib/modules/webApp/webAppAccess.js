var webAppAccess = {};

webAppAccess.initWebApp = function(workspaceUrl,onWorkspaceLoad) {
    //create with no container id to not use the standard UI
    var app = apogeeapp.app.Apogee.createApp();
    
    apogeeapp.app.openworkspace.openWorkspaceFromUrlImpl(app,workspaceUrl,onWorkspaceLoad);     
}

/** This method returns a PlainFrame object which contains the component display object. 
* If the optionalViewType is not set, the default view (which is typically the desired one) will be used.*/
webAppAccess.getDisplayFrame = function(memberName,optionalViewType) {
   var app = apogeeapp.app.Apogee.getInstance();
   var workspace = app.getWorkspace();
   var workspaceUI = app.getWorkspaceUI();

   var member = workspace.getMemberByFullName(memberName); 
   if(!member) {
       alert("Member not found: " + memberName);
       return;
   }
   var component = workspaceUI.getComponent(member);

   var options = {};
   options.viewType = optionalViewType;
   options.PLAIN_FRAME_UI = true;

   var componentDisplay = component.getWindowDisplay(true,options);
   return componentDisplay.getDisplayFrame();
}


