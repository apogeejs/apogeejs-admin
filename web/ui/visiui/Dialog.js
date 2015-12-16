/** This is a window for a dialog. The title and options are the same as the title
 * and options for a window frame. 
 *
 * @class 
 */
visicomp.visiui.Dialog = function(options) {
    
    //use page body and the parent
    var parentContainer = document.body;
    
    //call the parent constructor
    visicomp.visiui.WindowFrame.call(this,parentContainer,options);
    
    this.setZIndex(visicomp.visiui.DIALOG_ZINDEX);
}

visicomp.visiui.Dialog.prototype = Object.create(visicomp.visiui.WindowFrame.prototype);
visicomp.visiui.Dialog.prototype.constructor = visicomp.visiui.Dialog;

/** This method centers the dialog on the page. It must be called after the conten
 * is set, and possibly after it is rendered, so the size of it is calculated. */
visicomp.visiui.Dialog.prototype.centerOnPage = function() {
    var element = this.getElement();
    var x = (document.body.clientWidth - element.clientWidth)/2;
    var y = (document.body.clientHeight - element.clientHeight)/2;
    this.setPosition(x,y);
}



      

