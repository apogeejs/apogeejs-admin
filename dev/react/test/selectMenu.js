
/** Select Menu
 * notes - I should add a property for "displayElement" and then insert the text
 * or the image depending in which is present. (I should play around with spacing.
 * As is, it wasn't intended for both, but only because spacing is funny. It will work.)
 * Additional options for label (and other) style might be good too.
 */
 function SelectMenu({text, image, items}) {

    console.log("asdfas")

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
            {image ? 
                <img src={image} className="selectMenu_image"/> 
                : 
                text ? 
                    <div className="selectMenu_label">{text}</div> 
                    : 
                    ''
            }
            <select ref={selectRef} onChange={changeHandler} className="selectMenu_select" >
                {items.map(item => <option key={item.text} className="selectMenu_option">{item.text}</option>)}
            </select>
        </div>
    )
}