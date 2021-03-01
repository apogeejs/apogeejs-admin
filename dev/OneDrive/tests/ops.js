function launchOneDrivePicker(onFileJsonData){
    var odOptions = {
        clientId: "d87a2f91-7064-41d0-85b2-3e0775068ac2",
        action: "download",
        multiSelect: false,
        advanced: {
        },
        success: response => onOpenSuccess(response,onFileJsonData),
        cancel: onOpenCancel,
        error: onOpenError
    }
  OneDrive.open(odOptions);
}

function onOpenSuccess(responseObject,onFileJsonData) {
    let itemList = responseObject.value;
    if((itemList)&&(itemList.length > 0)) {
        let item = itemList[0];
        //this gives me the metadata???
        let downloadUrl = item["@microsoft.graph.downloadUrl"];
        fetch(downloadUrl).then(response => response.json()).then(data => {
            onFileJsonData(data);
        })

        // //let url = item.endpoint + "/drives/" + item.parentReference.driveId + "/items/" + item.id;
        // let url = responseObject.apiEndpoint + "drives/" + item.parentReference.driveId + "/items/" + item.id;
        // let editor = document.getElementById("fileContent");
        // fetch(url,{
        //     headers: {
        //         Authorization: "bearer " + responseObject.accessToken
        //     }
        // })
        // .then(response => response.json())
        // .then(data => {
        //     editor.value = JSON.stringify(data);

            
        .catch(error => alert("error retrieving file: " + error.toString()));
    }
}

function onOpenCancel() {
    alert("File open canceled!");
}

function onOpenError(error) {
    alert("Error opening file: " + error.toString());
}

function launchSaveToOneDrive(fileName,fileJsonContent) {

    let fileStringContent = JSON.stringify(fileJsonContent);

    let dataUrl = "data:application/json;base64," + btoa(fileStringContent);

    let odOptions = {
        clientId: "d87a2f91-7064-41d0-85b2-3e0775068ac2",
        action: "save",
        sourceUri: dataUrl,
        fileName: fileName,
        viewType: "all",
        openInNewWindow: true,
        advanced: {},
        success: onSaveSuccess,
        progress: onSaveProgress,
        cancel: onSaveCancel,
        error: onSaveError
    };
    OneDrive.save(odOptions);
}

function onSaveSuccess(response) {
    alert("File saved!");
    console.log(JSON.stringify(response));
}

function onSaveProgress(percent) {
    console.log("Save percent complete: " + percent + "%");
}

function onSaveCancel() {
    alert("File save canceled!");
}

function onSaveError(error) {
    alert("Error saving file: " + error.toString());
}