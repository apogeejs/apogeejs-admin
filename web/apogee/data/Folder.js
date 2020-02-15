import base from "/apogeeutil/base.js";
import Model from "/apogee/data/Model.js";
import DependentMember from "/apogee/datacomponents/DependentMember.js";
import ContextHolder from "/apogee/datacomponents/ContextHolder.js";
import Owner from "/apogee/datacomponents/Owner.js";
import Parent from "/apogee/datacomponents/Parent.js";

/** This is a folder. */
export default class Folder extends DependentMember {

    constructor(name,owner) {
        super(name,Folder.generator);

        //mixin init where needed
        this.contextHolderMixinInit();
        this.parentMixinInit();
        
        this.initOwner(owner);

        //this holds the base objects, mapped by name
        this.childMap = {};
        this.dataMap = {};
        
        //make sure the data map is frozen
        Object.freeze(this.dataMap);
        this.setData(this.dataMap);
    }

    //------------------------------
    // Parent Methods
    //------------------------------

    /** this method gets the table map. */
    getChildMap() {
        return this.childMap;
    }

    /** This method looks up a child from this folder.  */
    lookupChild(name) {
        //check look for object in this folder
        return this.childMap[name];
    }

    /** This method adds a table to the folder. It also sets the folder for the
     *table object to this folder. It will fail if the name already exists.  */
    addChild(child) {
        
        //check if it exists first
        var name = child.getName();
        if(this.childMap[name]) {
            //already exists! not fatal since it is not added to the model yet,
            throw base.createError("There is already an object with the given name.",false);
        }
        //add object
        this.childMap[name] = child;
        
        var data = child.getData();
        //object may first appear with no data
        if(data !== undefined) {
            this.spliceDataMap(name,data);
        }
        
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
        delete(this.childMap[name]);
        this.spliceDataMap(name);
        
        //set all children as dependents
        this.calculateDependents();
    }

    /** This method updates the table data object in the folder data map. */
    updateData(child) {
        
        var name = child.getName();
        var data = child.getData();
        if(this.childMap[name] === undefined) {
            alert("Error - this table " + name + " has not yet been added to the folder.");
            return;
        }
        this.spliceDataMap(name,data);
    }

    /** There is no calculation for the folder base on dependents. 
     * @private */
    needsCalculating() {
        return true;
    }

    /** Calculate the data.  */
    calculate() {
        //we don't need to calculate since the calculate is done on the fly
        //we just need to make sure the impactors are set
        this.initializeImpactors();
        
        this.clearCalcPending();
    }

    //------------------------------
    // Dependent Methods
    //------------------------------

    /** This method updates the dependencies of any children
     * based on an object being added. */
    updateDependeciesForModelChange(recalculateList) {
        for(var key in this.childMap) {
            var child = this.childMap[key];
            if(child.isDependent) {
                child.updateDependeciesForModelChange(recalculateList);
            }
        }
    }

    //------------------------------
    // Member Methods
    //------------------------------

    /** This method creates a member from a json. It should be implemented as a static
     * method in a non-abstract class. */ 
    static fromJson(owner,json) {
        var folder = new Folder(json.name,owner);
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
        
        for(var key in this.childMap) {
            var child = this.childMap[key];
            json.children[key] = child.toJson();
        }
    }

    onClose () {
        for(var key in this.childMap) {
            var child = this.childMap[key];
            if(child.onClose) child.onClose();
        }
    }

    //============================
    // Private methods
    //============================

    /** This method updates the table data object in the folder data map. 
     * @private */
    calculateDependents() {
        var newDependsOn = [];
        for(var name in this.childMap) {
            var child = this.childMap[name];
            newDependsOn.push(child);
        }
        this.updateDependencies(newDependsOn);
    }

    /** This method creates a new immutable data map, either adding a give name and data or
     * removing a name. To remove a name from the map, leave "addData" as undefined. 
     * @private */
    spliceDataMap(addOrRemoveName,addData) {
        var newDataMap = {};
        
        //copy old data
        for(var key in this.dataMap) {
            if(key !== addOrRemoveName) {
                newDataMap[key] = this.dataMap[key];
            }
        }
        //add or update thiis child data
        if(addData !== undefined) {
            newDataMap[addOrRemoveName] = addData;
        }
        
        //make this immutable and set it as data for this folder
        Object.freeze(newDataMap);
        this.dataMap = newDataMap;
        this.setData(this.dataMap);
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

