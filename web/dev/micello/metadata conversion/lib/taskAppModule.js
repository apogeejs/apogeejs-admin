taskAppModule = (function() {
	var wrapper = {};
	

	//---------------------
	//internal functions
	//---------------------
	function getTaskIndex(taskName,taskList) {
		return taskList.indexOf(taskName);
	}
	
	function getNextTask(taskName,taskList) {
		var index = getTaskIndex(taskName,taskList);
		if(index < 0) throw new Error("Task not found: " + taskName);
		
		if(index < taskList.length - 1) return taskList[index+1];
		else return null;
	}
	
	function getPreviousTask(taskName,taskList) {
		var index = getTaskIndex(taskName,taskList);
		if(index < 0) throw new Error("Task not found: " + taskName);
		
		if(index > 0) return taskList[index-1];
		else return null;
	}
	
	//---------------------
	//exported functions
	//----------------------
	
	/** This loads the result data for a given task. */
	wrapper.loadTaskResultData = function(taskResultsFolder,taskName) {
		var resultTable = taskResultsFolder[taskName];
		if(!resultTable) throw new Error("Task result table not found: " + taskName);
		switch(resultTable.state) {
			
			case "SUCCESS":
				return resultTable.data; 
			
			case "ERROR":
				throw new Exception("Task result error for required task: " + taskName);
		
			default:
				return null;
		}
	}
	
	/** This method should be called when a task is completed. */
	wrapper.taskCompleted = function(messenger,currentTask,taskList,data) {
		
		var nextTask = getNextTask(currentTask,taskList);
		
		var taskResult = {};
		taskResult.state = "SUCCESS";
		taskResult.data = data;
		
		var updateInfo = [];
		updateInfo.push(["taskResults." + currentTask,taskResult]);
		updateInfo.push(["tasks.activeTask",nextTask]);
		messenger.compoundDataUpdate(updateInfo);
	}

	/** This method should be called when a task is canceled. */
	wrapper.taskCanceled = function(messenger,currentTask,taskList) {
		
		var prevTask = getPreviousTask(currentTask,taskList);
		
		var clearData = {};
		clearData.state = "INCOMPLETE";
		
		var updateInfo = [];
		updateInfo.push(["taskResults." + currentTask,clearData]);
		updateInfo.push(["taskResults." + prevTask,clearData]);
		updateInfo.push(["tasks.activeTask",prevTask]);
		messenger.compoundDataUpdate(updateInfo);
	}
	
	/** This method clears the results for a list of tasks. */
	wrapper.clearTasks = function(messenger,toClearTaskList) {
		var clearData = {};
		clearData.state = "INCOMPLETE";
		
		var updateInfo = [];
		toClearTaskList.forEach( (taskName) => (updateInfo.push(["taskResults." + taskName,clearData])) );
		messenger.compoundDataUpdate(updateInfo);
	}
	
	return wrapper;

})();