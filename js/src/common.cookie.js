/*!
 * @author common.cookie.js
 * @email comahead@vi-nyl.com
 * @create 2014-11-25
 * @license MIT License
 */
(function (ctx, $, core, undefined) {
    "use strict";

    core.addon('Cookie', {
        defaults: {
            // domain: location.host,
            path: '/'
        },

        /**
         * 쿠키를 설정
         *
         * @param {String} name 쿠키명
         * @param {String} value 쿠키값
         * @param {Date} (Optional) options.expires 만료시간
         * @param {String} (Optional) options.path 쿠키의 유효경로
         * @param {String} (Optional) options.domain 쿠키의 유효 도메인
         * @param {Boolean} (Optional) options.secure https에서만 쿠키 설정이 가능하도록 하는 속성
         */
        set: function (name, value, options) {
            options || (options = {});
            var curCookie = name + "=" + encodeURIComponent(value) +
                ((options.expires) ? "; expires=" + (options.expires instanceof Date ? options.expires.toGMTString() : options.expires) : "") +
                ((options.path) ? "; path=" + options.path : '') +
                ((options.domain) ? "; domain=" + options.domain : '') +
                ((options.secure) ? "; secure" : "");

            document.cookie = curCookie;
        },

        /**
         * 쿠키를 설정
         *
         * @param {String} name 쿠키명
         * @return  {String} 쿠키값
         */
        get: function (name) {
            var j, g, h, f;
            j = ";" + document.cookie.replace(/ /g, "") + ";";
            g = ";" + name + "=";
            h = j.indexOf(g);

            if (h !== -1) {
                h += g.length;
                f = j.indexOf(";", h);
                return decodeURIComponent(j.substr(h, f - h));
            }
            return "";
        },

        /**
         * 쿠키 삭제
         *
         * @param {String} name 쿠키명
         */
        remove: function (name) {
            document.cookie = name + "=;expires=Fri, 31 Dec 1987 23:59:59 GMT;";
        },

        /**
         * sep를 구분자로 하여 문자열로 조합하여 쿠키에 셋팅
         * @param {String} name 쿠키명
         * @param {String} val 값
         * @param {String} sep 구분자
         * @example
         * vinyl.cookie.addToArray('arr', 'a');
         * vinyl.cookie.addToArray('arr', 'b');  // arr:a|b
         */
        addToArray: function(name, val, sep) {
            sep = sep || '|';
            val = val + '';

            var value = this.get(name),
                values = value ? value.split(sep) : [];

            if(!core.array.include(values, val)) {
                values.push(val);
            }

            this.set.apply(this, [name, values.join(sep)].concat(arguments));
        },

        /**
         * name에 셋팅되어 있던 조합문자열에서 val를 제거
         * @param {String} name 쿠키명
         * @param {String} val 값
         * @param {String} sep
         * @example
         * vinyl.cookie.addToArray('arr', 'a');
         * vinyl.cookie.addToArray('arr', 'b');  // arr:a|b
         */
        removeToArray: function(name, val, sep) {
            sep = sep || '|';
            val = val + '';

            var value = this.get(name),
                values = value ? value.split(sep) : [];

            values = core.array.remove(values, val);

            this.set.apply(this, [name, values.join(sep)].concat(arguments));
        }
    });

})(window, jQuery, window[FRAMEWORK_NAME]);