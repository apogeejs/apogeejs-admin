(function() {

//===================================
// Google Chart Component
//===================================

/** This is a simple google chart component. */
apogeeapp.app.DynamicForm = class extends apogeeapp.app.BasicControlComponent {
    
    constructor(workspaceUI,member) {
        super(workspaceUI,member,apogeeapp.app.DynamicForm);
    }
        
    /** This creates a form whose layout is the member value. */
    getOutputDisplay(viewMode) {
        var getLayout = () => this.getMember().getData();
        return new apogeeapp.app.ConfigurableFormDisplay(viewMode,getLayout);
    }
};

//attach the standard static values to the static object (this can also be done manually)
apogeeapp.app.BasicControlComponent.attachStandardStaticProperties(apogeeapp.app.DynamicForm,
        "DynamicForm",
        "aapogeeapp.app.DynamicForm");

//-----------------
//auto registration
//-----------------
var app = apogeeapp.app.Apogee.getInstance();
if(app) {
    app.registerComponent(apogeeapp.app.DynamicForm);
}
else {
    console.log("Component could not be registered because no Apogee app instance was available at component load time: apogeeapp.app.DynamicForm");
}

//end definition
})();
