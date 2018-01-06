

//this can be in an object - wrap this part
var app = null;

//this must be global
function registerComponent(controlBundle) {
    app.registerComponent(controlBundle);
} 

function initTaskApp(workspaceUrl,configData,containerElementId,initialComponentName) {

    //==============================
    //internal variables and functions
    //==============================
    var _displayPanel = document.getElementById(containerElementId);
    var _configData = configData;
    var _initialComponentName = initialComponentName;
    var _activeDisplayFrame = null;
    

    function onWorkspaceLoad() {

        //load the UI controls
        for(var fullName in _configData) {
            initDisplay(fullName,_configData[fullName]);
        }

        //set the initial component
        setActiveComponent(_initialComponentName);
    }

    function initDisplay(memberName,configEntry) {

        //get the display element
        var displayFrame = getDisplayFrame(app,memberName);
        configEntry.displayFrame = displayFrame;

        //create wrapper dom Element
        var wrapperElement = document.createElement("div");
        wrapperElement.className = "wrapperElementClass";

        var titleElement = document.createElement("h3");
        titleElement.innerHTML = configEntry.title;
        wrapperElement.appendChild(titleElement);

        var frameHolder = document.createElement("div");
        frameHolder.className = "frameHolderClass";
        frameHolder.appendChild(displayFrame.getElement())
        wrapperElement.appendChild(frameHolder);

        configEntry.panel = wrapperElement;             
    }


    function setActiveComponent(memberFolderName) {
        if(_activeDisplayFrame != null) {
            _activeDisplayFrame.setIsShowing(false);
            _activeDisplayFrame = null;
            apogeeapp.ui.removeAllChildren(_displayPanel);
        }

        var memberName;
        var found = false;
        for(memberName in _configData) {
            if(memberName.startsWith(memberFolderName)) {
                found = true;
                break;
            }
        }

        if(!found) {
            alert("Member folder not found: " + memberName);
            return;
        }

        var memberConfigEntry = _configData[memberName];

        _displayPanel.appendChild(memberConfigEntry.panel);

        _activeDisplayFrame = memberConfigEntry.displayFrame;
        _activeDisplayFrame.setIsShowing(true);

    }

    //==================
    // Init body
    //==================

    //apogeeapp.ui.initResourcePath("../../resources");
    app = new apogeeapp.app.Apogee();

    //set some globals
     __globals__.__WEB_APP_MAKE_ACTIVE_FUNCTION__ = setActiveComponent;
     __globals__.registerComponent = registerComponent;

     //open workspace
    apogeeapp.app.openworkspace.openWorkspaceFromUrlImpl(app,workspaceUrl,onWorkspaceLoad);
}
