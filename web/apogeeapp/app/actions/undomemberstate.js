/** This can be used if member code or data is changed, to create the undo
 * function to return to the original state. */
var undomemberstate = function(member) {
    
    let undoCommand;
    
    let workspace = member.getWorkspace();
    let memberFullName = member.getFullName();
    
    if((member.isCodeable)&&(member.hasCode())) {
        //check if the current state has code set - if so, set the code for the undo function
        let oldArgList = member.getArgList();
        let oldFunctionBody = member.getFunctionBody();
        let oldPrivateCode = member.getSupplementalCode();
        undoCommand = () => apogeeapp.app.dataDisplayCallbackHelper.setCode(workspace,memberFullName,oldArgList,oldFunctionBody,oldPrivateCode);
    }
    else {
        //here the object has data set. Check if an "alternate" data values was set - error, pending or invalid
        if(member.hasError()) {
            //member has an error
            let errors = member.getErrors();
            let errorMessage = apogee.ActionResponse.getListErrorMsg(errorList);
            undoCommand = () => apogeeapp.app.dataDisplayCallbackHelper.doErrorUpdate(workspace,updateMemberName,errorMessage);
            
        }
        else if(member.getResultPending()) {
            //the result is pending
            //our undo will have to either reinstate this promse, if it is not yet resolved,
            //or if it is resolved, set the data to the resolved value or set the error message.
            let pendingPromise = member.getPendingPromise();
            
            let promiseResolved = false;
            let promiseFailed = false;
            let promiseValue;
            let promiseErrorMessage;
            
            let storePromiseResolution = resultValue => {
                promiseResolved = true;
                promiseValue = resultValue;
            }
            
            let storePromiseErrorMessage = errorMsg => {
                promiseFailed = true;
                promiseErrorMessage = errorMsg;
            }
            
            //add another then/catch to the promise
            pendingPromise.then(storePromiseResolution).catch(storePromiseErrorMessage);
            
            //the undo command reinstates the pending state or it sets the appropriate value/error
            var undoCommand = () => {
                
                if(promiseResolved) {
                    //if the promise if resolved, the undo should be a data update
                    return apogeeapp.app.dataDisplayCallbackHelper.doSaveData(workspace,memberFullName,promiseValue);
                }
                else if(promiseFailed) {
                    //if the promise is failed the undo should be a error message
                    return apogeeapp.app.dataDisplayCallbackHelper.doErrorUpdate(workspace,memberFullName,promiseErrorMessage);
                }
                else {
                    //if the promise is not resolved or failed, we can just reset the member to pending with this promise
                    return apogeeapp.app.dataDisplayCallbackHelper.doResetPendingState(workspace,memberFullName,pendingPromise);
                }  
            }
        }
        else if(member.getResultInvalid()) {
            //result is invalid - set value to invalid in undo
            undoCommand = () => apogeeapp.app.dataDisplayCallbackHelper.doSaveData(workspace,memberFullName,apogee.util.INVALID_VALUE);
        }
        else {
            //this is a standard data value
            let oldData = member.getData();
            undoCommand = () => apogeeapp.app.dataDisplayCallbackHelper.doSaveData(workspace,memberFullName,oldData);
        }
    }
    
    return undoCommand;
    
}


