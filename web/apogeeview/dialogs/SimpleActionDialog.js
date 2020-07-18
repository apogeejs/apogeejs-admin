import {uiutil,dialogMgr} from "/apogeeui/apogeeUiLib.js";

/** This dialog has a message and a number of buttons and associated actions. */
export function showSimpleActionDialog(msg,buttonTextList,buttonActionList) {

    var dialog = dialogMgr.createDialog({"movable":true});
    
    //add a scroll container
    var contentContainer = uiutil.createElement("div",null,
        {
			"display":"block",
            "position":"relative",
            "top":"0px",
            "height":"100%",
            "overflow": "auto"
        });
	dialog.setContent(contentContainer,uiutil.SIZE_WINDOW_TO_CONTENT);
    
	var content = uiutil.createElement("div",null,
			{
				"display":"table",
				"overflow":"hidden"
			});
	contentContainer.appendChild(content);
    
    var line;
  
    //title
    line = uiutil.createElement("div",{"className":"dialogLine"});
    line.appendChild(uiutil.createElement("div",{"className":"dialogTitle","innerHTML":msg}));
    content.appendChild(line);
    
    //buttons
    line = uiutil.createElement("div",{"className":"dialogLine"});
    for(let i = 0; i < buttonTextList.length; i++) {
        let buttonLabel = buttonTextList[i];
        let buttonAction = () => {
            buttonActionList[i]();
            dialogMgr.closeDialog(dialog);
        }
        line.appendChild(uiutil.createElement("button",{"className":"dialogButton","innerHTML":buttonLabel,"onclick":buttonAction}));
        content.appendChild(line);
    }
    dialog.setContent(content,uiutil.SIZE_WINDOW_TO_CONTENT);  
    
    //show dialog
    dialogMgr.showDialog(dialog);
    
    //size the dialog to the content
    dialog.fitToContent();
    dialog.centerInParent();
}



