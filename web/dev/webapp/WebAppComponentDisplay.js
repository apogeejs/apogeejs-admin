
apogeeapp.webapp.WebAppComponentDisplay = function(member,component) {
    this.member = member;
    this.component = component;
}

apogeeapp.webapp.WebAppComponentDisplay.prototype.getMember = function() {
    return this.member;
}

//thse are needed if editmode is used
//apogeeapp.webapp.WebAppComponentDisplay.prototype.startEditUI = function(onSave,onCancel);
//apogeeapp.webapp.WebAppComponentDisplay.prototype.endEditUI = function();


//this should call the members of the view mode
//showData
//requestHide
//onHide
//destoy




