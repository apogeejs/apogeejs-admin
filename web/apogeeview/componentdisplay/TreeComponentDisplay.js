import {getIconOverlay} from "/apogeeview/componentdisplay/banner.js"; 
import TreeEntry from "/apogeeui/treecontrol/TreeEntry.js";

import {addComponent} from "/apogeeview/commandseq/addcomponentseq.js";

/** This component represents a json table object. */
export default class TreeComponentDisplay {

    constructor(componentView) {
        this.componentView = componentView;
        
        this.treeEntry = this._createTreeEntry();
        this._setBannerState();

        //opnly needed for parents...
        this.treeEntry.setSortFunction(TreeComponentDisplay.treeSortFunction);
        //this should be overwritten in component
        this.treeEntry.setExtraSortParam(0);
    };

    getTreeEntry() {
        return this.treeEntry;
    }

    getState() {
        return this.treeEntry.getState();
    }

    setState(state) {
        this.treeEntry.setState(state);
    }

    setComponentTypeSortOrder(typeSortOrder) {
        this.treeEntry.setExtraSortParam(typeSortOrder);
    }

    // changeParent(newParentComponent,oldParentComponent) {
    //     var oldParentTreeEntry = oldParentComponent.getTreeEntry();
    //     oldParentTreeEntry.removeChild(this.treeEntry);
        
    //     var newParentTreeEntry = newParentComponent.getTreeEntry();
    //     newParentTreeEntry.addChild(this.treeEntry);
    // }

    deleteDisplay() {
        alert("Delete tree component display not implemneted");
    }

    componentUpdated(fieldsUpdated) {

        if(apogeeutil.isFieldUpdated(fieldsUpdated,"name")) {
            this._setLabel();
        }

        if(apogeeutil.isFieldUpdated(fieldsUpdated,"bannerState")) {
            this._setBannerState();
        }
    }
    //===============================
    // Private Functions
    //===============================

    /** @private */
    _createTreeEntry() {
        //TREE_ENTRY
        //FIX THIS CODE!!!
        //open doesn't work and the context menu is duplicated code (that shouldn't be)
        
        //menu item callback
        var menuItemCallback = () => {
            //open menu item
            var menuItemList = [];
            var openMenuItem = this.componentView.getOpenMenuItem();
            if(openMenuItem) {
                menuItemList.push(openMenuItem);
            }

            //add child folder menu item
            if(this.componentView.usesTabDisplay()) {
                var app = this.componentView.getModelView().getApp();
                var appView = this.componentView.getModelView().getAppView();
                var parentFullName = this.componentView.getFullName();
                var folderComponentClass = app.getFolderComponentClass();
                var initialValues = {parentName: parentFullName};

                var childMenuItem = {};
                childMenuItem.title = "Add Child Folder";
                childMenuItem.callback = () => addComponent(appView,app,folderComponentClass,initialValues);
                menuItemList.push(childMenuItem);
            }

            return this.componentView.getMenuItems(menuItemList);
        }
        
        //double click callback
        var openCallback = this.componentView.createOpenCallback();
        
        var labelText = this.componentView.getName();
        var iconUrl = this.componentView.getIconUrl();
        var isRoot = this.componentView.getComponent().getParentComponent() ? true : false;
        return new TreeEntry(labelText, iconUrl, openCallback, menuItemCallback,isRoot);
    }

    _setLabel() {
        let displayName = this.componentView.getName();
        this.treeEntry.setLabel(displayName);
    }

    _setBannerState() {
        let bannerState = this.componentView.getComponent().getBannerState();
        //let bannerMessage = this.componentView.getBannerMessage();

        var iconOverlay = getIconOverlay(bannerState);
        if(iconOverlay) {
            this.treeEntry.setIconOverlay(iconOverlay);
        }
        else {
            this.treeEntry.clearIconOverlay();
        }
    }

    /** This is used to sort the child tree entries. 
     * We allow for a different ordering for different types by using the extrar sort parameter.
     * (for now, we put folers first. Other component type parameters can be set too) */
    static treeSortFunction(entry1,entry2) {
        var typeOrderDiff = (entry1.getExtraSortParam() - entry2.getExtraSortParam());
        if(typeOrderDiff) {
            return typeOrderDiff;
        }
        else {
            return entry1.getLabel().localeCompare(entry2.getLabel());
        }
    }
}
