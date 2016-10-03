

hax.app.visiui.addadditionalcomponent = {};

//=====================================
// UI Entry Point
//=====================================

hax.app.visiui.addadditionalcomponent.getAddAdditionalComponentCallback = function(app,optionalInitialValues,optionalComponentOptions) {
    return function() {
    
        var onSelect = function(componentType) {
            var generator = app.getComponentGenerator(componentType);
            if(generator) {
                var doAddComponent = hax.app.visiui.updatecomponent.getAddComponentCallback(app,generator,optionalInitialValues,optionalComponentOptions);
                doAddComponent();
            }
            else {
                alert("Unknown component type: " + componentType);
            }
        }
        //open select component dialog
        hax.app.visiui.dialog.showSelectComponentDialog(app.additionalComponents,onSelect);
    }
}

//=====================================
// Action
//=====================================


