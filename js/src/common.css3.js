/*!
 * @author common.css3.js
 * @email comahead@vi-nyl.com
 * @create 2014-11-25
 * @license MIT License
 */
(function (ctx, $, core, undefined) {
    "use strict";

    var doc = document;

    /**
     * css3관련 유틸함수들이 들어있는 객체이다.
     * @namespace
     * @name vinyl.css3
     */
    core.addon('css3', function() {

        var _tmpDiv = doc.createElement('div'),
            _prefixes = ['Webkit', 'Moz', 'O', 'ms', ''],
            _style = _tmpDiv.style,
            _noReg = /^([0-9]+)[px]+$/,
            _vendor = (function () {
                var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
                    transform,
                    i = 0,
                    l = vendors.length;

                for ( ; i < l; i++ ) {
                    transform = vendors[i] + 'ransform';
                    if ( transform in _style ) return vendors[i].substr(0, vendors[i].length-1);
                }

                return false;
            })(),
            string  = core.string;

        function prefixStyle(name, isHippen) {
            if ( _vendor === false ) return name;
            if ( _vendor === '' ) return name;
            if(isHippen){
                return '-' + _vendor.toLowerCase()+'-'+name[0].toLowerCase()+name.substr(1);
            }
            return _vendor + string.capitalize(name);
        }

        return /** @lends vinyl.css3 */{
            support: _vendor !== false,
            support3D: (function() {
                var body = document.body,
                    docEl = document.documentElement,
                    docOverflow;
                if (!body) {
                    body = document.createElement('body');
                    body.fake = true;
                    body.style.background = '';
                    body.style.overflow = 'hidden';
                    body.style.padding = '0 0 0 0';
                    docEl.appendChild(body);
                }
                docOverflow = docEl.style.overflow;
                docEl.style.overflow = 'hidden';

                var parent = document.createElement('div'),
                    div = document.createElement('div'),
                    cssTranslate3dSupported;

                div.style.position = 'absolute';
                parent.appendChild(div);
                body.appendChild(parent);

                div.style[prefixStyle('transform')] = 'translate3d(20px, 0, 0)';
                cssTranslate3dSupported = ($(div).position().left - div.offsetLeft == 20);
                if (body.fake) {
                    body.parentNode.removeChild(body);
                    docEl.offsetHeight;
                } else {
                    parent.parentNode.removeChild(parent);
                }
                docEl.style.overflow = docOverflow;
                return cssTranslate3dSupported;
            })(),

            /**
             * 현재 브라우저의 css prefix명 (webkit or Moz or ms or O)
             * @function
             * @return {string}
             */
            vendor: _vendor,
            /**
             * 주어진 css속성을 지원하는지 체크
             *
             * @param {string} cssName 체크하고자 하는 css명
             * @return {boolean} 지원여부
             * @example
             * if(vinyl.css3.has('transform')) { ...
             */
            has: function (name) {
                var a = _prefixes.length;
                if (name in _style) { return true; }
                name = string.capitalize(name);
                while (a--) {
                    if (_prefixes[a] + name in _style) {
                        return true;
                    }
                }
                return false;
            },

            /**
             * 주어진 css명 앞에 현재 브라우저에 해당하는 벤더prefix를 붙여준다.
             *
             * @function
             * @param {string} cssName css명
             * @return {string}
             * @example
             * vinyl.css3.prefix('transition'); // => webkitTransition
             */
            prefix: prefixStyle,
            get: function(el, style) {
                if (!el || !core.is(el, 'element')) { return null; }
                var value;
                if (el.currentStyle) {
                    value = el.currentStyle[ string.camelize(style) ];
                } else {
                    value = window.getComputedStyle(el, null)[ string.camelize(style) ];
                }
                if(_noReg.test(value)) {
                    return parseInt(RegExp.$1, 10);
                }
                return value;
            }
        };
    });
})(window, jQuery, window[LIB_NAME]);