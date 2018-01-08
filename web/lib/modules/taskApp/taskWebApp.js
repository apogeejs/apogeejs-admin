var taskWebApp = {};

taskWebApp.initTaskApp = function(workspaceUrl,configData,containerElementId,initialComponentName) {

    //==============================
    //internal variables and functions
    //==============================
    var _displayPanel = document.getElementById(containerElementId);
    var _configData = configData;
    var _initialComponentName = initialComponentName;
    var _activeDisplayFrame = null;
    var _titleElementHeight = 0;
    var _titleTotalHeight = 0;

    function onWorkspaceLoad() {
        //load the UI controls
        for(var fullName in _configData) {
            initDisplay(fullName,_configData[fullName]);
        }
        
        //remove loading label
        apogeeapp.ui.removeAllChildren(_displayPanel);

        //set the initial component
        setActiveComponent(_initialComponentName);
    }

    function initDisplay(memberName,configEntry) {

        //get the display element
        var displayFrame = webAppAccess.getDisplayFrame(memberName);
        configEntry.displayFrame = displayFrame;

        //create wrapper dom Element
        var wrapperElement = document.createElement("div");
        wrapperElement.className = "taskApp_wrapperElementClass";

        var titleElement = getTitleElement(configEntry.title);
        titleElement.style.height = _titleElementHeight + "px";
        wrapperElement.appendChild(titleElement);

        var frameHolder = document.createElement("div");
        frameHolder.className = "taskApp_frameHolderClass";
        frameHolder.appendChild(displayFrame.getElement());
        frameHolder.style.top = _titleTotalHeight + "px";
        wrapperElement.appendChild(frameHolder);

        configEntry.panel = wrapperElement;             
    }
    
    function getTitleElement(name) {
        var titleElement = document.createElement("h2");
        titleElement.innerHTML = name;
        titleElement.className = "taskApp_titleElement";
        return titleElement;
    }
    
    function getActualHeight(element) {
        var styles = getComputedStyle(element);
        return Math.ceil(parseFloat(styles.marginTop) + element.offsetHeight + parseFloat(styles['marginBottom']));
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
    
    //create a loading page - this is to measure the title height
    var loadingElement = getTitleElement("loading...");
    _displayPanel.appendChild(loadingElement);
    _titleElementHeight = loadingElement.clientHeight;
    _titleTotalHeight = getActualHeight(loadingElement);
    
    //set some globals
     __globals__.__WEB_APP_MAKE_ACTIVE_FUNCTION__ = setActiveComponent;

    //create with no container id to not use the standard UI
    var app = apogeeapp.app.Apogee.createApp();

     //open workspace
    apogeeapp.app.openworkspace.openWorkspaceFromUrlImpl(app,workspaceUrl,onWorkspaceLoad);
}
