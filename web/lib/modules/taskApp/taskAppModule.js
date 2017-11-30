taskAppModule = (function() {
	
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
	function getAppendedPath(path,field) {
		return path.concat([field]);
	}
    
    function setActiveComponentByPath(relativeToTasksPath) {
        //this is a little convuluted - I should fix up how we loda this object
        var absolutePath = ["tasks"].concat(relativeToTasksPath);
        var workspace = app.getWorkspace();
        var rootFolder = workspace.getRoot();
        var workspaceUI = app.getWorkspaceUI();
        var member = rootFolder.getMemberByPathArray(absolutePath);
        var component = workspaceUI.getComponent(member);
        var makeActiveCallback = component.createOpenCallback();
        makeActiveCallback();
    }
	
	//---------------------
	//exported functions
	//----------------------
	
	
	/** This method should be called when a task is completed. */
	wrapper.taskCompleted = function(messenger,currentTaskPath,nextTaskPath,data) {
		
		var taskResult = {};
		taskResult.valid = true;
		taskResult.data = data;
		
		var activeState = {};
		activeState.active = true;
		activeState.previousTask = currentTaskPath;
		
		var currentResultString = getTaskPathString("tasks",getAppendedPath(currentTaskPath,"result"));
		var nextStateString = getTaskPathString("tasks",getAppendedPath(nextTaskPath,"state"));
		
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
		
		var previousResultString = getTaskPathString("tasks",getAppendedPath(previousTaskPath,"result"));
		var currentStateString = getTaskPathString("tasks",getAppendedPath(currentTaskPath,"state"));
			
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
			let taskResultString = getTaskPathString("tasks",getAppendedPath(taskPath,"result"));
			let taskStateString = getTaskPathString("tasks",getAppendedPath(taskPath,"state"));
			updateInfo.push([taskResultString,invalidResult]);
			updateInfo.push([taskStateString,inactiveState]);
		};
		clearTaskPathList.forEach(clearTask);
		
		//go to task
		var nextTaskResultString = getTaskPathString("tasks",getAppendedPath(nextTaskPath,"result"));
		updateInfo.push([nextTaskResultString,invalidResult]);
		updateInfo.push(["tasks.currentTask",nextTaskPath]);
		
		messenger.compoundDataUpdate(updateInfo);

        setActiveComponentByPath(nextTaskPath);
	}
	
	return wrapper;

})();