// 是否為 undefined 的型態
exports.isUndefined = function(value){
    return value === undefined;
}

// 是否不為字串的防呆
exports.isNotValidSting = function(value){
    return typeof value !== "string" || value.trim().length === 0 || value === "";
}

// 是否不為數字(整數)的防呆
exports.isNotValidInteger = function(value){
    return typeof value !== "number" || value < 0 || value % 1 !== 0;
}

