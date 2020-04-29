import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import Model from "/apogee/data/Model.js";
import DependentMember from "/apogee/datacomponents/DependentMember.js";
import ContextHolder from "/apogee/datacomponents/ContextHolder.js";
import ContextManager from "/apogee/lib/ContextManager.js";
import Parent from "/apogee/datacomponents/Parent.js";

/** This is a folder. */
export default class Folder extends DependentMember {

    constructor(name,parent,instanceToCopy,keepUpdatedFixed) {
        super(name,parent,instanceToCopy,keepUpdatedFixed);

        //mixin init where needed
        //This is not a root. Scope is inherited from the parent.
        this.contextHolderMixinInit(false);
        this.parentMixinInit(instanceToCopy);

        //initialize data value if this is a new folder
        if(!instanceToCopy) {
            let dataMap = {};
            Object.freeze(dataMap);
            this.setData(dataMap);
        }
    }

    //------------------------------
    // Parent Methods
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

    //------------------------------
    // Dependent Methods
    //------------------------------

    /** There is no calculation for the folder base on dependents. */
    memberUsesRecalculation() {
        return true;
    }

    /** Calculate the data.  */
    calculate(model) {
        //make sure impactors are calculated
        this.initializeImpactors(model);
        
        //folders work slightly different because of pass thorugh dependencies. We will set the folder data
        //value regardless of the state, meaning if the state is error or pending or invalid, we still set
        //the data, along with maintaining the current state.

        //make an immutable map of the data for each child
        let childIdMap = this.getChildIdMap();
        let dataMap = {};
        for(let name in childIdMap) {
            let childId = childIdMap[name];
            let child = model.lookupMemberById(childId);
            if(child) {
                dataMap[name] = child.getData();
            }
        }
        Object.freeze(dataMap);

        let state = this.getState();
        if((state != apogeeutil.STATE_ERROR)&&(state != apogeeutil.STATE_PENDING)&&(state != apogeeutil.STATE_INVALID)) {
            //set the data state if there is no child error or other exceptional case
            this.setData(dataMap);
        }
        else {
            //if there is a child exceptional case, still set the data for the sake of pass through dependencies
            this.forceUpdateDataWithoutStateChange(dataMap);
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
    static fromJson(parentId,json) {
        var folder = new Folder(json.name,parentId);

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

