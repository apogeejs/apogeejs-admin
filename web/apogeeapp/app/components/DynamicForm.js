/** This is a component with a configurable form. */
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
        "apogeeapp.app.DynamicForm");
