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
        var codeLabel = this.getName();
        var compiledInfo = processCode(argList,functionBody,supplementalCode,codeLabel);
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
            var dependsOnMap = getDependencyInfo(compiledInfo.varInfo,model,this.getContextManager());
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
            let newDependsOnMap = getDependencyInfo(compiledInfo.varInfo,model,this.getContextManager());

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
            this.setErrors(model,compiledInfo.errors);
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
            //--------------------------------------
            else {
                //normal error in member function execution
            
                //this is an error in the code
                if(error.stack) {
                    console.error("Error calculating member " + this.getFullName(model));
                    console.error(error.stack);
                }

                this.setError(model,error);
            }
        }
        
        this.clearCalcPending();
    }

    //------------------------------
    // Member Methods
    //------------------------------

    /** This gets an update structure to upsate a newly instantiated member
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
                alert("There is a pending result in a field being saved. This may not be saved properly.");
                updateData.data = "<unknown pending value>";
            }
            else if(state == apogeeutil.STATE_ERROR) {
                //save a single error
                updateData.errorList = [this.getErrorMsg()];
            }
            else {
                //save the data value
                updateData.data = this.getData();
            }
        }
        return updateData;
    }

    //------------------------------
    //ContextHolder methods
    //------------------------------

    /** This method retrieve creates the loaded context manager. */
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
                compiledInfo.memberFunctionContextInitializer(model,this.getContextManager(),messenger);
                
                functionInitializedSuccess = true;
            }
            catch(error) {
                //this is an error in the code
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