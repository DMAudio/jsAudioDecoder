/*
 * @Author: Kitagawa.Kenta 
 * @Date: 2017-06-24 14:22:53 
 * @Last Modified by: Kitagawa.Kenta
 * @Last Modified time: 2017-06-24 14:24:10
 */
/**
 * 
 * 
 * @param {any} bytes 
 * @param {number} [encode=0] 
 * @returns 
 */
function int2Str(bytes, encode = 0) {
    if (encode === 0x01) {
        itemContent = new TextDecoder('UTF-16').decode(bytes);
    } else if (encode === 0x02) {
        itemContent = new TextDecoder('UTF-16BE').decode(bytes);
    } else if (encode === 0x03) {
        itemContent = new TextDecoder('UTF-8').decode(bytes);
    } else {
        itemContent = new TextDecoder('ISO-8859-1').decode(bytes);
    }
    return trim(itemContent);
}
/**
 * 
 * 
 * @param {any} bytes 
 * @returns 
 */
function short2hex(bytes) {
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
 * @param {any} str 
 * @returns 
 */
function trim (str) {
    str = str.replace(/(^(\s|\u00A0|\u0000)+)|((\s|\u00A0|\u0000)+$)/g, '');
    for (var i = str.length - 1; i >= 0; i--) {
        if (/\S/.test(str.charAt(i))) {
            str = str.substring(0, i + 1);
            break;
        }
    }
    return str;
}