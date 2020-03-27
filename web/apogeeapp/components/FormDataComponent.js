import Component from "/apogeeapp/component/Component.js";

/** This ccomponent represents a data value, with input being from a configurable form.
 * This is an example of componound component. The data associated with the form
 * can be accessed from the variables (componentName).data. There are also subtables
 * "layout" which contains the form layout and "isInputValid" which is a function
 * to validate form input.
 * If you want a form to take an action on submit rather than create and edit a 
 * data value, you can use the dynmaic form. */
export default class FormDataComponent extends Component {

    constructor(member,modelManager,instanceToCopy,keepUpdatedFixed) {
        //extend edit component
        super(member,modelManager,instanceToCopy,keepUpdatedFixed);
        
        //this should be present in the json that builds the folder, but in case it isn't (for one, because of a previous mistake)
        folder.setChildrenWriteable(false);
        
        let model = modelManager.getModel();
        //==============
        //Fields
        //==============
        //Initailize these if this is a new instance
        if(!instanceToCopy) {
            //internal tables
            let dataMember = folder.lookupChild(model,"data");
            this.setField("member.data",dataMember);
            modelManager.registerMember(dataMember.getId(),this,false);

            let layoutFunctionMember = folder.lookupChild(model,"layout");
            this.setField("member.layout",layoutFunctionMember);
            modelManager.registerMember(layoutFunctionMember.getId(),this,false);

            let isInputValidFunctionMember = folder.lookupChild(model,"isInputValid");
            this.setField("member.isInputValid",isInputValidFunctionMember);
            modelManager.registerMember(isInputValidFunctionMember.getId(),this,false);
        }
    };

}

//======================================
// This is the component generator, to register the component
//======================================

FormDataComponent.displayName = "Form Data Table";
FormDataComponent.uniqueName = "apogeeapp.app.FormDataComponent";
FormDataComponent.DEFAULT_MEMBER_JSON = {
        "type": "apogee.Folder",
        "childrenNotWriteable": true,
        "children": {
            "layout": {
                "name": "layout",
                "type": "apogee.FunctionTable",
                "updateData": {
                    "argList":[],
                }
            },
            "data": {
                "name": "data",
                "type": "apogee.JsonTable",
                "updateData": {
                    "data": "",
                }
            },
            "isInputValid": {
                "name": "isInputValid",
                "type": "apogee.FunctionTable",
                "updateData": {
                    "argList":["formValue"],
                    "functionBody": "//If data valid, return true. If data is invalid, return an error message.\nreturn true;"
                }
            }
        }
    };

