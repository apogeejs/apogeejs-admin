import base from "/apogeeutil/base.js";
import { Model, doAction } from "/apogee/apogeeCoreLib.js";
import FieldObject from "/apogeeutil/FieldObject.js";
import EventManager from "/apogeeutil/EventManager.js";

/** This class manages the user interface for a model object. */
export default class ModelManager  extends FieldObject {

    constructor(workspaceManager) {
        super("modelManager");

        //mixin initialization
        this.eventManagerMixinInit();

        this.app = workspaceManager.getApp();

        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
        //FIELDS
        this.setField("workspaceManager",workspaceManager); 
        this.setField("model",null);
        this.setField("componentMap",{});
        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
        //Working
        this.viewStateCallback = null;
        this.cachedViewState = null;
        //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
      
    }

    //====================================
    // Model Management
    //====================================

    /** This gets the application instance. */
    getApp() {
        return this.app;
    }

    getWorkspaceManager() {
        return this.getField("workspaceManager");
    }

    setViewStateCallback(viewStateCallback) {
        this.viewStateCallback = viewStateCallback;
    }

    getCachedViewState() {
        return this.cachedViewState;
    }

     /** This method loads the model data and model components from the json. */
    load(json) {

        let modelJson; 
        let componentsJson;

        if(json) {
            modelJson = json.model;
            componentsJson = json.components;

            //set the view state
            if(json.viewState !== undefined) {
                this.cachedViewState = json.viewState;
            }
        }

        //load defaults if there is not saved model data
        if(!modelJson) modelJson = Model.EMPTY_MODEL_JSON;
        if(!componentsJson) componentsJson = ModelManager.EMPTY_MODEL_COMPONENT_JSON;

        //create model
        let model = new Model();
        this.setField("model",model);
        
        //add listeners
        //model.addListener("created", eventInfo => this.objectCreated(eventInfo));
        model.addListener("updated", eventInfo => this.objectUpdated(eventInfo));
        model.addListener("deleted", eventInfo => this.objectDeleted(eventInfo));

        //load the model
        let loadAction = {};
        loadAction.action = "loadModel";
        loadAction.modelJson = modelJson;
        let actionResult = doAction(model,loadAction);

        //create the return result
        let commandResult = {};

        if(actionResult.actionDone) {
            commandResult.action = "updated";
            commandResult.cmdDone = true;
            commandResult.target = this;
            commandResult.dispatcher = this;

            //create the children
            let childCommandResults = [];
            let rootChildMap = model.getChildMap();
            for(let childName in rootChildMap) {
                let childMember = rootChildMap[childName];
                let childJson = componentsJson[childName];
                let childCommandResult = this.createComponentFromMember(childMember,childJson);
                childCommandResults.push(childCommandResult);
            }
            if(childCommandResults.length > 0) {
                commandResult.childCommandResults = childCommandResults;
            }

            commandResult.actionResult = actionResult;
        }
        else {
            commandResult.cmdDone = false;
            commandResult.errorMsg = "Error opening workspace model";
        }

        return commandResult;
    }

    /** This method gets the model object. */
    getModel() {
        return this.getField("model");
    }

    /** This method closes the model object. */
    close() {
        //delete all the components - to make sure the are cleaned up
        let componentMap = this.getField("componentMap");
        for(var key in componentMap) {
            var componentInfo = componentMap[key];
            if((componentInfo)&&(componentInfo.component)&&(!componentInfo.componentMember)) {
                componentInfo.component.onDelete();
            }
        }
    }

    //====================================
    // Component Management
    //====================================

    /** This method gets the component associated with a member object. */
    getComponentByMember(member) {
        let componentMap = this.getField("componentMap");
        var componentInfo = componentMap[member.getId()];
        if(componentInfo) {
            return componentInfo.component;
        }
        else {
            return null;
        }
    }

    /** This method gets the component associated with a member object. */
    getComponentByMemberId(memberId) {
        let componentMap = this.getField("componentMap");
        var componentInfo = componentMap[memberId];
        if(componentInfo) {
            return componentInfo.component;
        }
        else {
            return null;
        }
    }

    /** This returns the list of folder names. */
    getFolders() {
        let componentMap = this.getField("componentMap");
        let model = this.getModel();
        var folders = []
        for(var key in componentMap) {
            var folderEntry = [];
            var componentInfo = componentMap[key];
            var member = componentInfo.member;
            if((member.isParent)&&(member.getChildrenWriteable())) { 
                folderEntry.push(member.getId());
                folderEntry.push(member.getFullName(model));
                folders.push(folderEntry);
            }
        }
        return folders;
    }

    /** This method registers a member data object and its associated component object.
     * If the member is not the main member assoicated with component but instead an included
     * member, the main componentMember should be passed in also. Otherwise it should be left 
     * undefined. */
    registerMember(member,component,mainComponentMember) {

        let oldComponentMap = this.getField("componentMap");

        //store the ui object
        var memberId = member.getId();

        if(oldComponentMap[memberId]) {
            //already exists! (we need to catch this earlier if we want it to not be fatal. But we should catch it here too.)
            throw base.createError("There is already a member with the given ID.",true);
        }

        //copy the old map
        let newComponentMap = {};
        Object.assign(newComponentMap,oldComponentMap);

        //add the new info
        var componentInfo = {};
        componentInfo.member = member;
        componentInfo.component = component;
        if(mainComponentMember) componentInfo.componentMember = mainComponentMember;

        newComponentMap[memberId] = componentInfo;

        this.setField("componentMap",newComponentMap);

    }
    
    testPrint(eventInfo) {
        if(eventInfo.updated) {
            console.log(JSON.stringify(eventInfo.updated));
        }
    }
        
    createComponentFromMember(member,componentJson) {
        
        //response - get new member
        var component;
        var commandResult = {};

        if(member) {
            
            var componentClass = this.app.getComponentClass(componentJson.type);
            if((componentClass)&&(member.constructor.generator.type != "apogee.ErrorTable")) {
                //create empty component
                component = new componentClass(member,this);

                //apply any serialized values
                if(componentJson) {
                    component.loadPropertyValues(componentJson);
                }
            }

            //if we failed to create the component, or if we failed to make the member properly (and we used the error member)
            if(!component) {
                //table not found - create an empty table
                componentClass = this.app.getComponentClass("apogeeapp.app.ErrorComponent");
                component = new componentClass(member,this);
                if(componentJson) {
                    component.loadProperties(componentJson);
                }
            }

        }

        if(!component) {
            commandResult.cmdDone = false;
            commandResult.errorMsg = "Component creation failed: " + member.getName();
        }
        else {
            commandResult.target = component;
            commandResult.dispatcher = this;
            commandResult.cmdDone = true;
            commandResult.action = "created";

            //load the children, after the component load is completed
            if(component.loadChildrenFromJson) {
                let childCommentResults = component.loadChildrenFromJson(this,componentJson);
                if((childCommentResults)&&(childCommentResults.length > 0)) {
                    commandResult.childCommandResults = childCommentResults;
                }
            }
        }
            
        return commandResult;
    }

    objectCreated(eventInfo) {
        if(eventInfo.member) {
            this.memberCreated(eventInfo.target);
        }
    }

    objectUpdated(eventInfo) {
        if(eventInfo.member) {
            this.memberUpdated(eventInfo.member);
        }
        else if(eventInfo.model) {
            this.modelUpdated(eventInfo.model);
        }
    }

    objectDeleted(eventInfo) {
        if(eventInfo.member) {
            this.memberDeleted(eventInfo.member);
        }
    }

    /** This method responds to a member updated. */
    memberCreated(member) {
    }


    /** This method responds to a member updated. */
    memberUpdated(member) {
        var componentInfo = this.getField("componentMap")[member.getId()];
        if((componentInfo)&&(componentInfo.component)) {
            componentInfo.component.memberUpdated(member);
        }
    }

    modelUpdated(model) {
        //all changes kept in model
    }

    /** This method responds to a "new" menu event. */
    memberDeleted(member) {
        let memberId = member.getId();
        let oldComponentMap = this.getField("componentMap");
        var componentInfo = oldComponentMap[memberId];

        if(componentInfo) {
            //copy the old map
            let newComponentMap = {};
            Object.assign(newComponentMap,oldComponentMap);
            //remove the given component
            delete newComponentMap[memberId];
            //save the updated map
            this.setField("componentMap",newComponentMap);

            //take any additionl delete actions
            if((componentInfo)&&(componentInfo.component)) {
                //do any needed cleanup
                componentInfo.component.onDelete();
            }
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

        let model = this.getField("model");
        let json = {};

        //get the model json
        json.model = model.toJson(optionalSavedRootFolder);

        //get the components json
        let componentsJson = {};

        let childMap;
        if(optionalSavedRootFolder) {
            childMap = [];
            childMap[optionalSavedRootFolder.getName()] = optionalSavedRootFolder;
        }
        else {
            childMap = model.getChildMap();
        }

        for(let childName in childMap) {
            let childMember = childMap[childName];
            let childComponent = this.getComponentByMember(childMember);
            componentsJson[childName] = childComponent.toJson(this);
        }
        json.components = componentsJson;

        //model view state
        if(this.viewStateCallback) {
            this.cachedViewState = this.viewStateCallback();
            if(this.cachedViewState) componentsJson.viewState = this.cachedViewState;
        }

        return json;
    }

    //==================================
    // DEV FUNCTION
    //==================================

    showDependencies() {
        console.log(JSON.stringify(this.createDependencies()));
    }

    createDependencies() {
        let model = this.getField("model");
        var memberInfo = {};

        let componentMap = this.getField("componentMap");

        for(var key in componentMap) {
            var componentInfo = componentMap[key];
            if((componentInfo)&&(componentInfo.member)) {


                var member = componentInfo.member;

                var memberStruct = {};
                memberStruct.type = member.constructor.generator.type;
                var parent = member.getParent(model);
                memberStruct.parent = parent ? parent.getFullName(model) : null;

                if(member.isDependent) {
                    let depList = [];
                    let dependsOnMap = member.getDependsOn();
                    for(var idString in dependsOnMap) {
                        dependencyType = dependsOnMap[idString];
                        if(dependencyType == apogeeutil.NORMAL_DEPENDENCY) {
                            let dependency = model.lookupMemberById(idString);
                            depList.push(dependency.getFullName(model));
                        }
                    }
                    if(depList.length > 0) {
                        memberStruct.dep = depList;
                    }
                }

                memberInfo[member.getFullName(model)] = memberStruct;
            }
        }

        return memberInfo;
    }

}

//add mixins to this class
base.mixin(ModelManager,EventManager);

//this is the json for an empty model
ModelManager.EMPTY_MODEL_COMPONENT_JSON = {
    "Main": {
        "type":"apogeeapp.app.FolderComponent"
    }
};
