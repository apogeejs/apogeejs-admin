import apogeeutil from "/apogeejs-util-lib/src/apogeeUtilLib.js";
import * as apogeeui from "/apogeejs-ui-lib/src/apogeeUiLib.js";

//expose these apogee libraries globally so plugins can use them 
__globals__._ = apogeeutil._;
__globals__.apogeeutil = apogeeutil;

//some user message utilities
__globals__.apogeeUserAlert = (msg) => apogeeui.showSimpleActionDialog(msg,null,["OK"]);
__globals__.apogeeUserConfirm = (msg,okText,cancelText,okAction,cancelAction,defaultToOk) => apogeeui.showSimpleActionDialog(msg,null,[okText,cancelText],[okAction,cancelAction]);
__globals__.apogeeUserConfirmSynchronous = (msg,okText,cancelText,defaultToOk) => confirm(msg);