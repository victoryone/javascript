/*!
 * @author 김승일
 * @email comahead@vi-nyl.com
 * @description 이마트 코어 라이브러리
 * @license MIT License
 */
(function (ctx, $, core, undefined) {
    "use strict";

    /**
     * 숫자관련 유틸함수 모음
     *
     * @namespace
     * @name vinyl.number
     */
    core.addon('number', /** @lends vinyl.number */{
        /**
         * 주어진 수를 자릿수만큼 앞자리에 0을 채워서 반환
         *
         * @param {string} value
         * @param {number} size (Optional: 2)
         * @param {string} ch (Optional: '0')
         * @return {string}
         *
         * @example
         * vinyl.number.zeroPad(2, 3); => "002"
         */
        zeroPad: function (value, size, ch) {
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
        },

        /**
         * 세자리마다 ,를 삽입
         *
         * @param {number} value
         * @return {string}
         *
         * @example
         * vinyl.number.addComma(21342); => "21,342"
         */
        addComma: function (value) {
            value += '';
            var x = value.split('.'),
                x1 = x[0],
                x2 = x.length > 1 ? '.' + x[1] : '',
                re = /(\d+)(\d{3})/;

            while (re.test(x1)) {
                x1 = x1.replace(re, '$1' + ',' + '$2');
            }
            return x1 + x2;
        },

        /**
         * min ~ max사이의 랜덤값 반환
         *
         * @param {number} min 최소값
         * @param {number} max 최대값
         * @return {number} 랜덤값
         */
        random: function (min, max) {
            if (max === null) {
                max = min;
                min = 0;
            }
            return min + Math.floor(Math.random() * (max - min + 1));
        },

        /**
         * 상하한값을 반환. value가 min보다 작을 경우 min을, max보다 클 경우 max를 반환
         *
         * @param {number} value
         * @param {number} min 최소값
         * @param {number} max 최대값
         * @return {number}
         */
        limit: function (value, min, max) {
            if (value < min) { return min; }
            else if (value > max) { return max; }
            return value;
        }
    });
    /**
     * @function
     * @static
     * @name vinyl.number.pad
     */
    core.number.pad = core.number.zeroPad;

})(window, jQuery, window[LIB_NAME]);
