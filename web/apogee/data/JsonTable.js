import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import Model from "/apogee/data/Model.js";
import CodeableMember from "/apogee/datacomponents/CodeableMember.js";

/** This class encapsulatees a data table for a JSON object. 
 * (This object does also support function objects as elements of the json, though
 * objects using this, such as the JsonTableComponent, may not.)
*/
export default class JsonTable extends CodeableMember {

    constructor(name,parentId,instanceToCopy,keepUpdatedFixed,specialCaseIdValue) {
        super(name,parentId,instanceToCopy,keepUpdatedFixed,specialCaseIdValue);
    }

    //------------------------------
    // Codeable Methods
    //------------------------------

    /** This method returns the argument list. We override it because
     * for JsonTable it gets cleared when data is set. However, whenever code
     * is used we want the argument list to be this value. */
    getArgList() {
        return [];
    }
        
    processMemberFunction(model,memberFunctionInitializer,memberGenerator) {
        let initialized = memberFunctionInitializer();
        if(initialized) {
            //the data is the output of the function
            let memberFunction = memberGenerator();
            let data = memberFunction();
            this.applyData(model,data);

            //we must separately apply the asynch data set promise if there is one
            if((data)&&(data instanceof Promise)) {
                this.applyAsynchData(model,data);
            }
        } 
    }

    /** This is an optional method that, when present will allow the member data to be set if the 
     * member function is cleared. */
    getDefaultDataValue() {
        return "";
    }

    //------------------------------
    // Member Methods
    //------------------------------

    /** This method extends set data from member. It also
     * freezes the object so it is immutable. (in the future we may
     * consider copying instead, or allowing a choice)*/
    setData(model,data) {
        
        //make this object immutable
        apogeeutil.deepFreeze(data);

        //store the new object
        return super.setData(model,data);
    }

    /** This method creates a member from a json. It should be implemented as a static
     * method in a non-abstract class. */ 
    static fromJson(parentId,json) {
        let member = new JsonTable(json.name,parentId,null,null,json.specialIdValue);

        //set initial data
        let initialData = json.updateData;
        if(!initialData) {
            //default initail value
            initialData = {};
            initialData.data = "";
        }  

        //apply the initial data
        if(initialData.functionBody !== undefined) {
            //apply initial code
            member.applyCode(initialData.argList,
                initialData.functionBody,
                initialData.supplementalCode);
        }
        else {
            //apply initial data
            let data;
            let errorList;

            if(initialData.errorList) errorList = initialData.errorList;
            else if(initialData.invalidError) data = apogeeutil.INVALID_VALUE;
            else if(initialData.data !== undefined) data = initialData.data;
            else data = "";

            //apply the initial data
            //note for now this can not be a promise, so we do not need to also call applyAsynchData.
            member.applyData(model,data,errorList);

            //set the code fields to empty strings
            member.setField("functionBody","");
            member.setField("supplementalCode","");
        }

        return member;
    }
}

//============================
// Static methods
//============================

JsonTable.generator = {};
JsonTable.generator.displayName = "JSON Member";
JsonTable.generator.type = "apogee.JsonMember";
JsonTable.generator.createMember = JsonTable.fromJson;
JsonTable.generator.setDataOk = true;
JsonTable.generator.setCodeOk = true;

//register this member
Model.addMemberGenerator(JsonTable.generator);