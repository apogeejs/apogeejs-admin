import base from "/apogeeutil/base.js";
import Model from "/apogee/data/Model.js";
import Member from "/apogee/datacomponents/Member.js";

/** This class encapsulatees a table with no specific functionality. It
 * is intended to be used as a placeholder when a table generator is not found. */
function ErrorTable(name,owner,completeJson) {
    //base init
    Member.init.call(this,name,ErrorTable.generator);
    //i didn't really want this to be a dependent, bot for now I think they all have to be - check into this.
    //there are at least two places
    //- add to recalc list function in action (which I temporarily fixed)
    //- initialize impactors in dependent, assumes all impactors are dependents (this is also needed 
    Dependent.init.call(this);
    
    this.initOwner(owner);
    
    //store this to use during save later
    this.completeJson = completeJson;
    this.fieldUpdated("completeJson");

    var dummyData = "";
    this.setData(dummyData);
}

//add components to this class
base.mixin(ErrorTable,Member);
//base.mixin(ErrorTable,Dependent);

//------------------------------
// Member Methods
//------------------------------

/** This method extends set data from member. It also
 * freezes the object so it is immutable. (in the future we may
 * consider copying instead, or allowing a choice)*/
ErrorTable.prototype.setData = function(data) {
    
	//make this object immutable
	base.deepFreeze(data);

	//store the new object
    return Member.setData.call(this,data);
}

/** This overrides the commplete json to just pass back the entire json sent in. */
ErrorTable.prototype.toJson = function() {
    return this.completeJson;
}

/** This method creates a member from a json. It should be implemented as a static
 * method in a non-abstract class. */ 
ErrorTable.fromJson = function(owner,json) {
    //note - we send in the complete JSON so we can return is on saving
    return new ErrorTable(json.name,owner,json);
}

//------------------------------
// Dependent Methods
//------------------------------

/** This method udpates the dependencies if needed because
 *a variable was added or removed from the model.  */
ErrorTable.prototype.updateDependeciesForModelChange = function(object) {
    //no action
}

/** This is a check to see if the object should be checked for dependencies 
 * for recalculation. It is safe for this method to always return false and
 allow the calculation to happen. 
 * @private */
ErrorTable.prototype.needsCalculating = function() {
    return false;
}

/** This method udpates the dependencies if needed because
 *the passed variable was added.  */
ErrorTable.prototype.updateDependeciesForModelChange = function(recalculateList) {
    //no action
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