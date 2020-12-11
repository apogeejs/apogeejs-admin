import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import {doAction} from "/apogee/actions/action.js";
import Model from "/apogee/data/Model.js";
import ContextManager from "/apogee/lib/ContextManager.js";
import DependentMember from "/apogee/datacomponents/DependentMember.js";
import ContextHolder from "/apogee/datacomponents/ContextHolder.js";
import Parent from "/apogee/datacomponents/Parent.js";

/** This is a folderFunction, which is basically a function
 * that is expanded into data objects. */
export default class FolderFunction extends DependentMember {

    constructor(name,instanceToCopy,keepUpdatedFixed,specialCaseIdValue) {
        super(name,instanceToCopy,keepUpdatedFixed,specialCaseIdValue);

        //mixin init where needed
        this.contextHolderMixinInit();
        this.parentMixinInit(instanceToCopy);

        //==============
        //Fields
        //==============
        //Initailize these if this is a new instance
        if(!instanceToCopy) {
            //this field is used to disable the calculation of the value of this function
            //It is used in the "virtual model" to prevent any unnecessary downstream calculations
            this.setField("sterilized",false)
        }

        //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        this.temporaryVirtualModelRunContext = {
            doAsynchActionCommand: function(modelId,actionData) {
                let msg = "NOT IPLEMENTED: Asynchronous actions in folder function!"
                apogeeUserAlert(msg);
                throw new Error(msg);
            }
        }
        //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    }

    /** This gets the internal forlder for the folderFunction. */
    getInternalFolder(model) {
        return this.lookupChild(model,"body");
    }

    /** This gets the name of the return object for the folderFunction function. */
    getReturnValueString() {
        return this.getField("returnValue");
    }

    /** This gets the arg list of the folderFunction function. */
    getArgList() {
        return this.getField("argList");
    }

    //------------------------------
    // Member Methods
    //------------------------------

    /** This method creates a member from a json. It should be implemented as a static
     * method in a non-abstract class. */ 
    static fromJson(model,json) {
        let member = new FolderFunction(json.name,null,null,json.specialIdValue);

        //set initial data

        //set to an empty function
        member.setData(model,function(){});

        let initialData = json.updateData;
        let argList = ((initialData)&&(initialData.argList !== undefined)) ? initialData.argList : [];
        member.setField("argList",argList);
        let returnValueString = ((initialData)&&(initialData.returnValue !== undefined)) ? initialData.returnValue : [];
        member.setField("returnValue",returnValueString);
        
        return member;
    }

    /** This method adds any additional data to the json saved for this member. 
     * @protected */
    addToJson(model,json) {
        json.updateData = {};
        json.updateData.argList = this.getField("argList");
        json.updateData.returnValue = this.getField("returnValue");
        json.children = {};
        let childIdMap = this.getChildIdMap();
        for(var name in childIdMap) {
            var childId = childIdMap[name];
            let child = model.lookupMemberById(childId);
            if(child) {
                json.children[name] = child.toJson(model);
            }
        }
    }

    /** This method extends the base method to get the property values
     * for the property editting. */
    static readProperties(member,values) {
        var argList = member.getArgList();
        var argListString = argList.toString();
        values.argListString = argListString;
        values.returnValueString = member.getReturnValueString();
        return values;
    }

    /** This method executes a property update. */
    static getPropertyUpdateAction(folderFunction,newValues) {
        let updateData = newValues.updateData;
        if((updateData)&&((updateData.argList !== undefined)||(updateData.returnValue !== undefined))) {

            var argList = updateData.argList ? updateData.argList : folderFunction.getArgList();
            var returnValueString = updateData.returnValue ? updateData.returnValue : folderFunction.getReturnValueString();
    
            var actionData = {};
            actionData.action = "updateFolderFunction";
            actionData.memberId = folderFunction.getId();
            actionData.argList = argList;
            actionData.returnValueString = returnValueString;
            return actionData;
        }    
        else {
            return null;
        }
    }

    //-------------------------------
    // Dependent Methods
    //-------------------------------
        

    /** If this is true the member must be executed. */
    memberUsesRecalculation() {
        return true;
    }

    /** This updates the member data based on the function. It returns
     * true for success and false if there is an error.  */
    calculate(model) {  

        //if this function is sterilized, we will just set the value to invalid value.
        //This prevents any object which calls this function from updating. It is inended to be 
        //used in the virtual workspace assoicated with this folder function
        if(this.getField("sterilized")) {
            this.setResultInvalid(model);
            this.clearCalcPending();
            return;
        }

        //make sure the data is set in each impactor
        this.initializeImpactors(model);
        this.calculateDependentState(model,true);

        let state = this.getState();
        if((state != apogeeutil.STATE_ERROR)&&(state != apogeeutil.STATE_PENDING)&&(state != apogeeutil.STATE_INVALID)) {
            //calculate folder function if no issue in dependent
            try {
                var folderFunctionFunction = this.getFolderFunctionFunction(model);
                this.setData(model,folderFunctionFunction);
            }
            catch(error) {
                if(error.stack) console.error(error.stack);
                
                //error in calculation
                this.setError(model,error);
            }
        }
        
        this.clearCalcPending();
    }

    /** This method updates the dependencies of any children
     * based on an object being added. */
    updateDependeciesForModelChange(model,additionalUpdatedMembers) {

        //update dependencies of this folder
        let oldDependsOnMap = this.getDependsOn();
        let newDependsOnMap = this.calculateDependents(model);
        if(!apogeeutil.jsonEquals(oldDependsOnMap,newDependsOnMap)) {
            //if dependencies changes, make a new mutable copy and add this to 
            //the updated values list
            let mutableMemberCopy = model.getMutableMember(this.getId());
            mutableMemberCopy.updateDependencies(model,newDependsOnMap);
            additionalUpdatedMembers.push(mutableMemberCopy);
        }

        //call update in children
        let childIdMap = this.getChildIdMap();
        for(var name in childIdMap) {
            var childId = childIdMap[name];
            let child = model.lookupMemberById(childId);
            if((child)&&(child.isDependent)) {
                child.updateDependeciesForModelChange(model,additionalUpdatedMembers);
            }
        }
    }

    //------------------------------
    //ContextHolder methods
    //------------------------------

    /** This method retrieve creates the loaded context manager. */
    createContextManager() {
        //set the context manager
        var contextManager = new ContextManager(this);
        
        //add an entry for this folder
        var myEntry = {};
        myEntry.contextHolderAsParent = true;
        contextManager.addToContextList(myEntry);
        
        return contextManager;
    }

    //------------------------------
    //Parent methods
    //------------------------------

    onAddChild(model,child) {
        //set all children as dependents
        let dependsOnMap = this.calculateDependents(model);
        this.updateDependencies(model,dependsOnMap);
    }

    onRemoveChild(model,child) {
        //set all children as dependents
        let dependsOnMap = this.calculateDependents(model);
        this.updateDependencies(model,dependsOnMap);
    }

    /** this method gets the hame the children inherit for the full name. */
    getPossesionNameBase(model) {
        return this.getFullName(model) + ".";
    }

    //============================
    // Private methods
    //============================

    /** This method updates the table data object in the folder data map. 
     * @private */
    calculateDependents(model) {
        let dependsOnMap = [];
        let childIdMap = this.getChildIdMap();
        for(var name in childIdMap) {
            var childId = childIdMap[name];
            dependsOnMap[childId] = apogeeutil.NORMAL_DEPENDENCY;
        }
        return dependsOnMap;
    }

    /** This is called from the update action. It should not be called externally. */
    setReturnValueString(returnValueString) {
        let existingRVS = this.getField("returnValue");
        if(existingRVS != returnValueString) {
            this.setField("returnValue",returnValueString);
        }
    }

    /** This is called from the update action. It should not be called externally. */
    setArgList(argList) {
        let existingArgList = this.getField("argList");
        if(existingArgList != argList) {
            this.setField("argList",argList);
        }
    }

    /** This method creates the folderFunction function. It is called from the update action 
     * and should not be called externally. 
     * @private */
    getFolderFunctionFunction(model) {

        //create a copy of the model to do the function calculation - we don't update the UI display version
        var virtualModel;
        var inputMemberIdArray;
        var returnValueMemberId; 
        
        var initialized = false;
        
        var folderFunctionFunction = (...argumentArray) => {
            
            if(!initialized) {
                //get the ids of the inputs and outputs. We can use the real instance to look these up since they don't change.
                let internalFolder = this.getInternalFolder(model);
                inputMemberIdArray = this.loadInputElementIds(model,internalFolder);
                returnValueMemberId = this.loadOutputElementId(model,internalFolder); 

                //prepare the virtual function
                //this is a copy of the original model, but with any member that is unlocked replaced.
                //to prevent us from modifying an object in use by our current real model calculation.
                virtualModel = model.getCleanCopy(this.temporaryVirtualModelRunContext);

                //we want to set the folder function as "sterilized" - this prevents any downstream work from the folder function updating
                let commandData = {}
                commandData.action = "setField";
                commandData.memberId = this.getId();
                commandData.fieldName = "sterilized";
                commandData.fieldValue = "true";
                let actionResult = doAction(virtualModel,commandData);

                //we should do something with the action result
                if(!actionResult.actionDone) {
                    throw new Error("Error calculating folder function");
                }
                
                initialized = true;
            }
            
            //create an update array to set the table values for the input elements  
            var updateActionList = [];
            for(var i = 0; i < inputMemberIdArray.length; i++) {
                var entry = {};
                entry.action = "updateData";
                entry.memberId = inputMemberIdArray[i];
                entry.data = argumentArray[i];
                updateActionList.push(entry);
            }
            
            var actionData = {};
            actionData.action = "compoundAction";
            actionData.actions = updateActionList;

            //apply the update
            let workingVirtualModel = virtualModel.getMutableModel();
            var actionResult = doAction(workingVirtualModel,actionData);        
            if(actionResult.actionDone) {
                //retrieve the result
                if(returnValueMemberId) {
                    let returnValueMember = workingVirtualModel.lookupMemberById(returnValueMemberId);
                    
                    if(returnValueMember.getState() == apogeeutil.STATE_PENDING) {
                        throw new Error("A folder function must not be asynchronous: " + this.getFullName(workingVirtualModel));
                    }
                    
                    //get the resulting output
                    return returnValueMember.getData();
                }
                else {
                    //no return value found
                    return undefined;
                }
            }
            else {
                let errorMsg = actionResult.errorMsg ? actionResult.errorMsg : "Unknown error evaluating Folder Function " + this.getName();
                throw new Error(errorMsg);
            }
        }
        
        return folderFunctionFunction;    
    }

    /** This method loads the input argument members from the virtual model. 
     * @private */
    loadInputElementIds(model,internalFolder) {
        let argMembers = [];
        let argList = this.getField("argList");
        for(var i = 0; i < argList.length; i++) {
            var argName = argList[i];
            var argMember = internalFolder.lookupChild(model,argName);
            if(argMember) {
                argMembers.push(argMember.getId());
            }     
        }
        return argMembers;
    }

    /** This method loads the output member from the virtual model. 
     * @private  */
    loadOutputElementId(model,internalFolder) {
        let returnValueString = this.getField("returnValue");
        var returnValueMember = internalFolder.lookupChild(model,returnValueString);
        if(returnValueMember) return returnValueMember.getId();
        else return null;
    }
}

//add components to this class
apogeeutil.mixin(FolderFunction,ContextHolder);
apogeeutil.mixin(FolderFunction,Parent);

FolderFunction.INTERNAL_FOLDER_NAME = "body";

        
//============================
// Static methods
//============================

FolderFunction.generator = {};
FolderFunction.generator.displayName = "Folder Function";
FolderFunction.generator.type = "apogee.FolderFunction";
FolderFunction.generator.createMember = FolderFunction.fromJson;
FolderFunction.generator.readProperties = FolderFunction.readProperties;
FolderFunction.generator.getPropertyUpdateAction = FolderFunction.getPropertyUpdateAction;
FolderFunction.generator.setDataOk = false;
FolderFunction.generator.setCodeOk = false;

//register this member
Model.addMemberGenerator(FolderFunction.generator);




