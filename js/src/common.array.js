/*!
 * @author 김승일
 * @email comahead@vi-nyl.com
 * @description 이마트 코어 라이브러리
 * @license MIT License
 */
(function(ctx, $, core, undefined) {
    "use strict";

    var arrayProto = Array.prototype;

    // 네이티브에 f가 존재하지 않으면 false 반환
    function nativeCall(f) {
        return f ? function(obj) {
            return f.apply(obj, arraySlice.call(arguments, 1));
        } : false;
    }

    /**
     * 배열관련 유틸함수
     * @namespace
     * @name vinyl.array
     */
    core.addon('array', /** @lends vinyl.array */{
        /**
         * 배열 병합
         * @param {Array} arr
         * @param {Array} ...
         * @returns {*}
         * @exmaple
         * var newArray = vinyl.array.append([1,2,3], [4,5,6], [6, 7, 8]); // [1,2,3,4,5,6,7,8]
         */
        append: function (arr) {
            var args = arraySlice.call(arguments);
            arrayProto.push.apply.apply(args);
            return args[0];
        },
        /**
         * 콜백함수로 하여금 요소를 가공하는 함수
         *
         * @name vinyl.array.map
         * @param {Array} obj 배열
         * @param {Function} cb 콜백함수
         * @param {Object} (optional) 컨텍스트
         * @return {Array}
         *
         * @example
         * vinyl.array.map([1, 2, 3], function(item, index) {
		 *		return item * 10;
		 * });
         * => [10, 20, 30]
         */
        map: nativeCall(arrayProto.map) || function (obj, cb, ctx) {
            var results = [];
            if (!core.is(obj, 'array') || !core.is(cb, 'function')) { return results; }
            // vanilla js~
            for(var i =0, len = obj.length; i < len; i++) {
                results[results.length] = cb.call(ctx||obj, obj[i], i, obj);
            }
            return results;
        },

        /**
         * 반복자함수의 반환값이 true가 아닐 때까지 반복
         *
         * @name vinyl.array.every
         * @return {Boolean} 최종 결과
         */
        every: nativeCall(arrayProto.every) || function(arr, cb, ctx) {
            var isTrue = true;
            if (!core.is(arr, 'array') || !core.is(cb, 'function')) { return isTrue; }
            each(arr, function(v, k) {
                if (cb.call(ctx||this, v, k) !== true) {
                    return isTrue = false, false;
                }
            });
            return isTrue;
        },

        /**
         * 반복자함수의 반환값이 true일 때까지 반복
         *
         * @name vinyl.array.any
         */
        any: nativeCall(arrayProto.any) || function(arr, cb, ctx) {
            var isTrue = false;
            if (!core.is(arr, 'array') || !core.is(cb, 'function')) { return isTrue; }
            each(arr, function(v, k) {
                if (cb.call(ctx||this, v, k) === true) {
                    return isTrue = true, false;
                }
            });
            return isTrue;
        },

        /**
         * 배열 요소의 순서를 섞어주는 함수
         *
         * @param {Array} obj 배열
         * @return {Array} 순서가 섞인 새로운 배열
         */
        shuffle: function (obj) {
            var rand,
                index = 0,
                shuffled = [],
                number = core.number;

            each(obj, function (value, k) {
                rand = number.random(index++);
                shuffled[index - 1] = shuffled[rand], shuffled[rand] = value;
            });
            return shuffled;
        },

        /**
         * 콜백함수로 하여금 요소를 걸려내는 함수
         * @function
         * @name vinyl.array.filter
         * @param {Array} obj 배열
         * @param {Function} cb 콜백함수
         * @param {Object} (optional) 컨텍스트
         * @returns {Array}
         *
         * @example
         * vinyl.array.filter([1, '일', 2, '이', 3, '삼'], function(item, index) {
		 *		return typeof item === 'string';
		 * });
         * => ['일','이','삼']
         */
        filter: nativeCall(arrayProto.filter) || function (obj, cb, ctx) {
            var results = [];
            if (!core.is(obj, 'array') || !core.is(cb, 'function')) { return results; }
            for(var i =0, len = obj.length; i < len; i++) {
                cb.call(ctx||obj, obj[i], i, obj) && (results[results.length] = obj[i]);
            }
            return results;
        },

        /**
         * 주어진 배열에 지정된 값이 존재하는지 체크
         *
         * @param {Array} obj 배열
         * @param {Function} cb 콜백함수
         * @return {Array}
         *
         * @example
         * vinyl.array.include([1, '일', 2, '이', 3, '삼'], '삼');  => true
         */
        include: function (arr, value, b) {
            if (!core.is(arr, 'array')) { return value; }
            if(typeof value === 'function') {
                for(var i = 0; i<arr.length; i++) {
                    if(value(arr[i], i) === true){
                        return true;
                    }
                }
                return false;
            }
            return core.array.indexOf(arr, value, b) > -1;
        },

        /**
         * 주어진 인덱스의 요소를 반환
         * @function
         * @name vinyl.array.indexOf
         * @param {Array} obj 배열
         * @param {Function} cb 콜백함수
         * @return {Array}
         *
         * @example
         * vinyl.array.indexOf([1, '일', 2, '이', 3, '삼'], '일');  => 1
         */
        indexOf: nativeCall(arrayProto.indexOf) || function (arr, value, b) {
            for (var i = 0, len = arr.length; i < len; i++) {
                if ( (b !== false && arr[i] === value) || (b === false && arr[i] == value) ) { return i; }
            }
            return -1;
        },

        /**
         * 주어진 배열에서 index에 해당하는 요소를 삭제
         *
         * @param {Array} value 배열
         * @param {Number} index 삭제할 인덱스 or 요소
         * @return {Array} 지정한 요소가 삭제된 배열
         */
        removeAt: function (value, index, cb) {
            if (!core.is(value, 'array')) { return value; }
            value.splice(index, 1);
            cb && cb.call(value, index);
            return value;
        },


        /**
         * 주어진 배열에서 해당하는 요소를 삭제
         *
         * @param {Array} value 배열
         * @param {Mixed} item 요소
         * @return {Array} 지정한 요소가 삭제된 배열
         */
        remove: function (value, iter, cb) {
            if (!core.is(value, 'array')) { return value; }
            if(typeof iter === 'function'){
                for(var i = value.length, item; item = value[--i]; ){
                    if(iter(item, i) === true){
                        value = this.removeAt(value, i, cb);
                    }
                }
                return value;
            } else {
                var index = this.indexOf(value, iter);
                if(index < 0) { return value; }
                return this.removeAt(value, index, cb);
            }
        },

        /**
         * 주어진 배열에서 가장 큰 요소를 반환
         *
         * @param {Array} array 배열
         * @return {Mix}
         */
        max: function( array ) {
            return Math.max.apply( Math, array );
        },

        /**
         * 주어진 배열에서 가장 작은 요소를 반환
         *
         * @param {Array} array 배열
         * @return {Mix}
         */
        min: function( array ) {
            return Math.min.apply( Math, array );
        },

        /**
         * 배열의 요소를 역순으로 재배치
         *
         * @name reverse
         * @param {Array} array 배열
         * @return {Array}
         */
        reverse: nativeCall(arrayProto.reverse) || function(array) {
            var first = null;
            var last = null;
            var tmp = null;
            var length = array.length;

            for (first = 0, last = length - 1; first < length / 2; first++, last--) {
                tmp = array[first];
                array[first] = array[last];
                array[last] = tmp;
            }

            return array;
        }
    });

})(window, jQuery, window[FRAMEWORK_NAME]);