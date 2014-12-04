/*!
 * @author 김승일
 * @email comahead@vi-nyl.com
 * @description 이마트 코어 라이브러리
 * @license MIT License
 */

window.LIB_NAME = 'vinyl';
 /*
 *
 */
(function (context, $, undefined) {
    "use strict";
    /* jshint expr: true, validthis: true */
    /* global vinyl, alert, escape, unescape */

    /**
     * @callback arrayCallback
     * @param  {*} item - 배열의 요소
     * @param  {number} index   - 배열의 인덱스
     * @param  {Array}  array   - 배열 자신
     * @return {boolean} false를 반환하면 반복을 멈춘다.
     */


    if(!$) {
        throw new Error("This library requires jQuery");
    }

    // 프레임웍 이름
    var LIB_NAME = window.LIB_NAME || 'vinyl';

    var $root = $(document.documentElement).addClass('js');
    ('ontouchstart' in context) && $root.addClass('touch');
    ('orientation' in context) && $root.addClass('mobile');

    if (typeof Function.prototype.bind === 'undefined') {
        /**
         * 함수내의 컨텐스트를 지정
         * @param {Object} context 컨텍스트
         * @param {*} ... 두번째 인자부터는 실제로 싱행될 콜백함수로 전달된다.
         * @return {Function} 주어진 객체가 켄텍스트로 적용된 함수
         * @example
         * function Test() {
         *      alert(this.name);
         * }.bind({name: 'axl rose'});
         *
         * Test(); -> alert('axl rose');
         */
        Function.prototype.bind = function () {
            var fn = this,
                args = arraySlice.call(arguments),
                object = args.shift();

            return function (context) {
                // bind로 넘어오는 인자와 원본함수의 인자를 병합하여 넘겨줌.
                var local_args = args.concat(arraySlice.call(arguments));
                if (this !== window) { local_args.push(this); }
                return fn.apply(object, local_args);
            };
        };
    }

    if (!window.console) {
        // 콘솔을 지원하지 않는 브라우저를 위해 출력요소를 생성
        window.console = {};
        if(window.LIB_DIV_DEBUG === true) {
            window.$debugDiv = $('<div class="d-debug" style=""></div>');
            $(function () {
                window.$debugDiv.appendTo('body');
            });
        }
        var consoleMethods = ['log', 'info', 'warn', 'error', 'assert', 'dir', 'clear', 'profile', 'profileEnd'];
        for(var i = -1, method; method = consoleMethods[++i]; ) {
            +function(method) {
                console[method] = window.LIB_DIV_DEBUG === true ?
                    function () {
                        window.$debugDiv.append('<div style="font-size:9pt;">&gt; <span>[' + method + ']</span> ' + [].slice.call(arguments).join(', ') + '</div>');
                    } : function () {
                };
            }(method);
        }
    }


    /**
     * @namespace
     * @name vinyl
     * @description root namespace of hib site
     */
    var core = context[ LIB_NAME ] || (context[ LIB_NAME ] = {});
    var arrayProto = Array.prototype,
        objectProto = Object.prototype,
        toString = objectProto.toString,
        hasOwn = objectProto.hasOwnProperty,
        arraySlice = arrayProto.slice,

        isPlainObject = (toString.call(null) === '[object Object]') ? function (value) {
            return value !== null
                && value !== undefined
                && toString.call(value) === '[object Object]'
                && value.ownerDocument === undefined;
        } : function (value) {
            return toString.call(value) === '[object Object]';
        },

        isType = function (o, typeName) {
            if (o === null) {
                return typeName === 'null';
            }

            if (o && o.nodeType) {
                if (o.nodeType === 1 || o.nodeType === 9) {
                    return typeName === 'element';
                } else if (o && o.nodeType === 3 && o.nodeName === '#text') {
                    return typeName === 'textnode';
                }
            }

            if(typeName === 'object' || typeName === 'json') {
                return isPlainObject(o);
            }

            var s = toString.call(o),
                type = s.match(/\[object (.*?)\]/)[1].toLowerCase();

            if (type === 'number') {
                if (isNaN(o)) {
                    return typeName === 'nan';
                }
                if (!isFinite(o)) {
                    return typeName === 'infinity';
                }
            }

            return type === typeName;
        },

        isArray = function(obj){
            return isType(obj, 'array');
        },

        isFunction = function (obj) {
            return isType(obj, 'function');
        },

        /**
         * 반복 함수
         * @function
         * @name vinyl.each
         * @param {Array|Object} obj 배열 및 json객체
         * @param {arrayCallback} cb 콜백함수
         * @param {*} [ctx] 컨텍스트
         * @returns {*}
         * @example
         * vinyl.each({'a': '에이', 'b': '비', 'c': '씨'}, function(value, key) {
         *     alert('key:'+key+', value:'+value);
         *     if(key === 'b') {
         *         return false; // false 를 반환하면 순환을 멈춘다.
         *     }
         * });
         */
        each = function (obj, cb, ctx) {
            if (!obj) {
                return obj;
            }
            var i = 0,
                len = 0,
                isArr = isArray(obj);

            if (isArr) {
                if (obj.forEach) {
                    if (obj.forEach(cb, ctx || obj) === false) {

                    }
                } else {
                    for (i = 0, len = obj.length; i < len; i++) {
                        if (cb.call(ctx || obj, obj[i], i, obj) === false) {
                            break;
                        }
                    }
                }
            } else {
                for (i in obj) {
                    if (hasOwn.call(obj, i)) {
                        if (cb.call(ctx || obj, obj[i], i, obj) === false) {
                            break;
                        }
                    }
                }
            }
            return obj;
        },
        /**
         * 객체 확장 함수
         * @function
         * @name vinyl.extend
         * @param {Object} obj...
         * @returns {*}
         */
        extend = function(deep, obj) {
            var args;
            if(deep === true) {
                args = arraySlice.call(arguments, 2);
            } else {
                args = arraySlice.call(arguments, 1);
                obj = deep;
                deep = false;
            }
            each(args, function (source) {
                if(!source) { return; }

                each(source, function (val, key) {
                    var isArr = isArray(val);
                    if(deep && (isArr || isPlainObject(val))) {
                        obj[key] || (obj[key] = isArr ? [] : {});
                        obj[key] = extend(deep, obj[key], val);
                    } else {
                        obj[key] = val;
                    }
                });
            });
            return obj;
        },
        /**
         * 객체 복제 함수
         * @function
         * @name vinyl.clone
         * @param {Object} obj 배열 및 json객체
         * @returns {*}
         */
        clone = function(obj) {
            if (null == obj || "object" != typeof obj) return obj;

            if (obj instanceof Date) {
                var copy = new Date();
                copy.setTime(obj.getTime());
                return copy;
            }

            if (obj instanceof Array) {
                var copy = [];
                for (var i = 0, len = obj.length; i < len; i++) {
                    copy[i] = clone(obj[i]);
                }
                return copy;
            }

            if (obj instanceof Object) {
                var copy = {};
                for (var attr in obj) {
                    if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
                }
                return copy;
            }
            throw new Error('oops!! clone is fail');
        };


    extend(core, {
    	name: LIB_NAME,
    	debug: false,
        each: each,
        extend: extend,
        clone: clone,

        /**
         * 타입 체크
         * @function
         * @param {Object} o 타입을 체크할 값
         * @param {string} typeName 타입명(null, number, string, element, nan, infinity, date, array)
         * @return {boolean}
         */
        is: isType,

        /**
         * 주어진 인자가 빈값인지 체크
         *
         * @param {Object} value 체크할 문자열
         * @param {boolean} allowEmptyString (Optional: false) 빈문자를 허용할 것인지 여부
         * @return {boolean}
         */
        isEmpty: function (value, allowEmptyString) {
            return (value === null) || (value === undefined) || (!allowEmptyString ? value === '' : false) || (core.is(value, 'array') && value.length === 0);
        },

        /**
         * 객체 자체에 주어진 이름의 속성이 있는지 조회
         *
         * @param {Object} obj 객체
         * @param {string} name 키 이름
         * @return {boolean} 키의 존재 여부
         */
        hasOwn: function (obj, name) {
            return hasOwn.call(obj, name);
        },
        /**
         * 네임스페이스 공간을 생성하고 객체를 설정<br>
         * .를 구분자로 하여 하위 네임스페이스가 생성된다.
         *
         * @function
         * @name vinyl.namespace
         *
         * @param {string} name 네임스페이스명
         * @param {Object} [obj] 지정된 네임스페이스에 등록할 객체, 함수 등
         * @return {Object} 생성된 새로운 네임스페이스
         *
         * @example
         * vinyl.namesapce('vinyl.widget.Tabcontrol', TabControl)
         * // 를 native로 풀면,
         * var vinyl = {
         *     widget: {
         *         Tabcontrol: TabControl
         *     }
         * };
         *
         */
        namespace: function (name, obj) {
            if (typeof name !== 'string') {
                obj && (name = obj);
                return name;
            }

            var root = context,
                names = name.split('.'),
                i, item;

            for (i = -1; item = names[++i];) {
                root = root[item] || (root[item] = {});

            }

            return extend(root, obj || {});
        },
        /**
         * vinyl 하위에 name에 해당하는 네임스페이스를 생성하여 object를 설정해주는 함수
         *
         * @function
         * @name vinyl.addon
         *
         * @param {string} name .를 구분자로 해서 common를 시작으로 하위 네임스페이스를 생성. name이 없으면 emart에 추가된다.
         * @param {Object|Function} obj
         *
         * @example
         *
         * alert(vinyl.urls.store);
         * alert(vinyl.urls.company);
         */
        addon: function (name, obj) {
            if (!isType(name, 'string')) {
                obj = name;
                name = '';
            }

            if (typeof obj === 'function' && !hasOwn.call(obj, '_class')) {
                obj = obj.call(null, core);
            }

            name = LIB_NAME + (name ? '.' + name : '');
            return this.namespace(name, obj);
        }
    });
    core.ns = core.namespace;

    /**
     * jQuery 객체
     * @class
     * @name $
     */

     // $(':focusable') => 포커싱할 수 있는 대상을 검색
    $.extend(jQuery.expr[':'], {
        focusable: function(el, index, selector){
            return $(el).is('a, button, input[type=text], input[type=file], input[type=checkbox], input[type=radio], select, textarea, [tabindex]');
        }
    });

    /**
     * benchmart functions
     */
    extend(core, /** @lends vinyl */{
        /**
         * timeStart("name")로 name값을 키로하는 타이머가 시작되며, timeEnd("name")로 해당 name값의 지난 시간을 로그에 출력해준다.
         *
         * @param {string} name 타이머의 키값
         * @param {boolean} reset 리셋(초기화) 여부
         *
         * @example
         * vinyl.timeStart('animate');
         * ...
         * vinyl.timeEnd('animate'); -> animate: 10203ms
         */
        timeStart: function (name, reset) {
            if (!name) {
                return;
            }
            var time = +new Date,
                key = "KEY" + name.toString();

            this.timeCounters || (this.timeCounters = {});
            if (!reset && this.timeCounters[key]) {
                return;
            }
            this.timeCounters[key] = time;
        },

        /**
         * timeStart("name")에서 지정한 해당 name값의 지난 시간을 로그에 출력해준다.
         *
         * @param {string} name 타이머의 키값
         * @return {number} 걸린 시간
         *
         * @example
         * vinyl.timeStart('animate');
         * ...
         * vinyl.timeEnd('animate'); -> animate: 10203ms
         */
        timeEnd: function (name) {
            if (!this.timeCounters) {
                return null;
            }

            var time = +new Date,
                key = "KEY" + name.toString(),
                timeCounter = this.timeCounters[key],
                diff;

            if (timeCounter) {
                diff = time - timeCounter;
                // 이 콘솔은 디버깅을 위한 것이므로 지우지 말것.
                console.log('[' + name + '] ' + diff + 'ms');
                delete this.timeCounters[key];
            }
            return diff;
        }
    });





    core.addon(/** @lends vinyl */ {
		getHost: function() {
            var loc = document.location;
			return loc.protocol + '//' + loc.host;
		},
        /**
         * 현재 url 반환(쿼리스트링, # 제외)
         * @returns {string}
         */
        getPageUrl: function() {
            var loc = document.location;
            return loc.protocol + '//' + loc.host + loc.pathname;
        },


        /**
         * 브라우저의 Detect 정보: 되도록이면 Modernizr 라이브러리를 사용할 것을 권함
         *
         * @example
         * vinyl.browser.isTouch // 터치디바이스 여부
         * vinyl.browser.isRetina // 레티나 여부
         * vinyl.browser.isMobile // orientation 작동여부로 판단
         * vinyl.browser.isMac // 맥OS
         * vinyl.browser.isLinux // 리눅스
         * vinyl.browser.isWin // 윈도우즈
         * vinyl.browser.is64Bit // 64비트 플랫폼
         *
         * vinyl.browser.isIE // IE
         * vinyl.browser.version // IE의 브라우저
         * vinyl.browser.isOpera // 오페라
         * vinyl.browser.isChrome // 크롬
         * vinyl.browser.isSafari // 사파리
         * vinyl.browser.isWebKit // 웹킷
         * vinyl.browser.isGecko // 파이어폭스
         * vinyl.browser.isIETri4 // IE엔진
         * vinyl.browser.isAir // 어도비 에어
         * vinyl.browser.isIOS // 아이폰, 아이패드
         * vinyl.browser.isAndroid // 안드로이드
         * vinyl.browser.iosVersion // ios 버전 : [8, 1, 0] -> [major, minor, revision]
         * vinyl.browser.androidVersion // android 버전 : [4, 1, 0] -> [major, minor, revision]
         */
        browser: (function () {
            // 아 정리하고 싶당..
            var detect = {},
                win = context,
                na = win.navigator,
                ua = na.userAgent,
                lua = ua.toLowerCase(),
                match;

            detect.isMobile = typeof orientation !== 'undefined';
            detect.isRetina = 'devicePixelRatio' in window && window.devicePixelRatio > 1;
            detect.isAndroid = lua.indexOf('android') !== -1;
            detect.isOpera = win.opera && win.opera.buildNumber;
            detect.isWebKit = /WebKit/.test(ua);
            detect.isTouch = !!('ontouchstart' in window);

            match = /(msie) ([\w.]+)/.exec(lua) || /(trident)(?:.*rv.?([\w.]+))?/.exec(lua) || ['',null,-1];
            detect.isIE = !detect.isWebKit && !detect.isOpera && match[1] !== null;
            detect.version = parseInt(match[2], 10);

			detect.isWin = (na.appVersion.indexOf("Win")!=-1);
            detect.isMac = (ua.indexOf('Mac') !== -1);
			detect.isLinux = (na.appVersion.indexOf("Linux")!=-1);
			detect.is64Bit = (lua.indexOf('wow64') > -1 || (na.platform==='Win64' && lua.indexOf('x64') > -1));

            detect.isChrome = (ua.indexOf('Chrome') !== -1);
            detect.isGecko = (ua.indexOf('Firefox') !==-1);
            detect.isAir = ((/adobeair/i).test(ua));
            detect.isIOS = /(iPad|iPhone)/.test(ua);
            detect.isSafari = !detect.isChrome && (/Safari/).test(ua);
            detect.isIETri4 = (detect.isIE && ua.indexOf('Trident/4.0') !== -1);

            detect.msPointer = na.msPointerEnabled && na.msMaxTouchPoints && !win.PointerEvent;
            detect.pointer = (win.PointerEvent && na.pointerEnabled && na.maxTouchPoints) || detect.msPointer;


			if(detect.isAndroid) {
				detect.androidVersion = +function () {
                    var v = (na).match(/[a|A]ndroid[^\d]*(\d+).?(\d+)?.?(\d+)?/);
                    return [parseInt(v[1], 10), parseInt(v[2] || 0, 10), parseInt(v[3] || 0, 10)];
                }();
			} else if(detect.isIOS) {
                detect.iosVersion = +function () {
                    var v = (na).match(/OS (\d+)_?(\d+)?_?(\d+)?/);
                    return [parseInt(v[1], 10), parseInt(v[2] || 0, 10), parseInt(v[3] || 0, 10)];
                }();
			}

            return detect;
        }()),

        /**
         * 주어진 시간내에 호출이 되면 무시되고, 초과했을 때만 비로소 fn를 실행시켜주는 함수
         * @param {Function} fn 콜백함수
         * @param {number} time 딜레이시간
         * @param {*} scope 컨텍스트
         * @returns {Function}
		 * @example
		 * // 리사이징 중일 때는 #box의 크기를 변경하지 않다가,
		 * // 리사이징이 끝나고 0.5초가 지난 후에 #box사이즈를 변경하고자 할 경우에 사용.
		 * $(window).on('resize', vinyl.delayRun(function(){
		 *		$('#box').css('width', $(window).width());
		 *  }, 500));
         */
        delayRun: function (fn, time, scope) {
            time || (time = 250);
            var timeout = null;
            return function () {
                if (timeout) {
                    clearTimeout(timeout);
                }
                var args = arguments,
                    me = this;
                timeout = setTimeout(function () {
                    fn.apply(scope || me, args);
                    timeout = null;
                }, time);
            };
        },

        /**
         * 주어진 값을 배열로 변환
         *
         * @param {*} value 배열로 변환하고자 하는 값
         * @return {Array}
         *
         * @example
         * vinyl.toArray('abcd"); => ["a", "b", "c", "d"]
         * vinyl.toArray(arguments);  => arguments를 객체를 array로 변환하여 Array에서 지원하는 유틸함수(slice, reverse ...)를 쓸수 있다.
         */
        toArray: function (value) {
            try {
                return arraySlice.apply(value, arraySlice.call(arguments, 1));
            } catch (e){}

            var ret = [];
            try {
                for (var i = 0, len = value.length; i < len; i++) {
                    ret.push(value[i]);
                }
            } catch (e) {}
            return ret;
        },

        /**
         * 15자의 숫자로 이루어진 유니크한 값 생성
         *
         * @return {string}
         */
        getUniqId: function (len) {
            len = len || 32;
            var rdmString = "";
            for( ; rdmString.length < len; rdmString  += Math.random().toString(36).substr(2));
            return  rdmString.substr(0, len);
        },

        /**
         * 순번으로 유니크값 을 생성해서 반환
         * @function
         * @return {number}
         */
        nextSeq: (function() {
            var seq = 0;
            return function(prefix) {
                return (prefix || '') + (seq += 1);
            };
        }()),

        /**
         * 템플릿 생성
         *
         * @param {string} text 템플릿 문자열
         * @param {Object} data 템플릿 문자열에서 변환될 데이타
         * @param {Object} settings 옵션
         * @return {Function} tempalte 함수
         *
         * @example
         * var tmpl = vinyl.template('&lt;span>&lt;$=name$>&lt;/span>');
         * var html = tmpl({name: 'Axl rose'}); => &lt;span>Axl rose&lt;/span>
         * $('div').html(html);
         */
        template: function (str, data) {
            var m,
                src = 'var __src = [], each='+LIB_NAME+'.each, escapeHTML='+LIB_NAME+'.string.escapeHTML; with(value||{}) { __src.push("';
            str = $.trim(str);
            src += str.replace(/\r|\n|\t/g, " ")
                .replace(/<\$(.*?)\$>/g, function(a, b) { return '<$' + b.replace(/"/g, '\t') + '$>'; })
                .replace(/"/g, '\\"')
                .replace(/<\$(.*?)\$>/g, function(a, b) { return '<$' + b.replace(/\t/g, '"') + '$>'; })
				//.replace(/<\$each\(([a-z0-9]+)\:([a-z0-9]+)\)\$>([^<]+?)<\$\/each\$>/ig, '", (function(){ var __ret = \'\'; each($1, function($2, $2_i) { __ret += $3; }); return __ret; })(), "')
                .replace(/<\$=(.+?)\$>/g, '", $1, "')
                .replace(/<\$-(.+?)\$>/g, '", escapeHTML($1), "')
                .replace(/(<\$|\$>)/g, function(a, b) { return b === '<$' ? '");' : '__src.push("'});

            src+='"); }; return __src.join("")';

            var f = new Function('value', 'data', src);
            if ( data ) {
                return f( data );
            }
            return f;
        },

        /**
         * js파일을 동적으로 로딩
         * @function
         * @name loadScript
         * @param {Array} scriptList 로딩할 js파일 리스트
         * @param {Function} callback 주어진 js파일들의 로딩이 모두 완료가 되었을 때 실행할 콜백함수
         */
        loadScript: (function () {
            // benchmark: https://github.com/eancc/seque-loadjs/blob/master/seque-loadjs.js

            var loadedjs = {},
                core = core;

            return function(scriptList, cb) {
                var args = arraySlice.call(arguments),
                    callbackArgs = args.slice(2),
                    len = scriptList.length,
                    loadedLen = 0,
                    defer = $.Deferred();

                // 이미 포함된 스크립트를 검색
                $('script').each(function() {
                    loadedjs[$(this).attr('src')] = true;
                });

                function callback() {
                    if(cb) {
                        cb.apply(null, callbackArgs);
                    }
                    defer.resolve.apply(null, callbackArgs);
                };

                function deepCallbacks(incallback, func, args) {
                    if (func) {
                        func.apply(null, args);
                    }
                    incallback();
                }

                //
                function loadScripts() {
                    if (loadedLen < len) {
                        loadScript(scriptList[loadedLen++], loadScripts);
                    } else if (callback) {
                        callback.apply(null, callbackArgs);
                    }
                }
                //////////

                // load
                function loadScript(scriptName, incallback) {

                    if (scriptName instanceof Array) {
                        incallback = deepCallbacks(incallback, scriptName[1], scriptName.slice(2));
                        scriptName = scriptName[0];
                    }
                    //캐쉬
                    if (scriptName && !loadedjs[scriptName]) {
                        loadedjs[scriptName] = true;

                        var body = document.getElementsByTagName('body')[0],
                            script = document.createElement('script');

                        script.type = 'text/javascript';
                        script.src = scriptName;

                        if (script.readyState) {
                            script.onreadystatechange = function() {
                                if (script.readyState === "loaded" || script.readyState === "complete") {
                                    script.onreadystatechange = null;
                                    incallback();
                                }
                            };
                        } else {
                            script.onload = incallback;
                        }

                        body.appendChild(script);
                    } else if (incallback) {
                        incallback();
                    }
                }
                ////////////

                if (scriptList instanceof Array) {
                    loadScripts();
                } else if (typeof (scriptList) == "string") {
                    loadScript(scriptList, function() {
                        callback.apply(null, callbackArgs);
                    });
                }
                return defer.promise();
            };

        })()
    });


    /**
     * 루트클래스로서, vinyl.Base나 vinyl.Class를 이용해서 클래스를 구현할 경우 vinyl.Base를 상속받게 된다.
     * @namespace
     * @name vinyl.Base
     * @example
     * var Person = vinyl.Base.extend({  // 또는 var Person = vinyl.Class({ 으로 구현해도 동일하다.
	*	$singleton: true, // 싱글톤 여부
	*	$statics: { // 클래스 속성 및 함수
	*		live: function() {} // Person.live(); 으로 호출
	*	},
	*	$mixins: [Animal, Robot], // 특정 클래스에서 메소드들을 빌려오고자 할 때 해당 클래스를 지정(다중으로도 가능),
	*	initialize: function(name) {
	*		this.name = name;
	*	},
	*	say: function(job) {
	*		alert("I'm Person: " + job);
	*	},
	*	run: function() {
	*		alert("i'm running...");
	*	}
	*`});
     *
	 * // Person에서 상속받아 Man클래스를 구현하는 경우
     * var Man = Person.extend({
	*	initialize: function(name, age) {
	*		this.supr(name);  // Person(부모클래스)의 initialize메소드를 호출 or this.suprMethod('initialize', name);
	*		this.age = age;
	*	},
	*	// say를 오버라이딩함
	*	say: function(job) {
	*		this.suprMethod('say', 'programer'); // 부모클래스의 say 메소드 호출 - 첫번째인자는 메소드명, 두번째부터는 해당 메소드로 전달될 인자

	*		alert("I'm Man: "+ job);
	*	}
	* });
     * var man = new Man('kim', 20);
     * man.say('freeman');  // 결과: alert("I'm Person: programer"); alert("I'm Man: freeman");
     * man.run(); // 결과: alert("i'm running...");
     */
    (function () {
        var F = function(){},
            ignoreNames = ['superclass', 'members', 'statics'];

        function array_indexOf(arr, value) {
            if(Array.prototype.indexOf) {
                return Array.prototype.indexOf.call(arr, value);
            } else {
                for(var i = -1, item; item = arr[++i]; ){
                    if(item == value) { return true; }
                }
                return false;
            }
        }

        // 부모클래스의 함수에 접근할 수 있도록 .supr 속성에 부모함수를 래핑하여 설정
        function wrap(k, fn, supr) {
            return function () {
                var tmp = this.callParent, ret;

                this.callParent = supr.prototype[k];
                ret = undefined;
                try {
                    ret = fn.apply(this, arguments);
                } finally {
                    this.callParent = tmp;
                }
                return ret;
            };
        }

        // 속성 중에 부모클래스에 똑같은 이름의 함수가 있을 경우 래핑처리
        function inherits(what, o, supr) {
			each(o, function(v, k) {
				what[k] = isFunction(v) && isFunction(supr.prototype[k]) ? wrap(k, v, supr) : v;
			});
        }

        function classExtend(attr, c) {
            var supr = c ? (attr.$extend || Object) : this,
                statics, Object, singleton, instance;

            if (core.is(attr, 'function')) {
                attr = attr();
            }

            singleton = attr.$singleton || false;
            statics = attr.$statics || false;
            Object = attr.$mixins || false;


            function ctor() {
                if (singleton && instance) {
                    return instance;
                } else {
                    instance = this;
                }

                var args = arraySlice.call(arguments),
                    me = this;
                each(me.constructor.hooks.init, function(fn, i) {
                    fn.call(me);
                });

                if (me.initialize) {
                    me.initialize.apply(this, args);
                } else {
                    supr.prototype.initialize && supr.prototype.initialize.apply(me, args);
                }
            }

            function Class() {
                ctor.apply(this, arguments);
            }

            F.prototype = supr.prototype;
            Class.prototype = new F;
            Class.prototype.constructor = Class;
            Class.superclass = supr.prototype;
            Class.extend = classExtend;
            Class.hooks = extend({
                init:[]
            }, supr.hooks);


            if (singleton) {
                Class.getInstance = function() {
                    var arg = arguments,
                        len = arg.length;
                    if (!instance) {
                        switch(true){
                            case !len: instance = new Class; break;
                            case len === 1: instance = new Class(arg[0]); break;
                            case len === 2: instance = new Class(arg[0], arg[1]); break;
                            default: instance = new Class(arg[0], arg[1], arg[2]); break;
                        }
                    }
                    return instance;
                };
            }

            Class.prototype.suprMethod = Class.prototype.parentMethod = function (name) {
                var args = arraySlice.call(arguments, 1);
                return supr.prototype[name].apply(this, args);
            };

            Class.Object = function (o) {
                if (!o.push) {
                    o = [o];
                }
                var proto = this.prototype;
                each(o, function (mixObj, i) {
					if(!mixObj){ return; }
                    each(mixObj, function (fn, key) {
                        if(key === 'init' && Class.hooks) {
                            Class.hooks.init.push(fn)
                        } else {
                            proto[key] = fn;
                        }
                    });
                });
            };
            Object && Class.Object.call(Class, Object);

            Class.members = function (o) {
                inherits(this.prototype, o, supr);
            };
            attr && Class.members.call(Class, attr);

            Class.statics = function (o) {
                o = o || {};
                for (var k in o) {
                    if (!array_indexOf(ignoreNames, k)) {
                        this[k] = o[k];
                    }
                }
                return Class;
            };
            Class.statics.call(Class, supr);
            statics && Class.statics.call(Class, statics);

            return Class;
        }

        var Base = function(){ };
        Base.prototype.initialize = function(){ throw new Error("Base 클래스로 객체를 생성 할 수 없습니다"); };
        Base.prototype.release = function(){};
        Base.extend = classExtend;

        core.Class = function(attr){ return classExtend.apply(this, [attr, true]); };
        return core.Base = Base;
    })();

    core.addon('Env', /** @lends vinyl */{
        configs: {},

        /**
         * 설정값을 꺼내오는 함수
         *
         * @param {string} name 설정명. `.`를 구분값으로 단계별로 값을 가져올 수 있다.
         * @param {Object} def (Optional) 설정된 값이 없을 경우 사용할 기본값
         * @return {Object} 설정값
         */
        get: function (name, def) {
            var root = this.configs,
                names = name.split('.'),
                pair = root;

            for (var i = 0, len = names.length; i < len; i++) {
                if (!(pair = pair[names[i]])) {
                    return def;
                }
            }
            return pair;
        },

        /**
         * 설정값을 지정하는 함수
         *
         * @param {string} name 설정명. `.`를 구분값으로 단계를 내려가서 설정할 수 있다.
         * @param {Object} value 설정값
         * @return {Object} 설정값
         */
        set: function (name, value) {
            var root = this.configs,
                names = name.split('.'),
                len = names.length,
                last = len - 1,
                pair = root;

            for (var i = 0; i < last; i++) {
                pair = pair[names[i]] || (pair[names[i]] = {});
            }
            return (pair[names[last]] = value);
        }
    });


    core.addon('Listener', function () {
        /**
         * 이벤트 리스너로서, 일반 객체에 이벤트 기능을 붙이고자 할경우에 사용
         * @class
         * @name vinyl.Listener
         * @example
         * var obj = {};
         * vinyl.Listener.build(obj);
         * obj.on('clickitem', function(){
         *   alert(0);
		 * });
         * obj.trigger('clickitem');
         */
        var Listener = /** @lends vinyl.Listener# */ {
            /**
             * obj에 이벤트 기능 적용하기
             * @param {Object} obj 이벤트를 적용하고자 하는 객체
             */
            build: function(obj){
                vinyl.extend(obj, vinyl.Listener).init();
            },
            /**
             * UI모듈이 작성될 때 내부적으로 호출되는 초기화 함수
             */
            init: function () {
                this._listeners = $(this);
            },

            /**
             * 이벤트 핸들러 등록
             * @param {Object} name 이벤트명
             * @param {Object} cb 핸들러
             */
            on: function () {
                var lsn = this._listeners;
                lsn.on.apply(lsn, arguments);
                return this;
            },

            /**
             * 한번만 실행할 이벤트 핸들러 등록
             * @param {Object} name 이벤트명
             * @param {Object} cb 핸들러
             */
            once: function () {
                var lsn = this._listeners;
                lsn.once.apply(lsn, arguments);
                return this;
            },

            /**
             * 이벤트 핸들러 삭제
             * @param {Object} name 삭제할 이벤트명
             * @param {Object} cb (Optional) 삭제할 핸들러. 이 인자가 없을 경우 name에 등록된 모든 핸들러를 삭제.
             */
            off: function () {
                var lsn = this._listeners;
                lsn.off.apply(lsn, arguments);
                return this;
            },

            /**
             * 이벤트 발생
             * @param {Object} name 발생시킬 이벤트명
             */
            trigger: function () {
                var lsn = this._listeners;
                lsn.trigger.apply(lsn, arguments);
                return this;
            }
        };

        return Listener;
    });

    /**
     * @namespace
     * @name vinyl.PubSub
     * @description 발행/구독 객체: 상태변화를 관찰하는 옵저버(핸들러)를 등록하여, 상태변화가 있을 때마다 옵저버를 발행(실행)
     * 하도록 하는 객체이다..
     * @example
     * // 옵저버 등록
     * vinyl.PubSub.on('customevent', function() {
	 *	 alert('안녕하세요');
	 * });
     *
     * // 등록된 옵저버 실행
     * vinyl.PubSub.trigger('customevent');
     */
    core.addon('PubSub', function () {

        var PubSub = $(window);

        var tmp = /** @lends vinyl.PubSub */{
            /**
             * 이벤트 바인딩
             * @function
             * @param {string} name 이벤트명
             * @param {function} handler 핸들러
             * @return {vinyl.PubSub}
             */
            on: function(name, handler) {
                return this;
            },

            /**
             * 이벤트 언바인딩
             * @param {string} name 이벤트명
             * @param {Function} [handler] 핸들러
             * @return {vinyl.PubSub}
             */
            off: function (name, handler) {
                return this;
            },

            /**
             * 이벤트 트리거
             * @param {string} name 이벤트명
             * @param {Object} [data] 핸들러
             * @return {vinyl.PubSub}
             */
            trigger: function (name, data) {
                return this;
            }
        };

        /**
         * 이벤트 바인딩
         * @alias vinyl.PubSub.on;
         */
        PubSub.attach = PubSub.on;
        /**
         * 이벤트 언바인딩
         * @alias vinyl.PubSub.off;
         */
        PubSub.unattach = PubSub.off;

        return PubSub;
    });

})(window, jQuery);
