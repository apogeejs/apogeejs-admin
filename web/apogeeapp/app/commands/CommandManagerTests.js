CommandManagerTests = class {
    
    getTests() {
        return {
            basicTest: () => {
                var commandManager = new apogeeapp.app.CommandManager();
                var executedTestList = [];
                var cmd1 = this.createCommand(1,executedTestList);
                var cmd2 = this.createCommand(2,executedTestList);
                var cmd3NoUndo = this.createCommand(3,executedTestList,true);
                
                commandManager.executeCommand(cmd1);
                commandManager.executeCommand(cmd2);
                commandManager.executeCommand(cmd3NoUndo);
                commandManager.undo();
                commandManager.redo();
                
                this.testExecutedTests("basis tests executed",[1,2,3,-2,2],executedTestList);
                
            },
            anotherBasicTest: () => {
                throw Error("Fail!")
            }
        };
    }
    
    //==============
    //TEST UTILITIES
    //==============
    
    createCommand(commandNumber,executedTestList,omitUndo) {
        var command = {};
        command.desc = commandNumber;
        command.cmd = () => executedTestList.push(commandNumber);
        if(!omitUndo) command.undoCmd = () => executedTestList.push(-commandNumber);
        return command;
    }
    
    /** This tests an array of integers (positive for execute and redo, negative for undo) that represent the tests run. */
    testExecutedTests(testLabel, expectedTests, actualTests) {
        testJsonEquals(testLabel + ": Expected tests run: ",expectedTests,actualTests);
    }
    
    /** This tests if the passsed in queue and values match the actual values. The passed in queue should have numbers instead
     * of the actual command objects. */
    testCommandQueue(testLabel, expectedQueue, expectedFirstArrayIndex, expectedNextArrayIndex, expectedLastArrayIndex, commandManager) {
        var comandQueue = commandManager.commandQueue;
        
        testSimpleEquals(testLabel + ": First array index match",expectedFirstArrayIndex,commandManager._getArrayIndex(commandManager.firstCmdIndex));
        testSimpleEquals(testLabel + ": Next array index match",expectedNextArrayIndex,commandManager._getArrayIndex(commandManager.nextCmdIndex));
        testSimpleEquals(testLabel + ": Last array index match",expectedLastArrayIndex,commandManager._getArrayIndex(commandManager.lastCmdIndex));
        
        for(var arrayIndex = expectedFirstArrayIndex; arrayIndex <= expectedLastArrayIndex; arrayIndex++) {
            testSimpleEquals(testLabel + ": CommandQueue: " + arrayIndex,expectedQueue[arrayIndex],commandManager.commandQueue[arrayIndex].desc);
        }   
    }
    
   
    
}


