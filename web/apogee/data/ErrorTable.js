import base from "/apogeeutil/base.js";
import Model from "/apogee/data/Model.js";
import Member from "/apogee/datacomponents/Member.js";

/** This class encapsulatees a table with no specific functionality. It
 * is intended to be used as a placeholder when a table generator is not found. */
export default class ErrorTable extends Member {

    constructor(name,owner,completeJson) {
        super(name);
        
        this.initOwner(owner);
        
        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
        //FIELDS
        //store this to use during save later
        this.setField("completeJson",completeJson);
        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

        var dummyData = "";
        this.setData(dummyData);
    }

    //------------------------------
    // Member Methods
    //------------------------------

    /** This method extends set data from member. It also
     * freezes the object so it is immutable. (in the future we may
     * consider copying instead, or allowing a choice)*/
    setData(data) {
        
        //make this object immutable
        base.deepFreeze(data);

        //store the new object
        return super.setData(data);
    }

    /** This overrides the commplete json to just pass back the entire json sent in. */
    toJson() {
        return this.getField("completeJson");
    }

    /** This method creates a member from a json. It should be implemented as a static
     * method in a non-abstract class. */ 
    static fromJson(owner,json) {
        //note - we send in the complete JSON so we can return is on saving
        return new ErrorTable(json.name,owner,json);
    }

    //------------------------------
    // Dependent Methods
    //------------------------------

    /** This method udpates the dependencies if needed because
     *a variable was added or removed from the model.  */
    updateDependeciesForModelChange(object) {
        //no action
    }

    /** This is a check to see if the object should be checked for dependencies 
     * for recalculation. It is safe for this method to always return false and
     allow the calculation to happen. 
    * @private */
    needsCalculating() {
        return false;
    }

    /** This method udpates the dependencies if needed because
     *the passed variable was added.  */
    updateDependeciesForModelChange(recalculateList) {
        //no action
    }

}
//============================
// Static methods
//============================

ErrorTable.generator = {};
ErrorTable.generator.displayName = "Table";
ErrorTable.generator.type = "apogee.ErrorTable";
ErrorTable.generator.createMember = ErrorTable.fromJson;
ErrorTable.generator.setDataOk = false;

//register this member
Model.addMemberGenerator(ErrorTable.generator);