//This class will manage access to microsoft one drive


export default class OneDriveFileSystem {

    constructor() {
		//this contains basic info for files and folders
		this.fileInfoMap = {};
		//this contains path and child info for folders
		this.addedFolderInfoMap = {};
		//this contains drive info
		this.drivesInfo = null;
    }

    getLoginState() {
        return _loginState_;
    }

    login() {
        //should we verify requesting page is https/file/localhost?
		let url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${oneDriveAppInfo.clientId}&redirect_uri=${oneDriveAppInfo.redirectUri}&scope=${oneDriveAppInfo.scopes}&response_type=token`;
		let loginPromise = _openPopup(url,true);
		return loginPromise;
    }

    logout() {
        //should we verify requesting page is https/file/localhost?
		let url = `https://login.live.com/oauth20_logout.srf?client_id=${oneDriveAppInfo.clientId}&redirect_uri=${oneDriveAppInfo.redirectUri}`;
		let logoutPromise = _openPopup(url,false);
		return logoutPromise;
    }

    getDrivesInfo() {
		//check if the data is cached
		if(this.drivesInfo) return this.drivesInfo;

		//otherwise download data
        return _getUserDrivesPromise().then( driveResponse => {
			let drives = driveResponse.value.map(odDriveInfo => this._parseDriveInfo(odDriveInfo));
			
			//need to choose default drive!
			//let defaultDriveId
			let drivesInfo = {drives};
			this.drivesInfo = drivesInfo;
				
			return drivesInfo;
		})
    }

    loadFolder(driveId,folderId) {
		//check for valid cached info
		let key = this._getCacheKey(driveId,folderId);
		let cachedFileInfo = this.fileInfoMap[key];
		let cachedAddedFolderInfo = this.addedFolderInfoMap[key];

		if((cachedFileInfo)&&(cachedAddedFolderInfo)) {
			let folderInfo = this._packageFolderInfo(cachedFileInfo,cachedAddedFolderInfo);
			return Promise.resolve(folderInfo);
		}

		//otherwise download the data
        return _getFolderInfoPromise(driveId,folderId).then(odFileInfo => {
			let fileInfo = this._parseFileInfo(odFileInfo);
			let addedFolderInfo = this._parseAddedFolderInfo(odFileInfo);

			return this._packageFolderInfo(fileInfo,addedFolderInfo); 
		});
    }

    createFile(driveId,folderId,fileName,data) {
        return Promise.resolve({
            fileMetadata: OneDriveFileSystem.NEW_FILE_METADATA
        })
    }

    updateFile(driveId,fileId,data) {
        return Promise.resolve({
            fileMetadata: OneDriveFileSystem.NEW_FILE_METADATA
        })
    }

    openFile(driveId,fileId) {
		let key = this._getCacheKey(driveId,fileId);
		let fileInfo = this.fileInfoMap[key];
		if(!fileInfo) {
			return Promise.reject("Unknown error: file not found");
		}

		return apogeeutil.textRequest(fileInfo.downloadUrl).then(response => {
			return {
				data: response,
				fileMetadata: fileInfo
			}
		})  
	}
	
	//===============================
	// private methods
	//===============================

	_getCacheKey(driveId,fileId) {
		return driveId + "|" + fileId;
	}
	
	_packageFolderInfo(fileInfo,addedFolderInfo) {
		return {
			folder: fileInfo,
			path: addedFolderInfo.path,
			children: addedFolderInfo.children
		}
	}

	_parseFileInfo(odFileInfo) {
		//check if we should used a saved copy of this data
		let driveId = odFileInfo.parentReference.driveId;
		let fileId = odFileInfo.id;
		let key = this._getCacheKey(driveId,fileId);

		let fileInfo = this.fileInfoMap[key];

		if(!fileInfo) {
			//parse the file info
			fileInfo = {};
			fileInfo.fileId = fileId;
			fileInfo.name = odFileInfo.name;
			fileInfo.driveId = driveId;
			if(odFileInfo.file) {
				fileInfo.type = odFileInfo.mimeType;
				fileInfo.downloadUrl = odFileInfo["@microsoft.graph.downloadUrl"];
			}
			else if(odFileInfo.folder) {
				fileInfo.type = FOLDER_TYPE;
			}

			//load this data into the cache
			this.fileInfoMap[key] = fileInfo;
		}

		return fileInfo;
	}

	_parseAddedFolderInfo(odFileInfo) {
		//check id we can use a saved copy
		let driveId = odFileInfo.parentReference.driveId;
		let fileId = odFileInfo.id;
		let key = this._getCacheKey(driveId,fileId);

		let addedFolderInfo = this.addedFolderInfoMap[key];
		if(!addedFolderInfo) {
			addedFolderInfo = {};
			//get the child file infos
			if(odFileInfo.children) {
				addedFolderInfo.children = odFileInfo.children.map(childFileInfo => this._parseFileInfo(childFileInfo));
			}
			else {
				//I am not sure this is correct. Investigate if possible
				addedFolderInfo.children = [];
			}

			//get the path file infos, excluding the current file info
			addedFolderInfo.path = this._getPath(driveId,fileId,true);
			
			//add to cache
			this.addedFolderInfoMap[key] = addedFolderInfo;
		}

		return addedFolderInfo;
	}

	/** This method gets an array of file infos up to the root direction. The current directory can be excluded 
	 * using the excludeThisEntry flag.	 */
	_getPath(driveId,fileId,excludeThisEntry) {
		let fileInfo = this.fileInfoMap[this._getCacheKey(driveId,fileId)];
		let parentPath = (fileInfo.parentId) ? this._getPath(driveId,fileInfo.parentId) : []; 
		return excludeThisEntry ? parentPath : parentPath.concat[fileInfo];
	}

	_parseDriveInfo(odDriveInfo) {
		let driveId = odDriveInfo.id;
		let name;
		if(odDriveInfo.name) {
			name = odDriveInfo.name;
		}
		else if((odDriveInfo.owner)&&(odDriveInfo.owner.user)) {
			name = odDriveInfo.owner.user.displayName;
		}
		else {
			name = driveId;
		}
		
		return {driveId, name};
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

//
const oneDriveAppInfo = {
	"authServiceUri": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
	"clientId": "d87a2f91-7064-41d0-85b2-3e0775068ac2",
	"redirectUri": "http://localhost:8888/dev/OneDrive/oneDriveAuthCallback.html",
	"scopes": "user.read files.read files.read.all sites.read.all"
}

const baseUrl = "https://graph.microsoft.com/v1.0/me";

//===================================
// Utilities
//===================================

const FOLDER_TYPE = "__folder__";

//====================================
// Login and Logout Workflows
//====================================

//create a external callback to receive the response
__globals__.oneDriveAuthCallback = (childWindow) => {
	_resetChildPopupTimer();
    if(childWindow) {
        let authResponse = {};
        authResponse.hash = childWindow.location.hash;
        authResponse.search = childWindow.location.search;
        _setAuthData(authResponse);
        childWindow.close();
	}
	else {
		//TODO! Verify this is correct, what are the conditions where this happens?
		_loginDataBad();
	}
} 

function _setAuthData(authResponse) {
	let authData;
	if(authResponse.hash) {
		let paramArray = authResponse.hash.substring(1).split("&").map(entry => entry.split("="));
		let credentials = {};
		paramArray.forEach( pair => credentials[pair[0]] = decodeURIComponent(pair[1]));

		authData = {};
		authData.credentials = credentials;
		authData.expiryInfo = _getExpiryInfo(credentials);
	}
	else {
		authData = null;
	}

	//store the auth data
	_authData_ = authData;

	if((_authData_)&&(_authData_.credentials)) {
		//fix this - user not known yet?
		_loginState_ = STATE_INFO_LOGGED_IN
		//this completes the login/logout workflow
		_loginDataGood();
	}
	else {
		_loginState_ = STATE_INFO_LOGGED_OUT
		//this completes the login/logout workflow
		_loginDataBad();
	}
}

function _clearAuthData() {
	_authData_ = null;
	_loginState_ = STATE_INFO_LOGGED_OUT;
}

//this gets the expiration data for our credentials
function _getExpiryInfo(authCredentials) {
	if((authCredentials)&&(authCredentials.expires_in)) {
		let expiresInSeconds = parseInt(authCredentials.expires_in);
		let nowMs = Date.now();
		let expireMs = nowMs + expiresInSeconds*1000;
		return {
			expireInt: expireMs,
			expireString: (new Date(expireMs)).toLocaleString(),
			loadString: (new Date(nowMs)).toLocaleString()
		}
	}
}

const STATE_INFO_LOGGED_OUT = {
    state: "logged out"
}

const STATE_INFO_LOGGED_IN = {
    state: "logged in",
    accountName: "unknown user"
}


let _authData_ = null;
let _loginState_ = STATE_INFO_LOGGED_OUT;


function _getToken() {
	if((_authData_)&&(_authData_.credentials)) {
		return _authData_.credentials.access_token;
	}
	else {
		return null;
	}
}

//for now, a single popup result promise
let _popupResultPromise = null;
let _popupIsLogin = true; //true = login, false = logout
let _popupResultResolve = null;
let _popupResultReject = null;
let _popupCheckTimer = null;
let _popupCheckCounter_ = 0;

const POPUP_CHECK_INTERVAL = 100;
const POPUP_CHECK_MAX_COUNTER = 5*60*1000/POPUP_CHECK_INTERVAL;

/** This opens a popup to carry out the login or log out. */
function _openPopup(url,isLogin) {
	if(_popupResultPromise) {
		//TODO! FIGURE OUT WHAT TO DO HERE!!!
		alert("Popup in process!");
		return null;
	}

	let width = 525;
	let height = 525;
	let screenX = window.screenX;
	let screenY = window.screenY;
	let outerWidth = window.outerWidth;
	let outerHeight = window.outerHeight;

	let left = screenX + Math.max(outerWidth - width, 0) / 2;
	let top = screenY + Math.max(outerHeight - height, 0) / 2;

	var features = [
		"width=" + width,
		"height=" + height,
		"top=" + top,
		"left=" + left,
		"status=no",
		"resizable=yes",
		"toolbar=no",
		"menubar=no",
		"scrollbars=yes"
	];

	//create the popup promise
	_popupResultPromise = new Promise((resolve,reject) => {
		_popupResultResolve = resolve;
		_popupResultReject = reject;
	})
	_popupIsLogin = isLogin;

	var popup = window.open(url, "oauth", features.join(","));
	if (!popup) {
		//TODO! FIGURE OUT WHAT TO DO HERE!!!
		alert("failed to pop up auth window");
		return null;
	}

	popup.focus();

	_popupCheckTimer = setInterval(() => _checkForChildPopupClose(popup), POPUP_CHECK_INTERVAL);

	return _popupResultPromise;

}

/** This starts a timer to check for the popup closing, for when the
 * user closes it rather than logging in. */
function _checkForChildPopupClose(popup) {
    _popupCheckCounter_++;
    if(_popupCheckCounter_ > POPUP_CHECK_MAX_COUNTER) {
		console.log("Max interval reached, giving up");
		_resetChildPopupTimer();
		_popupFailed();
        return;
    }

    if (popup.closed) {
		console.log("Child window closed! " + _popupCheckCounter_); 
		_resetChildPopupTimer();  
		_popupFailed();
    }
    else {
        console.log("Child not yet closed! " + _popupCheckCounter_)
    }
}

function _resetChildPopupTimer() {
	if(_popupCheckTimer) {
		clearInterval(_popupCheckTimer);
		_popupCheckTimer = null;
	}
	_popupCheckCounter_ = 0
}

//----------------------------
// popup results
//----------------------------
function _loginDataGood() {
	if(_popupIsLogin) {
		_resolvePopupPromise();
	}
	else {
		//wtf? This shouldn't happen
	}
	_cleanupPopup();
}
function _loginDataBad() {
	if(_popupIsLogin) {
		_rejectPopupPromise("Login failed");
	}
	else {
		_resolvePopupPromise();
	}
	_cleanupPopup();
}
function _popupFailed() {
	_clearAuthData();
	if(_popupIsLogin) {
		_rejectPopupPromise("Login failed");
	}
	else {
		_resolvePopupPromise();
	}
	_cleanupPopup();
}

//end popup results

function _resolvePopupPromise() {
	_popupResultResolve(_loginState_);
}

function _rejectPopupPromise() {
	_popupResultReject(errorMsg);
}

function _cleanupPopup() {
	_popupResultPromise = null;
	_popupResultResolve = null;
	_popupResultReject = null;
}


//====================================
// Drive Requests
//====================================

function _getUserInfoPromise() {
	let token = _getToken();

	let options = {
		header: { 
			"Authorization": "Bearer " + token,
			"Accept": "application/json;odata.metadata=none"
		}
	};
	
	let requestUrl = baseUrl;
	return apogeeutil.jsonRequest(requestUrl,options);
}

function _getUserDrivesPromise() {
	let token = _getToken();

	let options = {
		header: { 
			"Authorization": "Bearer " + token,
			"Accept": "application/json;odata.metadata=none"
		}
	};
	
	
	let requestUrl = baseUrl + "/drives";
	return apogeeutil.jsonRequest(requestUrl,options);
}

/** This gets folder info for the given drive id and file id. 
 * If no file id is provided, it returns the root folder for the specified drive. */
function _getFolderInfoPromise(driveId,fileId) {
	let token = _getToken();

	let options = {
		header: { 
			"Authorization": "Bearer " + token,
			"Accept": "application/json;odata.metadata=none"
		}
	};
	

	let requestUrl;
	if(fileId) {
		//request by file id
		requestUrl = `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${fileId}?expand=children`;
	}
	else {
		//request for root of drive
		requestUrl = `https://graph.microsoft.com/v1.0/drives/${driveId}/root?expand=children`
	}

	return apogeeutil.jsonRequest(requestUrl,options);

}

/////////////////////////////////////////////////////////////////////////
//for dev


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


const TEST_WORKSPACE_JSON = {
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