var taskAppModule = (function() {
	
	var wrapper = {};

	//---------------------
	//internal functions
	//---------------------
	
	/** Converts a path to a string, starting with a base folder name. */
	function getTaskPathString(baseFolderString,path) {
		var pathString = baseFolderString;
		path.forEach( (entry) => {pathString += "." + entry} );
		return pathString;
	}
	
	/** Adds a field to a path, returning a new path (not modifying old one) */
	function getResultPath(controlPath,field) {
		//copy array and replace last element of path with the "result" object
        var resultPath = controlPath.slice();
		resultPath[resultPath.length-1] = "result";
        return resultPath;
	}
    
    function getStatePath(controlPath,field) {
        //copy array and replace last element of path with the "state" object
        var statePath = controlPath.slice();
		statePath[statePath.length-1] = "state";
        return statePath;
	}
    
    function setActiveComponentByPath(relativeToTasksPath) {
        //this is a little convuluted - I should fix up how we loda this object
        var app = apogeeapp.app.Apogee.getInstance();
        
        var absolutePath = ["tasks"].concat(relativeToTasksPath);
        var workspace = app.getWorkspace();
        var rootFolder = workspace.getRoot();
        var workspaceUI = app.getWorkspaceUI();
        var member = rootFolder.lookupChildFromPathArray(absolutePath);
        var component = workspaceUI.getComponent(member);
        
        var makeActiveFuntion;
        if(__globals__.__WEB_APP_MAKE_ACTIVE_FUNCTION__) {
            //this is if the user sets the make active function
            makeActiveFuntion = __globals__.__WEB_APP_MAKE_ACTIVE_FUNCTION__;
            makeActiveFuntion(component.getMember().getFullName());
        }
        else {
            makeActiveFuntion = component.createOpenCallback();
            makeActiveFuntion();
        }
        
    }
	
	//---------------------
	//exported functions
	//----------------------
    
    wrapper.WEB_APP_UI = false;
	
	
	/** This method should be called when a task is completed. */
	wrapper.taskCompleted = function(messenger,currentTaskPath,nextTaskPath,data) {
		
		var taskResult = {};
		taskResult.valid = true;
		taskResult.data = data;
		
		var activeState = {};
		activeState.active = true;
		activeState.previousTask = currentTaskPath;
		
		var currentResultString = getTaskPathString("tasks",getResultPath(currentTaskPath));
		var nextStateString = getTaskPathString("tasks",getStatePath(nextTaskPath));
		
		var updateInfo = [];
		updateInfo.push([currentResultString,taskResult]);
		updateInfo.push([nextStateString,activeState]);
		updateInfo.push(["tasks.currentTask",nextTaskPath]);
		messenger.compoundDataUpdate(updateInfo);
        
        setActiveComponentByPath(nextTaskPath);
	}

	/** This method should be called when a task is canceled. NOTE - we can't cancel the first task.*/
	wrapper.taskCanceled = function(messenger,currentTaskPath,previousTaskPath) {
		
		var invalidResult = {};
		invalidResult.valid = false;
		invalidResult.data = null;
		
		var inactiveState = {};
		inactiveState.active = false;
		inactiveState.previousTask = null;
		
		var previousResultString = getTaskPathString("tasks",getResultPath(previousTaskPath));
		var currentStateString = getTaskPathString("tasks",getStatePath(currentTaskPath));
			
		var updateInfo = [];
		updateInfo.push([previousResultString,invalidResult]);
		updateInfo.push([currentStateString,inactiveState]);
		updateInfo.push(["tasks.currentTask",previousTaskPath]);
		messenger.compoundDataUpdate(updateInfo);
        
        setActiveComponentByPath(previousTaskPath);
	}
	
	/** This method clears tasks until is reaches the destination path. If not destination path
	 *  is set it goes back one task. */
	wrapper.clearTasksAndRestartFrom = function(messenger,clearTaskPathList,nextTaskPath) {

		var updateInfo = [];
		
		var invalidResult = {};
		invalidResult.valid = false;
		invalidResult.data = null;
		
		var inactiveState = {};
		inactiveState.active = false;
		inactiveState.previousTask = null;
		
		//clear tasks
		var clearTask = (taskPath) => {		
			let taskResultString = getTaskPathString("tasks",getResultPath(taskPath));
			let taskStateString = getTaskPathString("tasks",getStatePath(taskPath));
			updateInfo.push([taskResultString,invalidResult]);
			updateInfo.push([taskStateString,inactiveState]);
		};
		clearTaskPathList.forEach(clearTask);
		
		//go to task
		var nextTaskResultString = getTaskPathString("tasks",getResultPath(nextTaskPath));
		updateInfo.push([nextTaskResultString,invalidResult]);
		updateInfo.push(["tasks.currentTask",nextTaskPath]);
		
		messenger.compoundDataUpdate(updateInfo);

        setActiveComponentByPath(nextTaskPath);
	}
	
	return wrapper;

})();