/*!
 * @author 김승일
 * @email comahead@vi-nyl.com
 * @description 이마트 코어 라이브러리
 * @license MIT License
 */
(function (ctx, $, core, undefined) {
    "use strict";

    var each = core.each;

    /**
     * 문자열 관련 유틸 함수 모음
     *
     * @namespace
     * @name vinyl.string
     */
    core.addon('string', function () {
        var escapeChars = {
                '&': '&amp;',
                '>': '&gt;',
                '<': '&lt;',
                '"': '&quot;',
                "'": '&#39;'
            },
            unescapeChars = (function (escapeChars) {
                var results = {};
                each(escapeChars, function (v, k) {
                    results[v] = k;
                });
                return results;
            })(escapeChars),
            escapeRegexp = /[&><'"]/g,
            unescapeRegexp = /(&amp;|&gt;|&lt;|&quot;|&#39;|&#[0-9]{1,5};)/g,
            tagRegexp = /<\/?[^>]+>/gi,
            scriptRegexp = /<script[^>]*>([\\S\\s]*?)<\/script>/img;

        return /** @lends vinyl.string */{
            trim: function(value) {
                return value ? value.replace(/^\s+|\s+$/g, "") : value;
            },
            /**
             * 정규식이나 검색문자열을 사용하여 문자열에서 텍스트를 교체
             *
             * @param {String} value 교체를 수행할 문자열
             * @param {RegExp|String} find 검색할 문자열이나 정규식 패턴
             * @param {String} rep 대체할 문자열
             * @return {String} 대체된 결과 문자열
             *
             * @example
             * vinyl.replaceAll("a1b2c3d", /[0-9]/g, ''); => "abcd"
             */
            replaceAll: function (value, find, rep) {
                if (find.constructor === RegExp) {
                    return value.replace(new RegExp(find.toString().replace(/^\/|\/$/gi, ""), "gi"), rep);
                }
                return value.split(find).join(rep);
            },

            /**
             * 주어진 문자열의 바이트길이 반환
             *
             * @param {String} value 길이를 계산할 문자열
             * @return {Number}
             *
             * @example
             * vinyl.byteLength("동해물과"); => 8
             */
            byteLength: function (value) {
                var l = 0;
                for (var i=0, len = value.length; i < len; i++) {
                    l += (value.charCodeAt(i) > 255) ? 2 : 1;
                }
                return l;
            },

            /**
             * 주어진 path에서 확장자를 추출
             * @param {String} fname path문자열
             * @return {String} 확장자
             */
            getFileExt: function(fname){
                fname || (fname = '');
                return fname.substr((~-fname.lastIndexOf(".") >>> 0) + 2);
            },

            /**
             * 주어진 문자열을 지정된 길이(바이트)만큼 자른 후, 꼬리글을 덧붙여 반환
             *
             * @param {String} value 문자열
             * @param {Number} length 잘라낼 길이
             * @param {String} truncation (Optional: '...') 꼬리글
             * @return {String} 결과 문자열
             *
             * @example
             * vinyl.string.cutByByte("동해물과", 3, "..."); => "동..."
             */
            cutByByte: function (value, length, truncation) {
                var str = value,
                    chars = this.charsByByte(value, length);

                truncation || (truncation = '');
                if (str.length > chars) {
                    return str.substring(0, chars) + truncation;
                }
                return str;
            },

            /**
             * 주어진 바이트길이에 해당하는 char index 반환
             *
             * @param {String} value 문자열
             * @param {Number} length 제한 문자수
             * @return {Number} chars count
             */
            charsByByte: function (value, length) {
                var str = value,
                    l = 0, len = 0, i = 0;
                for (i=0, len = str.length; i < len; i++) {
                    l += (str.charCodeAt(i) > 255) ? 2 : 1;
                    if (l > length) { return i; }
                }
                return i;
            },

            /**
             * 첫글자를 대문자로 변환하고 이후의 문자들은 소문자로 변환
             *
             * @param {String} value 문자열
             * @return {String} 결과 문자열
             *
             * @example
             * vinyl.string.capitalize("abCdEfg"); => "Abcdefg"
             */
            capitalize: function (value) {
                return value ? value.charAt(0).toUpperCase() + value.substring(1) : value;
            },

            /**
             * 카멜 형식으로 변환
             *
             * @param {String} value 문자열
             * @return {String} 결과 문자열
             *
             * @example
             * vinyl.string.capitalize("ab-cd-efg"); => "abCdEfg"
             */
            camelize: function (value) {
                return value ? value.replace(/(\-|_|\s)+(.)?/g, function(a, b, c) {
                    return (c ? c.toUpperCase() : '');
                }) : value
            },

            /**
             * 대쉬 형식으로 변환
             *
             * @param {String} value 문자열
             * @return {String} 결과 문자열
             *
             * @example
             * vinyl.string.dasherize("abCdEfg"); => "ab-cd-efg"
             */
            dasherize: function (value) {
                return value ? value.replace(/[_\s]+/g, '-').replace(/([A-Z])/g, '-$1').replace(/-+/g, '-').toLowerCase() : value;
            },

            /**
             * 첫글자를 소문자로 변환하고 이후의 모든 문자를 소문자로 변환
             * @param {String} value
             * @returns {string}
             */
            toFirstLower: function (value) {
                return value ? value.replace(/^[A-Z]/, function(s) { return s.toLowerCase(); }) : value;
            },

            /**
             * 주어진 문자열을 지정한 수만큼 반복하여 조합
             *
             * @param {String} value 문자열
             * @param {Number} cnt 반복 횟수
             * @return {String} 결과 문자열
             *
             * @example
             * vinyl.string.repeat("ab", 4); => "abababab"
             */
            repeat: function (value, cnt, sep) {
                sep || (sep = '');
                var result = [];

                for (var i = 0; i < cnt; i++) {
                    result.push(value);
                }
                return result.join(sep);
            },

            /**
             * 특수기호를 HTML ENTITY로 변환
             *
             * @param {String} value 특수기호
             * @return {String} 결과 문자열
             *
             * @example
             * vinyl.string.escapeHTML('<div><a href="#">링크</a></div>'); => "&lt;div&gt;&lt;a href=&quot;#&quot;&gt;링크&lt;/a&gt;&lt;/div&gt;"
             */
            escapeHTML: function (value) {
                return value ? (value+"").replace(escapeRegexp, function (m) {
                    return escapeChars[m];
                }) : value;
            },

            /**
             * HTML ENTITY로 변환된 문자열을 원래 기호로 변환
             *
             * @param {String} value 문자열
             * @return {String} 결과 문자열
             *
             * @example
             * vinyl.string.unescapeHTML('&lt;div&gt;&lt;a href=&quot;#&quot;&gt;링크&lt;/a&gt;&lt;/div&gt;');  => '<div><a href="#">링크</a></div>'
             */
            unescapeHTML: function (value) {
                return value ? (value+"").replace(unescapeRegexp, function (m) {
                    return unescapeChars[m];
                }) : value;
            },

            /**
             * value === these이면 other를,  value !== these 이면 value를 반환
             *
             * @param {String} value 현재 상태값
             * @param {String} these 첫번째 상태값
             * @param {String} other 두번째 상태값
             * @return {String}
             *
             * @example
             * // 정렬버튼에 이용
             * vinyl.string.toggle('ASC", "ASC", "DESC"); => "DESC"
             * vinyl.string.toggle('DESC", "ASC", "DESC"); => "ASC"
             */
            toggle: function (value, these, other) {
                return these === value ? other : value;
            },

            /**
             * 주어진 문자열에 있는 {인덱스} 부분을 주어진 인수에 해당하는 값으로 치환 후 반환
             *
             * @param {String} format 문자열
             * @param {String} ... 대체할 문자열
             * @return {String} 결과 문자열
             *
             * @example
             * vinyl.string.format("{0}:{1}:{2} {0}", "a", "b", "c");  => "a:b:c a"
             */
            format: function (format, val) {
                var args = core.toArray(arguments).slice(1),
                    isJson = core.is(val, 'object');

                return format.replace(/\{([0-9a-z]+)\}/ig, function (m, i) {
                    return isJson ? val[i] : args[i] || '';
                });
            },

            /**
             * 형식문자열을 주어진 인자값으로 치환하여 반환
             * @function
             * @name vinyl.string.sprintf
             * @param {String} str 형식문자열(%d, %f, %s)
             * @param {Mixins} ... 형식문자열에 지정된 형식에 대치되는 값
             * @example
             * var ret = vinyl.string.sprintf('%2d %s', 2, 'abc'); // => '02 abc'
             */
            sprintf: (function() {
                var re = /%%|%(?:(\d+)[\$#])?([+-])?('.|0| )?(\d*)(?:\.(\d+))?([bcdfosuxXhH])/g;
                var pad = function (value, size, ch) {
                    var sign = value < 0 ? '-' : '',
                        result = String(Math.abs(value));

                    ch || (ch = "0");
                    size || (size = 2);

                    if(result.length >= size) {
                        return sign + result.slice(-size);
                    }

                    while (result.length < size) {
                        result = ch + result;
                    }
                    return sign + result;
                };

                // 형식문자열을 파싱
                var s = function() {
                    var args = [].slice.call(arguments, 1);
                    var val = arguments[0];
                    var index = 0;
                    var x;
                    var ins;

                    return val.replace(re, function () {
                        if (arguments[0] == "%%") {
                            return "%";
                        }

                        x = [];
                        for (var i = 0; i < arguments.length; i++) {
                            x[i] = arguments[i] || '';
                        }
                        x[3] = x[3].slice(-1) || ' ';

                        ins = args[+x[1] ? x[1] - 1 : index++];

                        return s[x[6]](ins, x);
                    });
                };

                // %d 처리
                s.d = s.u = function(ins, x){
                    return pad(Number(ins).toString(0x0A), x[2] + x[4], '0');
                };

                // %f 처리
                s.f = function(ins, x) {
                    var ins = Number(ins);

                    if (x[5]) {
                        ins = ins.toFixed(x[5]);
                    } else if (x[4]) {
                        ins = ins.toExponential(x[4]);
                    } else {
                        ins = ins.toExponential();
                    }

                    x[2] = x[2] == "-" ? "+" : "-";
                    return pad(ins, x[2] + x[4], x[3]);
                };

                // %s 처리
                s.s = function(ins, x) {
                    return ins;
                };

                return s;
            })(),

            /**
             * 주어진 문자열에서 HTML를 제거
             *
             * @param {String} value 문자열
             * @return {String}
             */
            stripTags: function (value) {
                return value.replace(tagRegexp, '');
            },

            /**
             * 주어진 문자열에서 스크립트를 제거
             *
             * @param {String} value 문자열
             * @return {String}
             */
            stripScripts: function (value) {
                return value.replace(scriptRegexp, '');
            }

        };
    });

})(window, jQuery, window[FRAMEWORK_NAME]);
