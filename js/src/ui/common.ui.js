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