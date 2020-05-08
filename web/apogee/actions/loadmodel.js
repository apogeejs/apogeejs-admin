import {addActionInfo} from "/apogee/actions/action.js";
import {createMember} from "/apogee/actions/createmember.js";
import Model from "/apogee/data/Model.js";

/** This is self installing command module. It has no exports
 * but it must be imported to install the command. 
 *
 * Action Data format:
 * {
 *  "action": "loadModel",
 *  
 *  "modelJson": model json
 *  
 * }
 *
 * MEMBER CREATED EVENT: "modelUpdated"
 * Event member format:
 * {
 *  "member": (member)
 * }
 */


/** This method instantiates a member, without setting the update data. 
 *@private */
function loadModel(model,actionData) {

    let actionResult = {};
    actionResult.event = ACTION_EVENT;

    let modelJson = actionData.modelJson;
    
    //check the file format
    var fileType = modelJson.fileType;
    if(fileType !== Model.SAVE_FILE_TYPE) {
        throw new Error("Bad file format.");
    }
    if(modelJson.version !== Model.SAVE_FILE_VERSION) {
        throw new Error("Incorrect file version. CHECK APOGEEJS.COM FOR VERSION CONVERTER.");
    }

    //set the model name
    if(modelJson.name !== undefined) {
        model.setName(modelJson.name);
    }

    //load the model members (root folder and its children)
    actionResult.childActionResults = [];
    for(let childName in modelJson.children) {
        let childJson = modelJson.children[childName];
        let memberActionResult = createMember(model,model,childJson);
        actionResult.childActionResults.push(memberActionResult);
    }

    actionResult.actionDone = true;
    
    return actionResult;
}

let ACTION_EVENT = "updated";

//This line of code registers the action 
addActionInfo("loadModel",loadModel);