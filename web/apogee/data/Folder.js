import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import Model from "/apogee/data/Model.js";
import DependentMember from "/apogee/datacomponents/DependentMember.js";
import ContextHolder from "/apogee/datacomponents/ContextHolder.js";
import ContextManager from "/apogee/lib/ContextManager.js";
import Parent from "/apogee/datacomponents/Parent.js";

/** This is a folder. */
export default class Folder extends DependentMember {

    constructor(name,instanceToCopy,keepUpdatedFixed,specialCaseIdValue) {
        super(name,instanceToCopy,keepUpdatedFixed,specialCaseIdValue);

        //mixin init where needed
        //This is not a root. Scope is inherited from the parent.
        this.contextHolderMixinInit(false);
        this.parentMixinInit(instanceToCopy);
    }

    //------------------------------
    // Parent Methods
    //------------------------------

    /** In this implementation updates the dependencies and updates the data value for the folder. See notes on why the update is
     * done here rather than in 'calculate' */
    onAddChild(model,child) {
        //set all children as dependents
        let dependsOnMap = this.calculateDependents(model);
        this.updateDependencies(model,dependsOnMap);

        //recalculate data and state
        let name = child.getName();
        let data = child.getData();
        let newDataMap = this._getSplicedDataMap(model,name,data);
        let {state, error} = this.calculateDependentState(model,false);

        //set the new state and data
        this.setStateAndData(model,state,newDataMap,error,true)
    }

    /** In this implementation updates the dependencies and updates the data value for the folder. See notes on why the update is
     * done here rather than in 'calculate' */
    onRemoveChild(model,child) {
        //set all children as dependents
        let dependsOnMap = this.calculateDependents(model);
        this.updateDependencies(model,dependsOnMap);

        //recalculate data and state
        let name = child.getName();
        let newDataMap = this._getSplicedDataMap(model,name);
        let {state, error} = this.calculateDependentState(model,false);

        //set the new state and data
        this.setStateAndData(model,state,newDataMap,error,true);
    }

    /** In this implementation we update the data value for the folder. See notes on why this is
     * done here rather than in 'calculate' */
    onChildDataUpdate(model,child) {
        let childId = child.getId();
        let childIdMap = this.getChildIdMap();
        let name = child.getName();
        if(childIdMap[name] != childId) {
            apogeeUserAlert("Error - the table " + childId + " is not registered in the parent under the name "  + name);
            return;
        }

        //get new data
        let data = child.getData();
        let newDataMap = this._getSplicedDataMap(model,name,data);
        //calculate dependent state but do not set it yet
        let {state, error} = this.calculateDependentState(model,false);

        //here we will always set the data whether or not there are any issues in dependents
        this.setStateAndData(model,state,newDataMap,error,true);
    }

    /** this method gets the hame the children inherit for the full name. */
    getPossesionNameBase(model) {
        return this.getFullName(model) + ".";
    }

    //------------------------------
    // Dependent Methods
    //------------------------------

    /** There is no calculation for the folder base on dependents. */
    memberUsesRecalculation() {
        return true;
    }

    /** This usually calculates the value of the member. However, in the case of a folder the value is already updated
     * once we initialize the impactors. We update the value incrementally so that we do not need to calculate all children
     * before any data is read from the folder. If we waited, we would get a circular dependecy if we trie to specify the 
     * name of a member including the path to it. We need to allow this to avoid name colisions at times.  */
    calculate(model) {
        //make sure the data is set in each impactor
        this.initializeImpactors(model);
        
        //see note in method description - no calculation is done here. It is done incrementally as children are calculated.
        //BUT if there was no update of children since prepare for calculate,
        //we will recalculate state and reset current value.
        if(this.getState() == apogeeutil.STATE_NONE) {
            //get new data
            let data = this.getData();
            let {state, error} = this.calculateDependentState(model,false);
            if(state == apogeeutil.STATE_NONE) state = apogeeutil.STATE_NORMAL;

            //here we will always set the data whether or not there are any issues in dependents
            this.setStateAndData(model,state,data,error,true);
        }

        //clear calc pending flag
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
            let childId = childIdMap[name];
            var child = model.lookupMemberById(childId);
            if((child)&&(child.isDependent)) {
                child.updateDependeciesForModelChange(model,additionalUpdatedMembers);
            }
        }
    }

    //------------------------------
    // Member Methods
    //------------------------------

    /** This method creates a member from a json. It should be implemented as a static
     * method in a non-abstract class. */ 
    static fromJson(model,json) {
        var folder = new Folder(json.name,null,null,json.specialIdValue);

        let dataMap = {};
        Object.freeze(dataMap);
        folder.setData(model,dataMap);

        if(json.childrenNotWriteable) {
            folder.setChildrenWriteable(false);
        }

        return folder;
    }

    /** This method adds any additional data to the json to save for this member. 
     * @protected */
    addToJson(model,json) {
        json.children = {};
        
        if(!this.getChildrenWriteable()) {
            json.childrenNotWriteable = true;
        }
        
        let childIdMap = this.getChildIdMap();
        for(var name in childIdMap) {
            let childId = childIdMap[name];
            let child = model.lookupMemberById(childId);
            json.children[name] = child.toJson(model);
        }
    }

    //------------------------------
    // context holder Methods
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

    //============================
    // Private methods
    //============================

    /** This method calculates the dependencies for this folder. 
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

    /** This does a partial update of the folder value, for a single child */
    _getSplicedDataMap(model,addOrRemoveName,addData) {
        //shallow copy old data
        let oldDataMap = this.getData();
        let newDataMap = {};
        Object.assign(newDataMap,oldDataMap);

        //add or update this child data
        if(addData !== undefined) {
            newDataMap[addOrRemoveName] = addData;
        }
        else {
            delete newDataMap[addOrRemoveName];
        }
        
        //make this immutable and set it as data for this folder - note we want to set the data whether or not we have an error!
        Object.freeze(newDataMap);
        return newDataMap;
    }

}

//add components to this class                     
apogeeutil.mixin(Folder,ContextHolder);
apogeeutil.mixin(Folder,Parent);

//============================
// Static methods
//============================


Folder.generator = {};
Folder.generator.displayName = "Folder";
Folder.generator.type = "apogee.Folder";
Folder.generator.createMember = Folder.fromJson;
Folder.generator.setDataOk = false;
Folder.generator.setCodeOk = false;

//register this member
Model.addMemberGenerator(Folder.generator);

