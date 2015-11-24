/** This is a editor element for holding an arbitrary JSON object.
 *
 * @class 
 */
visicomp.app.visiui.PackageUI = function(package,parentElement) {

    this.package = package;
    this.name = package.getName();
    this.parentElement = parentElement;
//    this.dataEventManager = package.getWorkspace().getEventManager();
    this.windowEventManager = null;//look this up below
	this.contentElement = null; //created below

	if(package.isRootPackage()) {
		//show as the root package
		visicomp.app.visiui.dialog.showRootPackage(this);
	}
	else {
		//create the window and editor (for display, not editing)
		visicomp.app.visiui.dialog.showPackageWindow(this);
	}
}

visicomp.app.visiui.PackageUI.prototype.getWindow = function() {
    return this.window;
}

visicomp.app.visiui.PackageUI.prototype.getContentElement = function() {
    return this.contentElement;
}

