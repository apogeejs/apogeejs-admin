//This is a single module that exports the public items from the apogee app namespace
export {default as Apogee} from "/apogeeapp/Apogee.js";
export {default as BaseFileAccess} from "/apogeeapp/BaseFileAccess.js";

export {default as Component} from "/apogeeapp/component/Component.js";

export {default as componentInfo} from "/apogeeapp/componentConfig.js";

//initialize the component and command and reference types.
import "/apogeeapp/commandConfig.js";
import "/apogeeapp/referenceConfig.js";
