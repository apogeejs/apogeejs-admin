/** This is a class for the field object formalism. It is used to store fields
 * and track modifications. It allows you to lock the object so that no more changes
 * can be made. */
export default class FieldObject {

    /** constructor.
     * - objectType - a text only string giving the name of the object type. This
     * is used in the id string.
     * - instanceToCopy - if this argument is defined, the created instance will be a shallow copy
     * of the this passed instance. By default it will have the updated fields flag cleared, but this
     * can be changed with the "keepUpdatedFixed" flag The new instance will be unlocked.
     * - keepUpdatedFixed - This should only be used when an instance is copied. If this is true
     * the copied instance will keep the same fields updated flags. Otherwise they will be cleared.
     * - specialCaseIdValue - This can be set if you wnt to create a new instance with a specific ID value. 
     * This should be done only in special circumstances. One example is "redo" creation of an object (after an undo)
     * subsequent commands for this object will reference its original ID. This is a way to set the ID of the recreaeted
     * object to match the original.
     */
    constructor(objectType,instanceToCopy,keepUpdatedFixed,specialCaseIdValue) {
        //this is a (semi-) unique number of each instance (There is no provision for wrapping - so there could be repeats)
        this.instanceNumber = _getInstanceNumber();

        if(!instanceToCopy) {
            if(specialCaseIdValue) {
                this.id = specialCaseIdValue;
            }
            else {
                this.id = _createId(objectType);
            }
            this.objectType = objectType;
        }
        else {
            this.id = instanceToCopy.id;
            this.objectType = instanceToCopy.objectType;
        }

        this.fieldMap = {};
        if(instanceToCopy) {
            Object.assign(this.fieldMap,instanceToCopy.fieldMap);
        }

        this.updated = {};
        if(keepUpdatedFixed) {
            Object.assign(this.updated,instanceToCopy.updated);
        }

        this.isLocked = false;
    }

    /** This sets a field value. It will throw an exception if the object is locked. */
    setField(name,value) {
        if(this.isLocked) {
            throw new Error("Attempting to set a value on a locked object.");
        }

        this.fieldMap[name] = value;
        this.updated[name] = true;
    }

    /** This will clear the value of a field. */
    clearField(name) {
        if(this.fieldMap[name] !== undefined) {
            delete this.fieldMap[name];
            this.updated[name] = true;
        }
    }

    /** This ges a field value, by name. */
    getField(name) {
        return this.fieldMap[name];
    }

    /** This method locks the object. On instantiation the object is unlocked and
     * fields can be set. Once it it locked the fields can not be changed. */
    lock() {
        this.isLocked = true;
    }

    getIsLocked() {
        return this.isLocked;
    }

    /** This returns a map of the updated fields for this object.  */
    getUpdated() {
        return this.updated;
    }

    /** This returns true if the given field is updated. */
    isFieldUpdated(field) {
        return this.updated[field] ? true : false;
    }

    /** This returns true if any fields in the give list have been updated. */
    areAnyFieldsUpdated(fieldList) {
        return fieldList.some( field => this.updated[field]);
    }

    /** This method should be implemented for any object using this mixin. 
     * This should give a unique identifier for all objects of the given object type, below.
     * A unique id may optionally be generated using the statid FieldObject method createId. */
    getId() {
        return this.id;
    }

    /** Thie method should be implemented for any object using this method. 
     * It identifies the type of object. */
    getType() {
        return this.objectType;
    }

    /** This static functions returns the type of an object given the ID. */
    static getTypeFromId(id) {
        let typeEnd = id.indexOf("|");
        if(typeEnd < 0) {
            throw new Error("Invalid ID");
        }
        else {
            return id.substr(0,typeEnd);
        }
    }

    /** This static function indicates if the given ID is an object of the given type. */
    static idIsTypeOf(id,type) {
        return id.startsWith(type + "|");
    }

    /** This loads the current field object to have a copy of the data from the given field object.
     * The update field is however cleared. This method will throw an exception is you try to copy 
     * into a loacked object. */
    copyFromFieldsObject(otherFieldObject) {
        if(this.isLocked) {
            throw new Error("Attempting to copy fields into a locked object.");
        }

        for(name in otherFieldObject.fieldMap) {
            this.fieldMap[name] = otherFieldObject.fieldMap[name];
        }
        this.updated = {};
    }

    //================================
    // Static Methods
    //================================

    

}

/** This function generates a ID that is unique over the span of this application execution (until the 
 * integers wrap). This is suitable for creating the field object ID for an instance.
 * At some point we shouldhandle wrapping, and the three cases it can cause - negative ids, 0 id, and most seriously,
 * a reused id.
 * 
 * Currently planned future solution to wrapping: make this an operation issue. And event can be issued when we 
 * have reached given id values. Then it is the responsibility of the operator to restart the sytems. This is probably safer
 * than trying to com eup with some clever remapping solution. */
function _createId(objectType) {
    return objectType + "|" + nextId++;
}

/** This is used for Id generation.
 * @private */
let nextId = 1;


/** This is intended for debug use only. It gives a unique number for each instance created. There is no provision made
 * for wrapping of this number, and it should be used in a way where that doesn't matter. */
function _getInstanceNumber() {
    return nextInstanceNumber++;
}

/** This is used for unique instance number generation.
 * @private */
let nextInstanceNumber = 1;
