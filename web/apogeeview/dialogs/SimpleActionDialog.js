import {uiutil,dialogMgr} from "/apogeeui/apogeeUiLib.js";

/** This dialog has a title, message and a number of buttons and associated actions. 
 * Both the title and message are optional.
 * For the message, HTML is allowed, including things such as formatting and links.
 * A button is added for each item in the buttonTextList argument. The action for the
 * button is the associated value in the buttonActionList. If no action is specified, such
 * as if the buttonActionList is null, then there is no action aside from the dialog close.
*/
export function showSimpleActionDialog(title,msg,buttonTextList,buttonActionList) {

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
    if(title) {
        line = uiutil.createElement("div",{"className":"dialogLine"});
        line.appendChild(uiutil.createElement("div",{"className":"dialogTitle","innerHTML":title}));
        content.appendChild(line);
    }
  
    //msg - HTML should be allowed for the "message"
    if(msg) {
        line = uiutil.createElement("div",{"className":"dialogLine"});
        line.appendChild(uiutil.createElement("div",{"className":"dialogMessage","innerHTML":msg}));
        content.appendChild(line);
    }
    
    //buttons
    if((!buttonTextList)||(buttonTextList.length == 0)) {
        buttonTextList = ["OK"];
    }
    line = uiutil.createElement("div",{"className":"dialogLine"});
    for(let i = 0; i < buttonTextList.length; i++) {
        let buttonLabel = buttonTextList[i];
        let buttonAction = () => {
            //include the action if one is specified
            if((buttonActionList)&&(buttonActionList.length > i)&&(buttonActionList[i])) buttonActionList[i]();
            dialogMgr.closeDialog(dialog);
        }
        line.appendChild(uiutil.createElement("button",{"className":"dialogButton","innerHTML":buttonLabel,"onclick":buttonAction}));
        content.appendChild(line);
    }
    dialog.setContent(content,uiutil.SIZE_WINDOW_TO_CONTENT);  
    
    //show dialog
    dialogMgr.showDialog(dialog);
}



