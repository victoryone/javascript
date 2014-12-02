/*!
 * @author common.valid.js
 * @email comahead@vi-nyl.com
 * @create 2014-11-25
 * @license MIT License
 */
(function (ctx, $, core, undefined) {
    "use strict";


    /**
     * @namespace
     * @name vinyl.valid
     * @description 밸리데이션 함수 모음
     */
    core.addon('valid', function () {
        var trim = $.trim,
            isString = core.isString,
            isNumber = core.isNumber,
            isNumeric = core.isNumeric,
            isElement = core.isElement,
            inRange = function(v, s, e) {
                if(typeof v == 'undefined') { return false; }
                v = v | 0;
                if(v >= s && v <= e){ return true; }
                return false;
            };

        return /** @lends vinyl.valid */{
            empty: core.isEmpty,
            /**
             * 필수입력 체크
             *
             * @param {String} str
             * @return {Boolean} 빈값이면 false 반환
             */
            require: function (str) {
                isString(str) || (isElement(str) && (str = str.value));
                return !!str;
            },
            /**
             * 유효한 이메일형식인지 체크
             *
             * @param {String} str
             * @return {Boolean}
             */
            email: function (str) {
                isString(str) || (isElement(str) && (str = str.value));
                return (str = trim(str)) ? (/\w+([-+.]\w+)*@\w+([-.]\w+)*\.[a-zA-Z]{2,4}$/).test(str) : false;
            },
            /**
             * 한글인지 체크
             *
             * @param {String} str
             * @return {Boolean}
             */
            kor: function (str) {
                isString(str) || (isElement(str) && (str = str.value));
                return (str = trim(str)) ? (/^[가-힝]+$/).test(str) : false;
            },
            /**
             * 영문 체크
             *
             * @param {String} str
             * @return {Boolean}
             */
            eng: function (str) {
                isString(str) || (isElement(str) && (str = str.value));
                return (str = trim(str)) ? (/^[a-zA-Z]+$/).test(str) : false;
            },
            /**
             * 숫자 체크(실제 숫자타입인가)
             *
             * @param {String} str
             * @return {Boolean}
             */
            rawNum: function (str) {
                isElement(str) && (str = str.value); // 엘리먼인 경우 .value에서 꺼내온다.
                return isNumber(str);
            },

            /**
             * 숫자 체크
             *
             * @param {String} str
             * @param {Boolean} allowSign (optional)  없으면 -, +기호를 허용안함, true이면 -, + 허용함
             * @return {Boolean}
             */
            num: function (str, allowSign) {
                isElement(str) && (str = str.value); // 엘리먼인 경우 .value에서 꺼내온다.
                str = trim(str);
                if(allowSign !== true && !/^[0-9]*$/g.test(str)) { return false; }
                return isNumeric(str);
            },

            /**
             * 유효한 url형식인지 체크
             *
             * @param {String} str
             * @return {Boolean}
             */
            url: function (str) {
                isString(str) || (isElement(str) && (str = str.value));
                return (str = trim(str)) ? (/^https?:\/\/([\w\-]+\.)+/).test(str) : false;
            },
            /**
             * 특수기호 유무 체크
             *
             * @param {String} str
             * @return {Boolean}
             */
            special: function (str) {
                isString(str) || (isElement(str) && (str = str.value));
                return (str = trim(str)) ? (/^[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]+$/).test(str) : false;
            },
            /**
             * 유효한 전화번호형식인지 체크
             *
             * @param {String} str
             * @return {Boolean}
             */
            phone: function (str) {
                isString(str) || (isElement(str) && (str = str.value));
                return (str = trim(str)) ? (/^\d{1,3}-\d{3,4}-\d{4}$/).test(str) : false;
            },

            allowFile: function(path, exts){
                if(!core.isArray(exts)){
                    exts = [exts];
                }
                var ext = core.string.getFileExt(path);
                if(!ext){ return false; }
                return core.array.include(exts, ext);
            },

            /**
             * 날짜가 유효한지 체크(20130212, 2013-12-12, 2013-12-12 23:12:12 모두 체크 가능)
             *
             *
             * @param {String} str
             * @return {Boolean}
             */
            date: function(str) {
                isString(str) || (isElement(str) && (str = str.value));
                if(!str){ return false; }
                var s ='',
                    m = str.match(/^(\d{4})[- ]*(\d{2})[- ]*(\d{2})[ ]*(\d{0,2})[:]*(\d{0,2})[:]*(\d{0,2})[:]*$/);
                if(!m || m.length < 4){ return false; }
                if(m.length > 4){
                    if(!inRange(m[4], 0, 23)) { return false; }
                    if(!inRange(m[5], 0, 59)) { return false; }
                    if(!inRange(m[6], 0, 59)) { return false; }
                }
                return core.date.isValid(m[1]+'-'+m[2]+'-'+m[3]);
            },
            /**
             * 유효한 yyyy-MM-dd형식인지 체크(삭제 예정)
             *
             * @deprecated
             * @param {String} str
             * @return {Boolean}
             */
            dateYMD: function (str) {
                isString(str) || (isElement(str) && (str = str.value));
                return (str = trim(str)) ? (/^\d{4}-\d{2}-\d{2}$/).test(str) : false;
            },
            /**
             * 유효한 yyyy-MM-dd hh:mm:ss형식인지 체크(삭제 예정)
             *
             * @deprecated
             * @param {String} str
             * @return {Boolean}
             */
            dateYMDHMS: function (str) {
                isString(str) || (isElement(str) && (str = str.value));
                return (str = trim(str)) ? (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/).test(str) : false;
            },
            /**
             * 유효한 주민번호인지 체크
             *
             * @param {String} strSsn1 앞주민번호.
             * @param {String} strSsn2 (Optional) 뒷주민번호. 값이 없으면 strSsn1만으로 체크
             * @return {Boolean}
             */
            SSN: function (sid1, sid2) {
                var num = sid1 + (sid2 ? sid2 : ""),
                    pattern = /^(\d{6})-?(\d{7})$/,
                    sum = 0,
                    last, mod,
                    bases = "234567892345";

                if (!pattern.test(num)) { return false; }
                num = RegExp.$1 + RegExp.$2;

                last = num.charCodeAt(12) - 0x30;

                for (var i = 0; i < 12; i++) {
                    if (isNaN(num.substring(i, i + 1))) { return false; }
                    sum += (num.charCodeAt(i) - 0x30) * (bases.charCodeAt(i) - 0x30);
                }
                mod = sum % 11;
                return ((11 - mod) % 10 === last) ? true : false;
            },
            /**
             * 유효한 외국인주민번호인지 체크
             *
             * @param {String} strSsn1 앞주민번호.
             * @param {String} strSsn2 (Optional) 뒷주민번호. 값이 없으면 strSsn1만으로 체크
             * @return {Boolean}
             */
            FgnSSN: function (sid1, sid2) {
                var num = sid1 + (sid2 ? sid2 : ""),
                    pattern = /^(\d{6})-?(\d{7})$/,
                    sum = 0,
                    odd, buf,
                    multipliers = "234567892345".split("");

                if (!pattern.test(num)) { return false; }
                num = RegExp.$1 + RegExp.$2;

                buf = core.toArray(num);
                odd = buf[7] * 10 + buf[8];

                if (odd % 2 !== 0) { return false; }

                if ((buf[11] !== 6) && (buf[11] !== 7) && (buf[11] !== 9)) { return false; }

                for (var i = 0; i < 12; i++) { sum += (buf[i] *= multipliers[i]); }

                sum = 11 - (sum % 11);
                if (sum >= 10) { sum -= 10; }

                sum += 2;
                if (sum >= 10) { sum -= 10; }

                if (sum !== buf[12]) { return false; }

                return true;
            },


            run: function(frm, validators) {
                var isValid = true;
                each(validators, function(v, k) {

                });
                return isValid;
            }
        };
    });

})(window, jQuery, window[FRAMEWORK_NAME]);