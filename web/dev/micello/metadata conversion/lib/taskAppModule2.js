taskAppModule = (function() {
	var wrapper = {};
	
	//these holds the current task
	var taskStack = [];	

	//---------------------
	//internal functions
	//---------------------
	function getTaskResultName(taskPath) {
		var name = "taskResults";
		taskPath.forEach( (entry) => {name += "." + entry} );
		return name;
	}
	
	//---------------------
	//exported functions
	//----------------------
	
	/** This loads the result data for a given task. */
	wrapper.loadTaskResultData = function(taskResultsFolder,taskPath) {
		var taskName = getTaskResultName(taskPath);
		var resultTable = taskResultsFolder[taskName];
		if(!resultTable) throw new Error("Task result table not found: " + taskName);
		
		if(resultTable.state == "SUCCESS") {
			return resultTable.data; 
		}
		else {
			return null;
		}
	}
	
	wrapper.setInitialTask = function(messenger,taskPath) {

		taskStack.push(taskPath);
		
		var clearData = {};
		clearData.state = "INCOMPLETE";
		
		var taskResultName = getTaskResultName(taskPath);
		
		var updateInfo = [];
		updateInfo.push([taskResultName,clearData]);
		updateInfo.push(["activeTask",taskPath]);
		messenger.compoundDataUpdate(updateInfo);
		
	}
	
	/** This method should be called when a task is completed. */
	wrapper.taskCompleted = function(messenger,nextTaskPath,data) {
		
		taskPath.push(nextTaskPath);
		
		var taskResult = {};
		taskResult.state = "SUCCESS";
		taskResult.data = data;
		
		var updateInfo = [];
		updateInfo.push(["result",taskResult]);
		updateInfo.push(["activeTask",nextTaskPath]);
		messenger.compoundDataUpdate(updateInfo);
	}

	/** This method should be called when a task is canceled. NOTE - we can't cancel the first task.*/
	wrapper.taskCanceled = function(messenger) {
		//go back 
		returnToTask(messenger,taskStack.length-1);
	}
	
	/** This method clears tasks until the task stack is the desired length. */
	wrapper.returnToTask = function(messenger,destStackLength) {

		var clearData = {};
		clearData.state = "INCOMPLETE";
		
		var updateInfo = [];
		
		//remove entries from task stack, and clear those entries
		while(taskStack.length > destStackLength) {
			var taskPath = taskStack.pop();
			var taskResultName = getTaskResultName(taskPath);
			updateInfo.push([taskResultName,clearData]);
		}
		
		//clear the current task
		var taskPath = taskStack[destStackLength-1];
		var taskResultName = getTaskResultName(taskPath);
		updateInfo.push([taskResultName,clearData]);
		
		updateInfo.push(["activeTask",taskPath]);
		messenger.compoundDataUpdate(updateInfo);
	}
	
	return wrapper;

})();