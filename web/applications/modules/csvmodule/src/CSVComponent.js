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
            let dataFolder = member.lookupChild(model,"data");
            this.registerMember(modelManager,dataFolder,"member.data",false);

            let bodyMember = dataFolder.lookupChild(model,"body");
            this.registerMember(modelManager,bodyMember,"member.data.body",false);

            let headerMember = dataFolder.lookupChild(model,"header");
            this.registerMember(modelManager,headerMember,"member.data.header",false);

            let inputMember = member.lookupChild(model,"__input__");
            this.registerMember(modelManager,inputMember,"member.input",false);
        }
    }
}

/** This is the display name for the type of component */
CSVComponent.displayName = "CSV Cell";

/** This is the univeral unique name for the component, used to deserialize the component. */
CSVComponent.uniqueName = "apogeeapp.CSVCell";

/** This is the json needed to create the necessary members for the  component 
 * NOTE: we put the data tables inside a folder "data" so the formula in the input member, from the 
 * form, does not collide with the internal tables. Well, unless you try to access data called data.body or data.header.
*/
CSVComponent.DEFAULT_MEMBER_JSON = {
    "type": "apogee.Folder",
    "childrenNotWriteable": true,
    "children": {
        "__input__": {
            "name": "__input__",
            "type": "apogee.JsonMember",
            "updateData": {
                "data": "",
            }
        },
        "data": {
            "name": "data",
            "type": "apogee.Folder",
            "childrenNotWriteable": true,
            "children": {
                "body": {
                    "name": "body",
                    "type": "apogee.JsonMember",
                    "updateData": {
                        "argList": [],
                        "functionBody":`
if(__input__.input) {
    let options = {};
    options.dynamicTyping = __input__.dynamicTyping;
    options.skipEmptyLines = __input__.skipEmptyLines;
    let result = __papaparse.parse(__input__.input,options);
    if(result.errors.length == 0) {
        let headerRow;
        let body = [];
        if((result.data)&&(result.data.length > 0)) {                
            result.data.forEach( (row,index) => {
                if(index == 0) {
                    headerRow = row;
                }
                else {
                    body.push(row);
                }
            });            
        }

        if(!headerRow) headerRow = [];
        apogeeMessenger.dataUpdate("header",headerRow);
        return body;
    }
    else {
        let errorMsg = "Parsing Error: " + result.errors.join(";");
        throw new Error(errorMsg);
    }
}
else {
    apogeeMessenger.dataUpdate("header",[]);
    return [[]];
}
        `
                    }
                },
                "header": {
                    "name": "header",
                    "type": "apogee.JsonMember",
                    "updateData": {
                        "data": [],
                    }
                },
            }
        }
    }
};
