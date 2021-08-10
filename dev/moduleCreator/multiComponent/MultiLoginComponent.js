import Component from "/apogeejs-app-lib/src/component/Component.js";

/** This component represents a table object. */
export default class MultiLoginComponent extends Component {

    
    /** This serializes the table component. */
    writeExtendedData(json,modelManager) {
        
        //save the children
        var folder = this.getParentFolderForChildren();
        var childrenPresent = false;
        var children = {};
        var childIdMap = folder.getChildIdMap();
        for(var key in childIdMap) {
            var childId = childIdMap[key];
            var childComponentId = modelManager.getComponentIdByMemberId(childId);
            var childComponent = modelManager.getComponentByComponentId(childComponentId);
            var name = childComponent.getName();
            children[name] = childComponent.toJson(modelManager);
            childrenPresent = true;
        }
        if(childrenPresent) {
            json.children = children;
        }

        return json;
    }

    //COPIED FROM PARENT COMPONENT SO WE CAN LOAD CHILDREN!!! (clean this up)
    /** This method loads the children for this component */
    loadChildrenFromJson(modelManager,componentJson) {
        if(componentJson.children) {
            let parentMember = this.getParentFolderForChildren();
            
            for(let childName in componentJson.children) {
                let childMember = parentMember.lookupChild(modelManager.getModel(),childName);
                if(childMember) {
                    let childComponentJson = componentJson.children[childName];
                    modelManager.createComponentFromMember(childMember,childComponentJson);
                }
            };

        }
    }

    //COPIED FROM PARENT COMPONENT SO WE CAN LOAD CHILDREN!!! (clean this up)
    /** This is used to update properties, such as from the set properties form. */
    loadPropertyValues(modelManager,propertyJson) {
        super.loadPropertyValues(modelManager,propertyJson);

        //load properties in child components if needed
        if(propertyJson.children) {
            let parentMember = this.getParentFolderForChildren();
            for(let childName in propertyJson.children) {
                let childMemberId = parentMember.lookupChildId(childName);
                if(childMemberId) {
                    let childPropertyJson = propertyJson.children[childName];
                    let childComponentId = modelManager.getComponentIdByMemberId(childMemberId);
                    let childComponent = modelManager.getMutableComponentByComponentId(childComponentId);
                    childComponent.loadPropertyValues(modelManager,childPropertyJson);
                }
            }
        }
    }

    getParentFolderForChildren() {
        return this.getMember();
    }

	//////////////////////////////////////////////
	// Child accessor methods - move this later
	////////////////////////////////////////////////

	//for parent components!
	getChildComponent(modelManager,componentPath) {
		if((!componentPath)||(componentPath == ".")) {
			return this;
		}
		else {
			let componentPathArray = this._getPathArrayFromPath(componentPath);
			return this._getChildComponent(modelManager,this,componentPathArray);
		}
	}

	//make this static too?
	/** This converts a component or member path to a path array. */
	_getPathArrayFromPath(path) {
		if((!path)||(path == ".")) {
			return [];
		}
		else {
			return path.split(",").map(entry => entry.trim());
		}
	}

	//maybe make this static?
	_getChildComponent(modelManager,parentComponent,componentPathArray,startIndex) {
		if(componentPathArray.length == 0) return parentComponent;
		if(startIndex === undefined) startIndex = 0;
	
		let folderMember = parentComponent.getParentFolderForChildren();
		let childMemberId = folderMember.lookupChildId(componentPathArray[startIndex]);
		let childComponentId = modelManager.getComponentIdByMemberId(childMemberId);
		let childComponent = modelManager.getComponentByComponentId(childComponentId);
		if(startIndex >= componentPathArray.length-1) {
			return childComponent;
		}
		else {
			return this._getChildComponent(modelManager,childComponent,componentPathArray,startIndex+1);
		}
	}

	//for parent components!!!
	//BELOW ONLY APPLIES IF THE PARENT IS A FOLDER (FIX FOR FUNCTION FOLDER!!!)
	//I think we need to look up the type for the component children. We might need to add model manager.
	getFullMemberPath(componentPath,memberPath) {
		if((!componentPath)||(componentPath == ".")) {
			return memberPath;
		}
		else if((!memberPath)||(memberPath == ".")) {
			return componentPath;
		}
		else {
			return componentPath + "." + memberPath;
		}
	}
}

//======================================
// This is the component generator, to register the component
//======================================

const TOTAL_MEMBER_JSON = {
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
		},
		"foo": {
			"name": "foo",
			"type": "apogee.FunctionMember",
			"updateData": {
				"argList": [
					"x",
					"y"
				],
				"functionBody": "return 2*x+y;",
				"supplementalCode": ""
			}
		},
		"fooTryer": {
			"name": "fooTryer",
			"type": "apogee.JsonMember",
			"updateData": {
				"argList": [],
				"functionBody": "return foo(10,1);",
				"supplementalCode": ""
			}
		}
	}
}

const DEFAULT_MEMBER_JSON = {
    "name": "main",
    "type": "apogee.Folder"
}

const DEFAULT_COMPONENT_JSON = {
	"type": "apogeeapp.MultiLoginCell",
	"children": {
		"loginForm": {
			"type": "apogeeapp.DesignerDataFormCell",
			"validatorCode": "return true;",
			"allowInputExpressions": true
		},
		"loginRequest": {
			"type": "apogeeapp.WebRequestCell"
		},
		"loginUrl": {
			"type": "apogeeapp.JsonCell",
			"dataView": "Colorized"
		},
		"sessionToken": {
			"type": "apogeeapp.JsonCell",
			"dataView": "Colorized"
		},
		"LOGIN_URL": {
			"type": "apogeeapp.JsonCell",
			"dataView": "Colorized"
		},
		"foo": {
			"type": "apogeeapp.FunctionCell"
		},
		"fooTryer": {
			"type": "apogeeapp.JsonCell",
			"dataView": "Colorized"
		}
	}
}

MultiLoginComponent.CLASS_CONFIG = {
	displayName: "Multi Login Cell",
	uniqueName: "apogeeapp.MultiLoginCell",
	defaultMemberJson: DEFAULT_MEMBER_JSON,
    totalMemberJson: TOTAL_MEMBER_JSON,
    defaultComponentJson: DEFAULT_COMPONENT_JSON
}
