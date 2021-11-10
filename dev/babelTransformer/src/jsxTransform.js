//const babel = require("@babel/core");
const babel = require("@babel/standalone");

// const babelOptions = {
//     //bable primary
//     plugins: [
//         ["@babel/plugin-transform-react-jsx",{
//             throwIfNamespace: true,
//             runtime: "classic"
//         }]
//     ],
//     code: true,
//     ast: false,
//     targets: {
//         esmodules: true,
//         //node: current
//     },
// }

let development = false;

const plugins = [[development ? "transform-react-jsx-development" : "transform-react-jsx", {
    //importSource: importSource,
    //pragma: pragma,
    //pragmaFrag: pragmaFrag,
    //runtime: runtime,
    throwIfNamespace: true,
    //pure: pure,
    //useBuiltIns: !!opts.useBuiltIns,
    useSpread: true
  }]/*, transformReactDisplayName, pure !== false && transformReactPure*/]

const babelOptions = {
    //bable primary
    plugins: plugins,
    code: true,
    ast: false,
    targets: {
        esmodules: true,
        //node: current
    },
}


function transform(jsxBody) {
    //return babel.transformSync(jsxBody,babelOptions);
    return babel.transform(jsxBody,babelOptions);
}

module.exports = transform
