/*!
 * @author 김승일
 * @email comahead@vi-nyl.com
 * @description 이마트 코어 라이브러리
 * @license MIT License
 */

window.FRAMEWORK_NAME = 'vinyl';
 /*
 *	
 */
(function (context, $, undefined) {
    "use strict";
    /* jshint expr: true, validthis: true */
    /* global vinyl, alert, escape, unescape */

    if(!$) {
        throw new Error("This library requires jQuery");
    }

    // 프레임웍 이름
    var FRAMEWORK_NAME = window.FRAMEWORK_NAME || 'vinyl';

    var $root = $(document.documentElement).addClass('js');
    ('ontouchstart' in context) && $root.addClass('touch');
    ('orientation' in context) && $root.addClass('mobile');

    if (typeof Function.prototype.bind === 'undefined') {
        /**
         * 함수내의 컨텐스트를 지정
         * @param {Object} context 컨텍스트
         * @param {Mixed} ... 두번째 인자부터는 실제로 싱행될 콜백함수로 전달된다.
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
        window.console = {};
        var consoleMethods = ['log', 'info', 'warn', 'error', 'assert', 'dir', 'clear', 'profile', 'profileEnd'];
        for(var i = -1, method; method = consoleMethods[++i]; ) {
            console[method] = function () { };
        }
    }


    /**
     * @namespace
     * @name vinyl
     * @description root namespace of hib site
     */
    var core = context[ FRAMEWORK_NAME ] || (context[ FRAMEWORK_NAME ] = {});
    var arrayProto = Array.prototype,
        objectProto = Object.prototype,
        toString = objectProto.toString,
        hasOwn = objectProto.hasOwnProperty,
        arraySlice = arrayProto.slice,
        doc = document,
        emptyFn = function () {},

        /**
         * 주어진 값이 json형인가
         */
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
         * @param {Array|JSON} obj 배열 및 json객체
         * @param {function(this:Array|Object, value, index)} cb
         * @param {Object} ctx
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
         * @param {JSON} obj...
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
         * @param {JSON} obj 배열 및 json객체
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
    	name: FRAMEWORK_NAME,
    	debug: false,
        each: each,
        extend: extend,
        clone: clone,

        /**
         * 타입 체크
         * @function
         * @param {Mixins} o 타입을 체크할 값
         * @param {String} typeName 타입명(null, number, string, element, nan, infinity, date, array)
         * @return {Boolean}
         */
        is: isType,

        /**
         * 주어진 인자가 빈값인지 체크
         *
         * @param {Object} value 체크할 문자열
         * @param {Boolean} allowEmptyString (Optional: false) 빈문자를 허용할 것인지 여부
         * @return {Boolean}
         */
        isEmpty: function (value, allowEmptyString) {
            return (value === null) || (value === undefined) || (!allowEmptyString ? value === '' : false) || (core.is(value, 'array') && value.length === 0);
        },

        /**
         * 객체 자체에 주어진 이름의 속성이 있는지 조회
         *
         * @param {Object} obj 객체
         * @param {String} name 키 이름
         * @return {Boolean} 키의 존재 여부
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
         * @param {String} name 네임스페이스명
         * @param {Object} obj {Optional) 지정된 네임스페이스에 등록할 객체, 함수 등
         * @return {Object} 생성된 네임스페이스
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
         * @param {String} name .를 구분자로 해서 common를 시작으로 하위 네임스페이스를 생성. name이 없으면 emart에 추가된다.
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

            name = FRAMEWORK_NAME + (name ? '.' + name : '');
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
         * @param {String} name 타이머의 키값
         * @param {Boolean} reset 리셋(초기화) 여부
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
         * @param {String} name 타이머의 키값
         * @return {Number} 걸린 시간
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
         * vinyl.browser.isOpera // 오페라
         * vinyl.browser.isWebKit // 웹킷
         * vinyl.browser.isIE // IE
         * vinyl.browser.isIE6 // IE56
         * vinyl.browser.isIE7 // IE567
         * vinyl.browser.isOldIE // IE5678
         * vinyl.browser.version // IE의 브라우저
         * vinyl.browser.isChrome // 크롬
         * vinyl.browser.isGecko // 파이어폭스
         * vinyl.browser.isMac // 맥OS
         * vinyl.browser.isAir // 어도비 에어
         * vinyl.browser.isIDevice // 아이폰, 아이패드
         * vinyl.browser.isSafari // 사파리
         * vinyl.browser.isIETri4 // IE엔진
         * vinyl.browser.isNotSupporte3DTransform // 안드로이드 3.0이하 3d transform지원X
         * vinyl.browser.isGingerbread // 안드로이드 Gingerbread
         * vinyl.browser.isIcecreamsandwith // 안드로이드 Icecreamsandwith
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
				detect.androidVersion = (function(match){ if(match){ return match[1]|0; } else { return 0; } })(lua.match(/android ([\w.]+)/));
			} else if(detect.isIOS) {
				detect.iosVersion = (function(match){ if(match){ return match[1]|0; } else { return 0; } })(ua.match(/OS ([[0-9]+)/));
			}

            return detect;
        }()),

        /**
         * 주어진 시간내에 호출이 되면 무시되고, 초과했을 때만 비로소 fn를 실행시켜주는 함수
         * @param {Function} fn 콜백함수
         * @param {Number} time 딜레이시간
         * @param {Mixin} scope 컨텍스트
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
         * @param {Mixed} value 배열로 변환하고자 하는 값
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
         * @return {String}
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
         * @return {Number}
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
         * @param {String} text 템플릿 문자열
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
                src = 'var __src = [], each='+FRAMEWORK_NAME+'.each, escapeHTML='+FRAMEWORK_NAME+'.string.escapeHTML; with(value||{}) { __src.push("';
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
    var Base = (function () {
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
                statics, mixins, singleton, instance;

            if (core.is(attr, 'function')) {
                attr = attr();
            }

            singleton = attr.$singleton || false;
            statics = attr.$statics || false;
            mixins = attr.$mixins || false;


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

            Class.mixins = function (o) {
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
            mixins && Class.mixins.call(Class, mixins);

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
        Base.prototype.initialize = function(){};
        Base.prototype.release = function(){};
        Base.extend = classExtend;

        core.Class = function(attr){ return classExtend.apply(this, [attr, true]); };
        return core.Base = Base;
    })();

    core.addon('Env', /** @lends vinyl */{
        /**
         * 사이트의 설정 값들이 들어갈 객체
         *
         * @private
         * @type {Object}
         */
        configs: {},

        /**
         * 설정값을 꺼내오는 함수
         *
         * @param {String} name 설정명. `.`를 구분값으로 단계별로 값을 가져올 수 있다.
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
         * @param {String} name 설정명. `.`를 구분값으로 단계를 내려가서 설정할 수 있다.
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
     * 하도록 하는 객체이다.
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
        PubSub.attach = PubSub.on;
        PubSub.unattach = PubSub.off;

        return PubSub;
    });

})(window, jQuery);

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
         * @param {String} value
         * @param {Number} size (Optional: 2)
         * @param {String} ch (Optional: '0')
         * @return {String}
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
         * @param {Number} value
         * @return {String}
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
         * @param {Number} min 최소값
         * @param {Number} max 최대값
         * @return {Number} 랜덤값
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
         * @param {Number} value
         * @param {Number} min 최소값
         * @param {Number} max 최대값
         * @return {Number}
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

})(window, jQuery, window[FRAMEWORK_NAME]);

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

/*!
 * @author common.date.js
 * @email comahead@vi-nyl.com
 * @create 2014-11-25
 * @license MIT License
 */
(function (ctx, $, core, undefined) {
    "use strict";

    /**
     * 날짜관련 유틸함수
     * @namespace
     * @name vinyl.date
     */
    core.addon('date', function () {
        var months = "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(","),
            fullMonths = "January,Febrary,March,April,May,June,July,Augst,September,October,November,December".split(",");


        function compare(d1, d2) {
            if(!(d1 instanceof Date)){ d1 = core.date.parse(d1); }
            if(!(d2 instanceof Date)){ d2 = core.date.parse(d2); }

            return d1.getTime() > d2.getTime() ? -1 : (d1.getTime() === d2.getTime() ? 0 : 1);
        }

        return /** @lends vinyl.date */{
            MONTHS_NAME: months,
            MONTHS_FULLNAME: fullMonths,

            /**
             * 날짜형식을 지정한 포맷의 문자열로 변환
             *
             * @param {Date} formatDate
             * @param {String} formatString} 포맷 문자열
             * @return {String} 결과 문자열
             *
             * @example
             * vinyl.date.format(new Date(), "yy:MM:dd");
             * =>
             */
            format: function (formatDate, formatString) {
                formatString || (formatString = 'yyyy-MM-dd');
                if (formatDate instanceof Date) {
                    var yyyy = formatDate.getFullYear(),
                        yy = yyyy.toString().substring(2),
                        M = formatDate.getMonth() + 1,
                        MM = M < 10 ? "0" + M : M,
                        MMM = this.MONTHS_NAME[M - 1],
                        MMMM = this.MONTHS_FULLNAME[M - 1],
                        d = formatDate.getDate(),
                        dd = d < 10 ? "0" + d : d,
                        h = formatDate.getHours(),
                        hh = h < 10 ? "0" + h : h,
                        m = formatDate.getMinutes(),
                        mm = m < 10 ? "0" + m : m,
                        s = formatDate.getSeconds(),
                        ss = s < 10 ? "0" + s : s,
                        x = h > 11 ? "PM" : "AM",
                        H = h % 12;

                    if (H === 0) {
                        H = 12;
                    }
                    return formatString.replace(/yyyy/g, yyyy).replace(/yy/g, yy).replace(/MMMM/g, MMMM).replace(/MMM/g, MMM).replace(/MM/g, MM).replace(/M/g, M).replace(/dd/g, dd).replace(/d/g, d).replace(/hh/g, hh).replace(/h/g, h).replace(/mm/g, mm).replace(/m/g, m).replace(/ss/g, ss).replace(/s/g, s).replace(/!!!!/g, MMMM).replace(/!!!/g, MMM).replace(/H/g, H).replace(/x/g, x);
                } else {
                    return "";
                }
            },

            /**
             *
             * @param {String} date
             * @returns {boolean}
             */
            isValid: function(date) {
                try {
                    return !isNaN( this.parse(date).getTime() );
                } catch(e){
                    return false;
                }
            },

            /**
             * date가 start와 end사이인지 여부
             *
             * @param {Date} date 날짜
             * @param {Date} start 시작일시
             * @param {Date} end 만료일시
             * @return {Boolean}
             */
            between: function (date, start, end) {
                return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
            },

            /**
             * 날짜 비교
             *
             * @function
             * @name vinyl.date.compare
             * @param {Date} date1 날짜1
             * @param {Date} date2 날짜2
             * @return {Number} -1: date1가 이후, 0: 동일, 1:date2가 이후
             */
            compare: compare,

            /**
             * 년월일이 동일한가
             *
             * @param {Date} date1 날짜1
             * @param {Date} date2 날짜2
             * @return {Boolean}
             */
            equalsYMH: function(a, b) {
                var ret = true;
                if (!a || !a.getDate || !b || !b.getDate) { return false; }
                each(['getFullYear', 'getMonth', 'getDate'], function(fn) {
                    ret = ret && (a[fn]() === b[fn]());
                    if (!ret) { return false; }
                });
                return ret;
            },

            /**
             * value날짜가 date이후인지 여부
             *
             * @param {Date} value 날짜
             * @param {Date} date
             * @return {Boolean}
             */
            isAfter: function (value, date) {
                return compare(value, date || new Date()) === 1;
            },

            /**
             * value날짜가 date이전인지 여부
             *
             * @param {Date} value 날짜
             * @param {Date} date
             * @return {Boolean}
             */
            isBefore: function (value, date) {
                return compare(value, date || new Date()) === -1;
            },

            /**
             * 주어진 날짜를 기준으로 type만큼 가감된 날짜를 format형태로 반환(내가 이걸 왜 beforeDate로 명명 했을까나..;;;)
             * @param {Date} date 기준날짜
             * @param {String} type -2d, -3d, 4M, 2y ..
             * @param {String} format
             * @returns {Date|String}
             */
            beforeDate: function(date, type, format) {
                date = this.parse(date);
                var m = type.match(/([-+]*)([0-9]*)([a-z]+)/i),
                    g = m[1] === '-' ? -1 : 1,
                    d = (m[2]|0) * g;

                switch(m[3]) {
                    case 'd':
                        date.setDate(date.getDate() + d);
                        break;
                    case 'w':
                        date.setDate(date.getDate() + (d * 7));
                        break;
                    case 'M':
                        date.setMonth(date.getMonth() + d);
                        break;
                    case 'y':
                        date.setFullYear(date.getFullYear() + d);
                        break;
                }
                if(format) {
                    return this.format(date, format);
                }
                return date;
            },

            /**
             * 주어진 날짜 형식의 문자열을 Date객체로 변환
             *
             * @function
             * @name vinyl.date.parse
             * @param {String} dateStringInRange 날짜 형식의 문자열
             * @return {Date}
             */
            parse: (function() {
                var isoExp = /^\s*(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?\s*$/;
                return function (dateStringInRange) {
                    var date, month, parts;

                    if (dateStringInRange instanceof Date) {
                        return dateStringInRange;
                    }

                    dateStringInRange = (dateStringInRange+'').replace(/[^\d]+/g, '');
                    date = new Date(dateStringInRange);
                    if (!isNaN(date)) {
                        return date;
                    }

                    date = new Date(NaN);
                    parts = isoExp.exec(dateStringInRange);

                    if (parts) {
                        month = +parts[2];
                        date.setFullYear(parts[1]|0, month - 1, parts[3]|0);
                        date.setHours(parts[4]|0);
                        date.setMinutes(parts[5]|0);
                        date.setSeconds(parts[6]|0);
                        if (month != date.getMonth() + 1) {
                            date.setTime(NaN);
                        }
                        return date;
                    }
                    return new Date;
                };
            })(),

            /**
             * 두 날짜의 월 간격
             * @param {Date} d1 날짜 1
             * @param {Date} d2 날짜 2
             * @return {Number}
             */
            monthDiff: function(d1, d2) {
                d1 = this.parse(d1);
                d2 = this.parse(d2);

                var months;
                months = (d2.getFullYear() - d1.getFullYear()) * 12;
                months -= d1.getMonth() + 1;
                months += d2.getMonth();
                return months;
            },

            /**
             * 주어진 년월의 일수를 반환
             *
             * @param {Number} year 년도
             * @param {Number} month 월
             * @return {Date}
             */
            daysInMonth: function(year, month) {
                var dd = new Date(year|0, month|0, 0);
                return dd.getDate();
            },

            /**
             * 주어진 시간이 현재부터 몇시간 이전인지 표현(예: -54000 -> 54초 이전)
             *
             * @function
             * @name vinyl.date.prettyDuration
             * @param {Date|Interval} time 시간
             * @param {Date|Interval} time (Optional) 기준시간
             * @return {JSON}
             *
             * @example
             * vinyl.date.prettyDuration(new Date() - 51811); -> "52초 이전"
             */
            prettyDuration: (function() {
                var ints = {
                    '초': 1,
                    '분': 60,
                    '시': 3600,
                    '일': 86400,
                    '주': 604800,
                    '월': 2592000,
                    '년': 31536000
                };

                return function(time, std, tailWord) {
                    std || (std = +new Date);
                    tailWord || (tailWord = '이전');

                    if(time instanceof Date) {
                        time = time.getTime();
                    }
                    // time = +new Date(time);

                    var gap = (std - time) / 1000,
                        amount, measure;

                    for (var i in ints) {
                        if (gap > ints[i]) { measure = i; }
                    }

                    amount = gap / ints[measure];
                    amount = gap > ints.day ? (Math.round(amount * 100) / 100) : Math.round(amount);
                    amount += measure + ' ' + tailWord;

                    return amount;
                };
            }()),

            /**
             * 밀리초를 시,분,초로 변환
             * @param time
             * @returns {JSON}
             */
            msToTime: function(amount) {
                var days = 0,
                    hours = 0,
                    mins = 0,
                    secs = 0;

                amount = amount / 1000;
                days = Math.floor(amount / 86400), amount = amount % 86400;
                hours = Math.floor(amount / 3600), amount = amount % 3600;
                mins = Math.floor(amount / 60), amount = amount % 60;
                secs = Math.floor(amount);

                return {
                    days: days,
                    hours: hours,
                    mins: mins,
                    secs: secs
                };
            },

            /**
             * 주어진 두 날짜의 간견을 시, 분, 초로 반환
             *
             * @function
             * @param {Date|Interval} time 시간
             * @param {Date|Interval} time 시간
             * @return {JSON}
             *
             * @example
             * vinyl.date.timeDiff(new Date, new Date(new Date() - 51811));
             */
            diffTime: function(t1, t2) {
                if(!core.is(t1, 'date')) { t1 = new Date(t1); };
                if(!core.is(t2, 'date')) { t2 = new Date(t2); };

                var diff = t1.getTime() - t2.getTime(),
                    ddiff = diff;

                diff = Math.abs(diff);

                var ms = diff % 1000;
                diff /= 1000;

                var s = Math.floor(diff % 60);
                diff /= 60;

                var m = Math.floor(diff % 60);
                diff /= 60;

                var h = Math.floor(diff % 24);
                diff /= 24;

                var d = Math.floor(diff);

                var w = Math.floor(diff / 7);

                return {
                    ms: ms,
                    secs: s,
                    mins: m,
                    hours: h,
                    days: d,
                    weeks: w,
                    diff: ddiff
                };
            },

            /**
             * 주어진 날짜가 몇번째 주인가
             * @function
             * @param {Date} date 날짜
             * @returns {Number}
             */
            weekOfYear : (function() {
                var ms1d = 1000 * 60 * 60 * 24,
                    ms7d = 7 * ms1d;

                return function(date) {
                    var DC3 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 3) / ms1d,
                        AWN = Math.floor(DC3 / 7),
                        Wyr = new Date(AWN * ms7d).getUTCFullYear();

                    return AWN - Math.floor(Date.UTC(Wyr, 0, 7) / ms7d) + 1;
                };
            }()),

            /**
             * 윤년인가
             * @param {Number} y 년도
             * @returns {boolean}
             */
            isLeapYear: function ( y ) {
                if ( toString.call( y ) === '[object Date]' ) { y = y.getUTCFullYear(); }
                return (( y % 4 === 0 ) && ( y % 100 !== 0 )) || ( y % 400 === 0 );
            },

            /**
             * 날짜 가감함수
             * @param {Date} date 날짜
             * @param {String} interval 가감타입(ms, s, m, h, d, M, y)
             * @param {Number} value 가감 크기
             * @returns {Date}
             * @example
             * // 2014-06-10에서 y(년도)를 -4 한 값을 계산
             * var d = vinyl.date.add(new Date(2014, 5, 10), 'y', -4); // 결과 => 2010-06-10
             */
            add: function(date, interval, value) {
                var d = new Date(date.getTime());
                if (!interval || value === 0) {
                    return d;
                }

                switch(interval) {
                    case "ms":
                        d.setMilliseconds(d.getMilliseconds() + value);
                        break;
                    case "s":
                        d.setSeconds(d.getSeconds() + value);
                        break;
                    case "m":
                        d.setMinutes(d.getMinutes() + value);
                        break;
                    case "h":
                        d.setHours(d.getHours() + value);
                        break;
                    case "d":
                        d.setDate(d.getDate() + value);
                        break;
                    case "M":
                        d.setMonth(d.getMonth() + value);
                        break;
                    case "y":
                        d.setFullYear(d.getFullYear() + value);
                        break;
                }
                return d;
            },

            /**
             * 시분초 normalize화 처리
             * @param h
             * @param M
             * @param s
             * @param ms
             * @returns {{day: number, hour: (*|number), min: (*|number), sec: (*|number), ms: (*|number)}}
             * @example
             * vinyl.date.normalize(0, 0, 120, 0) // => {day:0, hour: 0, min: 2, sec: 0, ms: 0} // 즉, 120초가 2분으로 변환
             */
            normalize: function(h, M, s, ms) {
                h = h || 0;
                M = M || 0;
                s = s || 0;
                ms = ms || 0;

                var d = 0;

                if(ms > 1000) {
                    s += Math.floor(ms / 1000);
                    ms = ms % 1000;
                }

                if(s > 60) {
                    M += Math.floor(s / 60);
                    s = s % 60;
                }

                if(M > 60) {
                    h += Math.floor(M / 60);
                    M = M % 60;
                }

                if(h > 24) {
                    d += Math.floor(h / 24);
                    h = h % 24;
                }

                return {
                    day: d,
                    hour: h,
                    min: M,
                    sec: s,
                    ms: ms
                }
            }
        };
    });

})(window, jQuery, window[FRAMEWORK_NAME]);
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
/*!
 * @author 김승일
 * @email comahead@vi-nyl.com
 * @description 이마트 코어 라이브러리
 * @license MIT License
 */
(function (ctx, $, core, undefined) {
    "use strict";


    /**
     * @namespace
     * @name vinyl.uri
     */
    core.addon('uri', /** @lends vinyl.uri */{

        /**
         * 주어진 url에 쿼리스츠링을 조합
         *
         * @param {String} url
         * @param {String:Object} string
         * @return {String}
         *
         * @example
         * vinyl.uri.addParam("board.do", {"a":1, "b": 2, "c": {"d": 4}}); => "board.do?a=1&b=2&c[d]=4"
         * vinyl.uri.addParam("board.do?id=123", {"a":1, "b": 2, "c": {"d": 4}}); => "board.do?id=123&a=1&b=2&c[d]=4"
         */
        addParam: function (url, string) {
            if (core.is(string, 'object')) {
                string = core.object.toQueryString(string);
            }
            if (!core.isEmpty(string)) {
                return url + (url.indexOf('?') === -1 ? '?' : '&') + string;
            }

            return url;
        },

        /**
         * 쿼리스트링을 객체로 변환
         *
         * @param {String} query
         * @return {Object}
         *
         * @example
         * vinyl.uri.parseQuery("a=1&b=2"); => {"a": 1, "b": 2}
         */
        parseQuery: function (query) {
            if (!query) {
                return {};
            }
            if (query.length > 0 && query.charAt(0) === '?') { query = query.substr(1); }

            var params = (query + '').split('&'),
                obj = {},
                params_length = params.length,
                tmp = '',
                i;

            for (i = 0; i < params_length; i++) {
                tmp = params[i].split('=');
                obj[decodeURIComponent(tmp[0])] = decodeURIComponent(tmp[1]).replace(/[+]/g, ' ');
            }
            return obj;
        },

        /**
         * url를 파싱하여 host, port, protocol 등을 추출
         *
         * @param {String} str url 문자열
         * @return {Object}
         *
         * @example
         * vinyl.uri.parseUrl("http://www.vinyl.com:8080/list.do?a=1&b=2#comment");
         * => {scheme: "http", host: "www.vinyl.com", port: "8080", path: "/list.do", query: "a=1&b=2"…}
         */
        parseUrl: (function() {
            var o = {
                strictMode: false,
                key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
                q: {
                    name: "queryKey",
                    parser: /(?:^|&)([^&=]*)=?([^&]*)/g
                },
                parser: {
                    strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
                    loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/\/?)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
                }
            };

            return function (str) {
                if (str.length > 2 && str[0] === '/' && str[1] === '/') {
                    str = window.location.protocol + str;
                }
                var m = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
                    uri = {}, i = 14;
                while (i--) { uri[o.key[i]] = m[i] || ""; }
                return uri;
            };
        })(),

        /**
         * 주어진 url에서 해쉬문자열 제거
         *
         * @param {String} url url 문자열
         * @return {String} 결과 문자열
         *
         * @example
         * vinyl.uri.removeHash("list.do#comment"); => "list.do"
         */
        removeHash: function (url) {
            return url ? url.replace(/#.*$/, '') : url;
        }
    });

})(window, jQuery, window[FRAMEWORK_NAME]);
/*!
 * @author common.util.js
 * @email comahead@vi-nyl.com
 * @create 2014-11-25
 * @license MIT License
 */
(function (ctx, $, core, undefined) {
    "use strict";

    /**
     * @namespace
     * @name vinyl.util
     */
    core.addon('util', function() {

        return /** @lends vinyl.util */{


            /**
             * ie하위버전에서 주어진 셀렉터에 해당하는 png 이미지가 정상적으로 출력되도록 AlphaImageLoader필터를 적용시켜 주는 함수
             * png
             */
            png24: function ( selector ) {
                var $target;
                if ( typeof (selector) == 'string') {
                    $target = $(selector + ' img');
                } else {
                    $target = selector.find(' img');
                }
                var c = new Array();
                $target.each(function(j) {
                    c[j] = new Image();
                    c[j].src = this.src;
                    if (navigator.userAgent.match(/msie/i))
                        this.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled='true',sizingMethod='scale',src='" + this.src + "')";
                });
            },

            /**
             * ie하위버전에서 페이지에 존재하는 모든 png 이미지가 정상적으로 출력되도록 AlphaImageLoader필터를 적용시켜 주는 함수
             * png Fix
             */
            pngFix: function () {
                var s, bg;
                $('img[@src*=".png"]', document.body).each(function () {
                    this.css('filter', 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + this.src + '\', sizingMethod=\'\')');
                    this.src = '/resource/images/core/blank.gif';
                });
                $('.pngfix', document.body).each(function () {
                    var $this = $(this);

                    s = $this.css('background-image');
                    if (s && /\.(png)/i.test(s)) {
                        bg = /url\("(.*)"\)/.exec(s)[1];
                        $this.css('background-image', 'none');
                        $this.css('filter', "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + bg + "',sizingMethod='scale')");
                    }
                });
            },

            /**
             * 페이지에 존재하는 플래쉬의 wmode모드를 opaque로 변경
             */
            wmode: function () {
                $('object').each(function () {
                    var $this;
                    if (this.classid.toLowerCase() === 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000' || this.type.toLowerCase() === 'application/x-shockwave-flash') {
                        if (!this.wmode || this.wmode.toLowerCase() === 'window') {
                            this.wmode = 'opaque';
                            $this = $(this);
                            if (typeof this.outerHTML === 'undefined') {
                                $this.replaceWith($this.clone(true));
                            } else {
                                this.outerHTML = this.outerHTML;
                            }
                        }
                    }
                });
                $('embed[type="application/x-shockwave-flash"]').each(function () {
                    var $this = $(this),
                        wm = $this.attr('wmode');
                    if (!wm || wm.toLowerCase() === 'window') {
                        $this.attr('wmode', 'opaque');
                        if (typeof this.outerHTML === 'undefined') {
                            $this.replaceWith($this.clone(true));
                        } else {
                            this.outerHTML = this.outerHTML;
                        }
                    }
                });
            },

            /**
             * 팝업을 띄우는 함수. (vinyl.openPopup으로도 사용가능)
             * @param {string} url 주소
             * @param {number=} width 너비.
             * @param {number=} height 높이.
             * @param {opts=} 팝업 창 모양 제어 옵션.
             */
            openPopup: function (url, width, height, opts) {
                opts = extend({

                }, opts);
                width = width || 600;
                height = height || 400;
                //var winCoords = vinyl.util.popupCoords(width, height),
                var target = opts.target || '',
                    feature = 'app_, ',
                    tmp = [];

                delete opts.name;
                for(var key in opts) {
                    tmp.push(key + '=' + opts[ key ]);
                }
                core.browser.isSafari && tmp.push('location=yes');
                tmp.push('height='+height);
                tmp.push('width='+width);
                /* + ', top=' + winCoords.top + ', left=' + winCoords.left;*/
                feature += tmp.join(', ');

                window.open(
                    url,
                    target,
                    feature
                );
            },

            /**
             * 팝업의 사이즈를 $el 사이즈에 맞게 조절
             */
            resizePopup: function($el) {
                if (!($el instanceof jQuery)) { $el = $($el); }
                window.resizeTo($el.width(), $el.height());
            },

            /**
             * 팝업의 사이즈에 따른 화면상의 중앙 위치좌표를 반환
             * @param {number} w 너비.
             * @param {number} h 높이.
             * @return {JSON} {left: 값, top: 값}
             */
            popupCoords: function (w, h) {
                var wLeft = window.screenLeft ? window.screenLeft : window.screenX,
                    wTop = window.screenTop ? window.screenTop : window.screenY,
                    wWidth = window.outerWidth ? window.outerWidth : document.documentElement.clientWidth,
                    wHeight = window.outerHeight ? window.outerHeight : document.documentElement.clientHeight;

                return {
                    left: wLeft + (wWidth / 2) - (w / 2),
                    top: wTop + (wHeight / 2) - (h / 2) - 25
                };
            },

            /**
             * data-src에 있는 이미지주소를 실제로 불러들인 다음, 주어진 사이즈내에서 가운데에 배치시켜주는 함수
             * @param {jQuery} $imgs
             * @param {Number} wrapWidth 최대 너비 값
             * @param {Number} wrapHeight 최대 높이 값
             * @param {Function} [onError] (optional) 이미지를 불어오지 못했을 경우 실행할 콜백함수
             * @return {Boolean} true 불러들인 이미지가 있었는지 여부
             */
            centeringImage: function ($imgs, wrapWidth, wrapHeight, onError) {
                var hasLazyImage = false;
                var dataSrcAttr = 'data-src';

                $imgs.filter('img[data-src]').each(function(i) {
                    var $img = $(this);
                    wrapWidth = wrapWidth || $img.parent().width();
                    wrapHeight = wrapHeight || $img.parent().height();

                    // 이미지가 로드되면, 실제 사이즈를 체크해서 가로이미지인지 세로이미지인지에 따라 기준이 되는 width, height에 지정한다.
                    $img.one('load', function() {
                        $img.removeAttr('width height').css({'width':'auto', 'height':'auto'});
                        if ($img.attr('data-no-height') === 'true' && this.width > wrapWidth) {
                            $img.css('width', wrapWidth);
                        } else if ($img.attr('data-no-width') === 'true' && this.height > wrapHeight) {
                            $img.css('height', wrapWidth);
                        } else {
                            var isHoriz = this.width > this.height;
                            if ( isHoriz ) { // 가로로 긴 이미지
                                $img.css('width', Math.min(this.width, wrapWidth));
                            } else { // 세로로 긴 이미지
                                $img.css('height', Math.min(this.height, wrapHeight));
                            }
                        }
                    }).attr('src', $img.attr('data-src')).removeAttr('data-src');
                });
                return hasLazyImage;
            },

            /**
             * data-src속성에 있는 이미지url를 src에 설정하여 로드시키는 함수
             * @param { jquery/string } target 이미지 요소
             * @param { jquery/string } loadingClip
             * @return { jquery } deferred
             */
            lazyImages: function(target, loadingClip) {
                var $imgs = $(target),
                    $loading = $(loadingClip),
                    len = $imgs.length,
                    def = $.Deferred();

                function loaded(e) {
                    if (e.type === 'error') {
                        def.reject(e.target);
                        return;
                    }
                    var $target;
                    if($target = $(this).data('target')) {
                        $target.css('background', 'url('+this.src+')');
                    }

                    len--;
                    if (!len) {
                        if ($loading) {
                            $loading.addClass("none");
                        }
                        def.resolve();
                    }
                }

                if(!len){
                    $loading.addClass("none");
                    def.resolve();
                } else {

                    if ($loading) {
                        $loading.removeClass("none");
                    }

                    $imgs.each(function(i) {
                        var $img = $imgs.eq(i);
                        if(!$img.is('img')) {
                            $img = $('<img>').data({
                                'target': $img[0],
                                'src': $img.attr('data-src')
                            });
                        }

                        $img.one("load.lazyload error.lazyload", loaded);
                        var src = $img.attr("data-src");

                        if (src) {
                            $img.attr("src", src);
                        } else if (this.complete) {
                            $img.trigger("load");
                        }
                    });

                }

                return def.promise();
            },

            // 정확한 사이즈계산을 위해 내부에 있는 이미지를 다 불러올 때까지 기다린다.
            waitImageLoad: function($imgs, allowError){
                var me = this,
                    defer = $.Deferred(),
                    count = $imgs.length,
                    loaded = function() {
                        count -= 1;
                        if(count <= 0){
                            defer.resolve();
                        }
                    };

                if(count === 0) {
                    defer.resolve();
                } else {
                    $imgs.each(function(i) {
                        if(this.complete){
                            loaded();
                        } else {
                            $imgs.eq(i).one('load' + (allowError === false?'' : ' error'), loaded);
                        }
                    });
                }

                return defer.promise();
            },

            /**
             * 도큐먼트의 높이를 반환
             * @return {Number}
             */
            getDocHeight: function() {
                var doc = document,
                    bd = doc.body,
                    de = doc.documentElement;

                return Math.max(
                    Math.max(bd.scrollHeight, de.scrollHeight),
                    Math.max(bd.offsetHeight, de.offsetHeight),
                    Math.max(bd.clientHeight, de.clientHeight)
                );
            },

            /**
             * 도큐먼트의 너비를 반환
             * @return {Number}
             */
            getDocWidth: function() {
                var doc = document,
                    bd = doc.body,
                    de = doc.documentElement;
                return Math.max(
                    Math.max(bd.scrollWidth, de.scrollWidth),
                    Math.max(bd.offsetWidth, de.offsetWidth),
                    Math.max(bd.clientWidth, de.clientWidth)
                );
            },

            /**
             * 창의 너비를 반환
             * @return {Number}
             */
            getWinWidth : function() {
                var w = 0;
                if (self.innerWidth) {
                    w = self.innerWidth;
                } else if (document.documentElement && document.documentElement.clientHeight) {
                    w = document.documentElement.clientWidth;
                } else if (document.body) {
                    w = document.body.clientWidth;
                }
                return w;
            },

            /**
             * 창의 높이를 반환
             * @return {Number}
             */
            getWinHeight : function() {
                var w = 0;
                if (self.innerHeight) {
                    w = self.innerHeight;
                } else if (document.documentElement && document.documentElement.clientHeight) {
                    w = document.documentElement.clientHeight;
                } else if (document.body) {
                    w = document.body.clientHeight;
                }
                return w;
            },


            /**
             * @function scroll top animate
             * @param { Integer } y target y
             * @param { Integer } data.triggerY
             * @param { Integer } data.duration
             * @param { function } data.triggerCallback
             * @param { function } data.completeCallback
             */
            scrollTopAnimate: function( y, data ){
                var $body = $("body");
                var duration = ( data == undefined || data.duration == undefined  ) ? 200 : data.duration;

                var isTrigger = false;
                var triggerFuncExe = function(){
                    if( data && data.triggerY != undefined && data.triggerY != "" && $body.scrollTop() < data.triggerY && !isTrigger){
                        isTrigger = true;
                        if( data && data.triggerCallback ){
                            data.triggerCallback();
                        }
                    }
                }

                $body.stop().animate({scrollTop:y}, {duration:duration,
                    step:function(){
                        triggerFuncExe();
                    }, complete:function(){
                        triggerFuncExe();
                        if( data && data.completeCallback ){
                            data.completeCallback();
                        }
                    }, ease: "easeOutQuad"
                });
            },

            /**
             * 주어진 요소의 사이즈 & 위치를 반환
             * @param elem
             * @returns {JSON} {width: 너비, height: 높이, offset: { top: 탑위치, left: 레프트위치}}
             */
            getDimensions: function( elem ) {
                var el = elem[0];
                if ( el.nodeType === 9 ) {
                    return {
                        width: elem.width(),
                        height: elem.height(),
                        offset: { top: 0, left: 0 }
                    };
                }
                if ( $.isWindow( el ) ) {
                    return {
                        width: elem.width(),
                        height: elem.height(),
                        offset: { top: elem.scrollTop(), left: elem.scrollLeft() }
                    };
                }
                if ( el.preventDefault ) {
                    return {
                        width: 0,
                        height: 0,
                        offset: { top: el.pageY, left: el.pageX }
                    };
                }
                return {
                    width: elem.outerWidth(),
                    height: elem.outerHeight(),
                    offset: elem.offset()
                };
            },

            bindCheckAll: function(el) {
                var $con = $(el);

                // 전체 선택
                $con.on('click.globalui', ' input:checkbox:enabled', function (e) {
                    var $el = $(this),
                        $checkes = $con.find('input:checkbox:enabled:not(.d-notcheck)'),
                        $checkAll = $checkes.filter('.d-checkall'),
                        $others = $checkes.not('.d-checkall');

                    if($el.hasClass('d-checkall')) {
                        $others.prop('checked', this.checked);
                    } else {
                        $checkAll.prop('checked', $others.not(':checked').size() === 0);
                    }
                    $checkAll.triggerHandler('checkallchanged');
                });

            },

            getFileName: function(str) {
                var paths = str.split(/\/|\\/g);
                return paths[paths.length - 1];
            },

            // 컨텐츠 사이즈에 맞게 창사이즈 조절
            resizeToContent: function() {
                var innerX, innerY,
                    pageX, pageY,
                    win = window,
                    doc = win.document;

                if (win.innerHeight) {
                    innerX = win.innerWidth;
                    innerY = win.innerHeight;
                } else if (doc.documentElement && doc.documentElement.clientHeight) {
                    innerX = doc.documentElement.clientWidth;
                    innerY = doc.documentElement.clientHeight;
                } else if (doc.body) {
                    innerX = doc.body.clientWidth;
                    innerY = doc.body.clientHeight;
                }

                pageX = doc.body.offsetWidth;
                pageY = doc.body.offsetHeight;

                win.resizeBy(pageX - innerX, pageY - innerY);
            },

            /**
             * 팝업 뛰우기
             */
            openPopup2: function(url, feature, callback) {
                feature = $.extend(feature,  {
                    name: 'popupWin',
                    width: 600,
                    height: 531,
                    align: 'center',
                    resizable: 'no',
                    scrollbars: 'no'
                });
                var f = [];
                core.each(feature, function(val, key){
                    f.push(key + '=' + val);
                });

                var popupWin = window.open('', feature.name, f.join(','));
                if (!popupWin || popupWin.outerWidth === 0 || popupWin.outerHeight === 0) {
                    alert("팝업 차단 기능이 설정되어있습니다\n\n차단 기능을 해제(팝업허용) 한 후 다시 이용해 주십시오.");
                    return;
                }

                if (popupWin.location.href === 'about:blank') {
                    popupWin.location.href = url;
                }

                var limit = 0,
                    fn = function() {
                        if (limit++ > 50) {
                            return;
                        }
                        if (!popupWin.document.body) {
                            setTimeout(fn, 100);
                            return;
                        }
                        callback && callback(popupWin);
                        popupWin.focus();
                    };

                if (!popupWin.document.body) {
                    setTimeout(fn, 100);
                } else {
                    fn();
                }
            }
            /**
             *
             * @param {String} scriptUrl URL
             * @param {Function} [callback] 콜백
             * @return {Deferred} deferred
             */
            /*
             loadScript: (function() {
             var doc = document,
             loaded = {};

             return function(url, callback) {
             var defer = $.Deferred();
             if(loaded[url]){
             callback&&callback();
             defer.resolve(url)
             return defer.promise();
             }

             var script = document.createElement('script');

             script.type = 'text/javascript';
             script.async = true;

             script.onerror = function() {
             defer.reject(url);
             //throw new Error(url + ' not loaded');
             };

             script.onreadystatechange = script.onload = function (e) {
             e = context.event || e;

             if (e.type == 'load' || this.readyState.test(/loaded|complete/)) {
             this.onreadystatechange = null;
             callback&&callback();
             defer.resolve(url);
             }
             };

             script.src = url;
             doc.getElementsByTagName('head')[0].appendChild(script);
             return defer.promise();
             };
             })()*/
        };
    });
    /**
     * vinyl.util.openPopup 함수의 별칭
     * @name vinyl.openPopup
     */
    core.openPopup = core.util.openPopup;
})(window, jQuery, window[FRAMEWORK_NAME]);
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
             * @return {String}
             */
            vendor: _vendor,
            /**
             * 주어진 css속성을 지원하는지 체크
             *
             * @param {String} cssName 체크하고자 하는 css명
             * @return {Boolean} 지원여부
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
             * @param {String} cssName css명
             * @return {String}
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
})(window, jQuery, window[FRAMEWORK_NAME]);
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
/*!
 * @author common.globalevents.js
 * @email comahead@vi-nyl.com
 * @create 2014-11-25
 * @license MIT License
 */
(function (ctx, $, core, undefined) {
    "use strict";

    var $doc = core.$doc,
        win = window,
        _isInit = false;

    /**
     * 주어진 엘리먼트 하위에 탭, 아코디온, 달력, Placeholder 관연요소가 있을 때 해당 UI모듈을 빌드해준다.
     * @function
     * @name $#buildUIControls
     * @param {String} types (Optional) "tab,selectbox,calendar,placeholder"
     * @example
     * $.ajax(...).done(function(html) {
	 *    $('#box').html(html).buildUIControls();
	 *    // 동적으로 새로 추가된 컨텐츠에 탭이나 아코디온이 존재할 경우 이 메소드를 호출해주어야 각 기능들이 작동한다.
	 * });
     */
    $.fn.buildUIControls = function() {
        //this.find('.d-selectbox').selectbox();   // 셀렉트박스 스킨모드로 변경
        this.find('.d-tab').tab();               // 탭
        this.find('.d-calendar').calendar();     // 달력
        this.find('.d-accordion').accordion();    // 아코디온
        if(!('placeholder' in core.tmpInput)) {   // placeholder
            this.find('input[placeholder], textarea[placeholder]').placeholder();
        }
    };


    /**
     * 글로벌 이벤트 정의(인쇄, 전체선택, 공유하기, 공통 UI 빌드 등)
     * @name vinyl.GlobalUI
     */
    core.GlobalUI = /** @lends vinyl.GlobalUI */{
        init: function() {
            if(_isInit) { return; }

            this.base();
            this.hover();
            this.modal();
            this.close();
            this.print();
            this.link();
            this.buttonPressed();
            this.checkAll();
            this.sns();
        },

        /**
         * 탭, 커스텀셀렉트박스, 달력, 플레이스홀더, 아코디온 등의 공통 기능을 바인딩
         */
        base: function() {
            // tab, selectbox, calendar, placeholder
            $doc.buildUIControls();
        },

        /**
         * 1. 버튼에 링크기능 바인딩(_self:현재창, _blank: 팝업, _modal: 모달레이어)
         * 2. [data-control=toggle], .d-toggle에 해당하는 요소를 클릭했을 때 next에 있는 요소를 토글링해준다.(드롭다운 레이어)
         */
        link: function(){
            // 버튼에 링크기능 추가
            $doc.on("click.globalui", "button[data-href], a[data-target]", function(e){
                e.preventDefault();

                var $el = $(this),
                    href = $el.attr("data-href") ||  $el.attr("href"),
                    target = $el.attr("data-target");

                if(!href){ return; }

                switch( target ){
                    case "_self":
                        window.location.assign(href);
                        break;
                    case "_blank":
                        window.open(href, target, $el.attr('data-options') || '');
                        break;
                    case "_modal":
                        core.ui.ajaxModal(href, {opener: $el});
                        break;
                    default :
                        window.location.assign(href);
                }
            });

            $doc.on('click.globalui', 'a.disabled', function(e) {
                e.preventDefault();
                e.stopPropagation();
            });

            // 드롭다운 레이어 바인딩
            // ex) <button class="d-toggle" data-target="#box">보기</button><div class="none" id="box">...</div>
            $doc.on('click.globalui', '[data-control=toggle], .d-toggle', (function() {
                var $layer = $(),
                    $btn = $();

                function hideLayer() {
                    $layer.addClass('none');
                    $btn.removeClass('on');
                    $doc.off('click.togglelayer');
                }

                return function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    var $el = $(this),
                        target = $el.attr('data-target') || core.uri.removeHash($el.attr('href')),
                        $target = target ? $( target ) : $el.next('div');

                    if($target.length === 0){ return; }
                    if($target[0] != $layer[0]) { hideLayer(); }

                    var isShow = !$target.hasClass('none');
                    if(!isShow) {
                        // 레이어영역 밖을 클릭했을 때 레이어가 닫히도록
                        $doc.off('click.togglelayer').on('click.togglelayer', function(e) {
                            if(($layer[0] !== e.target && !$.contains($layer[0], e.target)) || $(e.target).hasClass('d-close')) {
                                //e.preventDefault();
                                hideLayer();
                                $btn.focus();
                            }
                        });
                    }
                    $layer = $target.addClass('d-togglelayer').toggleClass('none', isShow);
                    $btn = $el.toggleClass('on', !isShow);

                    $layer.triggerHandler(isShow ? 'hidelayer' : 'showlayer');
                };
            })());
        },

        /**
         * a 링크에 버튼눌림과 같은 효가를 주기 위해 마우스다운 시 active클래스를 추가, 마우스업 때 제거
         */
        buttonPressed: function() {
            // 버튼 눌림효과

            // 터치디바이스에서는 무시함
            /*if(!core.browser.isOldIE){
             return;
             }*/

            // 버튼 pressed 효과
            $doc.on('mousedown.globalui mouseup.globalui mouseleave.globalui click.globalui', '.d-active', function(e) {
                var $el = $(this);

                if($el.hasClass('disabled')) {
                    return;
                }

                switch(e.type) {
                    case 'mousedown':
                        $el.addClass('active');
                        break;
                    default:
                        $el.removeClass('active');
                        break;
                }
            });
        },

        /**
         * a 이외에 요소에 효버효과를 바인딩(ie하위버전에서 a이외에 :hover가 있으면 freezing 현상이 발생)
         */
        hover: function() {
            // 터치디바이스에서는 무시함
            if(core.browser.isTouch){
                return;
            }

            // 호버 효과
            $doc.on('mouseenter.globalui', '.d-hover', function(e) {
                $(this).addClass('hover');
            });

            $doc.on('mouseleave.globalui', '.d-hover', function(e) {
                $(this).removeClass('hover');
            });
        },

        /**
         * 전체선택 체크박스(테이블 태그 내)
         *
         */
        checkAll: function() {
            var me = this;

            // 전체 선택
            $doc.on('click.globalui', 'thead input:checkbox, tbody input:checkbox', function (e) {
                var $check = $(this),
                    $table = $check.closest('table'),
                    $thead = $table.find('>thead'),
                    $tbody = $table.find('>tbody'),
                    isInHead = $thead.length > 0;

                if($check.closest('thead').length) {
                    $tbody.find('input:checkbox:enabled:not(.d-notcheck)').prop('checked', this.checked);
                } else {
                    if($tbody.find('input:checkbox:not(:checked)').length) {
                        $thead.find('input:checkbox').prop('checked', false);
                    } else {
                        $thead.find('input:checkbox').prop('checked', true);
                    }
                }

                $thead.find('input:checkbox').triggerHandler('checkallchanged');
            });
        },

        /**
         * 1. 윈도우 창 닫기 기능 바인딩
         * 2. 레이어 닫기
         */
        close: function(){
            //윈도우 창 닫기 기능
            $doc.on("click.globalui", ".d-win-close", function(e){
                e.preventDefault();

                self.close();
            });

            // 레이어 닫기
            $doc.on("click.globalui", ".d-layer .d-close", function(e){
                e.preventDefault();

                $(this).closest('.d-layer').toggle( !$(this).closest('.d-layer').is(':visible') );
            });
        },

        /**
         * 버튼에 d-print를 추가해주면 인쇄 기능이 바인딩
         */
        print: function(){
            //인쇄 기능
            $doc.on("click.globalui", ".d-print", function(e) {
                e.preventDefault();
                if(this.getAttribute('data-frame')){
                    try {
                        win.frames[this.getAttribute('data-frame')].print();
                    } catch(e){alert(e)}
                } else {
                    win.print();
                }
            });
        },

        /**
         * 버튼에 data-control=modal를 추가해줌으로써 next에 있는 div를 모달로 띄워준다.
         */
        modal: function() {
            // 모달 띄우기
            $.fn.modal && $doc.on('click.globalui', '[data-control=modal]', function(e) {
                e.preventDefault();
                var $el = $(this),
                    target = $el.attr('href') || $el.attr('data-target'),
                    $modal;
                if(target){
                    // ajax형 모달인 경우
                    if(!/^#/.test(target)) {
                        $.ajax({
                            url: target
                        }).done(function(html) {
                            $modal = $('<div class="d-modal-ajax d-modal-new" style="display:none"></div>').html(html).appendTo('body');
                            $modal.modal({opener: $el, removeOnClose:true});
                        });
                        return;
                    } else {
                        $modal = $(target);
                    }
                } else {
                    $modal = $(this).next('div.d-layerpop');
                }

                if($modal && $modal.length > 0) {
                    $modal.modal({opener: $el});
                }
            });

            // ajax로 생성된 레이어팝업이면 표시때, 내부에 속한 공통 UI 들을 빌드
            $doc.on('modalshown.globalui', '.d-modal-new', function(e) {
                $(this).buildUIControls().removeClass('d-modal-new');
            });
        },

        sns: function() {
            var types = core.object.keys(core.sns.types);

            $doc.on('click.globalui', core.array.map(types, function(val) { return '.d-'+val; }).join(', '), function(e) {
                e.preventDefault();

                var $el = $(this),
                    url = $el.attr('href') || $el.attr('data-url') || location.href,
                    title = $el.attr('data-title') || document.title,
                    desc = $el.attr('data-desc') || $('head meta[property$=description]').attr('content') || $('head meta[name=description]').attr('content') || '',
                    image = $el.attr('data-image') || $('head meta[property$=image]').attr('content') || '',
                    service = $el.attr('data-service');

                if(!service){
                    core.each(types, function(name) {
                        if($el.hasClass('d-'+name)) {
                            service = name;
                            return false;
                        }
                    });
                    if(!service) {
                        alert('공유할 SNS타입을 지정해주세요.');
                        return;
                    }
                }

                core.sns.share(service, {url: url, title:title, desc: desc, image: image});
            });
        }
    };


})(window, jQuery, window[FRAMEWORK_NAME]);
/*!
 * @author common.ui.js
 * @email comahead@vi-nyl.com
 * @create 2014-12-02
 * @license MIT License
 */
(function (ctx, $, core, undefined) {
    "use strict";

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var View;		// vinyl.ui.View

    /**
     * ui 관련 네임스페이스
     * @name vinyl.ui
     * @param name
     * @param attr
     * @returns {*}
     */
    core.ui = function(/*String*/name, supr, /*Object*/attr) {
        var bindName, Klass;

        if(!attr) {
            attr = supr;
            supr = null;
        }
        if(typeof supr === 'string'){
            supr = core.ui[supr];
        } else if(attr.$extend) {
            supr = attr.$extend
        } else if(supr && supr.superclass) {
            // supr = supr;
        } else {
            supr = core.ui.View;
        }

        if(core.is(attr, 'function')) {
            if(!core.is(attr = attr(supr), 'function')) {
                bindName = attr.bindjQuery;
                Klass = supr.extend(attr);
            } else {
                Klass = attr;
            }
        } else {
            bindName = attr.bindjQuery;
            Klass = supr.extend(attr);
        }

        Klass.prototype.name = name;
        core.addon('ui.' + name, Klass);
        if (bindName) {
            core.bindjQuery(Klass, bindName);
        }
        return Klass;
    };

    core.addon('ui', /** @lends vinyl.ui */{
        /**
         * 작성된 UI모듈을 jQuery의 플러그인으로 사용할 수 있도록 바인딩시켜 주는 함수
         *
         * @param {Class} Klass 클래스
         * @param {String} name 플러그인명
         *
         * @example
         * // 클래스 정의
         * var Slider = vinyl.ui.View({
		 *   initialize: function(el, options) { // 생성자의 형식을 반드시 지킬 것..(첫번째 인수: 대상 엘리먼트, 두번째
		 *   인수: 옵션값들)
		 *   ...
		 *   },
		 *   ...
		 * });
         * vinyl.ui.bindjQuery(Slider, 'hibSlider');
         * // 실제 사용시
         * $('#slider').hibSlider({count: 10});
         */
        bindjQuery: function (Klass, name) {
            var old = $.fn[name];

            $.fn[name] = function (options) {
                var a = arguments,
                    args = arraySlice.call(a, 1),
                    me = this,
                    returnValue = this;

                this.each(function() {
                    var $this = $(this),
                        methodValue,
                        instance = $this.data('ui_'+name);

                    if(instance && options === 'release') {
                        try { instance.release(); } catch(e){}
                        $this.removeData('ui_'+name);
                        return;
                    }

                    if ( !instance || (a.length === 1 && typeof options !== 'string')) {
                        instance && (instance.release(), instance = null);
                        $this.data('ui_'+name, (instance = new Klass(this, extend({}, $this.data(), options), me)));
                    }

                    if(options === 'instance'){
                        returnValue = instance;
                        return false;
                    }

                    if (typeof options === 'string' && core.is(instance[options], 'function')) {
                        if(options[0] === '_') {
                            throw new Error('[bindjQuery] private 메소드는 호출할 수 없습니다.');
                        }

                        try {
                            methodValue = instance[options].apply(instance, args);
                        } catch(e) {
                            console.error('[name.'+options+' error] ' + e);
                        }

                        if (methodValue !== instance && methodValue !== undefined) {
                            returnValue = methodValue;
                            return false;
                        }
                    }
                });
                return returnValue;
            };

            // 기존의 모듈로 복구
            $.fn[name].noConflict = function() {
                $.fn[name] = old;
                return this;
            };
        }
    });

    core.ui.setDefaults = function(name, opts) {
        $.extend(true, core.ui[name].prototype.defaults, opts);
    };

    View = core.addon('ui.View', function () {
        var execObject = function(obj, ctx) {
            return core.is(obj, 'function') ? obj.call(ctx) : obj;
        };

        function setUIName($el, name) {
            $el.attr('ui-modules', (function(modules) {
                var arr;
                if(modules) {
                    arr = modules.split(',');
                } else {
                    arr = [];
                }
                arr.push(name);
                return arr.join(',');
            })($el.attr('ui-modules')));
        }

        /**
         * 모든 UI요소 클래스의 최상위 클래스로써, UI클래스를 작성함에 있어서 편리한 기능을 제공해준다.
         * @class
         * @name vinyl.ui.View
         *
         * @example
         *
         * var Slider = Class({
		 *		$extend: vinyl.ui.View,
		 *		// 기능1) events 속성을 통해 이벤트핸들러를 일괄 등록할 수 있다. ('이벤트명 selector': '핸들러함수명')
		 *	events: {
		 *		click ul>li.item': 'onItemClick',		// this.$el.on('click', 'ul>li.item', this.onItemClick.bind(this)); 를 자동 수행
		 *		'mouseenter ul>li.item>a': 'onMouseEnter'	// this.$el.on('mouseenter', 'ul>li.item>a', this.onMouseEnter.bind(this)); 를 자동 수행
		 *	},
		 *	// 기능2) selectors 속성을 통해 지정한 selector에 해당하는 노드를 주어진 이름의 멤버변수에 자동으로 설정해 준다.
		 *	selectors: {
		 *		box: 'ul',			// this.$box = this.$el.find('ul') 를 자동수행
		 *		items: 'ul>li.item',	// this.$items = this.$el.find('ul>li.item') 를 자동수행
		 *		prevBtn: 'button.prev', // this.$prevBtn = this.$el.find('button.prev') 를 자동 수행
		 *		nextBtn: 'button..next' // this.$nextBtn = this.$el.find('button.next') 를 자동 수행
		 *	},
		 *	initialize: function(el, options) {
		 *	this.supr(el, options);	// 기능4) this.$el, this.options가 자동으로 설정된다.
		 *	},
		 *	onItemClick: function(e) {
		 *		...
		 *	},
		 *	onMouseEnter: function(e) {
		 *		...
		 *	}
		 * });
         *
         * new vinyl.ui.Slider('#slider', {count: 10});
         */
        var View = core.Base.extend(/** @lends vinyl.ui.View# */{
            $statics: {
                _instances: [] // 모든 인스턴스를 갖고 있는다..
            },
            /**
             * 생성자
             * @param {String|Element|jQuery} el 해당 엘리먼트(노드, id, jQuery 어떤 형식이든 상관없다)
             * @param {Object} options 옵션값
             * @return {Mixes} false 가 반환되면, 이미 해당 엘리먼트에 해당 모듈이 빌드되어 있거나 disabled 상태임을 의미한다.
             */
            initialize: function (el, options) {
                options || (options = {});

                var me = this,
                    eventPattern = /^([a-z]+) ?([^$]*)$/i,
                    moduleName, superClass;

                if(!el) {
                    throw new Error('[ui.View] el객체가 없습니다.');
                }

                if (!me.name) {
                    throw new Error('[ui.View] 클래스의 이름이 없습니다');
                }

                moduleName = me.moduleName = core.string.toFirstLower(me.name);
                me.$el = el instanceof jQuery ? el : $(el);

                // 강제로 리빌드 시킬 것인가 ///////////////////////////////////////////////////////////////
                if (options.rebuild === true) {
                    try { me.$el.data('ui_'+moduleName).release(); } catch(e) {}
                    me.$el.removeData('ui_'+moduleName);
                } else {
                    // 이미 빌드된거면 false 반환 - 중복 빌드 방지
                    if (me.$el.data('ui_'+moduleName) ) {
                        return false;
                    }
                    me.$el.data('ui_'+moduleName, this);
                }


                // disabled상태면 false 반환
                if (me.$el.hasClass('disabled') || me.$el.attr('data-readony') === 'true' || me.$el.attr('data-disabled') === 'true') {
                    return false;
                }

                superClass = me.constructor.superclass;
                // TODO
                View._instances.push(me);
                me.el = me.$el[0];  // 원래 엘리먼트도 변수에 설정
                me.options = $.extend(true, {}, superClass.defaults, me.defaults, me.$el.data(), options);			// 옵션 병합
                me.cid = moduleName + '_' + core.nextSeq();    // 객체 고유 키
                me.subViews = {};   // 하위 컨트롤를 관리하기 위함
                me._eventNamespace = '.' + /*moduleName*/ me.cid;	// 객체 고유 이벤트 네임스페이스명

                setUIName(me.$el, me.name);
                me.updateSelectors();

                // events 속성 처리
                // events: {
                //	'click ul>li.item': 'onItemClick', //=> this.$el.on('click', 'ul>li.item', this.onItemClick); 으로 변환
                // }
                me.options.events = core.extend({},
                    execObject(me.events, me),
                    execObject(me.options.events, me));
                core.each(me.options.events, function (value, key) {
                    if (!eventPattern.test(key)) { return false; }

                    var name = RegExp.$1,
                        selector = RegExp.$2,
                        args = [name],
                        func = isFn(value) ? value : (isFn(me[value]) ? me[value] : core.emptyFn);

                    if (selector) { args[args.length] = $.trim(selector); }

                    args[args.length] = function () {
                        func.apply(me, arguments);
                    };
                    me.on.apply(me, args);
                });

                // options.on에 지정한 이벤트들을 클래스에 바인딩
                me.options.on && core.each(me.options.on, function (value, key) {
                    me.on(key, value);
                });

            },

            /**
             * this.selectors를 기반으로 엘리먼트를 조회해서 멤버변수에 셋팅
             * @returns {vinyl.ui.View}
             */
            updateSelectors: function () {
                var me = this;
                // selectors 속성 처리
                // selectors: {
                //  box: 'ul',			// => this.$box = this.$el.find('ul');
                //  items: 'ul>li.item'  // => this.$items = this.$el.find('ul>li.item');
                // }
                me.selectors = core.extend({},
                    execObject(me.constructor.superclass.selectors, me),
                    execObject(me.selectors, me),
                    execObject(me.options.selectors, me));
                core.each(me.selectors, function (value, key) {
                    if (typeof value === 'string') {
                        me['$' + key] = me.$el.find(value);
                    } else if (value instanceof jQuery) {
                        me['$' + key] = value;
                    } else {
                        me['$' + key] = $(value);
                    }
                    me.subViews['$' + key] = me['$' + key];
                });

                return me;
            },

            /**
             * this.$el하위에 있는 엘리먼트를 조회
             * @param {String} selector 셀렉터
             * @returns {jQuery}
             */
            $: function (selector) {
                return this.$el.find(selector);
            },

            /**
             * 파괴자
             */
            release: function () {
                var me = this;

                me.$el.off(me._eventNamespace);
                me.$el.removeData(me.moduleName);

                // me.subviews에 등록된 자식들의 파괴자 호출
                core.each(me.subViews, function(item, key) {
                    if (key.substr(0, 1) === '$') {
                        item.off(me._eventNamespace);
                    } else {
                        item.release && item.release();
                    }
                    me.subViews[key] = null;
                });

                core.array.remove(View._instances, me);
            },

            /**
             * 옵션 설정함수
             *
             * @param {String} name 옵션명
             * @param {Mixed} value 옵션값
             */
            setOption: function(name, value) {
                this.options[name] = value;
            },

            /**
             * 옵션값 반환함수
             *
             * @param {String} name 옵션명
             * @param {Mixed} def 옵션값이 없을 경우 기본값
             * @return {Mixed} 옵션값
             */
            getOption: function(name, def) {
                return (name in this.options && this.options[name]) || def;
            },

            /**
             * 인자수에 따라 옵션값을 설정하거나 반환해주는 함수
             *
             * @param {String} name 옵션명
             * @param {Mixed} value (Optional) 옵션값: 없을 경우 name에 해당하는 값을 반환
             * @return {Mixed}
             * @example
             * $('...').tabs('option', 'startIndex', 2);
             */
            option: function(name, value) {
                if (typeof value === 'undefined') {
                    return this.getOption(name);
                } else {
                    this.setOption(name, value);
                    this.triggerHandler('optionchange', [name, value]);
                }
            },

            /**
             * 이벤트명에 현재 클래스 고유의 네임스페이스를 붙여서 반환 (ex: 'click mousedown' -> 'click.MyClassName mousedown.MyClassName')
             * @private
             * @param {String} eventNames 네임스페이스가 없는 이벤트명
             * @return {String} 네임스페이스가 붙어진 이벤트명
             */
            _normalizeEventNamespace: function(eventNames) {
                if (eventNames instanceof $.Event) {
                    return eventNames;
                }

                var me = this,
                    m = (eventNames || "").split( /\s/ );
                if (!m || !m.length) {
                    return eventNames;
                }

                var name, tmp = [], i;
                for(i = -1; name = m[++i]; ) {
                    if (name.indexOf('.') === -1) {
                        tmp.push(name + me._eventNamespace);
                    } else {
                        tmp.push(name);
                    }
                }
                return tmp.join(' ');
            },

            /**
             * 현재 클래스의 이벤트네임스페이스를 반환
             * @return {String} 이벤트 네임스페이스
             */
            getEventNamespace: function() {
                return this._eventNamespace;
            },

            proxy: function(fn){
                var me = this;
                return function(){
                    return fn.apply(me, arguments);
                };
            },


            /**
             * me.$el에 이벤트를 바인딩
             */
            on: function() {
                var args = arraySlice.call(arguments);
                args[0] = this._normalizeEventNamespace(args[0]);

                this.$el.on.apply(this.$el, args);
                return this;
            },

            /**
             * me.$el에 등록된 이벤트를 언바인딩
             */
            off: function() {
                var args = arraySlice.call(arguments);
                this.$el.off.apply(this.$el, args);
                return this;
            },

            /**
             * me.$el에 일회용 이벤트를 바인딩
             */
            one: function() {
                var args = arraySlice.call(arguments);
                args[0] = this._normalizeEventNamespace(args[0]);

                this.$el.one.apply(this.$el, args);
                return this;
            },

            /**
             * me.$el에 등록된 이벤트를 실행
             */
            trigger: function() {
                var args = arraySlice.call(arguments);
                this.$el.trigger.apply(this.$el, args);
                return this;
            },

            /**
             * me.$el에 등록된 이벤트 핸들러를 실행
             */
            triggerHandler: function() {
                var args = arraySlice.call(arguments);
                this.$el.triggerHandler.apply(this.$el, args);
                return this;
            },

            /**
             * 해당 엘리먼트에 바인딩된 클래스 인스턴스를 반환
             * @return {Class}
             * @example
             * var tabs = $('div').Tabs('instance');
             */
            instance: function() {
                return this;
            },

            /**
             * 해당 클래스의 소속 엘리먼트를 반환
             * @return {jQuery}
             */
            getElement: function() {
                return this.$el;
            },

            show: function(){},
            hide: function(){},
            disabled: function(){},
            enabled: function(){}
        });

        return View;
    });

})(window, jQuery, window[FRAMEWORK_NAME]);