import base from "/apogeeutil/base.js";
import { Model, doAction } from "/apogee/apogeeCoreLib.js";
import EventManager from "/apogeeutil/EventManagerClass.js";

/** This class manages the user interface for a model object. */
export default class ModelManager extends EventManager {

    constructor(workspaceManager) {
        super();

        this.workspaceManager = workspaceManager;
        this.app = workspaceManager.getApp();
        this.model = null;
      
        this.componentMap = {};
    }

    //TEMPORARY###############################################
    getModelView() {
        return this.modelView;
    }

    setModelView(modelView) {
        this.modelView = modelView;
    }
    //########################################################

    //====================================
    // Model Management
    //====================================

    /** This gets the application instance. */
    getApp() {
        return this.app;
    }

    getWorkspaceManager() {
        return this.workspaceManager;
    }

     /** This method loads the model data and model components from the json. */
    load(modelDataJson,modelComponentsJson) {

        //load defaults if there is not saved model data
        if(!modelDataJson) modelDataJson = Model.EMPTY_MODEL_JSON;
        if(!modelComponentsJson) modelComponentsJson = ModelManager.EMPTY_MODEL_COMPONENT_JSON;

        //create model
        this.model = new Model();
        let actionResult = this.model.loadFromJson(modelDataJson);

        ////////////////////////////////////////////////////////////////////////
        //We are manually clearing the updated fields because there is no create workspce
        //event (in whcih we would clear any udpated field flags)
        //we should probably change that...
        this.model.clearUpdated();
        ////////////////////////////////////////////////////////////////////////

        //set up the root folder conmponent, with children if applicable
        var rootFolder = this.model.getRoot();
        var commandResult = this.createComponentFromMember(actionResult,modelComponentsJson);

        //add listeners
        //this.model.addListener("memberCreated", eventInfo => this.memberCreated(eventInfo));
        this.model.addListener("memberUpdated", eventInfo => this.memberUpdated(eventInfo));
        this.model.addListener("memberDeleted", eventInfo => this.memberDeleted(eventInfo));

        return commandResult;
    }

    /** This method gets the model object. */
    getModel() {
        return this.model;
    }

    /** This method closes the model object. */
    close() {
        //delete all the components - to make sure the are cleaned up
        for(var key in this.componentMap) {
            var componentInfo = this.componentMap[key];
            if((componentInfo)&&(componentInfo.component)&&(!componentInfo.componentMember)) {
                componentInfo.component.onDelete();
            }
        }
    }

    //------------------------------------------
    // Event Tracking Methods
    //------------------------------------------

    getUpdated() {
        return this.updated;
    }

    isFieldUpdated(field) {
        return this.updated[field] ? true : false;
    }

    clearUpdated() {
        this.updated = {};
    }

    fieldUpdated(field) {
        this.updated[field] = true;
    }

    getEventId() {
        //for now we have a single fixed id for the model
        return "model";
    }

    getTargetType() {
        return "model";
    }

    //====================================
    // Component Management
    //====================================

    /** This method returns a component by full name. */
    getComponentByFullName(fullName) {
        let member = this.model.getMemberByFullName(fullName);
        if(member) {
            return this.getComponent(member);
        }
        else {
            return undefined;
        }
    }

    /** This method gets the component associated with a member object. */
    getComponent(member) {
        var componentInfo = this.componentMap[member.getId()];
        if(componentInfo) {
            return componentInfo.component;
        }
        else {
            return null;
        }
    }

    /** This method gets the component associated with a member object. */
    getComponentById(memberId) {
        var componentInfo = this.componentMap[memberId];
        if(componentInfo) {
            return componentInfo.component;
        }
        else {
            return null;
        }
    }

    /** This returns the list of folder names. */
    getFolders() {
        var folders = []
        for(var key in this.componentMap) {
            var componentInfo = this.componentMap[key];
            var member = componentInfo.member;
            if((member.isParent)&&(member.getChildrenWriteable())) { 
                folders.push(member.getFullName());
            }
        }
        return folders;
    }

    /** This method registers a member data object and its associated component object.
     * If the member is not the main member assoicated with component but instead an included
     * member, the main componentMember should be passed in also. Otherwise it should be left 
     * undefined. */
    registerMember(member,component,mainComponentMember) {

        //make sure this is for us
        if(member.getModel() !== this.model) {
            throw base.createError("Component registered in wrong model: " + member.getFullName());
        }

        //store the ui object
        var memberId = member.getId();

        if(this.componentMap[memberId]) {
            //already exists! (we need to catch this earlier if we want it to not be fatal. But we should catch it here too.)
            throw base.createError("There is already a member with the given ID.",true);
        }

        var componentInfo = {};
        componentInfo.member = member;
        componentInfo.component = component;
        if(mainComponentMember) componentInfo.componentMember = mainComponentMember;

        this.componentMap[memberId] = componentInfo;

    }
    
    testPrint(eventInfo) {
        if(eventInfo.updated) {
            console.log(JSON.stringify(eventInfo.updated));
        }
    }

        
    createComponentFromMember(createMemberResult,componentJson) {
        
        //response - get new member
        var member = createMemberResult.member;
        var memberFieldsUpdated = createMemberResult.updated;
        var component;
        var commandResult = {};

        if(member) {
            
            var componentGenerator = this.app.getComponentGenerator(componentJson.type);
            if((componentGenerator)&&(member.generator.type != "apogee.ErrorTable")) {
                //create empty component
                component = new componentGenerator(this,member);

                //call member updated to process and notify of component creation
                //I SHOULD CONSTRUCT THIS IN A STANDARD WAY RATHER THAN MAKING IT HERE.
                let eventInfo = { target: member, updated: memberFieldsUpdated, event: "memberCreated" };
                component.memberUpdated(eventInfo);

                //apply any serialized values
                if(componentJson) {
                    component.loadPropertyValues(componentJson);
                }
            }

            //if we failed to create the component, or if we failed to make the member properly (and we used the error member)
            if(!component) {
                //table not found - create an empty table
                componentGenerator = this.app.getComponentGenerator("apogeeapp.app.ErrorTableComponent");
                component = new componentGenerator(this,member);
                if(componentJson) {
                    component.loadProperties(componentJson);
                }
            }

        }

        //I WANT BETTER ERROR HANDLING HERE (AND ABOVE)
        if(!component) {
            //##########################################################################
            //undo create the member
            var json = {};
            json.action = "deleteMember";
            json.memberName = member.getFullName();
            //if this fails, we will just ignore it for now
            var model = this.getModel();
            var actionResult = doAction(model,json);
            //end undo create member
            //##########################################################################

            //this should have already been set
            commandResult.cmdDone = false;
            commandResult.targetType = "component"
            commandResult.action = "created";
        }
        else {
            commandResult.target = component;
            commandResult.parent = this;
            commandResult.cmdDone = true;
            commandResult.targetType = "component"
            commandResult.action = "created";

            //load the children, if there are any (BETTER ERROR CHECKING!)
            if((component.readChildrenFromJson)&&(createMemberResult.childActionResults)) { 
                let childCommandResults = [];     
                component.readChildrenFromJson(this,createMemberResult.childActionResults,componentJson,childCommandResults);
                commandResult.childCommandResults = childCommandResults;
            }
        }
            
        return commandResult;
        
    }

    
    /** This method responds to a member updated. */
    memberCreated(eventInfo) {
        
//        this.testPrint(eventInfo);
        
        //store the ui object
        var member = eventInfo.target;
        var key = member.getId();

//        var componentInfo = this.componentMap[key];
//        if((componentInfo)&&(componentInfo.component)) {
//            componentInfo.component.memberCreated();
//        }
    }


    /** This method responds to a member updated. */
    memberUpdated(eventInfo) {
        
//        this.testPrint(eventInfo);
        
        //store the ui object
        var member = eventInfo.target;
        if(member) {
            var key = member.getId();

            var componentInfo = this.componentMap[key];
            if((componentInfo)&&(componentInfo.component)) {
                componentInfo.component.memberUpdated(eventInfo);
            }
        }
    }

    /** This method responds to a "new" menu event. */
    memberDeleted(eventInfo) {
        
//        this.testPrint(eventInfo);

        //store the ui object
        var member = eventInfo.target;
        var memberId = member.getId();

        var componentInfo = this.componentMap[memberId];
        delete this.componentMap[memberId];

        if((componentInfo)&&(componentInfo.component)) {
            //do any needed cleanup
            componentInfo.component.onDelete();
        }
    }

    //====================================
    // open and save methods
    //====================================

    /** This retrieves the file metadata used to save the file. */
    getFileMetadata() {
        return this.fileMetadata;
    }

    /** This saves the model. It the optionalSavedRootFolder is passed in,
     * it will save a model with that as the root folder. */
    toJson(optionalSavedRootFolder) {

        let modelJson = this.model.toJson(optionalSavedRootFolder);

        var rootFolder;
        if(optionalSavedRootFolder) {
            rootFolder = optionalSavedRootFolder;
        }
        else {
            rootFolder = this.model.getRoot();
        }

        var rootFolderComponent = this.getComponent(rootFolder);
        let componentsJson = rootFolderComponent.toJson();

        return {modelJson, componentsJson};
    }

    /** This is used in saving the active tab 
     * @private */
    getMemberNameFromId(activeTabId) {
        var component = this.getComponentById(activeTabId);
        if(component) {
            var member = component.getMember();
            if(member) {
                return member.getFullName();
            }
        }
        return undefined;
    }

    //================================
    // Folder child methods
    // The following methods are standard methods to serialize and deserialize the children in a folder. This
    // can be used by different folder component representations.
    //================================

    getFolderComponentContentJson(folder) {
        var json = {};
        var tableMap = folder.getChildMap();
        for(var key in tableMap) {
            var child = tableMap[key];

            //get the object map for the model
            var childComponent = this.getComponent(child);

            //get the component for this child
            var name = child.getName();
            json[name] = childComponent.toJson();
        }
        return json;
    }
    
    loadFolderComponentContentFromJson(childActionResults,childrenJson) {
        if(!childActionResults) return;
        let childCommandResults = [];

        childActionResults.forEach( childActionResult => {
        
            let childMember = childActionResult.member;
            if(childMember) {
                var childComponentJson = childrenJson[childMember.getName()];

                var childCommandResult = this.createComponentFromMember(childActionResult,childComponentJson);
                childCommandResults.push(childCommandResult);
            }
        });

        return childCommandResults;
    }

    //==================================
    // DEV FUNCTION
    //==================================

    showDependencies() {
        console.log(JSON.stringify(this.createDependencies()));
    }

    createDependencies() {
        var memberInfo = {};

        for(var key in this.componentMap) {
            var componentInfo = this.componentMap[key];
            if((componentInfo)&&(componentInfo.member)) {


                var member = componentInfo.member;

                var memberStruct = {};
                memberStruct.type = member.generator.type;
                var parent = member.getParent();
                memberStruct.parent = parent ? parent.getFullName() : null;

                if(member.isDependent) {
                    if(member.getDependsOn().length > 0) {
                        memberStruct.dep = member.getDependsOn().map(dependency => dependency.getFullName());
                    }
                }

                memberInfo[member.getFullName()] = memberStruct;
            }
        }

        return memberInfo;
    }

}

//this is the json for an empty model
ModelManager.EMPTY_MODEL_COMPONENT_JSON = {
    "type":"apogeeapp.app.FolderComponent"
};
