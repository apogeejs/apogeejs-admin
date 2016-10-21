
var SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

/** Check if current user has authorized this application. */
function initiateAction(clientAction, clientId) {
    var nextStep = function(authResult) {
        handleAuthResult(authResult,clientAction);
    };
    var payload = {};
    payload.client_id = clientId;
    payload.scope = SCOPES.join(' ');
    payload.immediate = false;
    gapi.auth.authorize(payload,nextStep);
}

/** Handle response from authorization server. */
function handleAuthResult(authResult,clientAction) {
    if (authResult && !authResult.error) {
        loadSheetsApi(clientAction);
    } else {
        alert("Authorization failed: " + authResult.error);
    }
}

/** Load Sheets API client library. */
function loadSheetsApi(clientAction) {
    var discoveryUrl = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
    var temp = gapi.client.load(discoveryUrl)
    temp.then(clientAction);
}

function errorResult(response) {
    alert('Error: ' + response.result.error.message);
}

//======================================
// Access Methods
// These shoudl be wrapped into a client action which takes no arguments
//======================================

/** get a range from a spreadsheet. Requires authroization first. */
function getRange(spreadsheetId,range,onResult) {
    try {
        var payload = {};
        payload.spreadsheetId = spreadsheetId;
        payload.range = range;
        gapi.client.sheets.spreadsheets.values.get(payload).then(onResult,errorResult);
    }
    catch(error) {
        alert("Error: " + error);
    }
}

function doUpload(spreadsheetId,range,values,onResult) {
    var uploadData = {};
    uploadData.spreadsheetId = spreadsheetId;
    uploadData.valueInputOption="USER_ENTERED";
    uploadData.range = range;
    uploadData.values = values;
    var loadData = gapi.client.sheets.spreadsheets.values.update(uploadData);
    loadData.then(onResult,errorResult);
}

function doClear(spreadsheetId,range,onResult) {
    var uploadData = {};
    uploadData.spreadsheetId = spreadsheetId;
    uploadData.range = range;
    var loadData = gapi.client.sheets.spreadsheets.values.clear(uploadData);
    loadData.then(onResult,errorResult);
}

function doCopy(fromSpreadsheetId,toSpreadsheetId,sheetId,onResult) {
    var uploadData = {};
    uploadData.spreadsheetId = fromSpreadsheetId;
    uploadData.destinationSpreadsheetId = toSpreadsheetId;
    uploadData.sheetId = sheetId;
    var loadData = gapi.client.sheets.spreadsheets.values.clear(uploadData);
    loadData.then(onResult,errorResult);
}

function addNewSheet(spreadsheetId,sheetName,onResult) {
    var newSheetData = {};
    var newSheetProperties = {};
    newSheetProperties.title = sheetName;
    newSheetProperties.index = 0;
    newSheetData.properties = newSheetProperties;
    var newSheetRequest = {};
    newSheetRequest.addSheet = newSheetData;
    
    var updateData = {};
    updateData.spreadsheetId = spreadsheetId;
    updateData.requests = [];
    updateData.requests.push(newSheetRequest);
    
    var loadData = gapi.client.sheets.spreadsheets.batchUpdate(updateData);
    loadData.then(onResult,errorResult);
}

