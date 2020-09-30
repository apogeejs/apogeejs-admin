import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import Model from "/apogee/data/Model.js";
import CodeableMember from "/apogee/datacomponents/CodeableMember.js";

/** This is a function. */
export default class FunctionTable extends CodeableMember {

    constructor(name,instanceToCopy,keepUpdatedFixed,specialCaseIdValue) {
        super(name,instanceToCopy,keepUpdatedFixed,specialCaseIdValue);
        
        //The messenger should not be available from the formula for this member
        //see details in the CodeableMember function below.
        this.supressMessenger(true);
    }

    //------------------------------
    // Codeable Methods
    //------------------------------

    processMemberFunction(model,memberGenerator) {
        var memberFunction = this.getLazyInitializedMemberFunction(model,memberGenerator);
        this.setData(model,memberFunction);
    }

    getLazyInitializedMemberFunction(model,memberGenerator) {

        //create init member function for lazy initialization
        //we need to do this for recursive functions, or else we will get a circular reference
        //here we have logic to notify of an error or other problem in the function
        var initMember = () => {
            var impactorSuccess = this.initializeMemberFunction(model);
            if(impactorSuccess) {
                //this returns the member function
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
                    issue = this.getDependsOnError();
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

        //create the lazy initialize function
        let memberInitialized = false;
        let source = {};

        source.initIfNeeded = () => {
            if(!memberInitialized) {
                source.memberFunction = initMember();
                memberInitialized = true;
            }
        }

        //create the wrapped function - we call this from the debug file to make this cleaner for the
        //user, since they will run through it from the debugger.
        let wrappedMemberFunction = __functionTableWrapper(this.getName(),source);

        //add an function on this function to allow external initialization if needed (if the function is not called before the model is locked)
        wrappedMemberFunction.initIfNeeded = source.initIfNeeded;

        return wrappedMemberFunction;
    }

    /** The function is lazy initialized so it can call itself without a 
     * ciruclar reference. The initialization happens on the first actual call. This is OK if we are doing the
     * model calculation. but if it is first called _AFTER_ the model has completed being calculated, such as
     * externally, then we will get a locked error when the lazy initialization happens. Instead, we will
     * complete the lazy initialization before the lock is done. At this point we don't need to worry about
     * circular refernce anyway, since the model has already completed its calculation. */
    lazyInitializeIfNeeded() {
        //check if the function is initialized
        let memberFunction = this.getData();
        if((memberFunction)&&(memberFunction.initIfNeeded)) {
            try {
                memberFunction.initIfNeeded();
            }
            catch(error) {
                //this error is already handled in the function table initializer
                //it is rethrown so a calling member can also get the error, since it was not present at regular intialization
                //if we initialize here in lock, that means there is nobody who called this.
            }
        }
    }

    //------------------------------
    // Member Methods
    //------------------------------

    /** This method creates a member from a json. It should be implemented as a static
     * method in a non-abstract class. */ 
    static fromJson(model,json) {
        let member = new FunctionTable(json.name,null,null,json.specialIdValue);

        //get a copy of the initial data and set defaults if needed
        let initialData = {};
        Object.assign(initialData,json.updateData);

        if(!initialData.argList) initialData.argList = [];
        if(!initialData.functionBody) initialData.functionBody = "";
        if(!initialData.supplementalCode) initialData.supplementalCode = "";

        member.setUpdateData(model,initialData);

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

