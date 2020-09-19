import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import Model from "/apogee/data/Model.js";
import CodeableMember from "/apogee/datacomponents/CodeableMember.js";

/** This is a function. */
export default class FunctionTable extends CodeableMember {

    constructor(name,parentId,instanceToCopy,keepUpdatedFixed,specialCaseIdValue) {
        super(name,parentId,instanceToCopy,keepUpdatedFixed,specialCaseIdValue);
        
        //The messenger should not be available from the formula for this member
        //see details in the CodeableMember function below.
        this.supressMessenger(true);
    }

    //------------------------------
    // Codeable Methods
    //------------------------------

    processMemberFunction(model,memberFunctionInitializer,memberGenerator) {
        var memberFunction = this.getLazyInitializedMemberFunction(memberFunctionInitializer,memberGenerator);
        this.setData(model,memberFunction);
    }

    getLazyInitializedMemberFunction(memberFunctionInitializer,memberGenerator) {

        //create init member function for lazy initialization
        //we need to do this for recursive functions, or else we will get a circular reference
        var initMember = () => {
            var impactorSuccess = memberFunctionInitializer();
            if(impactorSuccess) {
                return memberGenerator();
            }
            else {
                //error handling
                let issue;
                let state = this.getState();

                //in the case of "result invalid" or "result pending" this is 
                //NOT an error. But I don't know
                //how else to stop the calculation other than throwing an error, so 
                //we do that here. It should be handled by anyone calling a function.
                if(state == apogeeutil.STATE_ERROR) {
                    issue = new Error("Error in dependency: " + this.getName());
                }
                else if(state == apogeeutil.STATE_PENDING) {
                    issue = apogeeutil.MEMBER_FUNCTION_PENDING_THROWABLE;
                }
                else if(state == apogeeutil.STATE_INVALID) {
                    issue = apogeeutil.MEMBER_FUNCTION_INVALID_THROWABLE;
                }
                else {
                    issue = new Error("Unknown problem in initializing: " + this.getName());
                }
                
                throw issue;
            } 
        }

        //this is called from separate code to make debugging more readable
        return __functionTableWrapper(initMember,this.getName());
    }

    /** Add to the base lock function - The function is lazy initialized so it can call itself without a 
     * ciruclar reference. The initialization happens on the first actual call. This is OK if we are doing the
     * model calculation. but if it is first called _AFTER_ the model has completed being calculated, such as
     * externally, then we will get a locked error when the lazy initialization happens. Instead, we will
     * complete the lazy initialization before the lock is done. At this point we don't need to worry about
     * circular refernce anyway, since the model has already completed its calculation. */
    lock() {
        //check if the function is initialized
        let memberFunction = this.getData();
        if((memberFunction)&&(memberFunction.initializeIfNeeded)) {
            try {
                memberFunction.initializeIfNeeded();
            }
            catch(error) {
                //This error is thrown so it can be received by any member that depends on this function 
                //when the function has not yet been called. If we do this during lock, then we only need
                //notify the function member itself, and that has already been done. we will just ignore this error.
                
                // if(error == apogeeutil.MEMBER_FUNCTION_INVALID_THROWABLE) {
                //     //This is not an error. I don't like to throw an error
                //     //for an expected condition, but I didn't know how else
                //     //to do this. See notes where this is thrown.
                //     this.setResultInvalid(model);
                // }
                // else if(error == apogeeutil.MEMBER_FUNCTION_PENDING_THROWABLE) {
                //     //This is not an error. I don't like to throw an error
                //     //for an expected condition, but I didn't know how else
                //     //to do this. See notes where this is thrown.
                //     this.setResultPending(model);
                // }
                // //--------------------------------------
                // else {
                //     //normal error in member function execution
                
                //     //this is an error in the code
                //     if(error.stack) {
                //         console.error(error.stack);
                //     }
    
                //     this.setError(model,error);
                // }
            }

        }
        super.lock();
    }

    //------------------------------
    // Member Methods
    //------------------------------

    /** This method creates a member from a json. It should be implemented as a static
     * method in a non-abstract class. */ 
    static fromJson(parentId,json) {
        let member = new FunctionTable(json.name,parentId,null,null,json.specialIdValue);

        //set initial data
        let initialData = json.updateData;

        var argList = initialData.argList ? initialData.argList : [];
        var functionBody = initialData.functionBody ? initialData.functionBody : "";
        var supplementalCode = initialData.supplementalCode ? initialData.supplementalCode : "";
        member.applyCode(argList,functionBody,supplementalCode);

        return member;
    }

    /** This method extends the base method to get the property values
     * for the property editting. */
    static readProperties(member,values) {
        var argList = member.getArgList();
        var argListString = argList.toString();
        values.argListString = argListString;
        return values;
    }

    /** This method executes a property update. */
    static getPropertyUpdateAction(member,newValues) {
        if((newValues.updateData)&&(newValues.updateData.argList !== undefined)) {
            var actionData = {};
            actionData.action = "updateCode";
            actionData.memberId = member.getId();
            actionData.argList = newValues.updateData.argList;
            actionData.functionBody = member.getFunctionBody();
            actionData.supplementalCode = member.getSupplementalCode();
            return actionData;
        }
        else {
            return null;
        }
    }

}

//============================
// Static methods
//============================

FunctionTable.generator = {};
FunctionTable.generator.displayName = "Function";
FunctionTable.generator.type = "apogee.FunctionMember";
FunctionTable.generator.createMember = FunctionTable.fromJson;
FunctionTable.generator.readProperties = FunctionTable.readProperties;
FunctionTable.generator.getPropertyUpdateAction = FunctionTable.getPropertyUpdateAction;
FunctionTable.generator.setDataOk = false;
FunctionTable.generator.setCodeOk = true;

//register this member
Model.addMemberGenerator(FunctionTable.generator);


