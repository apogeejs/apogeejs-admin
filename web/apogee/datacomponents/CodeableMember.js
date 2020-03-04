import base from "/apogeeutil/base.js";
import Messenger from "/apogee/actions/Messenger.js";
import {processCode} from "/apogee/lib/codeCompiler.js"; 
import {getDependencyInfo} from "/apogee/lib/codeDependencies.js";
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
    constructor(model,name,owner) {
        super(model,name,owner);
        
        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
        //FIELDS
        //arguments of the member function
        this.setField("argList",[]);
        //"functionBody";
        //"supplementalCode";
        //"compiledInfo"
        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
        
        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
        //WORKING FIELDS
        //fields used in calculation
        this.dependencyInitInProgress = false;
        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
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
        var codeLabel = this.getFullName();
        var compiledInfo = processCode(argList,functionBody,supplementalCode,codeLabel);
        this.setField("compiledInfo",compiledInfo);
    }

    /** This method clears the function body and supplemental code, and
     * updates any associated variables, including the dependencies.  */
    clearCode() {
        if(this.getField("functionBody") != "") {
            this.setField("functionBody","");
        }
        if(this.getField("supplementalCode") != "") {
            this.setField("supplementalCode","");
        }
        this.clearField("compiledInfo");
        
        this.clearCalcPending();

        this.updateDependencies([]);
    }

    /** This method returns the formula for this member.  */
    initializeDependencies() {

        let compiledInfo = this.getField("compiledInfo");
        
        if((this.hasCode())&&(compiledInfo.valid)) {
            try {
                var newDependsOnMemberList = getDependencyInfo(compiledInfo.varInfo,this.getContextManager());

                //update dependencies
                this.updateDependencies(newDependsOnMemberList);
            }
            catch(ex) {
                this.codeErrors.push(ex);
            }
        }
        else {
            //will not be calculated - has no dependencies
            this.updateDependencies([]);
        }
    }

    /** This method udpates the dependencies if needed because
     *the passed variable was added.  */
    updateDependeciesForModelChange(additionalUpdatedMembers) {
        let compiledInfo = this.getField("compiledInfo");
        if((compiledInfo)&&(compiledInfo.valid)) {
                    
            //calculate new dependencies
            var newDependencyList = getDependencyInfo(compiledInfo.varInfo,this.getContextManager());
            
            //update the dependency list
            var dependenciesChanged = this.updateDependencies(newDependencyList);
            if(dependenciesChanged) {
                //add to update list
                additionalUpdatedMembers.push(this);
            }  
        }
    }

    /** This method returns the formula for this member.  */
    hasCode() {
        return this.getField("compiledInfo") ? true : false;
    }

    /** If this is true the member is ready to be executed. 
     * @private */
    memberUsesRecalculation() {
        return this.hasCode();
    }

    /** This method sets the data object for the member.  */
    calculate() {
        let compiledInfo = this.getField("compiledInfo");
        if(!compiledInfo) {
            this.setError("Code not found for member: " + this.getName());
            this.clearCalcPending();
            return;
        }
        else if(!compiledInfo.valid) {
            this.setErrors(compiledInfo.codeErrors);
            this.clearCalcPending();
            return;
        }

//temporary - re create the initializer
let memberFunctionInitializer = this.createMemberFunctionInitializer();
      
        try {
            this.processMemberFunction(memberFunctionInitializer,compiledInfo.memberFunctionGenerator);
        }
        catch(error) {
            if(error == base.MEMBER_FUNCTION_INVALID_THROWABLE) {
                //This is not an error. I don't like to throw an error
                //for an expected condition, but I didn't know how else
                //to do this. See notes where this is thrown.
                this.setResultInvalid();
            }
            else if(error == base.MEMBER_FUNCTION_PENDING_THROWABLE) {
                //This is not an error. I don't like to throw an error
                //for an expected condition, but I didn't know how else
                //to do this. See notes where this is thrown.
                this.setResultPending();
            }
            //--------------------------------------
            else {
                //normal error in member function execution
            
                //this is an error in the code
                if(error.stack) {
                    console.error(error.stack);
                }

                this.setError(error);
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
                //save the errors as strings only
                updateData.errorList = this.getErrors().map(error => error.toString());
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
    // Private Functions
    //===================================

    //implementations must implement this function
    //This method takes the object function generated from code and processes it
    //to set the data for the object. (protected)
    //processMemberFunction 
    
    /** This makes sure user code of object function is ready to execute.  */
    createMemberFunctionInitializer() {
        //we want to hold these as closure variables
        let functionInitialized = false;
        let functionInitializedSuccess = false;

        let memberFunctionInitializer = () => {
            
            if(functionInitialized) return functionInitializedSuccess;
            
            //make sure this in only called once
            if(this.dependencyInitInProgress) {
                this.setError("Circular reference error");
                //clear calc in progress flag
                this.dependencyInitInProgress = false;
                functionInitialized = true;
                functionInitializedSuccess = false;
                return functionInitializedSuccess;
            }
            this.dependencyInitInProgress = true;
            
            try {
                //make sure the data is set in each impactor
                this.initializeImpactors();
                let state = this.getState();
                if((state == apogeeutil.STATE_ERROR)||(state == apogeeutil.STATE_PENDING)||(state == apogeeutil.STATE_INVALID)) {
                    this.dependencyInitInProgress = false;
                    functionInitialized = true;
                    functionInitializedSuccess = false;
                    return functionInitializedSuccess;
                }
                
                //set the context
                let compiledInfo = this.getField("compiledInfo");
                let messenger = new Messenger(this);
                compiledInfo.memberFunctionContextInitializer(this.getContextManager(),messenger);
                
                functionInitializedSuccess = true;
            }
            catch(error) {
                //this is an error in the code
                if(error.stack) {
                    console.error(error.stack);
                }

                this.setError(error);
                functionInitializedSuccess = false;
            }
            
            this.dependencyInitInProgress = false;
            functionInitialized = true;
            return functionInitializedSuccess;
        }

        return memberFunctionInitializer;

    }


}

