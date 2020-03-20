import base from "/apogeeutil/base.js";
import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import Model from "/apogee/data/Model.js";
import ContextHolder from "/apogee/datacomponents/ContextHolder.js";
import CodeableMember from "/apogee/datacomponents/CodeableMember.js";

/** This is a function. */
export default class FunctionTable extends CodeableMember {

    constructor(name,parent) {
        super(name,parent);

        //mixin init where needed
        this.contextHolderMixinInit();    
    }

    //------------------------------
    // Codeable Methods
    //------------------------------

    processMemberFunction(model,memberFunctionInitializer,memberGenerator) {
        var memberFunction = this.getLazyInitializedMemberFunction(memberFunctionInitializer,memberGenerator);
        this.setData(memberFunction);
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
                    issue = base.MEMBER_FUNCTION_PENDING_THROWABLE;
                }
                else if(state == apogeeutil.STATE_INVALID) {
                    issue = base.MEMBER_FUNCTION_INVALID_THROWABLE;
                }
                else {
                    issue = new Error("Unknown problem in initializing: " + this.getName());
                }
                
                throw issue;
            } 
        }

        //this is called from separate code to make debugging more readable
        return __functionTableWrapper(initMember);
    }

    //------------------------------
    // Member Methods
    //------------------------------

    /** This method creates a member from a json. It should be implemented as a static
     * method in a non-abstract class. */ 
    static fromJson(parentId,json) {
        let member = new FunctionTable(json.name,parentId);

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


//add components to this class
base.mixin(FunctionTable,ContextHolder);

//============================
// Static methods
//============================

FunctionTable.generator = {};
FunctionTable.generator.displayName = "Function";
FunctionTable.generator.type = "apogee.FunctionTable";
FunctionTable.generator.createMember = FunctionTable.fromJson;
FunctionTable.generator.readProperties = FunctionTable.readProperties;
FunctionTable.generator.getPropertyUpdateAction = FunctionTable.getPropertyUpdateAction;
FunctionTable.generator.setDataOk = false;
FunctionTable.generator.setCodeOk = true;

//register this member
Model.addMemberGenerator(FunctionTable.generator);


