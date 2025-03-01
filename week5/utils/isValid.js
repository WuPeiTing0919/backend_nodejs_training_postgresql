// 是否為 undefined 的型態
exports.isUndefined = function(value){
    return value === undefined;
}

// 是否可轉換為數字格式
exports.isparseInt = function(value){
    const num = Number(value);
    return isNaN(num); 
}

// 是否不為字串的防呆
exports.isNotValidSting = function(value){
    return typeof value !== "string" || value.trim().length === 0 || value === "";
}

// 是否不為數字(整數)的防呆
exports.isNotValidInteger = function(value){
    return typeof value !== "number" || value < 0 || value % 1 !== 0;
}

// 是否為英文數字格式
exports.isAlphanumeric = function(value){
    const regex = /^[a-zA-Z0-9]+$/;
    return !regex.test(value);
}

// 是否為英文數字和中文格式
exports.isAlphanumericChinese = function(value){
    const regex = /^[a-zA-Z0-9\u4e00-\u9fa5]+$/;
    return !regex.test(value);
}

// 是否為 email 格式
exports.isValidEmail = function(value){
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return !regex.test(value);
}

// 至少有一個英文字母 (大小寫皆可) 且至少有一個數字
exports.containsLetterAndNumber = function(str) {
    const hasLetter = /[a-zA-Z]/.test(str);
    const hasNumber = /\d/.test(str);
    return !(hasLetter && hasNumber);
}

// 文字長度是否符合範圍
exports.controlDigitalRange = function(value,min,max){
    return value.length < min || value.length > max;
}

// 是否為圖片格式
exports.isValidImageUrl = function(url){
    const regex = /^https:\/\/.*\.(png|jpg)$/i;
    return !regex.test(url);
}

// 是否為網址格式
exports.isInvalidURL = function(url){
    const regex = /^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/;
    return !regex.test(url);
}

// 是否格式符合 YYYY-MM-DD HH:MM:SS 或 YYYY/MM/DD HH:MM:SS
exports.isValidDate = function(dateTimeString) {
    const regex = /^\d{4}[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01])\s(0\d|1\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
    if (!regex.test(dateTimeString)) return true; //格式錯誤，回傳 true

    // 解析日期與時間
    const [datePart, timePart] = dateTimeString.split(" ");
    const [year, month, day] = datePart.split(/[-/]/).map(Number);
    const [hour, minute, second] = timePart.split(":").map(Number);

    // 檢查是否為有效日期
    const date = new Date(year, month - 1, day, hour, minute, second);

    return !(date.getFullYear() === year &&
             date.getMonth() + 1 === month &&
             date.getDate() === day &&
             date.getHours() === hour &&
             date.getMinutes() === minute &&
             date.getSeconds() === second);
}

// 日期比較是否正確
exports.isSDataEDataCompare = function(dateTime1, dateTime2) {
    return !(new Date(dateTime1.replace(" ", "T")) < new Date(dateTime2.replace(" ", "T")));
}