
import Menu from "/apogeeapp/ui/menu/Menu.js";

if(!apogeeapp.ui.treecontrol) apogeeapp.ui.treecontrol = {};

apogeeapp.ui.treecontrol.TreeEntry = function(labelText,iconSrc,dblClickCallback,menuItemCallback,isRoot) {
    
    this.contractUrl = apogeeapp.ui.getResourcePath("/opened_bluish.png");
    this.expandUrl = apogeeapp.ui.getResourcePath("/closed_bluish.png");
    this.noControlUrl = apogeeapp.ui.getResourcePath("/circle_bluish.png");
    this.emptyControlUrl = apogeeapp.ui.getResourcePath("/circle_bluish.png");
    
    this.isRoot = isRoot;
    
    var baseCssClass;
    if(isRoot) {
        baseCssClass = "visiui-tc-root";
    }
    else {
        baseCssClass = "visiui-tc-child";
    }
    
    this.element = apogeeapp.ui.createElementWithClass("li", baseCssClass);
    this.control = apogeeapp.ui.createElementWithClass("img", "visiui-tc-control",this.element);
    

    //icon/menu
    if(iconSrc) {
        this.iconContainerElement = apogeeapp.ui.createElementWithClass("div", "visiui-tc-icon-container",this.element);
        if(menuItemCallback) {
            //icon as menu
            this.menu = Menu.createMenuFromImage(iconSrc);
            this.menu.setAsOnTheFlyMenu(menuItemCallback);
            this.iconContainerElement.appendChild(this.menu.getElement());
        }
        else {
            //plain icon
            this.icon = apogeeapp.ui.createElementWithClass("img", "visiui-tc-icon",this.iconContainerElement);
            this.icon.src = iconSrc; 
        }
        this.iconOverlayElement = apogeeapp.ui.createElementWithClass("div","visiui_tc_icon_overlay",this.iconContainerElement);
    }
    
    
    
    //label
    this.label = apogeeapp.ui.createElementWithClass("div", "visiui-tc-label",this.element);
    if(labelText) {
        this.setLabel(labelText);
    }
    
    this.childContainer = null;
    this.childEntries = [];
    this.parent = null;
    this.sortFunction = null;
    this.extraSortParam = null;
    
    //set the non-empty state for in case we get children
    //but for now it will be empty
    this.nonEmptyState = apogeeapp.ui.treecontrol.DEFAULT_STATE;
    this.setState(apogeeapp.ui.treecontrol.NO_CONTROL);
    
    //context menu and double click
    var contextMenuCallback = function(event) {
        var contextMenu = Menu.createContextMenu();
        var menuItems = menuItemCallback();
        contextMenu.setMenuItems(menuItems);
        Menu.showContextMenu(contextMenu,event);
    }
    this.label.oncontextmenu = contextMenuCallback;
    
    //double click action
    if(dblClickCallback) {
        this.label.ondblclick = dblClickCallback;
    }
}

apogeeapp.ui.treecontrol.NO_CONTROL = 0;
apogeeapp.ui.treecontrol.EXPANDED = 1;
apogeeapp.ui.treecontrol.COLLAPSED = -1;

apogeeapp.ui.treecontrol.DEFAULT_STATE = apogeeapp.ui.treecontrol.COLLAPSED;

/** The outer DOM element */
apogeeapp.ui.treecontrol.TreeEntry.prototype.getElement = function() {
    return this.element;
}

/** This sets a sort function for the children of the node. If none is set the
 * children will be sorted by the order they are added. */
apogeeapp.ui.treecontrol.TreeEntry.prototype.setSortFunction = function(sortFunction) {
    this.sortFunction = sortFunction;
}

/** The label for the entry. */
apogeeapp.ui.treecontrol.TreeEntry.prototype.setLabel = function(labelText) {
    this.labelText = labelText;
    this.label.innerHTML = labelText;
    if(this.parent) {
        this.parent._notifyNameChange(this);
    }
}

/** The label for the entry. */
apogeeapp.ui.treecontrol.TreeEntry.prototype.getLabel = function() {
    return this.labelText;
}

/** This allows for specified ordering of the chidlren. */
apogeeapp.ui.treecontrol.TreeEntry.prototype.setExtraSortParam = function(value) {
    this.extraSortParam = value;
}

/** This allows for specified ordering of the chidlren. */
apogeeapp.ui.treecontrol.TreeEntry.prototype.getExtraSortParam = function() {
    return this.extraSortParam;
}

apogeeapp.ui.treecontrol.TreeEntry.prototype.addChild = function(childTreeEntry) {
    this.childEntries.push(childTreeEntry);
    this._insertChildIntoList(childTreeEntry);
    childTreeEntry._setParent(this);
}

apogeeapp.ui.treecontrol.TreeEntry.prototype.removeChild = function(childTreeEntry) {
    if(this.childContainer) {
        var index = this.childEntries.indexOf(childTreeEntry);
        if(index >= 0) {
            this.childEntries.splice(index,1);
            this._removeChildFromList(childTreeEntry);
            childTreeEntry._setParent(null);
        }
    }
}

apogeeapp.ui.treecontrol.TreeEntry.prototype.getState = function() {
    return this.state;
}

apogeeapp.ui.treecontrol.TreeEntry.prototype.setState = function(state) {
    //if we have no children, always make the state no control
    //but we will store the state below for latert
    if((!this.childContainer)||(this.childContainer.length == 0)) {
        this.state = apogeeapp.ui.treecontrol.NO_CONTROL;
    }
    else {
        this.state = state;
    }
    
    //save this as the non-empty state if it is not no control
    if(state != apogeeapp.ui.treecontrol.NO_CONTROL) {
        this.nonEmptyState = state;
    }
    
    //configure the state
    if(this.state == apogeeapp.ui.treecontrol.NO_CONTROL) {
        if(this.isRoot) {
            this.control.src = this.emptyControlUrl;
        }
        else {
            this.control.src = this.noControlUrl;
        }
    }
    else if(this.state == apogeeapp.ui.treecontrol.EXPANDED) {
        this.control.src = this.contractUrl;
        
        if(!this.collapse) {
            var instance = this;
            this.collapse = function() {
                instance.setState(apogeeapp.ui.treecontrol.COLLAPSED);
            }
        }
        
        this.control.onclick = this.collapse
        this.childContainer.style.display = "";
    }
    else if(this.state == apogeeapp.ui.treecontrol.COLLAPSED) {
        this.control.src = this.expandUrl;
        
        if(!this.expand) {
            var instance = this;
            this.expand = function() {
                instance.setState(apogeeapp.ui.treecontrol.EXPANDED);
            }
        }
        
        this.control.onclick = this.expand;
        this.childContainer.style.display = "none";
    }
}

/** This sets the given element as the icon overlay. If null or other [false} is passed
 * this will just clear the icon overlay. */
apogeeapp.ui.treecontrol.TreeEntry.prototype.setIconOverlay = function(element) {
    this.clearIconOverlay();
    if(element) {
        this.iconOverlayElement.appendChild(element);
    }
}

apogeeapp.ui.treecontrol.TreeEntry.prototype.clearIconOverlay = function() {
    apogeeapp.ui.removeAllChildren(this.iconOverlayElement);
}

//=====================================
// Private
//=====================================

/** I want to make sure people don't do this themselves. It is done in add/remove child. 
 * @private */
apogeeapp.ui.treecontrol.TreeEntry.prototype._setParent = function(parent) {
    this.parent = parent;
}

/** I want to make sure people don't do this themselves. It is done in add/remove child. 
 * @private */
apogeeapp.ui.treecontrol.TreeEntry.prototype._insertChildIntoList = function(childEntry) {
    if(!this.childContainer) {
        //add the child list if it does not exist
        this.childContainer = apogeeapp.ui.createElementWithClass("ul","visiui-tc-child-list",this.element); 
        this.setState(this.nonEmptyState);
    }
    
    if(this.sortFunction) {
        this._updateChildElements();
    }
    else {
        this.childContainer.appendChild(childEntry.getElement());
    }
}

/** I want to make sure people don't do this themselves. It is done in add/remove child. 
 * @private */
apogeeapp.ui.treecontrol.TreeEntry.prototype._removeChildFromList = function(childEntry) {
    this.childContainer.removeChild(childEntry.getElement());
    
    //remove the child list if there are no children
    if(this.childContainer.childElementCount === 0) {
        this.element.removeChild(this.childContainer);
        this.childContainer = null;
        //set state to empty, but save our old setting
        this.nonEmtpyState = this.state;
        this.setState(apogeeapp.ui.treecontrol.NO_CONTROL); 
    }
}

/** I want to make sure people don't do this themselves. It is done in add/remove child. 
 * @private */
apogeeapp.ui.treecontrol.TreeEntry.prototype._notifyNameChange = function(childEntry) {
    if(this.sortFunction) {
        this._updateChildElements();
    }
}

/** This sets the children elements in the sorted order 
 * @private */
apogeeapp.ui.treecontrol.TreeEntry.prototype._updateChildElements = function() {
  var temp = this.childEntries.map( element => element);
  temp.sort(this.sortFunction);
  apogeeapp.ui.removeAllChildren(this.childContainer);
  temp.forEach(child => this.childContainer.appendChild(child.getElement()));

}    






