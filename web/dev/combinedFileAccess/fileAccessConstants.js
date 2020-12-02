export const LOGIN_PENDING = "pending";
export const LOGGED_IN = "logged in";
export const LOGGED_OUT = "logged out";
export const FOLDER_TYPE = "__folder__";

export const STATE_INFO_LOGGED_OUT = {
    state: LOGGED_OUT
}

// const STATE_INFO_LOGGED_IN = {
//     state: fileAccessConstants.LOGGED_IN,
//     accountName: (LOGIN NAME GOES HERE)
// }

export const STATE_INFO_LOGIN_PENDING = {
    state: LOGIN_PENDING,
    message: "login pending"
}

export const STATE_INFO_LOGOUT_PENDING = {
    state: LOGIN_PENDING,
    message: "logout pending"
}

export const SAVE_ACTION = "save";

export const OPEN_ACTION = "open";

/** This will be used as the file info for the path when the data is not available. */
export const BROKEN_PATH_ENTRY = {};
