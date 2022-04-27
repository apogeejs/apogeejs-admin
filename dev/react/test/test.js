/////////////////
//???
//this is a function to get a locally unique integer for UI elements
const getLuid = () => {
    let luid = 0;
    return () => luid++
}
///////////////////////

function App() {
    return (
        <>
            <MenuBar />
            <MainBody />
        </>
    )
}

/** Select Menu
 * notes - I should add a property for "displayElement" and then insert the text
 * or the image depending in which is present. (I should play around with spacing.
 * As is, it wasn't intended for both, but only because spacing is funny. It will work.)
 * Additional options for label (and other) style might be good too.
 */
function SelectMenu({text, image, items}) {

    //grab a reference to clear the selection initially
    let selectRef = React.useRef();
    React.useEffect(() => {
        selectRef.current.selectedIndex = -1;
    },[])

    //on change do action and then reset selection to none
    function changeHandler(event) {
        let action = items[event.target.selectedIndex].action;
        event.target.selectedIndex = -1;
        action();
    }

    return (
        <div className="selectMenu_wrapper">
            {image ? <img src={image} className="selectMenu_image"/> : ''}
            {text ? <div className="selectMenu_label">{text}</div> : ''}
            <select className="selectMenu_select" ref={selectRef} onChange={changeHandler}>
                {items.map(item => <option key={item.text}>{item.text}</option>)}
            </select>
        </div>
    )
}
/////////////////////////////////////////////////////
const fileItems = [
    {text: "Open", action: () => alert("Open pressed")},
    {text: "Save", action: () => alert("Save pressed")},
    {text: "Save As", action: () => alert("Save As pressed")},
    {text: "Close", action: () => alert("Close pressed")},
]
const editItems = [
    {text: "Copy", action: () => alert("Copy pressed")},
    {text: "Cut", action: () => alert("Cut pressed")},
    {text: "Paste", action: () => alert("Paste pressed")},
]
const helpItems = [
    {text: "About", action: () => alert("About pressed")}
]
const threeDotsItems = [
    {text: "Edit Properties", action: () => alert("Edit Properties pressed")},
    {text: "Delete", action: () => alert("Delete pressed")},
]
//////////////////////////////////////////////////////

function MenuBar() {
    return (
        <div className="appMenuBar">
            <SelectMenu text="File" items={fileItems}/> 
            <SelectMenu text="Edit" items={editItems}/>
            <SelectMenu text="Help" items={helpItems}/> 
            <SelectMenu image="resources/menuDots16_gray.png" items={threeDotsItems}/>  
        </div>
    )
}

function MainBody() {
    const [leftWidth,setLeftWidth] = React.useState(200)
    const [resizeOn,setResizeOn] = React.useState(false)
    const [resizeX,setResizeX] = React.useState(0)

    function mouseDownHandler(event) {
        console.log()
        console.log(event)
        console.log(`mouse down: ${event.clientX} ${event.clientY}`)
        console.log(event.target.className)
        if(event.target.className == "divider") {
            console.log("resize on!")
            setResizeX(event.clientX)
            setResizeOn(true)
        }
    }
    function mouseMoveHandler(event) {
        console.log(`mouse move ${resizeX} ${event.clientX}`)
        if(resizeOn) {
            let deltaWidth = event.clientX - resizeX
            setResizeX(event.clientX)
            setLeftWidth(leftWidth + deltaWidth)
        }
    }
    function mouseUpHandler(event) {
        console.log("mouse up")
        if(resizeOn) {
            console.log("resize off!")
            setResizeOn(false)
        }
    }
    function mouseLeaveHandler(event) {
        console.log("mouse exit")
        if(resizeOn) {
            console.log("resize off!")
            setResizeOn(false)
        }
    }

    const leftStyleProps = {
        width: leftWidth + "px"
    }

    return (
        <div className="appBody" onMouseDown={mouseDownHandler} onMouseMove={mouseMoveHandler} 
                                onMouseUp={mouseUpHandler} onMouseLeave={mouseLeaveHandler}>
            <div className="leftPanel" style={leftStyleProps}>
                <ul>
                    <li>One</li>
                    <li>Two
                        <ul>
                            <li>Aa</li>
                            <li>Ba</li>
                            <li>Ca</li>
                        </ul>
                    </li>
                    <li>Three</li>
                    <li>Four</li>
                </ul>
            </div>
            <div className="divider">
            </div>
            <div className="rightPanel">
                frame view
            </div>
        </div>
    )
}