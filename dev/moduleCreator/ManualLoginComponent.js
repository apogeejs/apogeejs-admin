import Component from "/apogeejs-app-lib/src/component/Component.js";

/** This component represents a table object. */
export default class ManaualLoginComponent extends Component {

    //////////////////////////////////////////////////////////////////////
    // copy from DesignerDataFormComponent
    // - modify member field names - insert "loginForm"
    // - we need to load the validator field from the component data. Field name change?

    /** This method compiles the layout function entered by the user. It returns
     * the fields  {formLayoutFunction,validatorFunction,errorMessage}. */
     createValidatorFunction() {
        var validatorCodeText = this.getField("validatorCode");
        var validatorFunction, errorMessage;

        if((validatorCodeText !== undefined)&&(validatorCodeText !== null))  {
            try {
                //create the validator function
                validatorFunction = new Function("formValue","inputData",validatorCodeText);
            }
            catch(error) {
                errorMessage = "Error parsing validator function code: " + error.toString()
                if(error.stack) console.error(error.stack);
            }
        }
        else {
            validatorFunction = () => true;
        }

        return {validatorFunction, errorMessage};
    }

    // end copy from DesignerDataFormComponent
    //////////////////////////////////////////////////////////////////////
   
}

//======================================
// This is the component generator, to register the component
//======================================

const DEFAULT_JSON = {
    "name": "main",
    "type": "apogee.Folder",
    "children": {
        "loginForm": {
            "name": "loginForm",
            "type": "apogee.Folder",
            "children": {
                "formData": {
                    "name": "formData",
                    "type": "apogee.JsonMember",
                    "updateData": {
                        "data": {
                            "uniqueKey": "topLevelDataPanel",
                            "type": "panel",
                            "formData": [
                                {
                                    "key": "basicTextField",
                                    "value": {
                                        "uniqueKey": "basicTextField",
                                        "type": "textField",
                                        "label": "Email: ",
                                        "customLayout": {
                                            "size": "50"
                                        },
                                        "value": "",
                                        "expressionType": "value",
                                        "hint": "",
                                        "help": "",
                                        "useSelector": "none",
                                        "key": "email"
                                    }
                                },
                                {
                                    "key": "basicTextField",
                                    "value": {
                                        "uniqueKey": "basicTextField",
                                        "type": "textField",
                                        "label": "Password: ",
                                        "customLayout": {
                                            "size": "50"
                                        },
                                        "value": "",
                                        "expressionType": "value",
                                        "hint": "",
                                        "help": "",
                                        "useSelector": "none",
                                        "key": "password"
                                    }
                                }
                            ]
                        }
                    }
                },
                "formResult": {
                    "name": "formResult",
                    "type": "apogee.JsonMember",
                    "updateData": {
                        "data": {
                            "uniqueKey": "topLevelDataPanel",
                            "type": "panel",
                            "formData": [
                                {
                                    "key": "basicTextField",
                                    "value": {
                                        "uniqueKey": "basicTextField",
                                        "type": "textField",
                                        "label": "Email: ",
                                        "customLayout": {
                                            "size": "50"
                                        },
                                        "value": "",
                                        "expressionType": "value",
                                        "hint": "",
                                        "help": "",
                                        "useSelector": "none",
                                        "key": "email"
                                    }
                                },
                                {
                                    "key": "basicTextField",
                                    "value": {
                                        "uniqueKey": "basicTextField",
                                        "type": "textField",
                                        "label": "Password: ",
                                        "customLayout": {
                                            "size": "50"
                                        },
                                        "value": "",
                                        "expressionType": "value",
                                        "hint": "",
                                        "help": "",
                                        "useSelector": "none",
                                        "key": "password"
                                    }
                                }
                            ]
                        },
                        "contextParentGeneration": 2
                    }
                },
                "data": {
                    "name": "data",
                    "type": "apogee.DesignerDataFormMember"
                },
                "value": {
                    "name": "value",
                    "type": "apogee.JsonMember",
                    "updateData": {
                        "data": {
                            "email": "sutter@intransix.com",
                            "password": "xxx"
                        }
                    }
                }
            }
        },
        "loginRequest": {
            "name": "loginRequest",
            "type": "apogee.Folder",
            "children": {
                "formData": {
                    "name": "formData",
                    "type": "apogee.JsonMember",
                    "updateData": {
                        "data": {
                            "url": "loginUrl",
                            "urlType": "simple",
                            "method": "GET",
                            "body": "",
                            "bodyType": "value",
                            "contentType": "none",
                            "headers": [],
                            "outputFormat": "mime",
                            "onError": "error"
                        }
                    }
                },
                "formResult": {
                    "name": "formResult",
                    "type": "apogee.JsonMember",
                    "updateData": {
                        "argList": [],
                        "functionBody": "let output = {};\noutput[\"url\"] = loginUrl\noutput[\"urlType\"] = \"simple\"\noutput[\"method\"] = \"GET\"\noutput[\"body\"] = \"\"\noutput[\"bodyType\"] = \"value\"\noutput[\"contentType\"] = \"none\"\noutput[\"headers\"] = []\noutput[\"outputFormat\"] = \"mime\"\noutput[\"onError\"] = \"error\"\nreturn output;",
                        "supplementalCode": "",
                        "contextParentGeneration": 2
                    }
                },
                "data": {
                    "name": "data",
                    "type": "apogee.WebRequestMember"
                }
            }
        },
        "loginUrl": {
            "name": "loginUrl",
            "type": "apogee.JsonMember",
            "updateData": {
                "argList": [],
                "functionBody": "if(!loginForm.value) return apogeeutil.INVALID_VALUE;\n\nreturn LOGIN_URL + `?email=${loginForm.value.email}&password=${loginForm.value.password}`",
                "supplementalCode": ""
            }
        },
        "sessionToken": {
            "name": "sessionToken",
            "type": "apogee.JsonMember",
            "updateData": {
                "argList": [],
                "functionBody": "return loginRequest.data.body.sessionToken",
                "supplementalCode": ""
            }
        },
        "LOGIN_URL": {
            "name": "LOGIN_URL",
            "type": "apogee.JsonMember",
            "updateData": {
                "data": "http://localhost:8888/apogeejs-admin/dev/moduleCreator/login.json"
            }
        }
    }
}

ManaualLoginComponent.CLASS_CONFIG = {
	displayName: "Manual Login Cell",
	uniqueName: "apogeeapp.ManualLoginCell",
	defaultMemberJson: DEFAULT_JSON,
    /////////////////////////////////////////////////
    //NOTE - I added all the app level properties and data fields. I commented out the
    //ones I won't be using. If this is automated and some are not omitted I would have to rename them.
    /////////////////////////////////////////////////
    //componentPropertyMap: {
	//	"allowInputExpressions": true,
    //    "dataView": "Colorized",
    //    "dataView": "Colorized",
    //    "dataView": "Colorized",
	//},
    componentDataMap: {
		validatorCode: "return true;" //from DesignerDataFormComponent
	}
}
