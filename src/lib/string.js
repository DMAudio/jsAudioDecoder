/*
 * @Author: Kitagawa.Kenta 
 * @Date: 2017-06-24 14:22:53 
 * @Last Modified by: Kitagawa.Kenta
 * @Last Modified time: 2017-06-26 13:59:31
 */
/**
 * 
 * 
 * @param {array} bytes 
 * @param {number} [encode=0] 
 * @returns 
 */
function int2Str(bytes, encode = 0) {
    if (encode === 0x01) {
        return trim(new TextDecoder('UTF-16').decode(bytes));
    } else if (encode === 0x02) {
        return trim(new TextDecoder('UTF-16BE').decode(bytes));
    } else if (encode === 0x03) {
        return trim(new TextDecoder('UTF-8').decode(bytes));
    } else {
        return trim(new TextDecoder('ISO-8859-1').decode(bytes));
    }
}
/**
 * 
 * 
 * @param {array} bytes 
 * @returns 
 */
function int2char(bytes) {
    let result = "";
    bytes.forEach(function (element) {
        result += pickBits(element, 4, 7).toString(16);
        result += pickBits(element, 0, 3).toString(16);
    }, this);
    return result;
}
/**
 * 
 * 
 * @param {string} str 
 * @returns 
 */
function trim (str) {
    str = str.replace(/(^(\s|\u00A0|\u0000)+)|((\s|\u00A0|\u0000)+$)/g, '');
    return str;
}