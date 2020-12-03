import * as fileAccessConstants from "./fileAccessConstants.js";

//This class will manage access to microsoft one drive


export default class OneDriveFileSystem {

    constructor() {
		//this contains basic info for files and folders
		this.fileInfoMap = {};
		//this contains path and child info for folders
		this.addedFolderInfoMap = {};
		//this contains drive info
		this.drivesInfo = null;
		//this is the callback for changes to the login state
		this.loginStateCallback = null;
	}
	
	/** This sets the callback for login status */
	setLoginStateCallback(loginStateCallback) {
		this.loginStateCallback = loginStateCallback;
		_addLoginStateListener(this.loginStateCallback)
	}

	/** This returns the current login state. */
    getLoginInfo() {
		if(_loginInfo_.state == fileAccessConstants.LOGGED_IN) {
			//check for timeout. If so clear login data
			let loginValid =  ( (_authData_.expiryInfo.expireInt - Date.now()) > MIN_REMAINING_LOGGED_IN_TIME);
			if(!loginValid) {
				_clearLoginData();
			}
		}
        return _loginInfo_;
    }

	/** This method logs in. The login state callback is used for the login status change. This can be canceld with
	 * cancelAction(). */
    login() {
		//check if we are already logged in
		let loginInfo = this.getLoginInfo();
		if(loginInfo.state == fileAccessConstants.LOGGED_IN) {
			//just re-notify this listener
			if(this.loginStateCallback) this.loginStateCallback(loginInfo);
			return;
		}

        //should we verify requesting page is https/file/localhost?
		let url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${oneDriveAppInfo.clientId}&redirect_uri=${oneDriveAppInfo.redirectUri}&scope=${oneDriveAppInfo.scopes}&response_type=token`;
		_openPopup(url,true);
    }

	/** This method logs out. The login state callback is used for the login status change. This can be canceled with
	 * cancelAction(). */
    logout() {
		//check if we are already logged out
		let loginInfo = this.getLoginInfo();
		if(loginInfo.state == fileAccessConstants.LOGGED_OUT) {
			//just re-notify this listener
			if(this.loginStateCallback) this.loginStateCallback(loginInfo);
		}

        //should we verify requesting page is https/file/localhost?
		let url = `https://login.live.com/oauth20_logout.srf?client_id=${oneDriveAppInfo.clientId}&redirect_uri=${oneDriveAppInfo.redirectUri}`;
		_openPopup(url,false);
	}
	
	/** This can be used to cancel the active login or log out. It leaves the state as logged out.*/
	cancelAction() {
		_cancelPopup();
	}

	/** This method returns a promise containing the drives available to the user. */
    getDrivesInfo() {
		//check if the data is cached
		if(this.drivesInfo) return Promise.resolve(this.drivesInfo);

		//check if we are not logged in
		let loginInfo = this.getLoginInfo();
		if(loginInfo.state == fileAccessConstants.LOGGED_OUT) {
			//just re-notify this listener
			if(this.loginStateCallback) this.loginStateCallback(loginInfo);
			return Promise.reject("User is not currently logged in");
		}

		//otherwise download data
        return _getUserDrivesPromise().then( driveResponse => {
			let drives = driveResponse.value.map(odDriveInfo => this._parseDriveInfo(odDriveInfo));
			
			//need to choose default drive!
			//let defaultDriveId
			let drivesInfo = {drives};
			this.drivesInfo = drivesInfo;
				
			return drivesInfo;
		});
    }

	/** This method returns a promise containing the contents of the given folder. 
	 * If the data is cached, it will return the cached data rather than requesting and parsing
	 * it, unless force argument is set to true. */
    loadFolder(driveId,folderId,forceReload) {
		//check if we are not logged in
		let loginInfo = this.getLoginInfo();
		if(loginInfo.state == fileAccessConstants.LOGGED_OUT) {
			//just re-notify this listener
			if(this.loginStateCallback) this.loginStateCallback(loginInfo);
			return Promise.reject("User is not currently logged in");
		}

		//check for valid cached info
		if(!forceReload) {
			let key = this._getCacheKey(driveId,folderId);
			let cachedFileInfo = this.fileInfoMap[key];
			let cachedAddedFolderInfo = this.addedFolderInfoMap[key];

			if((cachedFileInfo)&&(cachedAddedFolderInfo)) {
				//there are cases where we might not have complete path info. Check to fix that here.
				this._testForPathUpdate(driveId,folderId,cachedAddedFolderInfo);

				let folderInfo = this._packageFolderInfo(cachedFileInfo,cachedAddedFolderInfo);
				return Promise.resolve(folderInfo);
			}
		}

		//otherwise download the data
        return _getFolderInfoPromise(driveId,folderId).then(odFileInfo => {
			let fileInfo = this._parseFileInfo(odFileInfo,forceReload);
			let addedFolderInfo = this._parseAddedFolderInfo(odFileInfo,forceReload);

			return this._packageFolderInfo(fileInfo,addedFolderInfo); 
		});
	}

	/** This method creates a file. It returns a promise with the fileInfo for the new file. */
    createFile(driveId,folderId,fileName,data) {
		//check if we are not logged in
		let loginInfo = this.getLoginInfo();
		if(loginInfo.state == fileAccessConstants.LOGGED_OUT) {
			//just re-notify this listener
			if(this.loginStateCallback) this.loginStateCallback(loginInfo);
			return Promise.reject("User is not currently logged in");
		}

        return _createFileUpload(driveId,folderId,fileName,data).then(response => {
			let fileInfo = this._parseFileInfo(response,true);
			return {
				source: OneDriveFileSystem.SOURCE_ID,
				name: fileInfo.name,
				fileInfo: fileInfo
			}
		});

		//TODO handle case of a collision
		//we will check for a collision based on local information. If we find a collision we will query the user and then will allow overwrite.
		//if we did not detect a collision locally then we want to get an error rather than overwrite (at which point the ui will handle it)
    }

	/** This method creates a file. It returns a promise with the fileInfo for the updated file. */
    updateFile(driveId,fileId,data) {
		//check if we are not logged in
		let loginInfo = this.getLoginInfo();
		if(loginInfo.state == fileAccessConstants.LOGGED_OUT) {
			//just re-notify this listener
			if(this.loginStateCallback) this.loginStateCallback(loginInfo);
			return Promise.reject("User is not currently logged in");
		}

        return _updateFileUpload(driveId,fileId,data).then(response => {
			let fileInfo = this._parseFileInfo(response,true);
			return {
				source: OneDriveFileSystem.SOURCE_ID,
				name: fileInfo.name,
				fileInfo: fileInfo
			}
		});
    }

	/** This method creates a file. It returns a promise with an object giving the file data and the fileInfo for the new file. */
    openFile(driveId,fileId) {
		//check if we are not logged in
		let loginInfo = this.getLoginInfo();
		if(loginInfo.state == fileAccessConstants.LOGGED_OUT) {
			//just re-notify this listener
			if(this.loginStateCallback) this.loginStateCallback(loginInfo);
			return Promise.reject("User is Not currently logged in");
		}
		
		let key = this._getCacheKey(driveId,fileId);
		let fileInfo = this.fileInfoMap[key];
		if(!fileInfo) {
			return Promise.reject("Unknown error: file not found");
		}

		let fileMetadata = {
			source: OneDriveFileSystem.SOURCE_ID,
			name: fileInfo.name,
			fileInfo: fileInfo
		}

		return apogeeutil.textRequest(fileInfo.downloadUrl).then(response => {
			return {
				data: response,
				fileMetadata: fileMetadata
			}
		});
	}

	createFolder(driveId,parentFileId,fileName) {
		//implement this - it should not allow if there is a file with this name
	}

	renameFile(driveId,fileId,fileName) {
		//implement - it should not allow if there is a file of this name
	}

	deleteFile(driveId,fileId) {

	}

	/** This should be called when this instance is no longer in use. */
	close() {
		if(this.loginStateListener) {
			_removeLoginStateListener(this.loginStateListener);
			this.loginStateListener = null;
		}
	}
	
	//===============================
	// private methods
	//===============================

	/** The fileId may be left undefined (of falsey) if it is not available. */
	_getCacheKey(driveId,fileId) {
		return fileId ? (driveId + "|" + fileId) : driveId;
	}
	
	_packageFolderInfo(fileInfo,addedFolderInfo) {
		return {
			folder: fileInfo,
			path: addedFolderInfo.path,
			children: addedFolderInfo.children
		}
	}

	/** This method parses the file info. If the file info is already present it will not reparse unless
	 * the forceReparse flag is set. */
	_parseFileInfo(odFileInfo,forceReparse) {
		//check if we should used a saved copy of this data
		let driveId = odFileInfo.parentReference.driveId;
		let fileId = odFileInfo.id;
		let key = this._getCacheKey(driveId,fileId);

		let fileInfo;
		if(!forceReparse) {
			fileInfo = this.fileInfoMap[key];
		}

		if(!fileInfo) {
			//parse the file info
			fileInfo = {};
			fileInfo.fileId = fileId;
			fileInfo.name = odFileInfo.name;
			fileInfo.driveId = driveId;
			if(odFileInfo.file) {
				fileInfo.type = odFileInfo.file.mimeType;
				fileInfo.downloadUrl = odFileInfo["@microsoft.graph.downloadUrl"];
			}
			else if(odFileInfo.folder) {
				fileInfo.type = fileAccessConstants.FOLDER_TYPE;
			}
			if(odFileInfo.parentReference.id) {
				fileInfo.parentId = odFileInfo.parentReference.id;
			}
			else {
				fileInfo.isRoot = true;
			}

			//load this data into the cache
			this.fileInfoMap[key] = fileInfo;

			//add a second time if this is the root
			if(fileInfo.isRoot) {
				let altRootKey = this._getCacheKey(driveId);
				this.fileInfoMap[altRootKey] = fileInfo;
			}
		}

		return fileInfo;
	}

	/** This method parses the added folder info. If the file info is already present it will not reparse unless
	 * the forceReparse flag is set. */
	_parseAddedFolderInfo(odFileInfo,forceReparse) {
		//check id we can use a saved copy
		let driveId = odFileInfo.parentReference.driveId;
		let fileId = odFileInfo.id;
		let key = this._getCacheKey(driveId,fileId);

		let addedFolderInfo;
		if(!forceReparse) {
			addedFolderInfo = this.addedFolderInfoMap[key];
		}

		if(!addedFolderInfo) {
			addedFolderInfo = {};
			//get the child file infos
			if(odFileInfo.children) {
				addedFolderInfo.children = odFileInfo.children.map(childFileInfo => this._parseFileInfo(childFileInfo,forceReparse));
			}
			else {
				//I am not sure this is correct. Investigate if possible
				addedFolderInfo.children = [];
			}

			//get the path file infos, excluding the current file info
			addedFolderInfo.path = this._getPath(driveId,fileId);
			
			//add to cache
			this.addedFolderInfoMap[key] = addedFolderInfo;

			//add a second time if this is the root
			if(odFileInfo.parentReference.id === undefined) {
				let altRootKey = this._getCacheKey(driveId);
				this.addedFolderInfoMap[altRootKey] = addedFolderInfo;
			}
		}
		else {
			//it is possible we didn't have complete path into when this was made. If so check here.
			this._testForPathUpdate(driveId,fileId,addedFolderInfo);
		}

		return addedFolderInfo;
	}

	/* If we initially open a folder that is not root, we will not have all the path info.
	 * recalculate path if it is not complete
	 * in which case the first entry is fileAccessConstants.BROKEN_PATH_ENTRY */
	_testForPathUpdate(driveId,fileId,addedFolderInfo) {
		if((addedFolderInfo.path)&&(addedFolderInfo.path.length > 0)&&(addedFolderInfo.path[0] == fileAccessConstants.BROKEN_PATH_ENTRY)) {
			addedFolderInfo.path = this._getPath(driveId,fileId);
		}
	}

	/** This method gets an array of file infos up to the root direction. The current directory can be excluded 
	 * using the excludeThisEntry flag.	 */
	_getPath(driveId,fileId) {
		let fileInfo = this.fileInfoMap[this._getCacheKey(driveId,fileId)];
		if(fileInfo === undefined) { 
			//if file info is undefined there is no data. This value signifies the data is not available..
			return [fileAccessConstants.BROKEN_PATH_ENTRY];
		}
		else if(!fileInfo.parentId) {
			return [fileInfo];
		}
		else {
			return this._getPath(driveId,fileInfo.parentId).concat([fileInfo]); 
		}
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

//===================================
// Static 
//===================================
//We manage a single user identity here in the static code.
//We allow multiple instances of the object to interface externall
//but we expect there will only be one.

//this is the identifier name for the source
OneDriveFileSystem.SOURCE_ID = "oneDrive";

//this is the identifier name for the source
OneDriveFileSystem.DISPLAY_NAME = "Microsoft OneDrive"

//this is metadata for a new file. Name is blank and there is not additional data besides source name.
OneDriveFileSystem.NEW_FILE_METADATA = {
    source: OneDriveFileSystem.NAME
}

OneDriveFileSystem.directSaveOk = function(fileMetadata) {
    return ((fileMetadata)&&(fileMetadata.fileInfo)&&(fileMetadata.fileInfo.fileId));
}

//
const oneDriveAppInfo = {
	"authServiceUri": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
	"clientId": "d87a2f91-7064-41d0-85b2-3e0775068ac2",
	"redirectUri": "http://localhost:8888/dev/OneDrive/oneDriveAuthCallback.html",
	"scopes": "user.read files.read files.read.all sites.read.all"
}

const baseUrl = "https://graph.microsoft.com/v1.0/me";

//interval in MS before actual logout that we consider logout to occur.
const MIN_REMAINING_LOGGED_IN_TIME = 100;
//this is the polling interval for checking if the login popup is closed.
const POPUP_CHECK_INTERVAL = 100;
//This is the timeout for a login attempt
const POPUP_CHECK_MAX_COUNTER = 5*60*1000/POPUP_CHECK_INTERVAL;

let _authData_ = null;
let _loginInfo_ = fileAccessConstants.STATE_INFO_LOGGED_OUT;
let _loginStateListeners_ = [];

//for now, a single popup result promise
let _popupWindow_ = null;
let _popupCheckTimer_ = null;
let _popupCheckCounter_ = 0;

function _addLoginStateListener(callback) {
	if(_loginStateListeners_.indexOf(callback) < 0) {
		_loginStateListeners_.push(callback);
	}
}

function _removeLoginStateListener(callback) {
	let index = _loginStateListeners_.indexOf(callback);
	_loginStateListeners_.splice(index,1);
}

function _notifyLoginStateListeners() {
	try {
		_loginStateListeners_.forEach(callback => callback(_loginInfo_));
	}
	catch(error) {
		if(error.stack) console.error(error.stack);
	}
}

//====================================
// Login and Logout Workflows
//====================================

//create a external callback to receive the response from the external login/logout popup window
__globals__.oneDriveAuthCallback = (childWindow) => {
	_clearPopup();
    if(childWindow) {
        let authResponse = {};
        authResponse.hash = childWindow.location.hash;
        authResponse.search = childWindow.location.search;
        _setAuthData(authResponse);
        childWindow.close();
	}
	else {
		//TODO! Verify this is correct, what are the conditions where this happens?
		_loginInfo_ = fileAccessConstants.STATE_INFO_LOGGED_OUT;
	}
	_notifyLoginStateListeners()
} 

/** This method sets the auth data. */
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
		//set the login state without user name
		_loginInfo_ = {
			state: fileAccessConstants.LOGGED_IN
		}
		//lookup user name
		_lookupUserAccount();
	}
	else {
		_loginInfo_ = fileAccessConstants.STATE_INFO_LOGGED_OUT;
	}
}

function _clearLoginData() {
	_authData_ = null;
	_loginInfo_ = fileAccessConstants.STATE_INFO_LOGGED_OUT;
}

function _setStatePending(isLogin) {
	_authData_ = null;
	_loginInfo_ = isLogin ? fileAccessConstants.STATE_INFO_LOGIN_PENDING : fileAccessConstants.STATE_INFO_LOGOUT_PENDING;
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


function _getToken() {
	if((_authData_)&&(_authData_.credentials)) {
		return _authData_.credentials.access_token;
	}
	else {
		return null;
	}
}

/** This opens a popup to carry out the login or log out. */
function _openPopup(url,isLogin) {

	//login is in process
	if(_popupWindow_ != null) return;

	//set state pending
	_setStatePending(isLogin);
	_notifyLoginStateListeners();

	//create popup
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

	_popupWindow_ = window.open(url, "oauth", features.join(","));
	if (!_popupWindow_) {
		apogeeUserAlert("failed to pop up auth window");
		_clearLoginData();
		_notifyLoginStateListeners();
		return;
	}

	_popupWindow_.focus();
	_popupCheckTimer_ = setInterval(() => _checkForChildPopupClose(), POPUP_CHECK_INTERVAL);
}

/** This starts a timer to check for the popup closing, for when the
 * user closes it rather than logging in. */
function _checkForChildPopupClose() {
	if(!_popupWindow_) {
		_clearPopup()
		return
	}

    _popupCheckCounter_++;
    if(_popupCheckCounter_ > POPUP_CHECK_MAX_COUNTER) {
		//timeout
		_clearPopup();
		_clearLoginData();
		_notifyLoginStateListeners();
    }
    else if(_popupWindow_.closed) {
		_clearPopup();  
		//treat this as a logout if the window is closed without us getting the login callback from the window
		_clearLoginData();
		_notifyLoginStateListeners();
    }
}

function _clearPopup() {
	if(_popupWindow_) {
		_popupWindow_ = null;
	}
	if(_popupCheckTimer_) {
		clearInterval(_popupCheckTimer_);
		_popupCheckTimer_ = null;
	}
	_popupCheckCounter_ = 0
}

function _cancelPopup() {
	if(!_popupWindow_.closed) {
		_popupWindow_.close();
	}
	_clearPopup();
	_clearLoginData();
}

function _lookupUserAccount() {
	let userInfoPromise = _getUserInfoPromise();
	userInfoPromise.then(userInfo => {
		console.log(JSON.stringify(userInfo));
	}).catch(errorMsg => {
		console.log("Error loading user info: " + errorMsg);
	})
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

function _createFileUpload(driveId,parentFileId,fileName,data) {
	let token = _getToken();

	let options = {
		header: { 
			"Authorization": "Bearer " + token,
			"Accept": "application/json;odata.metadata=none",
			"Content-Type": "application/json"
		},
		method: "PUT",
		body: data
	};
	
	
	let requestUrl = `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${parentFileId}:/${fileName}:/content`;
	return apogeeutil.jsonRequest(requestUrl,options);
}

function _updateFileUpload(driveId,fileId,data) {
	let token = _getToken();

	let options = {
		header: { 
			"Authorization": "Bearer " + token,
			"Accept": "application/json;odata.metadata=none",
			"Content-Type": "application/json"
		},
		method: "PUT",
		body: data
	};
	
	
	let requestUrl = `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${fileId}/content`;
	return apogeeutil.jsonRequest(requestUrl,options);
}
