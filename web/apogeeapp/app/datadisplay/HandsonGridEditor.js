import apogeeutil from "/apogeeutil/apogeeUtilLib.js";

import DataDisplay from "/apogeeapp/app/datadisplay/DataDisplay.js";
import DATA_DISPLAY_CONSTANTS from "/apogeeapp/app/datadisplay/dataDisplayConstants.js";
import apogeeui from "/apogeeapp/ui/apogeeui.js";
import Handsontable from "/ext/handsontable/handsontable_6.2.0/handsontable.full.min_to_es6.js";

/** This is a grid editor using hands on table*/
export default class HandsonGridEditor extends DataDisplay {
    
    constructor(displayContainer,callbacks) {
        super(displayContainer,callbacks);

        this.gridDiv = apogeeui.createElement("div",null,{
            //"position":"relative",
            "width": "100%",
            "height":"300px",
            "overflow":"hidden",
            //"zIndex":0
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

        //we will use a listener to see when the page is resized
        let app = this.displayContainer.getComponent().getWorkspaceUI().getApp();
        this.frameWidthListener = () => this.onFrameWidthResize();
        app.addListener("frameWidthResize",this.frameWidthListener);

    }

//=============================
// "Package" Methods
//=============================

    getContent() {
        return this.gridDiv;
    }
    
    getContentType() {
        return apogeeui.RESIZABLE;
    }
    
    getData() {
        //update "input" data before calling update
        if(this.gridControl) this.inputData = apogeeutil.jsonCopy(this.gridControl.getData());
        return this.inputData;
    }
    
    setData(json) {
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

    onResize() {
        //dont use this for now
    }

    setSize() {  
        if((this.gridDiv)&(this.gridDiv.parent)) {
            this.gridDiv.style.width = this.gridDiv.parent.scrollWidth + "px";
            this.gridDiv.style.height = this.gridDiv.parent.scrollWidth + "px";
            if(this.gridControl) {
                this.gridControl.render();
            }
        }
    }

    onFrameWidthResize() {
        this.setSize();
    }

    destroy() {
        //tear down the grid control
        if(this.gridControl) {
            this.gridControl.destroy();
            this.gridControl = null;
        }
        //remove the frame width listener
        if(this.frameWidthListener) {
            let app = this.displayContainer.getComponent().getWorkspaceUI().getApp();
            app.removeListener("frameWidthResize",this.frameWidthListener);
            this.frameWidthListener = null;
        }
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
                colWidths: 250,
                rowHeights: 23
            }
            this.gridEditable = true;
        }
        else {
            gridOptions = {
                data: initialData,
                readOnly: true,
                rowHeaders: true,
                colHeaders: true,
            }
            this.gridEditable = false;
        }

        this.gridControl = new Handsontable(this.gridDiv,gridOptions); 

        this.setSize();
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

