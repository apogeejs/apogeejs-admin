import {doAction} from "/apogee/actions/action.js";

/** This is a messenger class for sending action messages. 
 * If the send fails, and exception will be thrown. */
export default class Messenger {
    
    constructor(fromMember) {
        this.model = fromMember.getModel();
        this.contextManager = fromMember.getContextManager();
        this.fromMember = fromMember;
    }

    /** This is a convenience method to set a member to a given value.
     * updateMemberName - This is a member name as it would be accessed from the local code
     * data - This is the data to set on the given member. Aside from a JSON value, additional 
     * options are a Promise, to do an asynchronous update, a Error, to send an error to 
     * that table, or apogeeutil.INVALID_VALUE to send the invalid value.
     * These updates are applied after the current calculation is completed. See documentation
     * for more information on the messenger. */
    dataUpdate(updateMemberName,data) {
        
        var member = this._getMemberObject(updateMemberName);
        if(!member) {
            throw new Error("Error calling messenger - member not fond: " + updateMemberName);
        }
        
        //set the data for the table, along with triggering updates on dependent tables.
        var actionData = {};
        actionData.action = "updateData";
        actionData.memberName = member.getFullName();
        actionData.data = data;
        if(data instanceof Promise) {
            //for now no callback on promise
        }
        
        //return is handled above asynchronously
        doAction(this.model,actionData);
    }

    /** This is similar to dataUpdate except is allows multiple values to be set.
     * The argument update info is an array with each element representing an individual
     * data update. Each element shoudl be a 2-element array with the first entry being
     * the table name and the second being the data value. */
    compoundDataUpdate(updateInfo) { 
        
        //make the action list
        var actionList = [];
        for(var i = 0; i < updateInfo.length; i++) {
            let updateEntry = updateInfo[i];
            let subActionData = {};
            
            let member = this._getMemberObject(updateEntry[0]);
            if(!member) {
                throw new Error("Error calling messenger - member not fond: " + updateMemberName);
            }
            let data = updateEntry[1];
            
            subActionData.action = "updateData";
            subActionData.memberName = member.getFullName();
            subActionData.data = data;
            if(data instanceof Promise) {
                //for now no callback on promise
            }
            actionList.push(subActionData);
        }
        
        //create the single compound action
        var actionData = {};
        actionData.action = "compoundAction";
        actionData.actions = actionList;
        
        //return is handled above asynchronously
        doAction(this.model,actionData);
    }
    
    //=====================
    // Private Functions
    //=====================
    
    
    /** This method returns the member instance for a given local member name,
     * as defined from the source object context. */
    _getMemberObject(localMemberName) { 
        var path = localMemberName.split(".");
        var member = this.contextManager.getMember(path);
        return member;
    }
}
    


