import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import EventManager from "/apogeeutil/EventManagerClass.js";

import {bannerConstants} from "/apogeeview/componentdisplay/banner.js"; 

/** This is the base functionality for a component. */
export default class Component extends EventManager {

    constructor(modelManager,member) {

        super();
        
        this.modelManager = modelManager;
        this.member = member;
        this.uiActiveParent = null;
    
        this.modelManager.registerMember(this.member,this);
        
        //inheriting objects can pass functions here to be called on cleanup, save, etc
        this.cleanupActions = [];
        
        //notifications
        this.bannerState = bannerConstants.BANNER_TYPE_NONE;
        this.bannerMessage = "";
        
        this.updated = {};

        this.viewStateCallback = null;
        this.cachedViewState = null;
    }

    /** If an extending object has any cleanup actions, a callback should be passed here.
     * The callback will be executed in the context of the current object. */
    addCleanupAction(cleanupFunction) {
        this.cleanupActions.push(cleanupFunction);
    }

    //==============================
    // Public Instance Methods
    //==============================

    /** This method returns the base member for this component. */
    getMember() {
        return this.member;
    }

    getId() {
        return this.member.getId();
    }

    getName() {
        return this.member.getName();
    }

    getFullName() {
        return this.member.getFullName();
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

    getParentComponent() {
        let parent = this.member.getParent();
        if(parent) {
            return this.modelManager.getComponent(parent);
        }
        else {
            return null;
        }
    }

    getBannerState() {
        return this.bannerState;
    }

    getBannerMessage() {
        return this.bannerMessage;
    }

    /** This method returns the model for this component. */
    getModel() {
        return this.member.getModel();
    }

    /** This method returns the model manager for this component. */
    getModelManager() {
        return this.modelManager;
    }

    setViewStateCallback(viewStateCallback) {
        this.viewStateCallback = viewStateCallback;
    }

    getCachedViewState() {
        return this.cachedViewState;
    }

    //------------------------------------------
    // Event Tracking Methods
    //------------------------------------------

    getUpdated() {
        return this.updated;
    }

    clearUpdated() {
        this.updated = {};
    }

    fieldUpdated(field) {
        this.updated[field] = true;
    }

    isFieldUpdated(field) {
        return this.updated[field] ? true : false;
    }

    getEventId() {
        //use the main member for the event ID
        return "component:" + this.member.getId();
    }

    getTargetType() {
        return "component";
    }


    //------------------
    // serialization
    //------------------

    /** This deserializes the component. */
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

    /** This serializes the component. */
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
        
        //remove from parent
        if(this.uiActiveParent) {
            var parentComponent = this.modelManager.getComponent(this.uiActiveParent);
            if(parentComponent) {
                //remove the tree from the parent
                parentComponent.removeChildComponent(this);
            }
        }
        
        //execute cleanup actions
        for(var i = 0; i < this.cleanupActions.length; i++) {
            this.cleanupActions[i].call(this);
        }
    }

    /** This method extends the member udpated function from the base.
     * @protected */    
    memberUpdated(eventInfo) {

        let updatedMember = eventInfo.target;
        let fieldsUpdated = eventInfo.updated;
        
        if(updatedMember.getId() == this.member.getId()) {
            this.fieldUpdated("member");
            
            //check for name changes
            if(apogeeutil.isFieldUpdated(fieldsUpdated,"name")) {
                this.fieldUpdated("name");
            }
            
            //check for parent change
            if(apogeeutil.isFieldUpdated(fieldsUpdated,"owner")) {
                this.fieldUpdated("owner");
                
                // //old parent change logic!!!
                // var oldParent = this.uiActiveParent;
                // var newParent = this.member.getParent();

                // this.uiActiveParent = newParent;

                // //remove from old parent component
                // if(oldParent) {
                //     var oldParentComponent = this.modelManager.getComponent(oldParent);
                //     oldParentComponent.removeChildComponent(this);
                // }

                // //add to the new parent component
                // if(newParent) {
                //     var newParentComponent = this.modelManager.getComponent(newParent);
                //     newParentComponent.addChildComponent(this);
                // }
            }  
            
            //check for banner update
            let newBannerState;
            let newBannerMessage;
            if(updatedMember.hasError()) {
                var errorMsg = "";
                var actionErrors = updatedMember.getErrors();
                for(var i = 0; i < actionErrors.length; i++) {
                    errorMsg += actionErrors[i].msg + "\n";
                }

                newBannerState = bannerConstants.BANNER_TYPE_ERROR;
                newBannerMessage = errorMsg;
            }
            else if(updatedMember.getResultPending()) {
                newBannerState = bannerConstants.BANNER_TYPE_PENDING;
                newBannerMessage = bannerConstants.PENDING_MESSAGE;

            }
            else if(updatedMember.getResultInvalid()) {
                newBannerState = bannerConstants.BANNER_TYPE_INVALID;
                newBannerMessage = bannerConstants.INVALID_MESSAGE;
            }
            else {   
                newBannerState = bannerConstants.BANNER_TYPE_NONE;
                newBannerMessage = null;
            }
            
            if((newBannerState != this.bannerState)||(newBannerMessage != this.bannerMessage)) {
                this.fieldUpdated("bannerState");
                this.bannerState = newBannerState;
                this.bannerMessage = newBannerMessage;
            }
        }
        else {
            //there was an update to an internal field
            this.fieldUpdated(updatedMember.getName());
            
            //for now we will assume the internal members do not have their name update!!!
            //maybe I should add a error check 
        }
    }

    /** This method is used for setting initial values in the property dialog. 
     * If there are additional property lines, in the generator, this method should
     * be extended to give the values of those properties too. */
    getPropertyValues() {
        
        var member = this.member;
        
        var values = {};
        values.name = member.getName();
        var parent = member.getParent();
        if(parent) {
            values.parentName = parent.getFullName();
        }

        if(member.generator.readProperties) {
            member.generator.readProperties(member,values);
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

//======================================
// All components should have a generator to create the component
// from a json. See existing components for examples.
//======================================
