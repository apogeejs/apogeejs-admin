import base from "/apogeeutil/base.js";
import Model from "/apogee/data/Model.js";
import DependentMember from "/apogee/datacomponents/DependentMember.js";
import ContextHolder from "/apogee/datacomponents/ContextHolder.js";
import Owner from "/apogee/datacomponents/Owner.js";
import Parent from "/apogee/datacomponents/Parent.js";

/** This is a folder. */
export default class Folder extends DependentMember {

    constructor(model,name,owner) {
        super(model,name,owner);

        //mixin init where needed
        this.contextHolderMixinInit();
        this.parentMixinInit();

        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
        //FIELDS
        //this holds the base objects, mapped by name
        this.setField("childMap",{});
        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

        //make sure the data map is frozen
        let dataMap = {};
        Object.freeze(dataMap);
        this.setData(dataMap);
    }

    //------------------------------
    // Parent Methods
    //------------------------------

    /** this method gets the table map. */
    getChildMap() {
        return this.getField("childMap");
    }

    /** This method looks up a child from this folder.  */
    lookupChild(name) {
        //check look for object in this folder
        let childMap = this.getField("childMap");
        return childMap[name];
    }

    /** This method adds a table to the folder. It also sets the folder for the
     *table object to this folder. It will fail if the name already exists.  */
    addChild(child) {
        
        //check if it exists first
        let name = child.getName();
        let childMap = this.getField("childMap");
        if(childMap[name]) {
            //already exists! not fatal since it is not added to the model yet,
            throw base.createError("There is already an object with the given name.",false);
        }

        //make a copy of the child map to modify
        let newChildMap = {};
        Object.assign(newChildMap,childMap);

        //add object
        newChildMap[name] = child;
        this.setField("childMap",newChildMap);
        
        //set all children as dependents
        this.calculateDependents();
    }

    /** This method removes a table from the folder. */
    removeChild(child) {
        //make sure this is a child of this object
        var parent = child.getParent();
        if((!parent)||(parent !== this)) return;
        
        //remove from folder
        var name = child.getName();
        let childMap = this.getField("childMap");
        //make a copy of the child map to modify
        let newChildMap = {};
        Object.assign(newChildMap,childMap);
        
        delete(newChildMap[name]);
        this.setField("childMap",newChildMap);
        
        //set all children as dependents
        this.calculateDependents();
    }

    /** There is no calculation for the folder base on dependents. 
     * @private */
    memberUsesRecalculation() {
        return true;
    }

    /** Calculate the data.  */
    calculate() {
        //make sure impactors are calculated
        this.initializeImpactors();

        //make an immutable map of the data for each child
        let childMap = this.getField("childMap");
        let dataMap = {};
        for(let name in childMap) {
            dataMap[name] = childMap[name].getData();
        }
        Object.freeze(dataMap);
        this.setData(dataMap);
        
        //clear calc pending flag
        this.clearCalcPending();
    }

    //------------------------------
    // Dependent Methods
    //------------------------------

    /** This method updates the dependencies of any children
     * based on an object being added. */
    updateDependeciesForModelChange(additionalUpdatedMembers) {
        let childMap = this.getField("childMap");
        for(var key in childMap) {
            var child = childMap[key];
            if(child.isDependent) {
                child.updateDependeciesForModelChange(additionalUpdatedMembers);
            }
        }
    }

    //------------------------------
    // Member Methods
    //------------------------------

    /** This method creates a member from a json. It should be implemented as a static
     * method in a non-abstract class. */ 
    static fromJson(model,owner,json) {
        var folder = new Folder(model,json.name,owner);
        if(json.childrenNotWriteable) {
            folder.setChildrenWriteable(false);
        }
        return folder;
    }

    /** This method adds any additional data to the json to save for this member. 
     * @protected */
    addToJson(json) {
        json.children = {};
        
        if(!this.getChildrenWriteable()) {
            json.childrenNotWriteable = true;
        }
        
        let childMap = this.getField("childMap");
        for(var key in childMap) {
            var child = childMap[key];
            json.children[key] = child.toJson();
        }
    }

    onClose () {
        let childMap = this.getField("childMap");
        for(var key in childMap) {
            var child = childMap[key];
            if(child.onClose) child.onClose();
        }
    }

    //============================
    // Private methods
    //============================

    /** This method updates the table data object in the folder data map. 
     * @private */
    calculateDependents() {
        let dependsOnMemberList = [];
        let childMap = this.getField("childMap");
        for(var name in childMap) {
            var child = childMap[name];
            dependsOnMemberList.push(child);
        }
        this.updateDependencies(dependsOnMemberList);
    }
}

//add components to this class                     
base.mixin(Folder,ContextHolder);
base.mixin(Folder,Owner);
base.mixin(Folder,Parent);

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

