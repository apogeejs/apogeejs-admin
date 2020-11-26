//This class will manage access to microsoft one drive


export default class OneDriveFileSystem {

    constructor() {
        //for dev...
        this.loginStateInfo = STATE_INFO_LOGGED_OUT;
    }

    getLoginState() {
        return this.loginStateInfo;
    }

    login() {
        this.loginStateInfo = STATE_INFO_LOGGED_IN;
        return Promise.resolve(this.loginStateInfo);
    }

    logout() {
        this.loginStateInfo = STATE_INFO_LOGGED_OUT;
        return Promise.resolve(this.loginStateInfo);
    }

    getDrivesInfo() {
        return Promise.resolve(TEST_DRIVES_INFO);
    }

    loadFolder(driveId,folderId) {
        return Promise.resolve(TEST_FOLDER_INFO);
    }

    createFile(driveId,folderId,fileName,data) {
        return Promise.resolve({
            fileMetadata: fileMetadata
        })
    }

    updateFile(fileId,data) {
        return Promise.resolve({
            fileMetadata: fileMetadata
        })
    }

    openFile(fileId) {
        return Promise.resolve({
            data: TEST_WORKSPACE,
            fileMetadata: {
                source: OneDriveFileSystem.NAME,
                driveId: "???",
                parentFolderId: ["???"],
                fileId: fileId,
                name: "testWorkspace.json"
            }
        });
    }
}

//this is the identifier name for the source
OneDriveFileSystem.SOURCE_ID = "oneDrive";

//this is the identifier name for the source
OneDriveFileSystem.DISPLAY_NAME = "Microsoft OneDrive"

//this is metadata for a new file. Name is blank and there is not additional data besides source name.
OneDriveFileSystem.NEW_FILE_METADATA = {
    source: OneDriveFileSystem.NAME
    //displayName:
    //fileId: { ??? }
}

OneDriveFileSystem.directSaveOk = function(fileMetadata) {
    //fix this
    return false;
}

//for dev

const STATE_INFO_LOGGED_OUT = {
    state: "logged out"
}

const STATE_INFO_LOGGED_IN = {
    state: "logged in",
    accountName: "sutter@intransix.com"
}

const TEST_DRIVES_INFO = {
    defaultDriveId: "drive1",
    drives: [
        {
            name: "Personal Drive",
            id: "drive1"
        },
        {
            name: "Work Drive",
            id: "drive2"
        }
    ]
}

const TEST_FOLDER_INFO = {
    folder: {
        name: "workspaces",
        type: "__folder__",
        id: "folder2"
    },
    path: [
        {
            name: "test",
            type: "__folder__",
            id: "folder1"
        },
        {
            name: "workspaces",
            type: "__folder__",
            id: "folder2"
        }
    ],
    files: [
        {
            name: "workspace1.json",
            type: "application/json",
            id: "file1"
        },
        {
            name: "workspace2.json",
            type: "application/json",
            id: "file2"
        },
        {
            name: "workspace3.json",
            type: "application/json",
            id: "file3"
        },
        {
            name: "chidlFolder",
            type: "__folder__",
            id: "folder3"
        }
    ]
}


const TEST_WORKSPACE = {
	"fileType": "apogee app js workspace",
	"version": "0.60",
	"references": {
		"viewState": {
			"treeState": 1,
			"lists": {
				"es module": {
					"treeState": 0
				},
				"js link": {
					"treeState": 0
				},
				"css link": {
					"treeState": 0
				}
			}
		}
	},
	"code": {
		"model": {
			"fileType": "apogee model",
			"version": 0.3,
			"name": "Workspace",
			"children": {
				"main": {
					"name": "main",
					"type": "apogee.Folder",
					"children": {
						"a": {
							"name": "a",
							"type": "apogee.JsonMember",
							"updateData": {
								"data": 78
							}
						},
						"b": {
							"name": "b",
							"type": "apogee.JsonMember",
							"updateData": {
								"argList": [],
								"functionBody": "return 2*a;",
								"supplementalCode": ""
							}
						}
					}
				}
			}
		},
		"components": {
			"main": {
				"type": "apogeeapp.PageComponent",
				"data": {
					"doc": {
						"type": "doc",
						"content": [
							{
								"type": "heading1",
								"content": [
									{
										"type": "text",
										"text": "Test"
									}
								]
							},
							{
								"type": "apogeeComponent",
								"attrs": {
									"name": "a",
									"id": 0,
									"state": ""
								}
							},
							{
								"type": "paragraph"
							},
							{
								"type": "apogeeComponent",
								"attrs": {
									"name": "b",
									"id": 0,
									"state": ""
								}
							}
						]
					}
				},
				"children": {
					"a": {
						"type": "apogeeapp.JsonCell",
						"dataView": "Colorized",
						"viewState": {
							"childDisplayState": {
								"views": {
									"Data": {
										"isViewActive": true,
										"height": 280
									},
									"Formula": {
										"isViewActive": false
									},
									"Private": {
										"isViewActive": false
									}
								}
							}
						}
					},
					"b": {
						"type": "apogeeapp.JsonCell",
						"dataView": "Colorized",
						"viewState": {
							"childDisplayState": {
								"views": {
									"Data": {
										"isViewActive": true,
										"height": 280
									},
									"Formula": {
										"isViewActive": true,
										"height": 7000
									},
									"Private": {
										"isViewActive": false
									}
								}
							}
						}
					}
				},
				"viewState": {
					"childDisplayState": null,
					"treeState": 1,
					"tabOpened": true,
					"tabShowing": true
				}
			},
			"viewState": {
				"treeState": 1
			}
		}
	},
	"viewState": {
		"treeState": 1
	}
}