import Component from "/apogeejs-app-lib/src/component/Component.js";

/** This component represents a table object. */
export default class MultiLoginComponent extends Component {}

//======================================
// This is the component generator, to register the component
//======================================

const DEFAULT_MEMBER_JSON = {
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
	defaultMemberJson: DEFAULT_MEMBER_JSON,
    defaultComponentJson: DEFAULT_COMPONENT_JSON,
	childParentFolderPath: "."
}
