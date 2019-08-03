import util from "/apogeeutil/util.js";

/** This is a grid editor using hands on table*/
apogeeapp.app.HandsonGridEditor = class extends apogeeapp.app.DataDisplay {
    
    constructor(displayContainer,callbacks) {
        super(displayContainer,callbacks,apogeeapp.app.DataDisplay.NON_SCROLLING);

        //TBR initial sizing. now I just set it to a dummy number	
        this.gridDiv = apogeeapp.ui.createElement("div",null,{
            "position":"absolute",
            "top":"0px",
            "left":"0px",
            "width":"50px",
            "height":"50px",
            "overflow":"hidden",
            "zIndex":0
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

    }

//=============================
// "Package" Methods
//=============================

    getContent() {
        return this.gridDiv;
    }
    
    getContentType() {
        return apogeeapp.ui.RESIZABLE;
    }
    
    getData() {
        //update "input" data before calling update
        if(this.gridControl) this.inputData = util.jsonCopy(this.gridControl.getData());
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
        this.setSize();
    }

    setSize() {  
        if(this.gridDiv) {
            var gridDivParent = this.gridDiv.parentElement;
            if(gridDivParent) {
                this.gridDiv.style.width = gridDivParent.clientWidth + "px";
                this.gridDiv.style.height = gridDivParent.clientHeight + "px";
                if(this.gridControl) {
                    this.gridControl.render();
                }
            }
        }
    }

    destroy() {
        if(this.gridControl) {
            this.gridControl.destroy();
            this.gridControl = null;
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
                afterRemoveRow:this.delayGridEdited
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

        var editData = util.jsonCopy(this.inputData);
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
            this.gridDiv.style.backgroundColor = apogeeapp.app.EditWindowComponentDisplay.NO_EDIT_BACKGROUND_COLOR;
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

