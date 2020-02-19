import {addActionInfo} from "/apogee/actions/action.js";
import {createMember} from "/apogee/actions/createmember.js";
import base from "/apogeeutil/base.js";
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
    actionResult.actionInfo = ACTION_INFO;

    let modelJson = actionData.modelJson;
    
    //check the file format
    var fileType = modelJson.fileType;
    if(fileType !== Model.SAVE_FILE_TYPE) {
        throw base.createError("Bad file format.",false);
    }
    if(modelJson.version !== Model.SAVE_FILE_VERSION) {
        throw base.createError("Incorrect file version. CHECK APOGEEJS.COM FOR VERSION CONVERTER.",false);
    }

    //set the model name
    if(modelJson.name !== undefined) {
        model.setName(this.name);
    }

    //load the model members (root folder and its children)
    let memberActionResult = createMember(model,modelJson.data);
    actionResult.childActionResults = [memberActionResult];

    actionResult.actionDone = true;
    
    return actionResult;
}

/** Action info */
let ACTION_INFO = {
    "action": "loadModel",
    "actionFunction": loadModel,
    "event": "modelUpdated"
}

//This line of code registers the action 
addActionInfo(ACTION_INFO);