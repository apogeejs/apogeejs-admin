import {addActionInfo} from "/apogee/actions/action.js";
import Workspace from "/apogee/data/Workspace.js";

/** This is self installing command module. It has no exports
 * but it must be imported to install the command. 
 *
 * Action Data format:
 * {
 *  "action": "createMember",
 *  "owner": (parent/owner for new member),
 *  "name": (name of the new member),
 *  "createData": 
 *      - name
 *      - unique table type name
 *      - additional table specific data
 *  
 * }
 *
 * MEMBER CREATED EVENT: "memberCreated"
 * Event member format:
 * {
 *  "member": (member)
 * }
 */


/** This method instantiates a member, without setting the update data. 
 *@private */
function createMember(workspace,actionData,processedActions,actionResult) {
    
    var owner;
    if(actionData.workspaceIsOwner) {
        owner = workspace;
    }
    else {
        var ownerFullName = actionData.ownerName;
        var owner = workspace.getMemberByFullName(ownerFullName);
        if(!owner) {
            actionResult.actionDone = false;
            actionResult.alertMsg = "Parent not found for created member";
            return;
        }
    }
 
    createMemberImpl(owner,actionData,processedActions,actionResult);
}
 
    
function createMemberImpl(owner,actionData,actionResult) {
    
    var memberJson = actionData.createData;
    var member;
     
    //create member
    var generator;
    if(memberJson) {
        generator = Workspace.getMemberGenerator(memberJson.type);
    }

    if(generator) {
        member = generator.createMember(owner,memberJson);   

        //instantiate children if there are any
        if(memberJson.children) {
            actionResult.childActionResults = {};
            for(var childName in memberJson.children) {
                var childActionData = {};
                childActionData.action = "createMember";
                childActionData.createData = memberJson.children[childName];
                var childActionResult = {};
                childActionResult.actionInfo = ACTION_INFO;
                createMemberImpl(member,childActionData,childActionResult);
                actionResult.childActionResults[childName] = childActionResult;
            }
        }
    }
    else {
        //type not found! - create a dummy object and add an error to it
        var errorTableGenerator = Workspace.getMemberGenerator("appogee.ErrorTable");
        member = errorTableGenerator.createMember(owner,memberJson);
        var error = new apogee.ActionError("Member type not found: " + memberJson.type,apogee.ActionError.ERROR_TYPE_APP,null);
        member.addError(error);
        
        //store an error message, but this still counts as command done.
        actionResult.alertMsg = "Error creating member: member type not found: " + memberJson.type;
    }

    actionResult.member = member;
    actionResult.actionDone = true;
}

/** Action info */
let ACTION_INFO = {
    "action": "createMember",
    "actionFunction": createMember,
    "checkUpdateAll": true,
    "updateDependencies": true,
    "addToRecalc": true,
    "event": "memberCreated"
}

//This line of code registers the action 
addActionInfo(ACTION_INFO);