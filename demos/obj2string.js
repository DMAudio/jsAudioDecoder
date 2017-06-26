/*
 * @Author: Kitagawa.Kenta 
 * @Date: 2017-06-24 14:23:41 
 * @Last Modified by: Kitagawa.Kenta
 * @Last Modified time: 2017-06-26 13:46:31
 */

/**
 * 
 * 
 * @param {any} object 
 * @param {number} indent_length 
 * @returns 
 */
function obj2string(object, indent_length) {
    if (typeof (indent_length) === "undefined" || indent_length == 0) {
        indent_length = 1;
    }
    var indent = new Array(indent_length * 4 + 1).join(" ");
    var indent_s = new Array((indent_length - 1) * 4 + 1).join(" ");

    if (object === null) {
        return 'null';
    }

    if (typeof object === "string") {
        return "\"" + object.replace(/([\'\"\\])/g, "\\$1").replace(/(\n)/g, "\\n").replace(/(\r)/g, "\\r").replace(/(\t)/g, "\\t") + "\"";
    }

    if (typeof object === "object") {
        var r = [];
        if (!object.sort) {
            for (var i in object) {
                r.push('"' + i + '"' + ": " + obj2string(object[i], indent_length + 1));
            }
            if (!!document.all && !/^\n?function\s*toString\(\)\s*\{\n?\s*\[native code\]\n?\s*\}\n?\s*$/.test(object.toString)) {
                r.push("toString:" + object.toString.toString());
            }
            if (r.length === 0) {
                r = "{}";
            } else {
                r = "{\n" + indent + r.join(",\n" + indent) + "\n" + indent_s + "}";
            }
        } else {
            for (var i_ = 0; i_ < object.length; i_++) {
                r.push(obj2string(object[i_], indent_length + 1));
            }
            if (r.length === 0) {
                r = "[]";
            } else {
                r = "[\n" + indent + r.join(",\n" + indent) + "\n" + indent_s + "]";
            }
        }
        return r;
    }
    return object.toString();
}