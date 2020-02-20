import base from "/apogeeutil/base.js";
import {doAction} from "/apogee/actions/action.js";
import Model from "/apogee/data/Model.js";
import ActionError from "/apogee/lib/ActionError.js";
import ContextManager from "/apogee/lib/ContextManager.js";
import DependentMember from "/apogee/datacomponents/DependentMember.js";
import ContextHolder from "/apogee/datacomponents/ContextHolder.js";
import Owner from "/apogee/datacomponents/Owner.js";
import RootHolder from "/apogee/datacomponents/RootHolder.js";
import CommandManager from "/apogeeapp/commands/CommandManager.js";

/** This is a folderFunction, which is basically a function
 * that is expanded into data objects. */
export default class FolderFunction extends DependentMember {

    constructor(name,owner,initialData) {
        super(name,FolderFunction.generator);

        //mixin init where needed
        this.dependentMixinInit();
        this.contextHolderMixinInit();
        
        this.initOwner(owner);
        
        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
        //FIELDS
        let argList = initialData.argList !== undefined ? initialData.argList : [];
        this.setField("argList",argList);
        let returnValueString = initialData.returnValue !== undefined ? initialData.returnValue : [];
        this.setField("returnValue",returnValueString);
        //"internalFolder"
        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

        //set to an empty function
        this.setData(function(){});
    }

    /** This gets the internal forlder for the folderFunction. */
    getInternalFolder() {
        return this.getField("internalFolder");
    }

    /** Implemnetation of get root for folder function. */
    getRoot() {
        return this.getInternalFolder();
    }

    /** This method sets the root object - implemented from RootHolder.  */
    setRoot(child) {
        this.setField("internalFolder",child);
        var newDependsOn = [];
        if(child) newDependsOn.push(child);
        this.updateDependencies(newDependsOn);
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

    /** This method removes any data from this model on closing. */
    close() {
        this.getField("internalFolder").onClose();
    }

    /** This method creates a member from a json. It should be implemented as a static
     * method in a non-abstract class. */ 
    static fromJson(owner,json) {
        return new FolderFunction(json.name,owner,json.updateData);
    }

    /** This method adds any additional data to the json saved for this member. 
     * @protected */
    addToJson(json) {
        json.updateData = {};
        json.updateData.argList = this.getField("argList");
        json.updateData.returnValue = this.getField("returnValue");
        json.children = {};
        json.children[FolderFunction.INTERNAL_FOLDER_NAME] = this.getField("internalFolder").toJson();
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

            var argList = updateData.argList ? updateData.argList : folderFunction.argList;
            var returnValueString = updateData.returnValue ? updateData.returnValue : folderFunction.returnValueString;
    
            var actionData = {};
            actionData.action = "updateFolderFunction";
            actionData.memberName = folderFunction.getFullName();
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
    needsCalculating() {
        return true;
    }

    /** This updates the member data based on the function. It returns
     * true for success and false if there is an error.  */
    calculate() {  
        //make sure the data is set in each impactor
        this.initializeImpactors();
        
        var folderFunctionErrors = [];
        
        //check for code errors, if so set a data error
        var folderFunctionFunction = this.getFolderFunctionFunction(folderFunctionErrors);
        
        if(folderFunctionErrors.length == 0) {
            this.setData(folderFunctionFunction);
        }
        else {
            //for now I can only set a single error. I will set the first.
            //I should get way to set multiple
            this.addErrors(folderFunctionErrors);
        }
        
        this.clearCalcPending();
    }

    /** This method updates the dependencies of any children
     * based on an object being added. */
    updateDependeciesForModelChange(recalculateList) {
        let internalFolder = this.getField("internalFolder");
        if(internalFolder) {
            internalFolder.updateDependeciesForModelChange(recalculateList);
        }
    }

    //------------------------------
    //ContextHolder methods
    //------------------------------

    /** This method retrieve creates the loaded context manager. */
    createContextManager() {
        return new ContextManager(this);
    }

    //------------------------------
    //Parent methods
    //------------------------------

    /** this method gets the table map. */
    getChildMap() {
        return this.getField("internalFolder").getChildMap();
    }

    /** This method looks up a child from this folder.  */
    lookupChild(name) {
        //check look for object in this folder
        return this.getField("internalFolder").getChildMap()[name];
    }

    //------------------------------
    //Owner methods
    //------------------------------

    /** this method gets the hame the children inherit for the full name. */
    getPossesionNameBase() {
        return this.getFullName() + ".";
    }

    /** This method looks up a member by its full name. */
    getMemberByPathArray(path,startElement) {
        let internalFolder = this.getField("internalFolder");
        if(startElement === undefined) startElement = 0;
        if(path[startElement] === internalFolder.getName()) {
            if(startElement === path.length-1) {
                return internalFolder;
            }
            else {
                startElement++;
                return internalFolder.lookupChildFromPathArray(path,startElement);
            }
        }
        else {
            return null;
        }
    }


    //==============================
    // Private Methods
    //==============================

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
    getFolderFunctionFunction(folderFunctionErrors) {

        //create a copy of the model to do the function calculation - we don't update the UI display version
        var virtualModel;
        var rootFolder;
        var inputElementArray;
        var returnValueTable; 
        
        var initialized = false;
        
        var folderFunctionFunction = args => {
            
            if(!initialized) {
                //create a copy of the model to do the function calculation - we don't update the UI display version
                virtualModel = this.createVirtualModel(folderFunctionErrors);
        
        //HANDLE THIS ERROR CASE DIFFERENTLY!!!
                if(!virtualModel) {
                    return null;
                }

                //lookup elements from virtual model
                rootFolder = virtualModel.getRoot();
                inputElementArray = this.loadInputElements(rootFolder,folderFunctionErrors);
                returnValueTable = this.loadOutputElement(rootFolder,folderFunctionErrors); 
                
                initialized = true;
            }
            
            //create an update array to set the table values to the elements  
            var updateActionList = [];
            for(var i = 0; i < inputElementArray.length; i++) {
                var entry = {};
                entry.action = "updateData";
                entry.memberName = inputElementArray[i].getFullName();
                entry.data = arguments[i];
                updateActionList.push(entry);
            }
            
            var actionData = {};
            actionData.action = "compoundAction";
            actionData.actions = updateActionList;

            //apply the update
            var actionResult = doAction(virtualModel,actionData);        
            if(actionResult.alertMsg) {
                CommandManager.errorAlert(actionResult.alertMsg);
            }
            if(actionResult.actionDone) {
                //retrieve the result
                if(returnValueTable) {
                    
                    if(returnValueTable.getResultPending()) {
                        throw new Error("A folder function must not be asynchronous: " + this.getFullName());
                    }
                    
                    return returnValueTable.getData();
                }
                else {
                    //no return value found
                    return undefined;
                }
            }
        }
        
        return folderFunctionFunction;    
    }

    /** This method creates a copy of the model to be used for the function evvaluation. 
     * @private */
    createVirtualModel(folderFunctionErrors) {
        try {
            let internalFolder = this.getField("internalFolder");
            var folderJson = internalFolder.toJson();
            var modelJson = Model.createWorkpaceJsonFromFolderJson(this.getName(),folderJson);
            var virtualModel = new Model(this.getOwner());
            var actionResult = virtualModel.loadFromJson(modelJson);
            
            //do something with action result!!!
            
            return virtualModel;
        }
        catch(error) {
            var actionError = ActionError.processException(error,"FolderFunction - Code",false);
            folderFunctionErrors.push(actionError);
            return null;
        }
    }

    /** This method loads the input argument members from the virtual model. 
     * @private */
    loadInputElements(rootFolder,folderFunctionErrors) {
        let argMembers = [];
        let argList = this.getField("argList");
        for(var i = 0; i < argList.length; i++) {
            var argName = argList[i];
            var argMember = rootFolder.lookupChild(argName);
            if(argMember) {
                argMembers.push(argMember);
            }
    //		else {
    //            //missing input element
    //            var msg = "Input element not found in folderFunction: " + argName;
    //            var actionError = new ActionError(msg,"FolderFunction - Code",this);
    //            folderFunctionErrors.push(actionError);
    //        }       
        }
        return argMembers;
    }

    /** This method loads the output member from the virtual model. 
     * @private  */
    loadOutputElement(rootFolder,folderFunctionErrors) {
        let returnValueString = this.getField("returnValue");
        var returnValueMember = rootFolder.lookupChild(returnValueString);
    //    if(!returnValueMember) {
    //        //missing input element
    //        var msg = "Return element not found in folderFunction: " + returnValueString;
    //        var actionError = new ActionError(msg,"FolderFunction - Code",this);
    //        folderFunctionErrors.push(actionError);
    //    }
        return returnValueMember;
    }
}

//add components to this class
base.mixin(FolderFunction,ContextHolder);
base.mixin(FolderFunction,Owner);
base.mixin(FolderFunction,RootHolder);

FolderFunction.INTERNAL_FOLDER_NAME = "root";

        
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




