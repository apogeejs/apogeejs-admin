/** This is a messenger class for sending action messages. */
apogee.action.Messenger = function(fromMember) {

    /** This is a convenience method to set a member to a given value. */
    this.dataUpdate = function(updateMemberName,data) {
        apogee.action.dataUpdate(updateMemberName,fromMember,data);
    }

    /** This is a convenience method to set a member to a given value. */
    this.compoundDataUpdate = function(updateInfo) {
        apogee.action.compoundDataUpdate(updateInfo,fromMember);
    }

    /** This is a convenience method to set a member tohave an error message. */
    this.errorUpdate = function(updateMemberName,errorMessage) {
        apogee.action.errorUpdate(updateMemberName,fromMember,errorMessage);
    }

    /** This is a convenience method to set a member to a given value when the dataPromise resolves. */
    this.asynchDataUpdate = function(updateMemberName,dataPromise) {
        apogee.action.dataUpdate(updateMemberName,fromMember,dataPromise);
    }
}


