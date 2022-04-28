///////////////////////////////////////////
//Application
///////////////////////////////////////////


///////////////////////////////////////////////
//UI
///////////////////////////////////////////////
function App() {
    return (
        <>
            <MenuBar />
            <SplitFrame leftContent={leftContent} rightContent={<TabView frameManager={frameManager}/>} />
        </>
    )
}

function MenuBar() {
    return (
        <div className="appMenuBar">
            <SelectMenu text={"File"} items={fileItems}/>
            <SelectMenu text="#1" items={number1Items}/>
            <SelectMenu text="#2" items={number2Items}/> 
            <SelectMenu image="resources/menuDots16_gray.png" items={threeDotsItems}/> 
        </div>
    )
}

const leftContent = (
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
)

const rightContent = "asdfas"