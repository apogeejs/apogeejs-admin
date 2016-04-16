

visicomp.app.visiui.addadditionalcomponent = {};

//=====================================
// UI Entry Point
//=====================================

visicomp.app.visiui.addadditionalcomponent.getAddAdditionalComponentCallback = function(app,generator) {
    return function() {
    
        var onSelect = function(componentType) {
            var generator = app.getComponentGenerator(componentType);
            if(generator) {
                var doAddComponent = visicomp.app.visiui.updatecomponent.getAddComponentCallback(app,generator);
                doAddComponent();
            }
            else {
                alert("Unknown component type: " + componentType);
            }
        }
        //open select component dialog
        visicomp.app.visiui.dialog.showSelectComponentDialog(app.additionalComponents,onSelect);
    }
}

//=====================================
// Action
//=====================================


