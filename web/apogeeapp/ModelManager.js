import base from "/apogeeutil/base.js";
import { Model, doAction } from "/apogee/apogeeCoreLib.js";
import FieldObject from "/apogeeutil/FieldObject.js";

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
      
    }

    //====================================
    // Model Management
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
            //newModel.addListener("created", eventInfo => this.objectCreated(eventInfo));
            newModel.addListener("updated", eventInfo => this.objectUpdated(eventInfo));
            newModel.addListener("deleted", eventInfo => this.objectDeleted(eventInfo));

            return newModel;
        }
        else {
            return oldModel;
        }
    }

    //====================================
    // Component Management
    //====================================

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
                let newComponent = oldComponent.constructor(component.getMember(),this,oldComponent);

                //register this instance
                let newComponentMap = {};
                Object.assign(newComponentMap,oldComponentMap);
                newComponentMap[componentId] = newComponent;
                this.setField("componentMap",newComponentMap);
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

    /** This returns the list of folder names. */
    getFolders() {
        let componentMap = this.getField("componentMap");
        let model = this.getModel();
        var folders = []
        for(var key in componentMap) {
            var folderEntry = [];
            var component = componentMap[key];
            if(component.getParentFolderForChildren)
            var folderMember = component.getParentFolderForChildren();
            if(folderMember.getChildrenWriteable()) { 
                folderEntry.push(folderMember.getId());
                folderEntry.push(folderMember.getFullName(model));
                folders.push(folderEntry);
            }
        }
        return folders;
    }

    /** This method stores the component instance. It must be called when a
     * new component is created and when a component instance is replaced. */
    registerComponent(component) {
        //copy the old map
        let oldComponentMap = this.getField("componentMap");
        let newComponentMap = {};
        Object.assign(newComponentMap,oldComponentMap);

        //update and save
        newComponentMap[component.getId()] = component;
        this.setField("componentMap",newComponentMap);
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
            commandResult.cmdDone = true;
            commandResult.eventAction = "created";

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

    //=============================
    // Model event handlers
    //=============================

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

            //update the component map
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
            this.setField("memberMap",memberMap);
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
