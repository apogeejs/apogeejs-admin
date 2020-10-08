import "./papaparse.es.js";

//These are in lieue of the import statements
let {FormInputBaseComponent} = apogeeapp;

/** This is a simple custom component example. */
export default class CSVComponent extends FormInputBaseComponent {
    constructor(member,modelManager,instanceToCopy,keepUpdatedFixed) {
        super(member,modelManager,instanceToCopy,keepUpdatedFixed);
    }
}

const DATA_MEMBER_FUNCTION_BODY = `
    if((formResult)&&(formResult.input)) {
        let options = {};
        options.dynamicTyping = formResult.dynamicTyping;
        options.skipEmptyLines = formResult.skipEmptyLines;
        options.header = (formResult.outputFormat == "maps");
        let parseResult = __papaparse.parse(formResult.input,options);
        if(parseResult.errors.length == 0) {
            let headerRow;
            let body;
            if(options.header) {
                //row of objects
                headerRow = parseResult.meta.fields;
                body = parseResult.data;
            }
            else {
                body = [];
                if((parseResult.data)&&(parseResult.data.length > 0)) {                
                    parseResult.data.forEach( (row,index) => {
                        if(index == 0) {
                            headerRow = row;
                        }
                        else {
                            body.push(row);
                        }
                    });            
                }
            }

            if(!headerRow) headerRow = [];
            return {
                header: headerRow,
                body: body
            };
        }
        else {
            let errorMsg = "Parsing Error: " + parseResult.errors.join(";");
            throw new Error(errorMsg);
        }
    }
    else {
        return {
            header: [],
            body: [[]]
        };
    }
`

FormInputBaseComponent.initializeClass(CSVComponent,"Parse CSV Cell","apogeeapp.ParseCSVCell",DATA_MEMBER_FUNCTION_BODY);
