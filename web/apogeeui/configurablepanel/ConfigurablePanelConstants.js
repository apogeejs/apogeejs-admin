let ConfigurablePanelConstants = {};
export {ConfigurablePanelConstants as default};

ConfigurablePanelConstants.STATE_NORMAL = "normal";
ConfigurablePanelConstants.STATE_DISABLED = "disabled";
ConfigurablePanelConstants.STATE_HIDDEN = "hidden";
ConfigurablePanelConstants.STATE_INACTIVE = "inactive";

ConfigurablePanelConstants.DEFAULT_SUBMIT_LABEL = "OK";
ConfigurablePanelConstants.DEFAULT_CANCEL_LABEL = "Cancel";

ConfigurablePanelConstants.SELECTOR_ACTION_NORMAL_INACTIVE = "normalInactive";
ConfigurablePanelConstants.SELECTOR_ACTION_NORMAL_HIDDEN = "normalHidden";
ConfigurablePanelConstants.SELECTOR_ACTION_NORMAL_DISABLE = "normalDisabled";
ConfigurablePanelConstants.SELECTOR_ACTION_VALUE = "value";

ConfigurablePanelConstants.DEFAULT_SELECTOR_ACTION = ConfigurablePanelConstants.SELECTOR_ACTION_NORMAL_INACTIVE; 

ConfigurablePanelConstants.SELECTOR_FALSE_STATE = {
    "normalInactive": ConfigurablePanelConstants.STATE_INACTIVE,
    "normalHidden": ConfigurablePanelConstants.STATE_HIDDEN,
    "normalDisabled": ConfigurablePanelConstants.STATE_DISABLED
}