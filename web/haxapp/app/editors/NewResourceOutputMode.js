
haxapp.app.NewResourceOutputMode = function(componentDisplay) {
	haxapp.app.ViewMode.call(this,componentDisplay);   
        
    this.component = componentDisplay.getComponent();
    this.member = this.component.getObject();
    
    //no editor - override methods below as needed
}

haxapp.app.NewResourceOutputMode.prototype = Object.create(haxapp.app.ViewMode.prototype);
haxapp.app.NewResourceOutputMode.prototype.constructor = haxapp.app.NewResourceOutputMode;

haxapp.app.NewResourceOutputMode.prototype.createDisplay = function() {
    return this.component.createResource();
}

haxapp.app.NewResourceOutputMode.prototype.getDisplayData = function() {
	return this.member.getData();
}

//this is not applicable, for now at least
haxapp.app.NewResourceOutputMode.prototype.getIsDataEditable = function() {
    return false;
}

//TEMP!!!
//haxapp.app.NewResourceOutputMode.prototype.dataShown = function() {	
//    var resource = this.component.getResource();
//    if((resource)&&(resource.shown)) {
//        resource.shown(this.member.getData(),this.outputElement);
//    }   
//}

