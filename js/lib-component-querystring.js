var querystring = {};

/**
 * Module dependencies.
 */

var trim = function (str) {
    if (str.trim) return str.trim();
    return str.replace(/^\s*|\s*$/g, '');
};

var toString = Object.prototype.toString;
var type = function (val) {
    switch (toString.call(val)) {
        case '[object Date]':
            return 'date';
        case '[object RegExp]':
            return 'regexp';
        case '[object Arguments]':
            return 'arguments';
        case '[object Array]':
            return 'array';
        case '[object Error]':
            return 'error';
    }

    if (val === null) return 'null';
    if (val === undefined) return 'undefined';
    if (val !== val) return 'nan';
    if (val && val.nodeType === 1) return 'element';

    val = val.valueOf
        ? val.valueOf()
        : Object.prototype.valueOf.apply(val)

    return typeof val;
};


var pattern = /(\w+)\[(\d+)\]/

/**
 * Safely encode the given string
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

var encode = function (str) {
    try {
        return encodeURIComponent(str);
    } catch (e) {
        return str;
    }
};

/**
 * Safely decode the string
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

var decode = function (str) {
    try {
        return decodeURIComponent(str.replace(/\+/g, ' '));
    } catch (e) {
        return str;
    }
};

/**
 * Parse the given query `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

querystring.parse = function (str) {
    if ('string' != typeof str) return {};

    str = trim(str);
    if ('' == str) return {};
    if ('?' == str.charAt(0)) str = str.slice(1);

    var obj = {};
    var pairs = str.split('&');
    for (var i = 0; i < pairs.length; i++) {
        var parts = pairs[i].split('=');
        var key = decode(parts[0]);
        var m;

        if (m = pattern.exec(key)) {
            obj[m[1]] = obj[m[1]] || [];
            obj[m[1]][m[2]] = decode(parts[1]);
            continue;
        }

        obj[parts[0]] = null == parts[1]
            ? ''
            : decode(parts[1]);
    }

    return obj;
};

/**
 * Stringify the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api public
 */

querystring.stringify = function (obj) {
    if (!obj) return '';
    var pairs = [];

    for (var key in obj) {
        var value = obj[key];

        if ('array' == type(value)) {
            for (var i = 0; i < value.length; ++i) {
                pairs.push(encode(key + '[' + i + ']') + '=' + encode(value[i]));
            }
            continue;
        }

        pairs.push(encode(key) + '=' + encode(obj[key]));
    }

    return pairs.join('&');
};
