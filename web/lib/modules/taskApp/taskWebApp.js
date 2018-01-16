var taskWebApp = {};

taskWebApp.initTaskApp = function(workspaceUrl,containerElementId,initialComponentName) {

    //==============================
    //internal variables and functions
    //==============================
    //display fram initialization
    var _displayPanel = document.getElementById(containerElementId);
    var _displayFrames = {};
    var _activeDisplayFrame = null;
    var _initialComponentName = initialComponentName;

    function onWorkspaceLoad() {
        
        //remove loading label
        apogeeapp.ui.removeAllChildren(_displayPanel);

        //set the initial component
        setActiveComponent(_initialComponentName);
    }  
        
    function createDisplayFrameEntry(fullMemberPath) {
        
        var displayFrameEntry = {};
        
        //get the display element
        var displayFrame = webAppAccess.getDisplayFrame(fullMemberPath);
        displayFrameEntry.displayFrame = displayFrame;
        displayFrameEntry.wrapperElement = displayFrame.getElement();
        return displayFrameEntry;
    }

    function setActiveComponent(fullMemberPath) {
        if(_activeDisplayFrame != null) {
            _activeDisplayFrame.setIsShowing(false);
            _activeDisplayFrame = null;
            apogeeapp.ui.removeAllChildren(_displayPanel);
        }
        
        var displayFrameEntry = _displayFrames[fullMemberPath];
        if(!displayFrameEntry) {
            displayFrameEntry = createDisplayFrameEntry(fullMemberPath);
            _displayFrames[fullMemberPath] = displayFrameEntry
        }

        if(!displayFrameEntry) {
            alert("Member folder not found: " + fullMemberPath);
            return;
        }

        _displayPanel.appendChild(displayFrameEntry.wrapperElement);

        _activeDisplayFrame = displayFrameEntry.displayFrame;
        _activeDisplayFrame.setIsShowing(true);
    }

    //==================
    // Init body
    //==================
    
    //set some globals
     __globals__.__WEB_APP_MAKE_ACTIVE_FUNCTION__ = setActiveComponent;

    //create with no container id to not use the standard UI
    var app = apogeeapp.app.Apogee.createApp();

     //open workspace
    apogeeapp.app.openworkspace.openWorkspaceFromUrlImpl(app,workspaceUrl,onWorkspaceLoad);
}
