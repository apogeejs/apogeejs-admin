CommandManagerTests = class {
    
    getTests() {
        return {
            basicTest: function() {
                //no error
            },
            anotherBasicTest: function() {
                throw Error("Fail!")
            }
        };
    }

    
    
}

// Test utilities

//create a test with a given test number, a positive integer. The cmd and undoCmd functions will store
//a test label in a list (poitive for do, negative for undo) - for testing what is executed

//compare the current command queue to a expected list. The expected list 
//will be a list of test names - for testing the queue state


