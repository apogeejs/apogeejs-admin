var webAppAccess = {};

/** This method initializes the workspace. */
webAppAccess.initWebApp = function(workspaceUrl,onWorkspaceLoad) {
    //create with no container id to not use the standard UI
    var app = apogeeapp.app.Apogee.createApp();
    
    apogeeapp.app.openworkspaceseq.openWorkspaceFromUrlImpl(app,workspaceUrl,onWorkspaceLoad);     
}

/** This method attaches the apgee output display to the dom element. See the 
 * documentation for CSS requirements for the host element.
 * 
 * @param {type} memberName - The full name of the member to add to the web page (including the top level folder name)
 * @param {type} parentElementId - This is the DOM element ID into which the display should be added.
 * @param {type} isShowing - If the element is currently showing, this flag should be set to true. Otherwise, it 
 * should be set to false and the isShowing event used when the element becomes visible
 * @param {type} optionalViewType - For this component, the name of the data view can optionally be specified. Otherwise the default is used.
 * @returns {undefined} There is no return value
 */ 
webAppAccess.addDisplay = function(memberName,parentElementId,isShowing,optionalViewType) {
                
    var parentElement = document.getElementById(parentElementId);
    if(!parentElement) {
        console.error("DOM Element not found:" + parentElementId);
        return;
    }

    //show the display
    var displayFrame = webAppAccess.getDisplayFrame(memberName,optionalViewType);
    if(!displayFrame) {
        console.error("Workspace member not found not found:" + memberName);
        return;
    }

    //put the display element in the parent
    var element = displayFrame.getElement();
    parentElement.appendChild(element);

    //the display frame method "setIsShowing" must be called when
    //the object is shown or hidden for proper operation
    if(isShowing) {
        displayFrame.setIsShowing(true);
    }
}

/** If the DOM element is loaded or unloaded, this method should be called to update
 * the state. This state is available to all component displays and is used by some of them.
 */
webAppAccess.setIsShowing = function(memberName,isShowing,optionalViewType) {
    var displayFrame = webAppAccess.getDisplayFrame(memberName,optionalViewType);
    if(!displayFrame) {
        console.error("Workspace member not found not found:" + memberName);
        return;
    }
    
    displayFrame.setIsShowing(isShowing);
}

/** If the DOM element is resized this method should be called. This information is available
 * to all component display and is sued by some of them.
 */
webAppAccess.onResize = function(memberName,optionalViewType) {
    var displayFrame = webAppAccess.getDisplayFrame(memberName,optionalViewType);
    if(!displayFrame) {
        console.error("Workspace member not found not found:" + memberName);
        return;
    }
    
    displayFrame.onResize();
}

/** This method returns a PlainFrame object which contains the component display object. 
* If the optionalViewType is not set, the default view (which is typically the desired one) will be used.*/
webAppAccess.getDisplayFrame = function(memberName,optionalViewType) {
   var app = apogeeapp.app.Apogee.getInstance();
   var workspace = app.getWorkspace();
   var workspaceUI = app.getWorkspaceUI();

   var member = workspace.getMemberByFullName(memberName); 
   if(!member) {
       console.error("Member not found: " + memberName);
       return;
   }
   var component = workspaceUI.getComponent(member);

   var options = {};
   options.viewType = optionalViewType;
   options.PLAIN_FRAME_UI = true;

   var componentDisplay = component.getComponentDisplay(true,options);
   return componentDisplay.getDisplayFrame();
}


