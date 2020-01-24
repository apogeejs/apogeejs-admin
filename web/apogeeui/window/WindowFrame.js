import base from "/apogeeutil/base.js";
import EventManager from "/apogeeutil/EventManagerClass.js";
import Menu from "/apogeeui/menu/Menu.js";
import apogeeui from "/apogeeui/apogeeui.js";

/** This is a window frame component. IT is used the table window and the dialog.
 *
 * It can be minimized an maximized and dragged and resized with the mouse.  
 * 
 * options:
 * minimizable - allow content to be minimized. defaylt value: false
 * maximizable - allow content to be maximized. default value: false
 * closable - display a close button. defalt value: false
 * resizable- allow resizing window with mouse. default vlue: false
 * movable - allow moving window with mouse. default value : false
 *
 * @class 
 */
export default class WindowFrame extends EventManager {

    constructor(options) {

        super();
        
        //set the options
        if(!options) {
            options = {};
        }
        
        //variables
        this.windowParent = null;
        this.parentElement = null;
        this.options = options;

        this.windowState = (options.initialState !== undefined) ? options.initialState : apogeeui.WINDOW_STATE_NORMAL; //minimize, normal, maximize
        
        //set default size values
        this.posInfo = {};
        this.posInfo.x = 0;
        this.posInfo.y = 0;
        this.sizeInfo = {};
        this.sizeInfo.width = WindowFrame.DEFAULT_WINDOW_WIDTH;
        this.sizeInfo.height = WindowFrame.DEFAULT_WINDOW_HEIGHT;
        
        this.frame = null;
        this.titleCell = null;
        this.headerCell = null;
        this.bodyCell = null;
        
        this.content = null;
        
        this.windowDragActive = false;
        this.moveOffsetX = null;
        this.moveOffsetX = null;
        //handlers we place on the parent during a move
        this.moveOnMouseMove = null;
        this.moveOnMouseLeave = null;
        this.moveOnMouseUp = null;
        
        this.resizeEastActive = false;
        this.resizeWestActive = false;
        this.resizeNorthActive = false;
        this.resizeSouthActive = false;
        this.resizeOffsetWidth = null;
        this.resizeOffsetHeight = null;
        //hanlders we place on the parent during a resize
        this.resizeOnMouseUp = null;
        this.resizeOnMouseMove = null;
        this.resizeOnMouseLeave = null;
        
        //these should be set to soemthing more meeaningful, like the minimum sensible width of the title bar
        this.minWidth = 0;
        this.minHeight = 0;
        
        //initialize
        this.initUI();
        
        //add the handler to move the active window to the front
        var frontHandler = () => {
            this.windowParent.bringToFront(this);
        };
        var element = this.getElement();
        element.addEventListener("mousedown",frontHandler);
    }


    //====================================
    // Public Methods
    //====================================

    //---------------------------
    // WINDOW CONTAINER
    //---------------------------

    /** This method shows the window. */
    getTitle() {
        return this.title;
    }

    /** This method shows the window. */
    setTitle(title) {
        this.title = title;
        this.titleBarTitleElement.innerHTML = title;
    }

    /** This method shows the window. */
    createMenu(iconUrl) {
        if(!iconUrl) iconUrl = apogeeui.getResourcePath(apogeeui.MENU_IMAGE);
        this.menu = Menu.createMenuFromImage(iconUrl);
        this.titleBarMenuElement.appendChild(this.menu.getElement());
        //create the icon (menu) overlay
        this.iconOverlayElement = apogeeui.createElementWithClass("div","visiui_win_icon_overlay_style",this.titleBarMenuElement);
        
        return this.menu;
    }

    /** This method shows the window. */
    getMenu() {
        return this.menu;
    }

    /** This sets the given element as the icon overlay. If null or other [false} is passed
     * this will just clear the icon overlay. */
    setIconOverlay(element) {
        if(this.iconOverlayElement) {
            this.clearIconOverlay();
            if(element) {
                this.iconOverlayElement.appendChild(element);
            }
        }
    }

    clearIconOverlay() {
        if(this.iconOverlayElement) {
            apogeeui.removeAllChildren(this.iconOverlayElement);
        }
    }

    /** This sets the content for the window. If null (or otherwise false) is passed
     * the content will be set to empty.*/
    setHeaderContent(contentElement) {
        apogeeui.removeAllChildren(this.headerCell);
        if(contentElement) {
            this.headerCell.appendChild(contentElement);
        }
    }

    /** This sets the content for the window. The content type
     *  can be:
     *  apogeeui.RESIZABLE - content can be resized to fit window - scrolling, if necessary is managed within the content element.
     *  apogeeui.FIXED_SIZE - the content is fixed size. The window will decide how to display the complete object.
     *  apogeeui.SIZE_WINDOW_TO_CONTENT - this is not a content type but a input option for content FIXED_SIZE that shrinks the window to fit the content. */
    setContent(contentElement,elementType) {
        
        if(!this.contentContainer) {
            this.contentContainer = apogeeui.createElement("div");
            apogeeui.removeAllChildren(this.bodyCell);
            this.bodyCell.appendChild(this.contentContainer);
        }
        if(elementType == apogeeui.RESIZABLE) {
            this.contentContainer.className = "visiui_win_container_fixed";
        }
        else if(elementType == apogeeui.FIXED_SIZE) {
            this.contentContainer.className = "visiui_win_container_scrolling";
        }
        else if(elementType == apogeeui.SIZE_WINDOW_TO_CONTENT) {
            this.contentContainer.className = "visiui_win_container_fit_content";
        }
        else {
            throw new Error("Unknown content type: " + elementType);
        }
        
        apogeeui.removeAllChildren(this.contentContainer);
        this.contentContainer.appendChild(contentElement);
        
        this.content = contentElement;
    }

    /** This method removes the given element from the content display. If the element
     * is not in the content display, no action is taken. */
    safeRemoveContent(contentElement) {
        for(var i = 0; i < this.bodyCell.childNodes.length; i++) {
            var node = this.bodyCell.childNodes[i];
            if(node === contentElement) {
                this.bodyCell.removeChild(contentElement);
                this.content = null;
            }
        }
    }

    addTitleToolElement(element) {
        this.titleBarToolElement.appendChild(element);
    }

    removeTitleToolElement(element) {
        this.titleBarToolElement.removeChild(element);
    }




    //---------------------------
    // WINDOW CHILD
    //---------------------------

    /** This method returns the parent container for the window.*/
    getParent() {
        return this.windowParent;
    }

    /** This method returns true if the window is showing. */
    getIsShowing() {
        if(this.windowParent) {
            return this.windowParent.getIsShowing();
        }
        else {
            return false;
        }
    }

    /** This method closes the window. If the argument forceClose is not
     * set to true the "request_close" handler is called to check if
     * it is ok to close the window. */
    close(forceClose) {
        if(!this.windowParent) return;
        
        if(!forceClose) {
            //make a close request
            var requestResponse = this.callHandler(apogeeui.REQUEST_CLOSE,this);
            if(requestResponse == apogeeui.DENY_CLOSE) {
                //do not close the window
                return;
            }
        }

        this.windowParent.removeListener(apogeeui.SHOWN_EVENT, this.windowShownListener);
        this.windowParent.removeListener(apogeeui.HIDDEN_EVENT, this.windowHiddenListener);
        this.windowParent.removeWindow(this);
        this.windowParent = null;

        this.dispatchEvent(apogeeui.CLOSE_EVENT,this);
    }

    /** This method sets the position of the window frame in the parent. */
    setPosition(x,y) {
        //don't let window be placed at a negative coord. We can lose it.
        if(x < 0) x = 0;
        if(y < 0) y = 0;
        this.posInfo.x = x;
        this.posInfo.y = y;
        
        this.updateCoordinates();
    }

    /** This method sets the size of the window frame, including the title bar. */
    setSize(width,height) {
        this.sizeInfo.width = width;
        this.sizeInfo.height = height;
        
        this.updateCoordinates();
    }

    /** This method gets the location and size info for the window. */
    getPosInfo() {
        return this.posInfo;
    }

    /** This method gets the location and size info for the window. */
    setPosInfo(posInfo) {
        this.posInfo = posInfo;
        this.updateCoordinates();
    }

    /** This method gets the location and size info for the window. */
    getSizeInfo() {
        return this.sizeInfo;
    }

    /** This method gets the location and size info for the window. */
    setSizeInfo(sizeInfo) {
        this.sizeInfo = sizeInfo;
        this.updateCoordinates();
    }

    /** This method sets the location and size info for the window at the same time. */
    setCoordinateInfo(posInfo,sizeInfo) {
        this.posInfo = posInfo;
        this.sizeInfo = sizeInfo;
        this.updateCoordinates();
    }


    /** This method sets the size of the window, including the title bar and other decorations. */
    setZIndex(zIndex) {
        this.frame.style.zIndex = String(zIndex);
    }


    //---------------------------
    // GUI ELEMENT
    //---------------------------

    /** This method returns the main dom element for the window frame. */
    getElement() {
        return this.frame;
    }



    //----------------------------------------------------------------
    //object specific

    /** This method sets the size of the window to fit the content. */
    fitToContent() {
        this.sizeInfo.width = undefined;
        this.sizeInfo.height = undefined;
    }

    /** This method centers the window in its parent. it should only be called
     *after the window is shown. */
    centerInParent() {
        var coords = this.windowParent.getCenterOnPagePosition(this);
        this.setPosition(coords[0],coords[1]);
    }


    /** This method gets the location and size info for the window. */
    getWindowState() {
        return this.windowState;
    }

    /** This method sets the location and size info for the window. */
    setWindowState(windowState) {
        switch(windowState) {
            case apogeeui.WINDOW_STATE_NORMAL:
                this.restoreContent();
                break;
                
            case apogeeui.WINDOW_STATE_MINIMIZED:
                this.minimizeContent();
                break;
                
            case apogeeui.WINDOW_STATE_MAXIMIZED:
                this.maximizeContent();
                break;
                
            default:
                alert("Unknown window state: " + windowState);
                break;
        }
    }

    //================================
    // Internal
    //================================

    /** This method shows the window. This automatically called internally when the window is
     * added to the parent. */
    onAddedToParent(newWindowParent) {
        this.windowParent = newWindowParent;
        this.parentElement = newWindowParent.getOuterElement();
        
        //attach to listeners to forward show and hide events
        this.windowShownListener = (windowParent) => {
            this.dispatchEvent(apogeeui.SHOWN_EVENT,this);
        };
        this.windowParent.addListener(apogeeui.SHOWN_EVENT, this.windowShownListener);
        this.windowHiddenListener = (windowParent) => {
            this.dispatchEvent(apogeeui.HIDDEN_EVENT,this);
        };
        this.windowParent.addListener(apogeeui.HIDDEN_EVENT, this.windowHiddenListener);
        
        //do the show event if the parent is currently wshowing
        if(this.windowParent.getIsShowing()) {
            this.dispatchEvent(apogeeui.SHOWN_EVENT,this);
        }
        
        //we will redo this since the size of elements used in calculation may have been wrong
        if(this.sizeInfo.height !== undefined) {
            this.updateCoordinates();
        }
    }

    //====================================
    // Motion/Reseize Event Handlers and functions
    //====================================

    /** Mouse down handler for moving the window. */
    moveMouseDown(e) {
        //do not do move in maximized state
        if(this.windowState === apogeeui.WINDOW_STATE_MAXIMIZED) return;
        
        if(this.parentElement) {
            this.windowDragActive = true;
            this.moveOffsetX = e.clientX - this.frame.offsetLeft;
            this.moveOffsetY = e.clientY - this.frame.offsetTop;
            
            //add move events to the parent, since the mouse can leave this element during a move
            this.parentElement.addEventListener("mousemove",this.moveOnMouseMove);
            this.parentElement.addEventListener("mouseleave",this.moveOnMouseLeave);
            this.parentElement.addEventListener("mouseup",this.moveOnMouseUp);
            
            //move start event would go here
        }
    }

    /** Mouse m,ove handler for moving the window. */
    moveMouseMoveImpl(e) {
        if(!this.windowDragActive) return;
        var newX = e.clientX - this.moveOffsetX;
        if(newX < 0) newX = 0;
        var newY = e.clientY - this.moveOffsetY;
        if(newY < 0) newY = 0;
        this.posInfo.x = newX;
        this.posInfo.y = newY;
        this.updateCoordinates();
    }

    /** Mouse up handler for moving the window. */
    moveMouseUpImpl(e) {
        this.endMove();
    }

    /** Mouse leave handler for moving the window. */
    moveMouseLeaveImpl(e) {
        this.endMove();
    }

    /** Mouse down handler for resizing the window. */
    resizeMouseDownImpl(e,resizeFlags) {
        //do not do resize in maximized state
        if(this.windowState === apogeeui.WINDOW_STATE_MAXIMIZED) return;

        if(resizeFlags) {
            if(resizeFlags & WindowFrame.RESIZE_EAST) {
                this.resizeEastActive = true;
                this.resizeOffsetWidth = e.clientX - this.bodyCell.clientWidth;
            }
            else if(resizeFlags & WindowFrame.RESIZE_WEST) {
                this.resizeWestActive = true;
                this.resizeOffsetWidth = e.clientX + this.bodyCell.clientWidth;
                this.moveOffsetX = e.clientX - this.frame.offsetLeft;
            }
            if(resizeFlags & WindowFrame.RESIZE_SOUTH) {
                this.resizeSouthActive = true;
                this.resizeOffsetHeight = e.clientY - this.bodyCell.clientHeight;
            }
            else if(resizeFlags & WindowFrame.RESIZE_NORTH) {
                this.resizeNorthActive = true;
                this.resizeOffsetHeight = e.clientY + this.bodyCell.clientHeight;
                this.moveOffsetY = e.clientY - this.frame.offsetTop;
            }

            //add resize events to the parent, since the mouse can leave this element during a move
            this.parentElement.addEventListener("mouseup",this.resizeOnMouseUp);
            this.parentElement.addEventListener("mousemove",this.resizeOnMouseMove);
            this.parentElement.addEventListener("mouseleave",this.resizeOnMouseLeave);
        }
    }

    /** Mouse move handler for resizing the window. */
    resizeMouseMoveImpl(e) {
        var newHeight;
        var newWidth;
        var newX;
        var newY;
        var changeMade = false;
        
        if(this.resizeEastActive) {
            newWidth = e.clientX - this.resizeOffsetWidth;
            //if(newWidth < this.minWidth) return;
            this.sizeInfo.width = newWidth;
            changeMade = true;
        }
        else if(this.resizeWestActive) {
            newWidth = this.resizeOffsetWidth - e.clientX;
            //if(newWidth < this.minWidth) return;
            newX = e.clientX - this.moveOffsetX;
            if(newX < 0) newX = 0;
            this.sizeInfo.width = newWidth;
            this.posInfo.x = newX;
            changeMade = true;
        }
        if(this.resizeSouthActive) {
            newHeight = e.clientY - this.resizeOffsetHeight;
            //if(newHeight < this.minHeight) return;
            this.sizeInfo.height = newHeight;
            changeMade = true;
        }
        else if(this.resizeNorthActive) {
            newHeight = this.resizeOffsetHeight - e.clientY;
            //if(newHeight < this.minHeight) return;
            newY = e.clientY - this.moveOffsetY;
            if(newY < 0) newY = 0;
            this.sizeInfo.height = newHeight;
            this.posInfo.y = newY;
            changeMade = true;
        }
            
        if(changeMade) {
            //update coordinates
            this.updateCoordinates();
        }
    }

    /** Mouse up handler for resizing the window. */
    resizeMouseUpImpl(e) {
        this.endResize();
    }

    /** Mouse up handler for resizing the window. */
    resizeMouseLeaveImpl(e) {
        this.endResize();
    }


    /** This method ends a move action. 
     * @private */
    endMove(e) {
        this.windowDragActive = false;
        this.parentElement.removeEventListener("mousemove",this.moveOnMouseMove);
        this.parentElement.removeEventListener("mouseup",this.moveOnMouseUp);
        this.parentElement.removeEventListener("mouseleave",this.moveOnMouseLeave);
    }

    /** this method ends a resize action.
     * @private */
    endResize() {
        this.resizeEastActive = false;
        this.resizeWestActive = false;
        this.resizeSouthActive = false;
        this.resizeNorthActive = false;
        this.parentElement.removeEventListener("mouseup",this.resizeOnMouseUp);
        this.parentElement.removeEventListener("mousemove",this.resizeOnMouseMove);
        this.parentElement.removeEventListener("mouseleave",this.resizeOnMouseLeave);
    }

    //====================================
    //  Min/max Methods
    //====================================

    /** This is the minimize function for the window.*/
    minimizeContent() {
        
        //set body as hidden
        this.headerCell.style.display = "none";
        this.bodyCell.style.display = "none";
        
        var wasMinimized = (this.windowState === apogeeui.WINDOW_STATE_MINIMIZED);
    
        //set the window state
        this.windowState = apogeeui.WINDOW_STATE_MINIMIZED;
        this.updateCoordinates();
        this.setMinMaxButtons();
        
        //dispatch resize event
        if(!wasMinimized) { 
            this.dispatchEvent(apogeeui.WINDOW_STATE_CHANGED,this);
        }
    }

    /** This is the restore function for the window.*/
    restoreContent() {
        
        //set body as not hidden
        this.headerCell.style.display = "";
        this.bodyCell.style.display = "";
        
        var wasMinimized = (this.windowState === apogeeui.WINDOW_STATE_MINIMIZED);
        var wasMaximized = (this.windowState === apogeeui.WINDOW_STATE_MAXIMIZED);
        
        //set the window state
        this.windowState = apogeeui.WINDOW_STATE_NORMAL;
        this.updateCoordinates();
        this.setMinMaxButtons();
        
        if((wasMinimized)||(wasMaximized)) {
            this.dispatchEvent(apogeeui.WINDOW_STATE_CHANGED,this);
        }
    }

    /** This is the minimize function for the window.*/
    maximizeContent() {
        
        //set body as not hidden
        this.headerCell.style.display = "";
        this.bodyCell.style.display = "";
        
        var wasMaximized = (this.windowState === apogeeui.WINDOW_STATE_MAXIMIZED);
        
        //set the window state
        this.windowState = apogeeui.WINDOW_STATE_MAXIMIZED;
        this.updateCoordinates();
        this.setMinMaxButtons();
        
        if(!wasMaximized) {
            this.dispatchEvent(apogeeui.WINDOW_STATE_CHANGED,this);
        }
    }

    /** @private */
    updateCoordinates() {
        
        var initialBodyHeight = this.bodyCell.style.height;
        var initialBodyWidth = this.bodyCell.style.width;
        
        if(this.windowState === apogeeui.WINDOW_STATE_MAXIMIZED) {
            //apply the maximized coordinates size
            this.frame.style.left = "0px";
            this.frame.style.top = "0px";
            this.frame.style.height = "100%";
            this.frame.style.width = "100%";
            
            this.bodyCell.style.height = "100%";
            this.bodyCell.style.width = "100%";
        }
        else if(this.windowState === apogeeui.WINDOW_STATE_NORMAL) {
            //apply the normal size to the window
            this.frame.style.left = this.posInfo.x + "px";
            this.frame.style.top = this.posInfo.y + "px";
            this.frame.style.height = "";
            this.frame.style.width = "";
            
            if(this.sizeInfo.height !== undefined) {
                this.bodyCell.style.height = this.sizeInfo.height + "px";
            }
            else {
                this.bodyCell.style.height = "";
            }
            if(this.sizeInfo.width !== undefined) {
                this.bodyCell.style.width = this.sizeInfo.width + "px";
            }
            else {
                this.bodyCell.style.width = "";
            }
        }
        else if(this.windowState === apogeeui.WINDOW_STATE_MINIMIZED) {
            //apply the minimized size to the window
            this.frame.style.left = this.posInfo.x + "px";
            this.frame.style.top = this.posInfo.y + "px";
            this.frame.style.height = "";
            this.frame.style.width = "";
            
            this.bodyCell.style.height = "0px";
            this.bodyCell.style.width = "0px";
        }
        
        if((initialBodyHeight != this.bodyCell.style.height)||(initialBodyWidth != this.bodyCell.style.width)) {
            this.dispatchEvent(apogeeui.RESIZED_EVENT,this);
        }
    }

    //====================================
    // Initialization Methods
    //====================================

    /** @private */
    initUI() {
        
        var table;
        var row;
        var cell;
        
        table = document.createElement("table");
        table.className = "visiui_win_main";
        this.frame = table; 
        
        //top border
        row = document.createElement("tr");
        table.appendChild(row);
        cell = document.createElement("td");
        cell.className = "visiui_win_windowColorClass visiui_win_topLeft";
        this.addResizeHandlers(cell,WindowFrame.RESIZE_WEST | WindowFrame.RESIZE_NORTH);
        row.appendChild(cell);
        cell = document.createElement("td");
        cell.className = "visiui_win_windowColorClass visiui_win_top";
        this.addResizeHandlers(cell,WindowFrame.RESIZE_NORTH);  
        row.appendChild(cell);
        cell = document.createElement("td");
        cell.className = "visiui_win_windowColorClass visiui_win_topRight";
        this.addResizeHandlers(cell,WindowFrame.RESIZE_EAST | WindowFrame.RESIZE_NORTH);  
        row.appendChild(cell);
        
        //title bar
        row = document.createElement("tr");
        table.appendChild(row);
        cell = document.createElement("td");
        cell.className = "visiui_win_windowColorClass visiui_win_left";
        this.addResizeHandlers(cell,WindowFrame.RESIZE_WEST); 
        cell.rowSpan = 3;
        row.appendChild(cell);
        cell = document.createElement("td");
        cell.className = "visiui_win_windowColorClass";
        this.titleBarCell = cell;
        row.appendChild(cell);
        cell = document.createElement("td");
        cell.className = "visiui_win_windowColorClass visiui_win_right";
        this.addResizeHandlers(cell,WindowFrame.RESIZE_EAST); 
        cell.rowSpan = 3;
        row.appendChild(cell);
        
        //header
        row = document.createElement("tr");
        row.className = "visiui_win_headerRow";
        table.appendChild(row);
        cell = document.createElement("td");
        cell.className = "visiui_win_headerCell";
        this.headerCell = cell;
        row.appendChild(cell);
        
        //body
        row = document.createElement("tr");
        row.className = "visiui_win_bodyRow";
        table.appendChild(row);
        cell = document.createElement("td");
        cell.className = "visiui_win_bodyCell";
        this.bodyCell = cell;
        row.appendChild(cell);
        
        //bottom border
        row = document.createElement("tr");
        table.appendChild(row);
        cell = document.createElement("td");
        cell.className = "visiui_win_windowColorClass visiui_win_bottomLeft";
        this.addResizeHandlers(cell,WindowFrame.RESIZE_WEST | WindowFrame.RESIZE_SOUTH); 
        row.appendChild(cell);
        cell = document.createElement("td");
        cell.className = "visiui_win_windowColorClass visiui_win_bottom";
        this.addResizeHandlers(cell,WindowFrame.RESIZE_SOUTH);  
        row.appendChild(cell);
        cell = document.createElement("td");
        cell.className = "visiui_win_windowColorClass visiui_win_bottomRight";
        this.addResizeHandlers(cell,WindowFrame.RESIZE_EAST | WindowFrame.RESIZE_SOUTH);
        row.appendChild(cell);
    
        //create the title bar
        this.createTitleBar();
    }

    /** @private */
    addResizeHandlers(cell,flags) {
        //add handlers if the window is resizable
        if(this.options.resizable) {
            cell.onmousedown = (event) => {
                this.resizeMouseDownImpl(event,flags);
            }
            
            //these are not cel specific. they are used on all cells and on the parent container
            //during a move.
            if(!this.resizeOnMouseMove) {
                this.resizeOnMouseMove = (event) => {
                    this.resizeMouseMoveImpl(event);
                };
                this.resizeOnMouseUp = (event) => {
                    this.resizeMouseUpImpl(event);
                };
                this.resizeOnMouseLeave = (event) => {
                    this.resizeMouseLeaveImpl(event);
                };
            }
        }
    }

    /** @private */
    createTitleBar() {
        
        this.titleBarElement = apogeeui.createElementWithClass("div","visiui_win_titleBarClass",this.titleBarCell);

        //add elements
        this.titleBarLeftElements = apogeeui.createElementWithClass("div","visiui_win_left_style",this.titleBarElement);
        this.titleBarMenuElement = apogeeui.createElementWithClass("div","visiui_win_menu_style",this.titleBarLeftElements);
        this.titleBarTitleElement = apogeeui.createElementWithClass("div","visiui_win_title",this.titleBarLeftElements);
        
        this.titleBarRightElements = apogeeui.createElementWithClass("div","visiui_win_right_style",this.titleBarElement);
        this.titleBarToolElement = apogeeui.createElementWithClass("div","visiui_win_tool_style",this.titleBarRightElements);
        
        //add window commands ( we will hide the bottons that are not needed)
        //minimize button
        if(this.options.minimizable) {
            this.minimizeButton = apogeeui.createElementWithClass("img","visiui_win_cmd_button",this.titleBarRightElements);
            this.minimizeButton.src = apogeeui.getResourcePath(apogeeui.MINIMIZE_CMD_IMAGE);
            this.minimizeButton.onclick = () => {
                this.minimizeContent();
            }
        }
        
        //restore button - only if we cn minimize or maximize
        if(this.options.minimizable || this.options.maximizable) {	
            this.restoreButton = apogeeui.createElementWithClass("img","visiui_win_cmd_button",this.titleBarRightElements);
            this.restoreButton.src = apogeeui.getResourcePath(apogeeui.RESTORE_CMD_IMAGE);
            this.restoreButton.onclick = () => {
                this.restoreContent();
            }
        }
        
        //maximize button and logic
    //DISABLE MAXIMIZE - just don't show button for now
    //    if(this.options.maximizable) {
    //        this.maximizeButton = apogeeui.createElementWithClass("img","visiui_win_cmd_button",this.titleBarRightElements);
    //        this.maximizeButton.src = apogeeui.getResourcePath(apogeeui.MAXIMIZE_CMD_IMAGE);
    //        this.maximizeButton.onclick = () => {
    //            this.maximizeContent();
    //        }
    //    }
        
        //layout the window buttons
        this.windowState = apogeeui.WINDOW_STATE_NORMAL;
        this.setMinMaxButtons();
        
        //close button
        if(this.options.closable) {
            this.closeButton = apogeeui.createElementWithClass("img","visiui_win_cmd_button",this.titleBarRightElements);
            this.closeButton.src = apogeeui.getResourcePath(apogeeui.CLOSE_CMD_IMAGE);
            this.closeButton.onclick = () => {
                this.close();
            }
        }
        
        //add am empty title
        this.setTitle("");
        
        //mouse move and resize
        if(this.options.movable) {
            //add mouse handlers for moving the window 
            this.titleBarElement.onmousedown = (event) => {
                this.moveMouseDown(event);
            }

            //mouse window drag events we will place on the parent container - since the mouse drag 
            //may leave the window frame during the move
            this.moveOnMouseMove = (event) => {
                this.moveMouseMoveImpl(event);
            };
            this.moveOnMouseUp = (event) => {
                this.moveMouseUpImpl(event);
            }
            this.moveOnMouseLeave = (event) => {
                this.moveMouseLeaveImpl(event);
            }
        }
    }


    /** This method shows the min/max/restore buttons properly 
     * @private */
    setMinMaxButtons() {
        if(this.minimizeButton) {
            if(this.windowState == apogeeui.WINDOW_STATE_MINIMIZED) {
                this.minimizeButton.style.display = "none";
            }
            else {
                this.minimizeButton.style.display = "";
            }
        }
        if(this.restoreButton) {
            if(this.windowState == apogeeui.WINDOW_STATE_NORMAL) {
                this.restoreButton.style.display = "none";
            }
            else {
                this.restoreButton.style.display = "";
            }
        }
        if(this.maximizeButton) {
            if(this.windowState == apogeeui.WINDOW_STATE_MAXIMIZED) {
                this.maximizeButton.style.display = "none";
            }
            else {
                this.maximizeButton.style.display = "";
            }
        }
    }

}

WindowFrame.RESIZE_LOCATION_SIZE = 10;

//constants for resizing
WindowFrame.RESIZE_TOLERANCE = 5;
WindowFrame.RESIZE_EAST = 1;
WindowFrame.RESIZE_WEST = 2;
WindowFrame.RESIZE_SOUTH = 4;
WindowFrame.RESIZE_NORTH = 8;
WindowFrame.RESIZE_NE = WindowFrame.RESIZE_NORTH + WindowFrame.RESIZE_EAST;
WindowFrame.RESIZE_NW = WindowFrame.RESIZE_NORTH + WindowFrame.RESIZE_WEST;
WindowFrame.RESIZE_SE = WindowFrame.RESIZE_SOUTH + WindowFrame.RESIZE_EAST;
WindowFrame.RESIZE_SW = WindowFrame.RESIZE_SOUTH + WindowFrame.RESIZE_WEST;

/** size must be speicifed for the window. If not these values are used. */
WindowFrame.DEFAULT_WINDOW_HEIGHT = 300;
WindowFrame.DEFAULT_WINDOW_WIDTH = 300;
