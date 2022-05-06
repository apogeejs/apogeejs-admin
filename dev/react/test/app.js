///////////////////////////////////////////
//Application
///////////////////////////////////////////

const INVALID_ID = 0


///////////////////////////////////////////////
//UI
///////////////////////////////////////////////
function App({appObject}) {
    //Tab State
    //tab data = {text,contentElement,closeOkCallback}
    const [tabObjectIds,setTabObjectIds] = React.useState([])
    const [selectedTabId,setSelectedTabId] = React.useState(INVALID_TAB_ID)   //0 is invalid tab id

    function openTab(tabObject,isSelected = true) {
        //open if not already there
        if(tabObjectIds.find(existingTabObjectId => tabObject.getId() == existingTabObjectId) === undefined) {
            //notify open??? (probabl not necessary)
            setTabObjectIds(tabObjectIds.concat(tabObject.getId()))
        }
        //select if specified
        if(isSelected) selectTabId(tabObject.getId())
    }

    function selectTabId(tabObjectId) {
        //need notify show and hide!!!
        setSelectedTabId(tabObjectId)
    }

    function closeTab(tabObject) {
        if( tabObject.closeTabOk && !tabObject.closeTabOk() ) {
            //we need some action here presumably
            return
        }

        //notify close??? (I am not sure if this is the place for it)
        let newTabObjectIds = tabObjectIds.filter(existingTabObjectId => existingTabObjectId != tabObject.getId())
        if(tabObject.getId() == selectedTabId) {
            if(newTabObjectIds.length > 0) { //if we close the active tab, make the first tab active
                selectTabId(newTabObjectIds[0])
            }
            else {
                selectTabId(INVALID_ID)
            }
        }
        setTabObjectIds(newTabObjectIds)
    }

    return (
        <>
            <MenuBar appObject={appObject} />
            <SplitFrame
                leftContent={<TreeView treeObject={appObject} openTab={openTab}/>}
                rightContent={<TabView appObject={appObject} tabObjectIds={tabObjectIds} selectedTabId={selectedTabId} closeTab={closeTab} selectTabId={selectTabId}/>} 
            />
        </>
    )
}

function MenuBar({appObject}) {
    return (
        <div className="appMenuBar">
            {appObject.getMenuItems().map(menuItem => <SelectMenu key={menuItem.text} text={menuItem.text} items={menuItem.items}/>)}
        </div>
    )
}