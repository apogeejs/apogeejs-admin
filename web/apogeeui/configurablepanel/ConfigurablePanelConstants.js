let ConfigurablePanelConstants = {};
export {ConfigurablePanelConstants as default};

ConfigurablePanelConstants.STATE_NORMAL = "normal";
ConfigurablePanelConstants.STATE_DISABLED = "disabled";
ConfigurablePanelConstants.STATE_HIDDEN = "hidden";
ConfigurablePanelConstants.STATE_INACTIVE = "inactive";

ConfigurablePanelConstants.DEFAULT_SUBMIT_LABEL = "OK";
ConfigurablePanelConstants.DEFAULT_CANCEL_LABEL = "Cancel";

ConfigurablePanelConstants.SELECTOR_ACTION_NORMAL_INACTIVE = "normalInactive"; //element is either active or inactive (meaning not showing and value not reported for form)
ConfigurablePanelConstants.SELECTOR_ACTION_NORMAL_HIDDEN = "normalHidden"; //element is either active or hidden(meaning not showing but value is reported for form)
ConfigurablePanelConstants.SELECTOR_ACTION_NORMAL_DISABLE = "normalDisabled"; //element is either active or disabled (meaning showing and value is reported, but element can not be set by user)
ConfigurablePanelConstants.SELECTOR_ACTION_VALUE = "value"; //element value is set to true or false depending on selector condition

ConfigurablePanelConstants.DEFAULT_SELECTOR_ACTION = ConfigurablePanelConstants.SELECTOR_ACTION_NORMAL_INACTIVE; 

ConfigurablePanelConstants.SELECTOR_FALSE_STATE = {
    "normalInactive": ConfigurablePanelConstants.STATE_INACTIVE,
    "normalHidden": ConfigurablePanelConstants.STATE_HIDDEN,
    "normalDisabled": ConfigurablePanelConstants.STATE_DISABLED
}