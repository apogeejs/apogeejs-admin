import _ from 'lodash';
import './style.css';
import Icon from './icon.png';
import {myTestFunction} from './test-module.js';
const myOtherTestFunction = require('./test_npm_module.js');

function component() {
    const element = document.createElement('div');
  
    // Lodash, currently included via a script, is required for this line to work
    element.innerHTML = _.join(['Hello', 'webpack'], ' ');
    //set the style, which will include above
    element.classList.add('hello');

    //add an image
    const myIcon = new Image();
    myIcon.src = Icon;
    element.appendChild(myIcon);
  
    return element;
}
  
document.body.appendChild(component());
document.body.appendChild(document.createTextNode(myTestFunction(4)));
document.body.appendChild(document.createElement("br"));
;document.body.appendChild(document.createTextNode(myOtherTestFunction(4)));