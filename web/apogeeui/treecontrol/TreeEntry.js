import uiutil from "/apogeeui/uiutil.js";
import Menu from "/apogeeui/menu/Menu.js";
import {getIconOverlay} from "/apogeeui/banner/banner.js"; 

export default class TreeEntry {

    constructor(labelText,iconSrc,clickCallback,menuItemCallback,isRoot) {
        
        this.contractUrl = uiutil.getResourcePath("/opened_bluish.png");
        this.expandUrl = uiutil.getResourcePath("/closed_bluish.png");
        this.noControlUrl = uiutil.getResourcePath("/circle_bluish.png");
        this.emptyControlUrl = uiutil.getResourcePath("/circle_bluish.png");
        
        this.isRoot = isRoot;
        
        var baseCssClass;
        if(isRoot) {
            baseCssClass = "visiui-tc-root";
        }
        else {
            baseCssClass = "visiui-tc-child";
        }
        
        this.element = uiutil.createElementWithClass("li", baseCssClass);
        this.control = uiutil.createElementWithClass("img", "visiui-tc-control",this.element);

        if(clickCallback) {
            this.mainContent = uiutil.createElementWithClass("a", "visiui-tc-main-content-link",this.element);
            this.mainContent.href = "#";
            this.mainContent.onclick = () => {
                clickCallback();
                return false;
            }
        }
        else {
            this.mainContent = uiutil.createElementWithClass("div", "visiui-tc-main-content-div",this.element);
        }

        //icon/menu
        if(!iconSrc) {
            iconSrc = uiutil.getResourcePath(uiutil.GENERIC_CELL_ICON);
        }

        this.iconContainerElement = uiutil.createElementWithClass("div", "visiui-tc-icon-container",this.mainContent);
        this.icon = uiutil.createElementWithClass("img", "visiui-tc-icon",this.iconContainerElement);
        this.icon.src = iconSrc; 
        this.iconOverlayElement = uiutil.createElementWithClass("div","visiui_tc_icon_overlay",this.iconContainerElement);
        
        //label
        this.label = uiutil.createElementWithClass("div", "visiui-tc-label",this.mainContent);
        if(labelText) {
            this.setLabel(labelText);
        }

        //menu
        if(menuItemCallback) {
            let menuImage = uiutil.getResourcePath(uiutil.DOT_MENU_IMAGE);
            this.menu = Menu.createMenuFromImage(menuImage);
            this.menu.setAsOnTheFlyMenu(menuItemCallback);
            let menuElement = this.menu.getElement();
            //update the style of the menu element
            menuElement.style.verticalAlign = "middle";
            this.element.appendChild(menuElement);
        }
        
        this.childContainer = null;
        this.childEntries = [];
        this.parent = null;
        this.sortFunction = null;
        this.extraSortParam = null;
        
        //set the non-empty state for in case we get children
        //but for now it will be empty
        this.nonEmptyState = TreeEntry.DEFAULT_STATE;
        this.setState(TreeEntry.NO_CONTROL);
    }

    /** The outer DOM element */
    getElement() {
        return this.element;
    }

    /** This sets a sort function for the children of the node. If none is set the
     * children will be sorted by the order they are added. */
    setSortFunction(sortFunction) {
        this.sortFunction = sortFunction;
    }

    /** The label for the entry. */
    setLabel(labelText) {
        this.labelText = labelText;
        this.label.innerHTML = labelText;
        if(this.parent) {
            this.parent._notifyNameChange(this);
        }
    }

    /** The label for the entry. */
    getLabel() {
        return this.labelText;
    }

    /** This allows for specified ordering of the chidlren. */
    setExtraSortParam(value) {
        this.extraSortParam = value;
    }

    /** This allows for specified ordering of the chidlren. */
    getExtraSortParam() {
        return this.extraSortParam;
    }

    addChild(childTreeEntry) {
        this.childEntries.push(childTreeEntry);
        this._insertChildIntoList(childTreeEntry);
        childTreeEntry._setParent(this);
    }

    removeChild(childTreeEntry) {
        if(this.childContainer) {
            var index = this.childEntries.indexOf(childTreeEntry);
            if(index >= 0) {
                this.childEntries.splice(index,1);
                this._removeChildFromList(childTreeEntry);
                childTreeEntry._setParent(null);
            }
        }
    }

    getState() {
        return this.state;
    }

    setState(state) {
        //if we have no children, always make the state no control
        //but we will store the state below for latert
        if((!this.childContainer)||(this.childContainer.length == 0)) {
            this.state = TreeEntry.NO_CONTROL;
        }
        else {
            this.state = state;
        }
        
        //save this as the non-empty state if it is not no control
        if(state != TreeEntry.NO_CONTROL) {
            this.nonEmptyState = state;
        }
        
        //configure the state
        if(this.state == TreeEntry.NO_CONTROL) {
            if(this.isRoot) {
                this.control.src = this.emptyControlUrl;
            }
            else {
                this.control.src = this.noControlUrl;
            }
            this.control.classList.remove("visiui-tc-control_interactive");
        }
        else if(this.state == TreeEntry.EXPANDED) {
            this.control.src = this.contractUrl;
            
            if(!this.collapse) {
                this.collapse = () => {
                    this.setState(TreeEntry.COLLAPSED);
                }
            }
            
            this.control.onclick = this.collapse
            this.childContainer.style.display = "";
            this.control.classList.add("visiui-tc-control_interactive");
        }
        else if(this.state == TreeEntry.COLLAPSED) {
            this.control.src = this.expandUrl;
            
            if(!this.expand) {
                this.expand = () => {
                    this.setState(TreeEntry.EXPANDED);
                }
            }
            
            this.control.onclick = this.expand;
            this.childContainer.style.display = "none";
            this.control.classList.add("visiui-tc-control_interactive");
        }
    }

    /** This sets the given element as the icon overlay. If null or other [false} is passed
     * this will just clear the icon overlay. */
    setIconOverlay(element) {
        this.clearIconOverlay();
        if(element) {
            this.iconOverlayElement.appendChild(element);
        }
    }

    clearIconOverlay() {
        uiutil.removeAllChildren(this.iconOverlayElement);
    }

    setBannerState(bannerState) {
        var iconOverlay = getIconOverlay(bannerState);
        if(iconOverlay) {
            this.setIconOverlay(iconOverlay);
        }
        else {
            this.clearIconOverlay();
        }
    }

    //=====================================
    // Private
    //=====================================

    /** I want to make sure people don't do this themselves. It is done in add/remove child. 
     * @private */
    _setParent(parent) {
        this.parent = parent;
    }

    /** I want to make sure people don't do this themselves. It is done in add/remove child. 
     * @private */
    _insertChildIntoList(childEntry) {
        if(!this.childContainer) {
            //add the child list if it does not exist
            this.childContainer = uiutil.createElementWithClass("ul","visiui-tc-child-list",this.element); 
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
    _removeChildFromList(childEntry) {
        this.childContainer.removeChild(childEntry.getElement());
        
        //remove the child list if there are no children
        if(this.childContainer.childElementCount === 0) {
            this.element.removeChild(this.childContainer);
            this.childContainer = null;
            //set state to empty, but save our old setting
            this.nonEmtpyState = this.state;
            this.setState(TreeEntry.NO_CONTROL); 
        }
    }

    /** I want to make sure people don't do this themselves. It is done in add/remove child. 
     * @private */
    _notifyNameChange(childEntry) {
        if(this.sortFunction) {
            this._updateChildElements();
        }
    }

    /** This sets the children elements in the sorted order 
     * @private */
    _updateChildElements() {
    var temp = this.childEntries.map( element => element);
    temp.sort(this.sortFunction);
    uiutil.removeAllChildren(this.childContainer);
    temp.forEach(child => this.childContainer.appendChild(child.getElement()));

    }    

}


TreeEntry.NO_CONTROL = 0;
TreeEntry.EXPANDED = 1;
TreeEntry.COLLAPSED = -1;

TreeEntry.DEFAULT_STATE = TreeEntry.EXPANDED;





