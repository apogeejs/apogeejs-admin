
function SplitFrame({leftContent, rightContent}) {
    const [leftWidth,setLeftWidth] = React.useState(200)
    const [resizeOn,setResizeOn] = React.useState(false)
    const [resizeX,setResizeX] = React.useState(0)

    function mouseDownHandler(event) {
        console.log()
        console.log(event)
        console.log(`mouse down: ${event.clientX} ${event.clientY}`)
        console.log(event.target.className)
        if(event.target.className == "splitFrame_divider") {
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
        <div className="splitFrame" onMouseDown={mouseDownHandler} onMouseMove={mouseMoveHandler} 
                                onMouseUp={mouseUpHandler} onMouseLeave={mouseLeaveHandler}>
            <div className="splitFrame_leftPanel" style={leftStyleProps}>
                {leftContent || 'adsf'}
            </div>
            <div className="splitFrame_divider">
            </div>
            <div className="splitFrame_rightPanel">
                {rightContent || 'asdfds'}
            </div>
        </div>
    )
}