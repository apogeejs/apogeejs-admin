import apogeeutil from "/apogeeutil/apogeeUtilLib.js";
import DataDisplay from "/apogeeview/datadisplay/DataDisplay.js";
import DATA_DISPLAY_CONSTANTS from "/apogeeview/datadisplay/dataDisplayConstants.js";
import {uiutil} from "/apogeeui/apogeeUiLib.js";
import Handsontable from "/ext/handsontable/handsontable_6.2.0/handsontable.es.js";

/** This is a grid editor using hands on table*/
export default class HandsonGridEditor extends DataDisplay {
    
    constructor(displayContainer,dataSource) {
        super(displayContainer,dataSource);

        this.resizeHeightMode = DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME;
        this.savedPixelHeight = DEFAULT_PIXEL_HEIGHT;

        this.gridDiv = uiutil.createElement("div",null,{
            "width": "100%",
            "height":this.savedPixelHeight + "px",
            "overflow":"hidden",
        });

        this.inputData = null;
        this.activeEditOk = undefined;
        this.dataCached = false;

       //we have to make sure the element is loaded before initailizing for handsontable to work properly
       this.loaded = false;

        //grid edited function
        this.gridEdited = (args) => {
            //I am doing this because it tries to save on the initial creation
            //I am sure there is some other way to prevent this.
            if(!this.gridControl) return;
            
            this.save(arguments);
        }

        //on a paste, the event is fired for each row created. We delay it here to haev fewer updates of the rest of the sheet
        this.timerInProcess = false;
        var REFRESH_DELAY = 50;

        this.delayGridEdited = (args) => {

            //if there is no timer waiting, start a timer
            if(!this.timerInProcess) {
                this.timerInProcess = true;
                var callEditEvent = (args) => {
                    this.timerInProcess = false;
                    this.gridEdited(arguments);
                }
                setTimeout(callEditEvent,REFRESH_DELAY);
            }
        }

        //set variables for internal display view sizing
        this.setSupressContainerHorizontalScroll(true);
        this.setUseContainerHeightUi(true)

        //we will use a listener to see when the page is resized
        let app = this.displayContainer.getComponentView().getModelView().getApp();
        this.frameWidthListener = () => this.onFrameWidthResize();
        app.addListener("frameWidthResize",this.frameWidthListener);

    }

//=============================
// "Package" Methods
//=============================

    getContent() {
        return this.gridDiv;
    }
    
    getData() {
        //update "input" data before calling update
        if(this.gridControl) this.inputData = apogeeutil.jsonCopy(this.gridControl.getData());
        return this.inputData;
    }
    
    setData(json) {
        if(json == apogeeutil.INVALID_VALUE) {
            var errorMsg = "ERROR: Data value is not valid"
            json = [[errorMsg]];
        }

        if((this.inputData === json)&&(this.editOk)) return;
        
        //verify data is the proper format
        if(!this.dataIsValidFormat(json)) {
            var errorMsg = "ERROR: Data value is not an array of arrays"
            json = [[errorMsg]];
        }
//figure out how to handle this error
//I should detect an error if the first array is not as long as all other arrays - handsontable issue
	
        this.inputData = json;
        this.dataCached = true;

        if(this.loaded) {
            this.displayData();
        }
    }

    onLoad() {
        this.loaded = true;
        if(this.dataCached) {
            this.displayData();
        }
    }

    onUnload() {
        this.loaded = false;
    }

    onFrameWidthResize() {
        this.updateWidth();
    }

    destroy() {
        //tear down the grid control
        if(this.gridControl) {
            this.gridControl.destroy();
            this.gridControl = null;
        }
        //remove the frame width listener
        if(this.frameWidthListener) {
            let app = this.displayContainer.getComponentView().getModelView().getApp();
            app.removeListener("frameWidthResize",this.frameWidthListener);
            this.frameWidthListener = null;
        }
    }

    /** This updates the width to the current container width. */
    updateWidth() {
        if(this.gridControl) {
            this.gridControl.render();
        }
    }

    /** This updates the height to the specified pixel height. */
    updateHeight(pixelHeight) {
        if(this.gridControl) {
            this.gridControl.updateSettings({height: pixelHeight});
        }
        else {
            this.gridDiv.style.height = this.savedPixelHeight + "px";
        }
    }

    //---------------------------
    // UI State Management
    //---------------------------
    
    /** This method adds any data display state info to the view state json. 
     * By default there is none. Note that this modifies the json state of the view,
     * rather than providing a data object that will by added to it.. */
    addUiStateData(json) {
        if(this.savedPixelHeight) {
            json.height = this.savedPixelHeight;
        }
    }

    /** This method reads an data display state info from the view state json. */
    readUiStateData(json) {
        if(json.height) {
            let newPixelHeight = json.height;
            if(newPixelHeight >= MAX_PIXEL_HEIGHT) {
                this.resizeHeightMode = DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_MAX;
                newPixelHeight = MAX_PIXEL_HEIGHT;
            }
            else {
                this.resizeHeightMode = DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME;
                if(newPixelHeight < MIN_PIXEL_HEIGHT) {
                    newPixelHeight = MIN_PIXEL_HEIGHT;
                }
            }

            this.savedPixelHeight = newPixelHeight;
            this.updateHeight(newPixelHeight);
        }
    }

    //----------------------------
    // This is the View resize API
    // The display has controls for the user to resize the display. These use the 
    // following API to interact with the display
    //----------------------------

    /** This method gets the resize mode. Options:
     * - DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME;
     * - DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_MAX;
     */
    getResizeHeightMode() {
        return this.resizeHeightMode;
    }

    /** This method sets the resize mode. Options:
     * - DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME;
     * - DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_MAX;
     */
    setResizeHeightMode(resizeHeightMode) {
        let newPixelHeight;
        if(resizeHeightMode == DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME) {
            this.resizeHeightMode = DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME;
            newPixelHeight = this.savedPixelHeight;
        }
        else if(resizeHeightMode == DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_MAX) {
            this.resizeHeightMode = DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_MAX;
            newPixelHeight = MAX_PIXEL_HEIGHT;
        }
        else {
            //ignore unknown value
            return;
        }

        this.updateHeight(newPixelHeight);
    }

    /** This method adjusts the size when the resize mode is DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME. Options:
     * - DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MORE;
     * - DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_LESS;
    */
    adjustHeight(adjustment) {
        if(this.resizeHeightMode == DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME) {
            let newPixelHeight;
            if(adjustment == DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_LESS) {
                //decrease up to the min size
                newPixelHeight = this.savedPixelHeight - DELTA_PIXEL_HEIGHT;
                if(newPixelHeight < MIN_PIXEL_HEIGHT) newPixelHeight = MIN_PIXEL_HEIGHT;

            }
            else if(adjustment == DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MORE) {
                //decrease up to the min size
                newPixelHeight = this.savedPixelHeight + DELTA_PIXEL_HEIGHT;
                if(newPixelHeight > MAX_PIXEL_HEIGHT) newPixelHeight = MAX_PIXEL_HEIGHT;
            }
            else {
                //ignore an unknown command
                return;
            }
            
            this.savedPixelHeight = newPixelHeight;
            this.updateHeight(newPixelHeight);
        }
    }

    /** This method returns the possible resize options, for use in the mode DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MODE_SOME. Flags:
     * - DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_LESS = 1;
     * - DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MORE = 2;
     * - DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_NONE = 0;
     * These flags should be or'ed togethder to give the allowed options.
    */
    getHeightAdjustFlags() {
        let flags = DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_LESS | DATA_DISPLAY_CONSTANTS.RESIZE_HEIGHT_MORE;
        return flags;
    }

//==============================
// Private Methods
//==============================

    /** This method creates a new grid. 
     * @private */
    createNewGrid(initialData) {
        if(this.gridControl) {
            this.gridControl.destroy();
            this.gridControl = null;
        }

        var gridOptions; 
        if(this.editOk) {
            gridOptions = {
                data: initialData,
                rowHeaders: true,
                colHeaders: true,
                contextMenu: true,
                //edit callbacks - I am using a delay on the grid edited because the table fires too many updates - one for 
                //each row (soemthing like that I forget) on a big paste
                afterChange:this.delayGridEdited,
                afterCreateCol:this.delayGridEdited,
                afterCreateRow:this.delayGridEdited,
                afterRemoveCol:this.delayGridEdited,
                afterRemoveRow:this.delayGridEdited,
                width:"100%",
                height: this.savedPixelHeight + "px"

            }
            this.gridEditable = true;
        }
        else {
            gridOptions = {
                data: initialData,
                readOnly: true,
                rowHeaders: true,
                colHeaders: true,
                width:"100%",
                height: this.savedPixelHeight + "px"
            }
            this.gridEditable = false;
        }

        this.gridControl = new Handsontable(this.gridDiv,gridOptions); 

        this.updateWidth();
    }
    
    
    //we must be loaded before creating objects
    displayData() {

        //clear the cached data flag, if it is present
        this.dataCached = false;

        var editData = apogeeutil.jsonCopy(this.inputData);
        if(!editData) {
            editData = [[]];
        }

        if((!this.gridControl)||(this.activeEditOk !== this.editOk)) {
            this.createNewGrid(editData);
            this.activeEditOk = this.editOk;
        }
        else {
            this.gridControl.loadData(editData);
        }

        //set the background color
        if(this.editOk) {
            this.gridDiv.style.backgroundColor = "";
        }
        else {
            this.gridDiv.style.backgroundColor = DATA_DISPLAY_CONSTANTS.NO_EDIT_BACKGROUND_COLOR;
        }
    }
    
    //this merifies the data is an array of arrays
    dataIsValidFormat(json) {
        if(Array.isArray(json)) {
            return json.every(Array.isArray);
        }
        else {
            return false;
        }
    }

}

//configuration constants
let MAX_PIXEL_HEIGHT = 1000;
let DEFAULT_PIXEL_HEIGHT = 300;
let MIN_PIXEL_HEIGHT = 30;
let DELTA_PIXEL_HEIGHT = 20;

