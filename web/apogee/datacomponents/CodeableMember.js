import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import Messenger from "/apogee/actions/Messenger.js";
import {processCode} from "/apogee/lib/codeCompiler.js"; 
import {getDependencyInfo} from "/apogee/lib/codeDependencies.js";
import ContextHolder from "/apogee/datacomponents/ContextHolder.js";
import ContextManager from "/apogee/lib/ContextManager.js";
import DependentMember from "/apogee/datacomponents/DependentMember.js"

/** This mixin encapsulates an object in that can be coded. It contains a function
 * and supplemental code. Object that are codeable should also be a member and
 * dependent.
 * 
 * This is a mixin and not a class. It is used in the prototype of the objects that inherit from it.
 * 
 * COMPONENT DEPENDENCIES: 
 * - A Codeable must be ContextHolder
 * 
 * FIELD NAMES (from update event):
 * - argList
 * - functionBody
 * - private
 */
export default class CodeableMember extends DependentMember {

    /** This initializes the component. argList is the arguments for the object function. */
    constructor(name,instanceToCopy,keepUpdatedFixed,specialCaseIdValue) {
        super(name,instanceToCopy,keepUpdatedFixed,specialCaseIdValue);

        //mixin init where needed. This is not a scoep root. Parent scope is inherited in this object
        this.contextHolderMixinInit(false);
        
        //this should be set to true by any extending class that supresses the messenger
        //see the supressMessenger function for details.
        this.doSupressMessenger = false;
        
        //==============
        //Fields
        //==============
        //Initailize these if this is a new instance
        if(!instanceToCopy) {
            //arguments of the member function
            this.setField("argList",[]);
            //"functionBody";
            //"supplementalCode";
            //"compiledInfo"
        }
        else {
            //this is treated as a fixed variable rather than a field
            //it can be set only on creation
            if(instanceToCopy.contextParentGeneration) {
                this.contextParentGeneration = instanceToCopy.contextParentGeneration;
            }
        }
        
        //==============
        //Working variables
        //==============
        this.dependencyInitInProgress = false;
    }

    /** This property tells if this object is a codeable.
     * This property should not be implemented on non-codeables. */
    get isCodeable() {
        return true;
    } 

    getSetCodeOk() {
        return this.constructor.generator.setCodeOk;
    }

    /** This method returns the argument list.  */
    getArgList() {
        return this.getField("argList");
    }

    /** This method returns the fucntion body for this member.  */
    getFunctionBody() {
        return this.getField("functionBody");
    }

    /** This method returns the supplemental code for this member.  */
    getSupplementalCode() {
        return this.getField("supplementalCode");
    }

    /** This method returns the actual code that is executed. It will only return a valid result when there
     * is code that has been compiled for the member. */
    getCodeText() {
        let compiledInfo = this.getField("compiledInfo");
        if((compiledInfo)&&(compiledInfo.generatorFunction)) return compiledInfo.generatorFunction.toString();
        else return null;
    }

    /** This is a helper method that compiles the code as needed for setCodeInfo.*/
    applyCode(argList,functionBody,supplementalCode) {

        //save the code
        if(this.getField("argList").toString() != argList.toString()) {
            this.setField("argList",argList);
        }
        
        if(this.getField("functionBody") != functionBody) {
            this.setField("functionBody",functionBody);
        }
        
        if(this.getField("supplementalCode") != supplementalCode) {
            this.setField("supplementalCode",supplementalCode);
        }
        
        //process the code text into javascript code
        var compiledInfo = processCode(argList,functionBody,supplementalCode,this.getName());
        this.setField("compiledInfo",compiledInfo);
    }

    /** This method clears the function body and supplemental code, and
     * updates any associated variables, including the dependencies.  */
    clearCode(model) {
        if(this.getField("functionBody") != "") {
            this.setField("functionBody","");
        }
        if(this.getField("supplementalCode") != "") {
            this.setField("supplementalCode","");
        }
        this.clearField("compiledInfo");
        
        this.clearCalcPending();

        this.updateDependencies(model,[]);
    }

    /** This method returns the formula for this member.  */
    initializeDependencies(model) {

        let compiledInfo = this.getField("compiledInfo");
        
        if((this.hasCode())&&(compiledInfo.valid)) {
            //set the dependencies
            var dependsOnMap = getDependencyInfo(compiledInfo.varInfo,model,this.getCodeContextManager(model));
            this.updateDependencies(model,dependsOnMap);
            
        }
        else {
            //will not be calculated - has no dependencies
            this.updateDependencies(model,{});
        }
    }

    /** This method udpates the dependencies if needed because
     *the passed variable was added.  */
    updateDependeciesForModelChange(model,additionalUpdatedMembers) {
        let compiledInfo = this.getField("compiledInfo");
        if((compiledInfo)&&(compiledInfo.valid)) {
                    
            //calculate new dependencies
            let oldDependsOnMap = this.getDependsOn();
            let newDependsOnMap = getDependencyInfo(compiledInfo.varInfo,model,this.getCodeContextManager(model));

            if(!apogeeutil.jsonEquals(oldDependsOnMap,newDependsOnMap)) {
                //if dependencies changes, make a new mutable copy and add this to 
                //the updated values list
                let mutableMemberCopy = model.getMutableMember(this.getId());
                mutableMemberCopy.updateDependencies(model,newDependsOnMap);
                additionalUpdatedMembers.push(mutableMemberCopy);
            }
        }
    }

    /** This method returns the formula for this member.  */
    hasCode() {
        return this.getField("compiledInfo") ? true : false;
    }

    /** If this is true the member is ready to be executed. */
    memberUsesRecalculation() {
        return this.hasCode();
    }

    /** This method sets the data object for the member.  */
    calculate(model) {
        let compiledInfo = this.getField("compiledInfo");
        if(!compiledInfo) {
            this.setError(model,"Code not found for member: " + this.getName());
            this.clearCalcPending();
            return;
        }
        else if(!compiledInfo.valid) {
            let error = new Error(compiledInfo.errorMsg ? compiledInfo.errorMsg : "Unknown error parsing user code");
            if(compiledInfo.extendedErrorInfo) CodeableMember.appendExtendedInfo(error,compiledInfo.extendedErrorInfo);
            this.setError(model,error);
            this.clearCalcPending();
            return;
        }
      
        try {
            this.processMemberFunction(model,compiledInfo.memberFunctionGenerator);
        }
        catch(error) {
            
            if(error == apogeeutil.MEMBER_FUNCTION_INVALID_THROWABLE) {
                //This is not an error. I don't like to throw an error
                //for an expected condition, but I didn't know how else
                //to do this. See notes where this is thrown.
                this.setResultInvalid(model);
            }
            else if(error == apogeeutil.MEMBER_FUNCTION_PENDING_THROWABLE) {
                //This is not an error. I don't like to throw an error
                //for an expected condition, but I didn't know how else
                //to do this. See notes where this is thrown.
                this.setResultPending(model);
            }
            else if(error.isDependsOnError) {
                //this is a depends on error from a member (presumably a fucntion table) we are calling
                this.setError(model,error);
            }
            //--------------------------------------
            else {            
                //this is an error in the code
                if(error.stack) {
                    console.error("Error calculating member " + this.getFullName(model));
                    console.error(error.stack);
                }

                //create the extended error info
                CodeableMember.appendMemberTraceInfo(model,error,this);

                let extendedErrorInfo = {};
                extendedErrorInfo.type = "runtimeError";
                extendedErrorInfo.description = "Error in code evaluating member: " + this.getFullName(model);
                if(error.stack) extendedErrorInfo.stack = error.stack;
                extendedErrorInfo.memberTrace = CodeableMember.getMemberTraceInfo(error);

                CodeableMember.appendExtendedInfo(error,extendedErrorInfo);

                this.setError(model,error);
            }
        }
        
        this.clearCalcPending();
    }

    //------------------------------
    // Member Methods
    //------------------------------

    /** This gets an update structure to update a newly instantiated member
    /* to match the current object. */
    getUpdateData() {
        var updateData = {};
        if(this.hasCode()) {
            updateData.argList = this.getArgList();
            updateData.functionBody = this.getFunctionBody();
            updateData.supplementalCode = this.getSupplementalCode();
        }
        else {
            let state = this.getState();

            //handle the possible data value cases
            if(state == apogeeutil.STATE_INVALID) {
                //invalid valude
                updateData.invalidValue = true;
            }
            else if(state == apogeeutil.STATE_PENDING) {
                //pending value - we can't do anything with this
                apogeeUserAlert("There is a pending result in a field being saved. This may not be saved properly.");
                updateData.data = "<unknown pending value>";
            }
            else if(state == apogeeutil.STATE_ERROR) {
                //save a single error
                updateData.error = this.getErrorMsg();
                updateData.extendedErrorInfoList = this.getExtendedErrorInfo();
            }
            else {
                //save the data value
                updateData.data = this.getData();
            }
        }

        if(this.contextParentGeneration) {
            updateData.contextParentGeneration = this.contextParentGeneration;
        }

        return updateData;
    }

    /** This member initialized the codeable fields for a member. */
    setUpdateData(model,initialData) {
        //apply the initial data
        if(initialData.functionBody !== undefined) {
            //apply initial code
            this.applyCode(initialData.argList,
                initialData.functionBody,
                initialData.supplementalCode);
        }
        else {
            //set initial data
            if(initialData.error) {
                //reconstruct the error
                let error = new Error(initialData.error);
                if(initialData.extendedErrorInfoList) {
                    initialData.extendedErrorInfo.forEach(extendedErrorInfo => CodeableMember.appendExtendedInfo(extendedErrorInfo));
                }
                this.setError(model,error);
            }
            else if(initialData.errorList) {
                //depracated!!! replaced with initialData.error and initialData.extendedErrorInfoList
                //this feature was seldom if ever used, so we will just take the first if there is more than one
                let error = (errorList.length >= 1) ? errorList[0] : new Error("Error!");
                this.setError(model,error);
            }
            else if(initialData.invalidValue) {
                this.setResultInvalid(model);
            }
            else {
                let data = (initialData.data !== undefined) ? initialData.data : "";
                this.setData(model,data);
            }

            //set the code fields to empty strings
            this.setField("functionBody","");
            this.setField("supplementalCode","");
        }

        if(initialData.contextParentGeneration) {
            this.contextParentGeneration = initialData.contextParentGeneration;
        }
    }

    //------------------------------
    //ContextHolder methods
    //------------------------------

    /** This method creates the context manager for this member. */
    createContextManager() {
        return new ContextManager(this);
    }

    //===================================
    // Protected Functions
    //===================================

    /** This method is used to remove access to the messenger from the formula for
     * this member. This should be done if the data from the member includes user runnable
     * code. The messenger should only be called in creating a data result for the member.
     * (Specifically, calling the messenger is only valid while the member is being calculated.
     * If it is called after that it will throw an error.) One place this supression is done is
     * in a FunctionMember.
     */
    supressMessenger(doSupressMessenger) {
        this.doSupressMessenger = doSupressMessenger;
    }

    /** This function just returns the context manager for the code for this object. 
     * This is nominally the context manager for this object. However, There is an allowance
     * to use a replacement for the context manager as used in the code.
     * This is specifically intended for compound members where the end user is providing code,
     * such as through a form with expressions for input. In this case we want to code to be executed as
     * if it were on a different member. In the above menetioned case, the code should be from the parent page 
     * where the user is entering the form data. To do this, the contextParentGeneration should be set to 
     * the number of parent generations that should be used for the context member.
     */
    getCodeContextManager(model) {
        let contextMember;
        if(this.contextParentGeneration) {
            contextMember = this.getRemoteContextMember(model);
        }
        else {
            contextMember = this;
        }

        return contextMember.getContextManager();
    }

    /** This function is used to get a remote context member */
    getRemoteContextMember(model) {
        let contextMember = this;
        let parentCount = this.contextParentGeneration;
        while((parentCount)&&(contextMember)) {
            contextMember = contextMember.getParent(model);
            parentCount--;
        }
        //if we have not context member, revert to the local object
        if(!contextMember) contextMember = this;
        return contextMember;
    }



    //===================================
    // Private Functions
    //===================================

    //implementations must implement this function
    //This method takes the object function generated from code and processes it
    //to set the data for the object. (protected)
    //processMemberFunction 
    
    /** This makes sure user code of object function is ready to execute.  */
    initializeMemberFunction(model) {
        //we want to hold these as closure variables
        let functionInitialized = false;
        let functionInitializedSuccess = false;

        let memberFunctionInitializer = () => {
            
            if(functionInitialized) return functionInitializedSuccess;
            
            //make sure this in only called once
            if(this.dependencyInitInProgress) {
                this.setError(model,"Circular reference error");
                //clear calc in progress flag
                this.dependencyInitInProgress = false;
                functionInitialized = true;
                functionInitializedSuccess = false;
                return functionInitializedSuccess;
            }
            this.dependencyInitInProgress = true;
            
            try {
                //make sure the data is set in each impactor
                this.initializeImpactors(model);
                this.calculateDependentState(model,true);
                let state = this.getState();
                if((state == apogeeutil.STATE_ERROR)||(state == apogeeutil.STATE_PENDING)||(state == apogeeutil.STATE_INVALID)) {
                    //stop initialization if there is an issue in a dependent
                    this.dependencyInitInProgress = false;
                    functionInitialized = true;
                    functionInitializedSuccess = false;
                    return functionInitializedSuccess;
                }
                
                //set the context
                let compiledInfo = this.getField("compiledInfo");
                let messenger = this.doSupressMessenger ? undefined : new Messenger(model,this);
                compiledInfo.memberFunctionContextInitializer(model,this.getCodeContextManager(model),messenger);
                
                functionInitializedSuccess = true;
            }
            catch(error) {
                //LATER NOTE - I think this is an internal error if we get an error here
                //initializeImpactor will catch errors in user code of other members.
                //the other function calls above should not throw errors, in theory
                //investigate this more...
                if(error.stack) {
                    console.error(error.stack);
                }

                this.setError(model,error);
                functionInitializedSuccess = false;
            }
            
            this.dependencyInitInProgress = false;
            functionInitialized = true;
            return functionInitializedSuccess;
        }

        return memberFunctionInitializer();

    }

}

//add components to this class
apogeeutil.mixin(CodeableMember,ContextHolder);