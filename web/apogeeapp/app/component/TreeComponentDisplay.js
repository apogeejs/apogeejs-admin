import {getIconOverlay} from "/apogeeapp/app/component/banner.js"; 

/** This component represents a json table object. */
export default class TreeComponentDisplay {

    constructor(component) {
        this.component = component;
        this.member = component.getMember();
        
        this.treeEntry = this.createTreeEntry();
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

    changeParent(newParentComponent,oldParentComponent) {
        var oldParentTreeEntry = oldParentComponent.getTreeEntry();
        oldParentTreeEntry.removeChild(this.treeEntry);
        
        var newParentTreeEntry = newParentComponent.getTreeEntry();
        newParentTreeEntry.addChild(this.treeEntry);
    }

    deleteDisplay() {
        alert("Delete tree component display not implemneted");
    }

    setBannerState(bannerState,bannerMessage) {
        var iconOverlay = getIconOverlay(bannerState);
        if(iconOverlay) {
            this.treeEntry.setIconOverlay(iconOverlay);
        }
        else {
            this.treeEntry.clearIconOverlay();
        }
    }

    updateData() {
        this.treeEntry.setLabel(this.member.getName());
    }
    //===============================
    // Private Functions
    //===============================

    /** @private */
    createTreeEntry() {
        //TREE_ENTRY
        //FIX THIS CODE!!!
        //open doesn't work and the context menu is duplicated code (that shouldn't be)
        
        //menu item callback
        var menuItemCallback = () => {
            //open menu item
            var menuItemList = [];
            var openMenuItem = this.component.getOpenMenuItem();
            if(openMenuItem) {
                menuItemList.push(openMenuItem);
            }

            //add child folder menu item
            if(this.component.usesTabDisplay()) {
                var childMenuItem = {};
                childMenuItem.title = "Add Child Folder";
                var app = this.component.getWorkspaceUI().getApp();
                var parentFullName = this.component.getMember().getFullName();
                childMenuItem.callback = app.getAddChildFolderCallback(parentFullName)
                menuItemList.push(childMenuItem);
            }

            return this.component.getMenuItems(menuItemList);
        }
        
        //double click callback
        var openCallback = this.component.createOpenCallback();
        
        var labelText = this.member.getName();
        var iconUrl = this.component.getIconUrl();
        var isRoot = ((this.member.isParent)&&(this.member.isRoot()));
        return new apogeeapp.ui.treecontrol.TreeEntry(labelText, iconUrl, openCallback, menuItemCallback,isRoot);
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
