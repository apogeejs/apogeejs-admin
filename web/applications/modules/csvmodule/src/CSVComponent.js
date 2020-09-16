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

            let headerMember = member.lookupChild(model,"csv_header");
            this.setField("member.csv_header",headerMember);
            modelManager.registerMember(headerMember.getId(),this,false);

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
        let options = {};
        options.dynamicTyping = csv_input.dynamicTyping;
        options.skipEmptyLines = csv_input.skipEmptyLines;
        let result = __papaparse.parse(csv_input.input,options);
        if(result.errors.length == 0) {
            let headers = [];
            let body = [];
            if((result.data)&&(result.data.length > 0)) {                
                result.data.forEach( (row,index) => {
                    if(index == 0) {
                        headers.push(row);
                    }
                    else {
                        body.push(row);
                    }
                });

                
            }

            apogeeMessenger.dataUpdate("csv_header",headers);
            return body;
            
        }
        else {
            let errorMsg = "Parsing Error: " + result.errors.join(";");
            throw new Error(errorMsg);
        }
    }
    else {
        apogeeMessenger.dataUpdate("csv_header",[[]]);
        return [[]];
    }
`
            }
        },
        "csv_header": {
            "name": "csv_header",
            "type": "apogee.JsonMember",
            "updateData": {
                "data": "",
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
