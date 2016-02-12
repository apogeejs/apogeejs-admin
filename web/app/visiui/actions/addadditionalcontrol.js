

visicomp.app.visiui.addadditionalcontrol = {};

//=====================================
// UI Entry Point
//=====================================

visicomp.app.visiui.addadditionalcontrol.getAddAdditionalControlCallback = function(app,generator) {
    return function() {
    
        var onSelect = function(controlType) {
            var generator = app.getControlGenerator(controlType);
            if(generator) {
                var doAddControl = visicomp.app.visiui.addcontrol.getAddControlCallback(app,generator);
                doAddControl();
            }
            else {
                alert("Unknown control type: " + controlType);
            }
        }
        //open select control dialog
        visicomp.app.visiui.dialog.showSelectControlDialog(app.additionalControls,onSelect);
    }
}

//=====================================
// Action
//=====================================


