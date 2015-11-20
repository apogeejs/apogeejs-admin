/** This is a editor element for holding an arbitrary JSON object.
 *
 * @class 
 */
visicomp.visiui.PackageUI = function(package,parentElement) {

    this.package = package;
    this.name = package.getName();
    this.parentElement = parentElement;
//    this.dataEventManager = package.getWorkspace().getEventManager();
    this.windowEventManager = null;//look this up below
	this.contentElement = null; //created below

    //create the window and editor (for display, not editing)
    visicomp.app.visiui.dialog.showPackageWindow(this);
}

visicomp.visiui.PackageUI.prototype.getWindow = function() {
    return this.window;
}

visicomp.visiui.PackageUI.prototype.getContentElement = function() {
    return this.contentElement;
}

