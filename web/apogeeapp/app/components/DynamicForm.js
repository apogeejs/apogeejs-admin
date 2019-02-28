/** This is a form that can be dynamically configured. This should be used
 * like an input that takes an action. If you want in input to populate a data
 * value, the FormDataComponent can be used. */
apogeeapp.app.DynamicForm = class extends apogeeapp.app.BasicControlComponent {
    
    constructor(workspaceUI,member) {
        super(workspaceUI,member,apogeeapp.app.DynamicForm);
    }
        
    /** This creates a form whose layout is the member value. */
    getOutputDisplay(displayContainer) {
        var callbacks = {
            getData: () => this.getMember().getData()
        }
        return new apogeeapp.app.ConfigurableFormDisplay(displayContainer,callbacks);
    }
};

//attach the standard static values to the static object (this can also be done manually)
apogeeapp.app.BasicControlComponent.attachStandardStaticProperties(apogeeapp.app.DynamicForm,
        "Dynamic Form",
        "apogeeapp.app.DynamicForm");
