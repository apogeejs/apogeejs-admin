import CommandManager from "/apogeeapp/app/commands/CommandManager.js";

CommandManagerTests = class {
    
    getTests() {
        return {
            failureTestTest: () => {
                throw Error("Just making sure fail works!");
            },
            basicTest: () => {
                var commandManager = new CommandManager();
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
            overwriteRedoTest: () => {
                var commandManager = new CommandManager();
                var executedTestList = [];
                var cmd1 = this.createCommand(1,executedTestList);
                var cmd2 = this.createCommand(2,executedTestList);
                var cmd3NoUndo = this.createCommand(3,executedTestList,true);
                var cmd4 = this.createCommand(4,executedTestList);
                var cmd5 = this.createCommand(5,executedTestList);
                
                commandManager.executeCommand(cmd1);
                commandManager.executeCommand(cmd2);
                commandManager.executeCommand(cmd3NoUndo);
                commandManager.executeCommand(cmd4);
                commandManager.undo();
                commandManager.undo();
                commandManager.executeCommand(cmd5);
                
                
                this.testExecutedTests("basis tests executed",[1,2,3,4,-4,-2,5],executedTestList);
                this.testCommandQueue("overwrite redo test", [1,5], 0, 2, 1, commandManager);
                
            },
            wrapTest: () => {
                //here we test wrapping of the command history. We also test setting the length.
                //this also tests the undo/redo labels
                var commandManager = new CommandManager(3);
                var executedTestList = [];
                var cmd1 = this.createCommand(1,executedTestList);
                var cmd2 = this.createCommand(2,executedTestList);
                var cmd3 = this.createCommand(3,executedTestList);
                var cmd4 = this.createCommand(4,executedTestList);
                var cmd5 = this.createCommand(5,executedTestList);

                commandManager.executeCommand(cmd1);
                commandManager.executeCommand(cmd2);
                commandManager.executeCommand(cmd3);
                commandManager.executeCommand(cmd4);
                commandManager.executeCommand(cmd5);

                //note expected values
                //expected first array index = 2, cmd index = 2
                //expected next array index = 2, cmd index = 5
                //expected last array index = 1, cmd index = 4
                this.testCommandQueue("wrap test", [4,5,3], 2, 2, 1, commandManager);

                let nextUndo, nextRedo;
                nextUndo = commandManager.getNextUndoDesc();
                testSimpleEquals("Wrap test undo label",nextUndo,5);
                nextRedo = commandManager.getNextRedoDesc();
                testSimpleEquals("Wrap test redo label",nextRedo,CommandManager.NO_COMMAND);
                
                commandManager.undo();
                nextUndo = commandManager.getNextUndoDesc();
                testSimpleEquals("Wrap test undo label",nextUndo,4);
                nextRedo = commandManager.getNextRedoDesc();
                testSimpleEquals("Wrap test redo label",nextRedo,5);
                
                commandManager.undo();
                nextUndo = commandManager.getNextUndoDesc();
                testSimpleEquals("Wrap test undo label",nextUndo,3);
                nextRedo = commandManager.getNextRedoDesc();
                testSimpleEquals("Wrap test redo label",nextRedo,4);
    
                commandManager.undo();
                nextUndo = commandManager.getNextUndoDesc();
                testSimpleEquals("Wrap test undo label",nextUndo,CommandManager.NO_COMMAND);
                nextRedo = commandManager.getNextRedoDesc();
                testSimpleEquals("Wrap test redo label",nextRedo,3);
                
                //this should give a alert dialog box warning - no more undos
                alert("Test notes: there should be a alert warning for no undo given next.");
                commandManager.undo();
                nextUndo = commandManager.getNextUndoDesc();
                testSimpleEquals("Wrap test undo label",nextUndo,CommandManager.NO_COMMAND);
                nextRedo = commandManager.getNextRedoDesc();
                testSimpleEquals("Wrap test redo label",nextRedo,3);
                alert("Test notes: the alert warning for no undo should have already been given.");
                
                //this should give a alert dialog box warning - no more undos
                commandManager.redo();
                nextUndo = commandManager.getNextUndoDesc();
                testSimpleEquals("Wrap test undo label",nextUndo,3);
                nextRedo = commandManager.getNextRedoDesc();
                testSimpleEquals("Wrap test redo label",nextRedo,4);
                
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
        
        testSimpleEquals(testLabel + ": First array index match",expectedFirstArrayIndex,commandManager._getArrayIndex(commandManager.firstUsedCmdIndex));
        testSimpleEquals(testLabel + ": Next array index match",expectedNextArrayIndex,commandManager._getArrayIndex(commandManager.nextInsertCmdIndex));
        testSimpleEquals(testLabel + ": Last array index match",expectedLastArrayIndex,commandManager._getArrayIndex(commandManager.lastUsedCmdIndex));
        
        for(var arrayIndex = expectedFirstArrayIndex; arrayIndex <= expectedLastArrayIndex; arrayIndex++) {
            testSimpleEquals(testLabel + ": CommandQueue: " + arrayIndex,expectedQueue[arrayIndex],commandManager.undoQueue[arrayIndex].desc);
        }   
    }
    
   
    
}


