/*!
 * @author common.object.js
 * @email comahead@vi-nyl.com
 * @create 2014-11-25
 * @license MIT License
 */
(function (ctx, $, core, undefined) {
    "use strict";

    /**
     * JSON객체 관련 유틸함수
     * @namespace
     * @name vinyl.object
     */
    core.addon('object', /** @lends vinyl.object */{

        /**
         * 개체의 열거가능한 속성 및 메서드 이름을 배열로 반환
         * @name vinyl.object.keys
         * @param {Object} obj 리터럴 객체
         * @return {Array} 객체의 열거가능한 속성의 이름이 포함된 배열
         *
         * @example
         * vinyl.object.keys({"name": "Axl rose", "age": 50}); => ["name", "age"]
         */
        keys: Object.keys || function (obj) {
            var results = [];
            each(obj, function (v, k) {
                results.push(k);
            });
            return results;
        },

        /**
         * 개체의 열거가능한 속성의 값을 배열로 반환
         * @function
         * @name vinyl.object.values
         * @param {Object} obj 리터럴 객체
         * @return {Array} 객체의 열거가능한 속성의 값들이 포함된 배열
         *
         * @example
         * vinyl.object.values({"name": "Axl rose", "age": 50}); => ["Axl rose", 50]
         */
        values: Object.values || function (obj) {
            var results = [];
            each(obj, function (v) {
                results.push(v);
            });
            return results;
        },

        /**
         * 콜백함수로 바탕으로 각 요소를 가공하는 함수
         *
         * @param {JSON} obj 배열
         * @param {Function} cb 콜백함수
         * @return {JSON}
         *
         * @example
         * vinyl.object.map({1; 'one', 2: 'two', 3: 'three'}, function(item, key) {
		 *		return item + '__';
		 * });
         * => {1: 'one__', 2: 'two__', 3: 'three__'}
         */
        map: function(obj, cb) {
            if (!core.is(obj, 'object') || !core.is(cb, 'function')) { return obj; }
            var results = {};
            each(obj, function(v, k) {
                results[k] = cb(obj[k], k, obj);
            });
            return results;
        },

        /**
         * 요소가 있는 json객체인지 체크
         *
         *
         * @param {Object} obj json객체
         * @return {Boolean} 요소가 하나라도 있는지 여부
         */
        hasItems: function (obj) {
            if (!core.is(obj, 'object')) {
                return false;
            }

            var has = false;
            each(obj, function(v) {
                return has = true, false;
            });
            return has;
        },


        /**
         * 객체를 쿼리스크링으로 변환
         *
         * @param {Object} obj 문자열
         * @param {Boolean} isEncode (Optional) URL 인코딩할지 여부
         * @return {String} 결과 문자열
         *
         * @example
         * vinyl.object.toQueryString({"a":1, "b": 2, "c": {"d": 4}}); => "a=1&b=2&c[d]=4"
         */
        toQueryString: function (params, isEncode) {
            if (typeof params === 'string') {
                return params;
            }
            var queryString = '',
                encode = isEncode === false ? function (v) {
                    return v;
                } : encodeURIComponent;

            each(params, function (value, key) {
                if (typeof (value) === 'object') {
                    each(value, function (innerValue, innerKey) {
                        if (queryString !== '') {
                            queryString += '&';
                        }
                        queryString += encode(key) + '[' + encode(innerKey) + ']=' + encode(innerValue);
                    });
                } else if (typeof (value) !== 'undefined') {
                    if (queryString !== '') {
                        queryString += '&';
                    }
                    queryString += encode(key) + '=' + encode(value);
                }
            });
            return queryString;
        },

        /**
         * 주어진 배열를 키와 요소를 맞바꿔주는 함수
         *
         * @param {Array} obj 배열
         * @return {Object}
         *
         * @example
         * vinyl.object.travere({1:a, 2:b, 3:c, 4:d]);
		 * => {a:1, b:2, c:3, d:4}
		 */
        traverse: function (obj) {
            var result = {};
            each(obj, function (item, index) {
                result[item] = index;
            });
            return result;
        },

        /**
         * 주어진 리터럴에서 key에 해당하는 요소를 삭제
         *
         * @param {Object} value 리터럴
         * @param {Object} key 삭제할 키
         * @return 지정한 요소가 삭제된 리터럴
         */
        remove: function (value, key) {
            if (!core.is(value, 'object')) { return value; }
            value[key] = null;
            delete value[key];
            return value;
        },

        /**
         * json를 문자열로 변환
         * @param {JSON} val json 객체
         * @param {Boolean} opts.singleQuotes (Optional) 문자열을 '로 감쌀것인가
         * @param {String} opts.indent (Optional)  들여쓰기 문자(\t or 스페이스)
         * @param {String} opts.nr (Optional) 줄바꿈 문자(\n or 스페이스)
         * @param {Boolean} (Optional) pad 기호와 문자간의 간격
         * @return {String}
         */
        stringify: function (val, opts, pad) {
            var cache = [];

            return (function stringify(val, opts, pad) {
                var objKeys;
                opts = $.extend({}, {
                    singleQuotes: false,
                    indent: '', // '\t'
                    nr: '' // '\n'
                }, opts);
                pad = pad || '';

                if (typeof val === 'number' ||
                    typeof val === 'boolean' ||
                    val === null ||
                    val === undefined) {
                    return val;
                }

                if(typeof val === 'string') {
                    return '"' + val +'"';
                }

                if (val instanceof Date) {
                    return "new Date('" + val.toISOString() + "')";
                }

                if ($.isArray(val)) {
                    if (core.isEmpty(val)) {
                        return '[]';
                    }

                    return '[' + opts.nr + core.array.map(val, function (el, i) {
                            var eol = val.length - 1 === i ? opts.nr : ', '+opts.nr;
                            return pad + opts.indent + stringify(el, opts, pad + opts.indent) + eol;
                        }).join('') + pad + ']';
                }

                if (core.isPlainObject(val)) {
                    if (core.array.indexOf(cache, val) !== -1) {
                        return null;
                    }

                    if (core.isEmpty(val)) {
                        return '{}';
                    }

                    cache.push(val);

                    objKeys = core.object.keys(val);

                    return '{'+opts.nr + core.array.map(objKeys, function (el, i) {
                            var eol = objKeys.length - 1 === i ? opts.nr : ', '+opts.nr;
                            var key = /^[^a-z_]|\W+/ig.test(el) && el[0] !== '$' ? stringify(el, opts) : el;
                            return pad + opts.indent + '"' + key + '": ' + stringify(val[el], opts, pad + opts.indent) + eol;
                        }).join('') + pad + '}';
                }

                if (opts.singleQuotes === false) {
                    return '"' + (val+'').replace(/"/g, '\\\"') + '"';
                } else {
                    return "'" + (val+'').replace(/'/g, "\\\'") + "'";
                }
            })(val, opts, pad);
        }
    });
    core.object.has = core.object.hasItems;
    core.json = core.object;


})(window, jQuery, window[FRAMEWORK_NAME]);