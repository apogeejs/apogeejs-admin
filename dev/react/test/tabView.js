
const INVALID_TAB_ID = 0

function TabView({frameManager}) {

    //need to set css
    //need to wire up actions!!!

    const [tabItems,setTabItems] = React.useState([]);
    const [selectedTabId,setSelectedTabId] = React.useState(INVALID_TAB_ID);  //0 is invalid tab id

    //tab data = {text,contentElement,closeOkCallback}
    function openTab(tabData,isSelected = true) {
        //open if not already there
        if(tabItems.find(tabItem => tabItem.tabId == tabData.tabId) === undefined) {
            //notify open??? (probabl not necessary)
            setTabItems(tabItems.concat(tabData))
        }
        //select if specified
        if(isSelected) selectTab(tabData.tabId)
    }

    function closeTab(tabId) {
        console.log("Closing tab: " + tabId)
        //notify close??? (I am not sure if this is the place for it)
        let newTabItems = tabItems.filter(tabItem => tabItem.tabId != tabId)
        if(tabId == selectedTabId) {
            if(newTabItems.length > 0) {
                selectTab(newTabItems[0].tabId)
            }
            else {
                selectTab(INVALID_TAB_ID)
            }
        }
        setTabItems(newTabItems)
    }

    function selectTab(tabId) {
        //need notify show and hide!!!
        setSelectedTabId(tabId) //I error checked before - but I checked the value too early. Maybe redo? or maybe not
    }

    frameManager.setTabFunctions(openTab,closeTab,selectTab);

    return (
        <div className="tabView">
            <div className="tabView_head">
                {tabItems.map(tabItem => TabTab({
                        tabId: tabItem.tabId,
                        text: tabItem.text, 
                        closeOkCallback: tabItem.closeOkCallback, 
                        doCloseFunction: closeTab,
                        selectTabFunction: selectTab
                    }))}
            </div>
            <div className="tabView_body">
                {tabItems.map(tabItem => TabFrame({
                    tabId: tabItem.tabId,
                    contentElement: tabItem.contentElement,
                    selected: tabItem.tabId == selectedTabId
                }))}
            </div>
        </div>
    )
}

function TabTab({tabId, text, closeOkCallback, doCloseFunction, selectTabFunction}) {
    function closeClicked() {
        if(closeOkCallback()) {
            doCloseFunction(tabId)
        }
        //here I want to prevent calling parent - is this right?
        return false;
    }

    function tabClicked() {
        selectTabFunction(tabId)
        //here I want to prevent calling parent - is this right?
        return false;
    }

    return (
        <div key={tabId} onClick={tabClicked} className="tabView_tab">
            <span>{text}</span>
            <img onClick={closeClicked} src="resources/close_gray.png"/>    
        </div>
    )
}

function TabFrame({tabId, contentElement, selected}) {
    return (
        <div key={tabId} style={{display: selected ? '' : "none"}} className="tabView_frame">{contentElement}</div>
    )
}