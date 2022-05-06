function IconWithStatus({treeObject}) {

    const iconImageSrc = treeObject.getIconUrl();
    
    const status = treeObject.getStatus();
    let statusImageSrc;
    switch(status) {
        case "normal":
            statusImageSrc = undefined
            break

        case "error":
            statusImageSrc = "resources/error.png"
            break

        case "pending":
            statusImageSrc = "resources/pending.png"
            break

        case "invalid":
            statusImageSrc = "resources/invalid.png"
            break

        default:
            //we should make something noticable here I think, rather than nothing
            statusImageSrc = undefined;
            brea
    }

    return (
        <div className="iconWithStatus_wrapper">
            <img src={iconImageSrc} className="iconWithStatus_icon"/>
            {statusImageSrc ? <img src={statusImageSrc} className="iconWithStatus_status"/> : ''}
        </div>
    )
}