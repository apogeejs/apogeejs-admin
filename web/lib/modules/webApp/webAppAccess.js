
var app = null;

function initWebApp(workspaceUrl,onWorkspaceLoad) {
    app = new apogeeapp.app.Apogee();
    
    apogeeapp.app.openworkspace.openWorkspaceFromUrlImpl(app,workspaceUrl,onWorkspaceLoad);     
}

function registerComponent(controlBundle) {
    app.registerComponent(controlBundle);
}   

/** This method returns a PlainFrame object which contains the component display object. 
* If the optionalViewType is not set, the default view (which is typically the desired one) will be used.*/
function getDisplayFrame(memberName,optionalViewType) {
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


