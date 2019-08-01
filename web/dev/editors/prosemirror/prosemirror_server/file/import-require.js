__module_map__ = {};

function register(moduleName,module) {
    __module_map__[moduleName] = module;
}

function require(moduleName) {
    return __module_map__[moduleName];
}