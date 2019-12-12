//this is a basic utilities library for apogee
//it exports a default shared object or the individual libraries
import util from "/apogeeutil/util.js";
import net from "/apogeeutil/net.js";

let apogee = {};
apogee.util = util;
apogee.net = net;

export {apogee as default};
export { util, net };
