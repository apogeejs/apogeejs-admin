//These are in lieue of the import statements
let {FormInputBaseComponent} = apogeeapp;

/** This is a simple custom component example. */
export default class WebRequestComponent extends FormInputBaseComponent {
    constructor(member,modelManager,instanceToCopy,keepUpdatedFixed) {
        super(member,modelManager,instanceToCopy,keepUpdatedFixed);
    }
}

const DATA_MEMBER_FUNCTION_BODY = `
    if((formResult)&&(formResult.url)) {
        let options = {};
        if(formResult.method !== undefined) options.method = formResult.method;
        if(formResult.body !== undefined) options.body = formResult.body;
        if(formResult.headers) {
            options.header = {};
            formResult.headers.forEach(headerEntry => {
                options.header[headerEntry.key] = headerEntry.value
            })
        }
        //return options
        if(formResult.outputFormat == "json") {
            return apogeeutil.jsonRequest(formResult.url,options);   
        }
        else {
            return apogeeutil.textRequest(formResult.url,options);
        }
    }
    else {
        return null;
    }
`

FormInputBaseComponent.initializeClass(WebRequestComponent,"Web Request Cell","apogeeapp.WebRequestCell",DATA_MEMBER_FUNCTION_BODY);
