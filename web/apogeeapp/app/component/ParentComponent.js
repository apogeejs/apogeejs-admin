import Component from "/apogeeapp/app/component/Component.js";

/** This is the base class for a parent component (an object that has children),
 * It extends the component class. */
export default class ParentComponent extends Component {

    constructor(workspaceUI,member,componentGenerator) {
        //base constructor
        super(workspaceUI,member,componentGenerator);
    }

    instantiateTreeEntry() {
        var treeDisplay = super.instantiateTreeEntry();
        
        //add any existing children to the tree entry
        var treeEntry = treeDisplay.getTreeEntry();
        var member = this.getMember();
        var childMap = member.getChildMap();
        for(var childKey in childMap) {
            var childMember = childMap[childKey];
            var childComponent = this.getWorkspaceUI().getComponent(childMember);
            if((childComponent)&&(childComponent.usesTabDisplay())) {
                //only add tree entries for components with tab displays
                var childTreeEntry = childComponent.getTreeEntry(true);
                treeEntry.addChild(childTreeEntry);
            }
        }
        
        return treeDisplay;
    }

    //----------------------
    // WindowParent Methods
    //----------------------
        
    usesTabDisplay() {    
        return true;
    }

    // getMenuItems(optionalMenuItemList) {
    //     var menuItemList = optionalMenuItemList ? optionalMenuItemList : [];
        
    //     //initialize the "add components" menu
    //     var itemInfo = {};
        
    //     var app = this.getWorkspaceUI().getApp();
    //     var initialValues = {};
    //     initialValues.parentName = this.member.getFullName();
        
    //     itemInfo.title = "Add Component...";
    //     itemInfo.childMenuItems = app.getAddChildMenuItems(initialValues);
    //     menuItemList.push(itemInfo);

    //     //call base class
    //     var menuItemList = super.getMenuItems(menuItemList);
                
    //     return menuItemList;
    // }

    /** This brings the child component to the front and takes any other actions
     * to show the child in the open parent. */
    showChildComponent(childComponent) {
        if(childComponent.getMember().getParent() != this.getMember()) return;
        
        if(this.tabDisplay) {
            this.tabDisplay.showChildComponent(childComponent);
        }
    }



    /** This function adds a fhile componeent to the displays for this parent component. */
    removeChildComponent(childComponent) {
        //remove from tree entry
        var treeEntry = this.getTreeEntry();
        if(treeEntry) {
            var childTreeEntry = childComponent.getTreeEntry();
            if(childTreeEntry) {
                treeEntry.removeChild(childTreeEntry);
            }
        }
        
        //remove child windows - just hide them. They will be deleted in the component
        childComponent.closeComponentDisplay();
    }

    /** This function adds a fhile componeent to the displays for this parent component. */
    addChildComponent(childComponent) {
        //add the child to the tree entry
        var treeEntry = this.getTreeEntry();
        if(treeEntry) {
            var childTreeEntry = childComponent.getTreeEntry(true);
            treeEntry.addChild(childTreeEntry);
        }

        //add child entry for tab
        if(this.tabDisplay) {
            this.tabDisplay.addChildComponent(childComponent); 
        }
    }
}

/** This is used to flag this as an edit component. */
ParentComponent.isParentComponent = true;