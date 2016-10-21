//to do
//- add other google sheets calls to allow download and upload data
//-- I will use the bulk update method of spreadsheet to add and manipulate sheets to a spreadsheet
//- create an external button control to do actions, like download or upload
//- create a test system


//intransix
var CLIENT_ID = '933018598900-o6ejkguvna42eu66epreehm5nuirocua.apps.googleusercontent.com'; //intransix
//spreadsheetId = '1VlcMRBzYsalrRw4E9W2D5c6-cowftX5QY6w4gbjFUWE';
//range = 'Sheet1!A1:G';


//micello
//var CLIENT_ID = '105795106133-2s6hcm7d2hoombjmkjgo4a86bi2gsnj9.apps.googleusercontent.com'; //micello
//spreadsheetId = '1xM9hFvTs69baR6v9jI3eMa2SLuDBTFkNRIEdUJh58xY',
//range = 'Sheet1!A1:G'

var SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

/** Check if current user has authorized this application. */
function initiateAction(clientAction, clientId) {
    var nextStep = function(authResult) {
        handleAuthResult(authResult,clientAction);
    };
    var payload = {};
    payload.clientId = clientId;
    payload.scope = SCOPES.joins(' ');
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

//EXAMPLE of how to use get range - use this returned client action
function getGetRangeClientAction(spreadsheetId,range,onResult) {
    return function() {
        getRange(spreadsheetId,range,onResult);
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
    uploadData.spreadsheetId = spreadsheetId;
    uploadData.destinationSpreadsheetId = spreadsheetId;
    uploadData.sheetId = sheetId;
    var loadData = gapi.client.sheets.spreadsheets.values.clear(uploadData);
    loadData.then(onResult,errorResult);
}

///////////////////////////////////////////////////////

function downloadResult(response) {
    var range = response.result;
    if (range.values.length > 0) {
        setTableData(range.values);
    } else {
        alert('No data found.');
    }
}

function uploadResult(response) {
    alert(JSON.stringify(response));
}



function setTableData(data) {
    var workspace = app.getWorkspace("CloudTest");
    var rootFolder = workspace.getRoot();
    var gridTable = rootFolder.lookupChildFromPath(["grid"]);
    if(gridTable) {
        var actionResponse = hax.core.updatemember.updateData(gridTable,data);
        if(actionResponse.getSuccess()) {
            //alert("Data loaded!");
        }
        else {
            alert(actionResponse.getErrorMsg());
        }
    }
    
}


