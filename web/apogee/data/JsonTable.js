import base from "/apogeeutil/base.js";
import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import Model from "/apogee/data/Model.js";
import ContextHolder from "/apogee/datacomponents/ContextHolder.js";
import CodeableMember from "/apogee/datacomponents/CodeableMember.js";

/** This class encapsulatees a data table for a JSON object */
export default class JsonTable extends CodeableMember {

    constructor(model,name,owner,initialData) {
        super(model,name);

        //mixin init where needed
        this.contextHolderMixinInit();
        
        this.initOwner(owner);
        
        //set initial data if not already set
        if(!initialData) {
            //default initail value
            initialData = {};
            initialData.data = "";
        }  

        //apply the initial data
        if(initialData.functionBody !== undefined) {
            //apply initial code
            this.applyCode(initialData.argList,
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

            this.applyData(data,errorList);

            //set the code fields to empty strings
            this.setField("functionBody","");
            this.setField("supplementalCode","");
        }
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
        
    processMemberFunction(memberGenerator) {
        
        //first initialize
        var initialized = this.memberFunctionInitialize();
        
        var data;
        if(initialized) {
            //the data is the output of the function
            var memberFunction = memberGenerator();
            data = memberFunction();
        }
        else {
            //initialization issue = error or pending dependancy
            data = undefined;
        }

        this.applyData(data);
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

    /** This method creates a member from a json. It should be implemented as a static
     * method in a non-abstract class. */ 
    static fromJson(model,owner,json) {
        return new JsonTable(model,json.name,owner,json.updateData);
    }
}


//add components to this class
base.mixin(JsonTable,ContextHolder);

//============================
// Static methods
//============================

JsonTable.generator = {};
JsonTable.generator.displayName = "Table";
JsonTable.generator.type = "apogee.JsonTable";
JsonTable.generator.createMember = JsonTable.fromJson;
JsonTable.generator.setDataOk = true;
JsonTable.generator.setCodeOk = true;

//register this member
Model.addMemberGenerator(JsonTable.generator);