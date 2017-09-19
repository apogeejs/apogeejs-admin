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
		
		var currentResultString = getTaskPathString("taskResults",getAppendedPath(currentTaskPath,"result"));
		var nextStateString = getTaskPathString("taskResults",getAppendedPath(nextTaskPath,"state"));
		
		var updateInfo = [];
		updateInfo.push([currentResultString,taskResult]);
		updateInfo.push([nextStateString,activeState]);
		updateInfo.push(["taskResults.currentTask",nextTaskPath]);
		messenger.compoundDataUpdate(updateInfo);
	}

	/** This method should be called when a task is canceled. NOTE - we can't cancel the first task.*/
	wrapper.taskCanceled = function(messenger,currentTaskPath,previousTaskPath) {
		
		var invalidResult = {};
		invalidResult.valid = false;
		invalidResult.data = null;
		
		var inactiveState = {};
		inactiveState.active = false;
		inactiveState.previousTask = null;
		
		var previousResultString = getTaskPathString("taskResults",getAppendedPath(previousTaskPath,"result"));
		var currentStateString = getTaskPathString("taskResults",getAppendedPath(currentTaskPath,"state"));
			
		var updateInfo = [];
		updateInfo.push([previousResultString,invalidResult]);
		updateInfo.push([currentStateString,inactiveState]);
		updateInfo.push(["taskResults.currentTask",previousTaskPath]);
		messenger.compoundDataUpdate(updateInfo);
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
			let taskResultString = getTaskPathString("taskResults",getAppendedPath(taskPath,"result"));
			let taskStateString = getTaskPathString("taskResults",getAppendedPath(taskPath,"state"));
			updateInfo.push([taskResultString,invalidResult]);
			updateInfo.push([taskStateString,inactiveState]);
		};
		clearTaskPathList.forEach(clearTask);
		
		//go to task
		var nextTaskResultString = getTaskPathString("taskResults",getAppendedPath(nextTaskPath,"result"));
		updateInfo.push([nextTaskResultString,invalidResult]);
		updateInfo.push(["taskResults.currentTask",nextTaskPath]);
		
		messenger.compoundDataUpdate(updateInfo);
	}
	
	return wrapper;

})();