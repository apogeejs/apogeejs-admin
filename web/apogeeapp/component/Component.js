import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import base from "/apogeeutil/base.js";
import FieldObject from "/apogeeutil/FieldObject.js";
import EventManager from "/apogeeutil/EventManager.js";

/** This is the base functionality for a component. */
export default class Component extends FieldObject {

    constructor(modelManager,member) {
        super();

        //mixin initialization
        this.eventManagerMixinInit();

        //inheriting objects can pass functions here to be called on cleanup, save, etc
        this.cleanupActions = [];
        
        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
        //FIELDS
        this.setField("modelManager",modelManager);
        this.setField("member",member);
        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
    
        modelManager.registerMember(member,this);

        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
        //Working
        this.viewStateCallback = null;
        this.cachedViewState = null;
        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
    }

    /** If an extending object has any cleanup actions, a callback should be passed here.
     * The callback will be executed in the context of the current object. */
    addCleanupAction(cleanupFunction) {
        this.cleanupActions.push(cleanupFunction);
    }

    //==============================
    // Public Instance Methods
    //==============================

    /** This method returns the base member for this component. To see if this
     * field has been updated, check the "member" field of the component.  
     * To access other child members for compound components, use the access those fields using
     * the getField method. The field name is the "member." + the variable name of the field. */
    getMember() {
        return this.getField("member");
    }

    /** This method returns true if the data from a given named member field has changed. */
    isMemberDataUpdated(memberFieldName) {
        return this.isMemberFieldUpdated(memberFieldName,"data");
    }
    
    /** This method returns true if the code, including either the function body or
     * the supplemental code, from a given named member field has changed. */
    isMemberCodeUpdated(memberFieldName) {
        return this.areAnyMemberFieldsUpdated(memberFieldName,["functionBody","supplementalCode"]);
    }

    /** This method returns true if the given member field has been updated. */
    isMemberFieldUpdated(memberFieldName,memberFieldFieldName) {
        if(this.isFieldUpdated(memberFieldName)) {
            let member = this.getField(memberFieldName);
            return member.isFieldUpdated(memberFieldFieldName);
        }
        else {
            return false;
        }
    }

    /** This method returns true if the given member field has been updated. */
    areAnyMemberFieldsUpdated(memberFieldName,memberFieldFieldNameList) {
        if(this.isFieldUpdated(memberFieldName)) {
            let member = this.getField(memberFieldName);
            return member.areAnyFieldsUpdated(memberFieldFieldNameList);
        }
        else {
            return false;
        }
    }
    
    /** This method returns the ID for the field. It is fixed for the duration of the application.
     * it is not persistent between running the application different time. */
    getId() {
        return this.getField("member").getId();
    }

    /** This method returns the name of the component. To see if the value has been updated, check 
     * the component field name "member" and the member field name "name".
     */
    getName() {
        return this.getField("member").getName();
    }

    /** This method returns the name of the member including the full path.
     * To check if the full name has changed, use the isFullNameChanged method of the member. */
    getFullName() {
        return this.getField("member").getFullName();
    }

    /** This method returns a display name for the member object. */
    getDisplayName(useFullPath) {
        if(useFullPath) {
            return this.getFullName();
        }
        else {
            return this.getName();
        }
    }

    /** This method returns true if the display name field is updated. This method exists because
     * display name is potentially a compound field and this is a systematic way to see if it has changed.
     * Components modifying the getDisplayName method should also update this method.
     * Note this method only applies when useFullPath = false. If you are using useFullPath = true, also
     * check if the fullName has changed. */
    isDisplayNameUpdated() {
        return this.isMemberFieldUpdated("member","name");
    }

    getParentComponent() {
        let parent = this.getField("member").getParent();
        if(parent) {
            return this.getField("modelManager").getComponent(parent);
        }
        else {
            return null;
        }
    }

    /** This method returns the model manager for this component. To see if the model manager has
     * been updated, check the "modelManager" field. */
    getModelManager() {
        return this.getField("modelManager");
    }

    setViewStateCallback(viewStateCallback) {
        this.viewStateCallback = viewStateCallback;
    }

    getCachedViewState() {
        return this.cachedViewState;
    }

    //------------------------------------------
    // Field Object Methods
    //------------------------------------------

    //getId() Implmented above

    getTargetType() {
        return "component";
    }


    //------------------
    // serialization
    //------------------

    /** This serializes the component. */
    toJson() {
        var json = {};
        json.type = this.constructor.uniqueName;

        //TO DO 

        if(this.displayState) {
            json.displayState = this.displayState;
        }
        
        //allow the specific component implementation to write to the json
        if(this.writeToJson) {
            this.writeToJson(json);
        }

        if(this.viewStateCallback) {
            this.cachedViewState = this.viewStateCallback();
            if(this.cachedViewState) json.viewState = this.cachedViewState;
        }
        
        return json;
    }

    /** This is used to load the component from a json and also to set properties, such as
     * from the set properties form. */
    loadPropertyValues(json) {
        if(!json) json = {};
        
        //take any immediate needed actions
        
        //set the tree state
        if(json.viewState !== undefined) {
            this.cachedViewState = json.viewState;
        }
        
        //allow the component implemnetation ro read from the json
        if(this.readFromJson) {
            this.readFromJson(json);
        }
    }
    //==============================
    // Protected Instance Methods
    //==============================

    //This method should optionally be populated by an extending object.
    //** This method reads any necessary component implementation-specific data
    // * from the json. OPTIONAL */
    //readFromJson(json);

    //This method should optionally be populated by an extending object.
    //** This method writes any necessary component implementation-specific data
    // * to the json. OPTIONAL */
    //writeToJson(json);

    /** This method cleans up after a delete. Any extending object that has delete
     * actions should pass a callback function to the method "addClenaupAction" */
    onDelete() {
        
        //execute cleanup actions
        for(var i = 0; i < this.cleanupActions.length; i++) {
            this.cleanupActions[i].call(this);
        }
    }

    /** This method extends the member udpated function from the base.
     * @protected */    
    memberUpdated(updatedMember) {
        
        let member = this.getField("member");
        if(updatedMember.getId() == member.getId()) {
            this.setField("member",updatedMember);
        }
        else {
            //there was an update to an internal field
            let internalMemberName = "member." + updatedMember.getName();
            this.setField(internalMemberName,updatedMember);
            
            //for now we will assume the internal members do not have their name update!!!
            //maybe I should add a error check 
        }
    }

    /** This method is used for setting initial values in the property dialog. 
     * If there are additional property lines, in the generator, this method should
     * be extended to give the values of those properties too. */
    getPropertyValues() {
        
        var member = this.getField("member");
        
        var values = {};
        values.name = member.getName();
        var parent = member.getParent();
        if(parent) {
            values.parentName = parent.getFullName();
        }

        if(member.constructor.generator.readProperties) {
            member.constructor.generator.readProperties(member,values);
        }
        if(this.readExtendedProperties) {
            this.readExtendedProperties(values);
        }
        return values;
    }

    //======================================
    // Static methods
    //======================================

    /** This function creates a json to create the member for a new component instance. 
     * It uses default values and then overwrites in with optionalBaseValues (these are intended to be base values outside of user input values)
     * and then optionalOverrideValues (these are intended to be user input values) */
    static createMemberJson(componentClass,optionalInputProperties,optionalBaseValues) {
        var json = apogeeutil.jsonCopy(componentClass.DEFAULT_MEMBER_JSON);
        if(optionalBaseValues) {
            for(var key in optionalBaseValues) {
                json[key]= optionalBaseValues[key];
            }
        }
        if(optionalInputProperties) {
            //add the base component values
            if(optionalInputProperties.name !== undefined) json.name = optionalInputProperties.name;
            
            //add the specific member properties for this component type
            if(componentClass.transferMemberProperties) {
                componentClass.transferMemberProperties(optionalInputProperties,json);
            }
        }
        
        return json;
    }

    /** This function merges values from two objects containing component property values. */
    static createComponentJson(componentClass,optionalInputProperties,optionalBaseValues) {
        //copy the base properties
        var newPropertyValues = optionalBaseValues ? apogeeutil.jsonCopy(optionalBaseValues) : {};
        
        //set the type
        newPropertyValues.type = componentClass.uniqueName;
        
        //add in the input property Value
        if((optionalInputProperties)&&(componentClass.transferComponentProperties)) {
            componentClass.transferComponentProperties(optionalInputProperties,newPropertyValues);
        }
        
        return newPropertyValues;
    }
}

//add mixins to this class
base.mixin(Component,EventManager);

//======================================
// All components should have a generator to create the component
// from a json. See existing components for examples.
//======================================
