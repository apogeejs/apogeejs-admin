import "./papaparse.es.js";

//These are in lieue of the import statements
let {Component} = apogeeapp;

/** This is a simple custom component example. */
export default class CSVComponent extends Component {
    constructor(member,modelManager,instanceToCopy,keepUpdatedFixed) {
        super(member,modelManager,instanceToCopy,keepUpdatedFixed);

        //this should be present in the json that builds the folder, but in case it isn't (for one, because of a previous mistake)
        member.setChildrenWriteable(false);
        
        let model = modelManager.getModel();

        //==============
        //Fields
        //==============
        //Initailize these if this is a new instance
        if(!instanceToCopy) {
            //internal tables
            let dataMember = member.lookupChild(model,"csv_data");
            this.setField("member.csv_data",dataMember);
            modelManager.registerMember(dataMember.getId(),this,false);

            let inputMember = member.lookupChild(model,"csv_input");
            this.setField("member.csv_input",inputMember);
            modelManager.registerMember(inputMember.getId(),this,false);
        }
    }
}

/** This is the display name for the type of component */
CSVComponent.displayName = "CSV Cell";

/** This is the univeral unique name for the component, used to deserialize the component. */
CSVComponent.uniqueName = "apogeeapp.CSVCell";

/** This is the json needed to create the necessary members for the  component */
CSVComponent.DEFAULT_MEMBER_JSON = {
    "type": "apogee.Folder",
    "childrenNotWriteable": true,
    "children": {
        "csv_data": {
            "name": "csv_data",
            "type": "apogee.JsonMember",
            "updateData": {
                "argList": [],
                "functionBody":`
    if(csv_input.input) {
        let result = __papaparse.parse(csv_input.input);
        if(result.errors.length == 0) {
            return result.data;
        }
        else {
            let errorMsg = "Parsing Error: " + result.errors.join(";");
            throw new Error(errorMsg);
        }
    }
    else {
        return [[]];
    }
`
            }
        },
        "csv_input": {
            "name": "csv_input",
            "type": "apogee.JsonMember",
            "updateData": {
                "data": "",
            }
        }
    }
};
