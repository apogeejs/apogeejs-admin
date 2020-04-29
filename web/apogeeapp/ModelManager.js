import { Model, doAction } from "/apogee/apogeeCoreLib.js";
import {FieldObject} from "/apogeeutil/apogeeBaseLib.js";

/** This class manages the user interface for a model object. */
export default class ModelManager extends FieldObject {

    constructor(app,instanceToCopy,keepUpdatedFixed) {
        super("modelManager",instanceToCopy,keepUpdatedFixed);

        this.app = app;

        //==============
        //Fields
        //==============
        //Initailize these if this is a new instance
        if(!instanceToCopy) {
            this.setField("model",null);
            this.setField("componentMap",{});
            this.setField("memberMap",{});
        }

        //==============
        //Working variables
        //==============
        this.viewStateCallback = null;
        this.cachedViewState = null;

        this.workingChangeMap = {};

        //add a change map entry for this object
        this.workingChangeMap[this.getId()] = {action: instanceToCopy ? "modelManager_updated" : "modelManager_created", instance: this};
      
    }

    //====================================
    // Methods
    //====================================

    /** This gets the application instance. */
    getApp() {
        return this.app;
    }

    /** This method gets the model object. */
    getModel() {
        return this.getField("model");
    }

    /** This method returns a mutable instance of the model. If the active model is already mutable
     * it returns that. If not, it returns a mutble copy that also becomes the current model instance. */
    getMutableModel() {
        let oldModel = this.getModel();
        if(oldModel.getIsLocked()) {
            let newModel = oldModel.getMutableModel();
            this.setField("model",newModel);
            
            //add listeners
            //newModel.addListener("member_created", member => this.memberCreated(member));
            newModel.addListener("member_updated", member => this.memberUpdated(member));
            newModel.addListener("member_deleted", member => this.memberDeleted(member));
            newModel.addListener("model_updated", model => this.modelUpdated(model));

            return newModel;
        }
        else {
            return oldModel;
        }
    }

    
    //============================
    // Component Creation
    //============================

    /** This returns the list of parents for newly created members. The argument includeRootFolder includes
     * the root folder in the list. This should only be done for other parent objects (The root should not 
     * hold any children.). */
    getParentList(includeRootFolder) {
        let componentMap = this.getField("componentMap");
        let model = this.getModel();
        let folders = []
        //get the model parent entry
        if(includeRootFolder) {
            folders.push([model.getId(),"Root Folder"]);
        }
        
        //get folder compontents
        for(var key in componentMap) {
            var component = componentMap[key];
            if(component.getParentFolderForChildren) {
                let folderMember = component.getParentFolderForChildren();
                if(folderMember.getChildrenWriteable()) { 
                    let folderEntry = [];
                    folderEntry.push(folderMember.getId());
                    folderEntry.push(folderMember.getFullName(model));
                    folders.push(folderEntry);
                }
            }
        }
        return folders;
    }
        
    createComponentFromMember(member,componentJson) {

        if(!member) {
            throw new Error("Unknown error: member missing!");
        }
        
        //response - get new member
        var component;
        var componentClass = this.app.getComponentClass(componentJson.type);
        if((componentClass)&&(member.constructor.generator.type != "apogee.ErrorTable")) {
            //create empty component
            component = new componentClass(member,this);

            //apply any serialized values
            if(componentJson) {
                component.loadStoredData(componentJson);
            }
        }

        //if we failed to create the component, or if we failed to make the member properly (and we used the error member)
        if(!component) {
            //table not found - create an empty error table
            componentClass = this.app.getComponentClass("apogeeapp.app.ErrorComponent");
            component = new componentClass(member,this);
            if(componentJson) {
                component.loadStoredData(componentJson);
            }
        }

        if(!component) {
            throw new Error("Unknown error creating componet: " + member.getName());
        }

        //load the children, after the component load is completed
        if(component.loadChildrenFromJson) {
            component.loadChildrenFromJson(this,componentJson);
        }

    }

    
    //=============================
    // Model event handlers
    //=============================

    /** This method responds to a member updated. */
    memberCreated(member) {
    }


    /** This method responds to a member updated. */
    memberUpdated(member) {
        let componentId = this.getComponentIdByMemberId(member.getId());
        if(componentId) {
            let component = this.getMutableComponentByComponentId(componentId);
            component.memberUpdated(member);
        }
    }

    modelUpdated(model) {
    }

    /** This method responds to a delete menu event. */
    memberDeleted(member) {
        let memberId = member.getId();
        let componentId = this.getComponentIdByMemberId(memberId);
        if(componentId) {
            let oldComponentMap = this.getField("componentMap");
            let component = oldComponentMap[componentId];

            //take any delete actions (thes should not require a mutable member)
            component.onDelete();

            //unregister the component
            this._unregisterComponent(component);
        }
    }


    //====================================
    // Component Owner Functionality
    //====================================

    /** The change map lists the changes to the components and model. This will only be
     * valid when the ModelManager is unlocked */
    getChangeMap() {
        return this.workingChangeMap;
    }

    /** This method locks the model manager and all components. */
    lockAll() {
        this.workingChangeMap = null;

        let componentMap = this.getField("componentMap");
        for(var id in componentMap) {
            componentMap[id].lock();
        }
        this.lock();
    }

    getComponentByComponentId(componentId) {
        return this.getField("componentMap")[componentId];
    }

    /** This method gets the component associated with a member object. */
    getMutableComponentByComponentId(componentId) {
        let oldComponentMap = this.getField("componentMap");
        var oldComponent = oldComponentMap[componentId];
        if(oldComponent) {
            if(oldComponent.getIsLocked()) {
                //create an unlocked instance of the component
                let newComponent = new oldComponent.constructor(oldComponent.getMember(),this,oldComponent);

                //register this instance
                this.registerComponent(newComponent);

                return newComponent;
            }
            else {
                return oldComponent;
            }
        }
        else {
            return null;
        }
    }

    /** This method gets the component associated with a member object. */
    getComponentIdByMemberId(memberId) {
        let memberMap = this.getField("memberMap");
        var memberInfo = memberMap[memberId];
        if(memberInfo) {
            return memberInfo.componentId;
        }
        else {
            return null;
        }
    }

    /** This method stores the component instance. It must be called when a
     * new component is created and when a component instance is replaced. */
    registerComponent(component) {
        let componentId = component.getId();
        let oldComponentMap = this.getField("componentMap");

        //create the udpated map
        let newComponentMap = {};
        Object.assign(newComponentMap,oldComponentMap);
        newComponentMap[componentId] = component;
        this.setField("componentMap",newComponentMap);

        //update the change map
        let oldChangeEntry = this.workingChangeMap[componentId];  
        let newAction; 
        //this.workingChangeMap[componentId] = {action: (oldInstance ? "component_updated" : "component_created"), instance: component};
        if(oldChangeEntry) {
            //we will assume the events come in order
            //the only scenarios assuming order are:
            //created then updated => keep action as created
            //updated then updated => no change
            //we will just update the component
            newAction = oldChangeEntry.action;
        }
        else {
            //new action will depend on if we have the component in our old component map
            newAction = oldComponentMap[componentId] ? "component_updated" : "component_created"; 
        }
        this.workingChangeMap[componentId] = {action: newAction, instance: component};
    }

    /** This method takes the local actions needed when a component is deleted. It is called internally. */
    _unregisterComponent(component) {
        let componentId = component.getId();

        //update the component map
        let oldComponentMap = this.getField("componentMap");
        let newComponentMap = {};
        Object.assign(newComponentMap,oldComponentMap);
        //remove the given component
        delete newComponentMap[componentId];
        //save the updated map
        this.setField("componentMap",newComponentMap);

        //update the member map
        //this is a little cumbersome
        let oldMemberMap = this.getField("memberMap");
        let newMemberMap = {};
        Object.assign(newMemberMap,oldMemberMap);
        for(let componentMemberId in newMemberMap) {
            let componentInfo = newMemberMap[componentMemberId];
            if(componentInfo.componentId == componentId) {
                delete newMemberMap[componentMemberId];
            }
        }
        this.setField("memberMap",newMemberMap);

        //update the change map
        let oldChangeEntry = this.workingChangeMap[componentId];
        let newChangeEntry;
        if(oldChangeEntry) {
            //handle the case of an existing change entry
            if(oldChangeEntry.action == "component_created") {
                //component created and deleted during this action - flag it as transient
                newChangeEntry = {action: "transient", instance: component};
            }
            else if(oldChangeEntry.action == "component_updated") {
                newChangeEntry = {action: "component_deleted", instance: component};
            }
            else {
                //this shouldn't happen. If it does there is no change to the action
                //we will just update the component
                newChangeEntry = {action: oldChangeEntry.action, instance: component};
            }
        }
        else {
            //add a new change entry
            newChangeEntry = {action: "component_deleted", instance: component};
        }
        this.workingChangeMap[componentId] = newChangeEntry;  
    }

    /** This method registers a member data object and its associated component object.
     * If the member is not the main member assoicated with component but instead an included
     * member, the main componentMember should be passed in also. Otherwise it should be left 
     * undefined. */
    registerMember(memberId,component,isMain) {

        let oldMemberMap = this.getField("memberMap");

        if(oldMemberMap[memberId]) {
            //already registered
            return;
        }

        //copy the old map
        let newMemberMap = {};
        Object.assign(newMemberMap,oldMemberMap);

        //add the new info
        let memberInfo = {};
        memberInfo.memberId = memberId;
        memberInfo.componentId = component.getId();
        memberInfo.isMain = isMain;

        newMemberMap[memberId] = memberInfo;

        this.setField("memberMap",newMemberMap);
    }
    
    testPrint(eventInfo) {
        if(eventInfo.updated) {
            console.log(JSON.stringify(eventInfo.updated));
        }
    }

    //====================================
    // open and save methods
    //====================================
    
    setViewStateCallback(viewStateCallback) {
        this.viewStateCallback = viewStateCallback;
    }

    getCachedViewState() {
        return this.cachedViewState;
    }

     /** This method loads the model data and model components from the json. */
    load(workspaceManager,json) {

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
        let model = new Model(workspaceManager.getModelRunContext());
        this.setField("model",model);
        
        //add listeners
        //model.addListener("member_created", member => this.memberCreated(member));
        model.addListener("member_updated", member => this.memberUpdated(member));
        model.addListener("member_deleted", member => this.memberDeleted(member));
        model.addListener("model_updated", model => this.modelUpdated(model));

        //load the model
        let loadAction = {};
        loadAction.action = "loadModel";
        loadAction.modelJson = modelJson;
        let actionResult = doAction(model,loadAction);

        //create the return result
        let commandResult = {};

        if(actionResult.actionDone) {
            commandResult.eventAction = "updated";
            commandResult.cmdDone = true;
            commandResult.target = this;

            //create the children
            let childCommandResults = [];
            let rootChildIdMap = model.getChildIdMap();
            for(let childName in rootChildIdMap) {
                let childMemberId = rootChildIdMap[childName];
                let childMember = model.lookupMemberById(childMemberId);
                if(childMember) {
                    let childJson = componentsJson[childName];
                    let childCommandResult = this.createComponentFromMember(childMember,childJson);
                    childCommandResults.push(childCommandResult);
                }
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

    /** This saves the model. It the optionalSavedRootFolder is passed in,
     * it will save a model with that as the root folder. */
    toJson(optionalSavedRootFolder) {

        let model = this.getField("model");
        let json = {};

        //get the model json
        if(optionalSavedRootFolder) {
            throw new Error("Need to correctly save the model for the optional saved root folder!");
        }
        json.model = model.toJson();

        //get the components json
        let componentsJson = {};

        //get the "root folder" - either for the model or the optional folder to save.
        let childIdMap;
        if(optionalSavedRootFolder) {
            childIdMap = optionalSavedRootFolder.getChildMap();
        }
        else {
            childIdMap = model.getChildIdMap();
        } 

        //get all the components asoicated with the root members
        for(let childName in childIdMap) {
            //member
            let memberId = childIdMap[childName];
            let componentId = this.getComponentIdByMemberId(memberId);
            let component = this.getComponentByComponentId(componentId);
            componentsJson[childName] = component.toJson(this);
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
        throw new Error("This needs to be rewritten, probably in Model rather than here.")
        //for one thing I removed the model instance from componentInfo in the component map
        //instead I should just read all the members from the model.

        // let model = this.getField("model");
        // var memberInfo = {};

        // let componentMap = this.getField("componentMap");

        // for(var key in componentMap) {
        //     var componentInfo = componentMap[key];
        //     if((componentInfo)&&(componentInfo.member)) {


        //         var member = componentInfo.member;

        //         var memberStruct = {};
        //         memberStruct.type = member.constructor.generator.type;
        //         var parentMember = member.getParentMember(model);
        //         memberStruct.parent = parentMember ? parentMember.getFullName(model) : null;

        //         if(member.isDependent) {
        //             let depList = [];
        //             let dependsOnMap = member.getDependsOn();
        //             for(var idString in dependsOnMap) {
        //                 dependencyType = dependsOnMap[idString];
        //                 if(dependencyType == apogeeutil.NORMAL_DEPENDENCY) {
        //                     let dependency = model.lookupMemberById(idString);
        //                     depList.push(dependency.getFullName(model));
        //                 }
        //             }
        //             if(depList.length > 0) {
        //                 memberStruct.dep = depList;
        //             }
        //         }

        //         memberInfo[member.getFullName(model)] = memberStruct;
        //     }
        // }

        // return memberInfo;
    }

}

//this is the json for an empty model
ModelManager.EMPTY_MODEL_COMPONENT_JSON = {
    "Main": {
        "type":"apogeeapp.app.FolderComponent"
    }
};
