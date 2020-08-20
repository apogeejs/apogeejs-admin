//here we export the main object from the npm library as a global
import papaparse from "../lib/papaparse.min.js";

if(__globals__) {
    __globals__.__papaparse = papaparse;
}