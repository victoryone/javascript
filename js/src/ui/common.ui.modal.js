/*!
 * @author common.ui.modal.js
 * @email comahead@vi-nyl.com
 * @create 2014-11-25
 * @license MIT License
 */
(function (ctx, $, core, undefined) {
    "use strict";
    var $doc = core.$doc,
        $win = core.$win,
        browser = core.browser,
        ui = core.ui,
        isTouch = browser.isTouch;

    // Modal ////////////////////////////////////////////////////////////////////////////
    /**
     * 모달 클래스<br />
     * // 기본 옵션 <br />
     * options.overlay:true 오버레이를 깔것인가<br />
     * options.clone: true  복제해서 띄울 것인가<br />
     * options.closeByEscape: true  // esc키를 눌렀을 때 닫히게 할 것인가<br />
     * options.removeOnClose: false // 닫을 때 dom를 삭제할것인가<br />
     * options.draggable: true              // 드래그를 적용할 것인가<br />
     * options.dragHandle: 'h1.title'       // 드래그대상 요소<br />
     * options.show: true                   // 호출할 때 바로 표시할 것인가...
     *
     * @class
     * @name vinyl.ui.Modal
     * @extends vinyl.ui.View
     * @example
     */
    var Modal = ui('Modal', /** @lends vinyl.ui.Modal# */{
        bindjQuery: 'modal',
        $statics: /** @lends vinyl.ui.Modal */{
            /**
             * 모달 생성시 발생되는 이벤트
             * @static
             */
            ON_CREATED: 'modalcreated',
            /**
             * 모달 표시 전에 발생되는 이벤트
             * @static
             */
            ON_SHOW:'modalshow',
            /**
             * 모달 표시 후에 발생되는 이벤트
             * @static
             */
            ON_SHOWN:'modalshown',    // 표시 후
            /**
             * 모달이 숨기기 전에 발생되는 이벤트
             * @static
             */
            ON_HIDE:'modalhide',          // 숨기기 전
            /**
             * 모달이 숨겨진 후에 발생되는 이벤트
             * @static
             */
            ON_HIDDEN: 'modalhidden'  // 숨긴 후
        },
        defaults: {
            overlay: true,
            clone: true,
            closeByEscape: true,
            removeOnClose: false,
            draggable: true,
            dragHandle: 'header h1',
            show: true,

            cssTitle: '.d-modal-title'
        },

        events: {
            'click button[data-role]': function (e) {
                var me = this,
                    $btn = $(e.currentTarget),
                    role = ($btn.attr('data-role') || ''),
                    e;

                if (role) {
                    me.triggerHandler(e = $.Event(role), [me]);
                    if(e.isDefaultPrevented()){
                        return;
                    }
                }

                this.hide();
            },
            'click .d-close': function(e) {
                e.preventDefault();
                e.stopPropagation();

                this.hide();
            }
        },
        /**
         * 생성자
         * @constructors
         * @param {String|Element|jQuery} el
         * @param {Object} options
         * @param {Boolean}  options.overlay:true 오버레이를 깔것인가
         * @param {Boolean}  options.clone: true    복제해서 띄울 것인가
         * @param {Boolean}  options.closeByEscape: true    // esc키를 눌렀을 때 닫히게 할 것인가
         * @param {Boolean}  options.removeOnClose: false   // 닫을 때 dom를 삭제할것인가
         * @param {Boolean}  options.draggable: true                // 드래그를 적용할 것인가
         * @param {Boolean}  options.dragHandle: 'h1.title'     // 드래그대상 요소
         * @param {Boolean}  options.show: true                 // 호출할 때 바로 표시할 것인가...
         */
        initialize: function(el, options) {
            var me = this;
            if(me.callParent(el, options) === false) {
                return me.release();
            }

            // 열릴때 body로 옮겼다가, 닫힐 때 다시 원복하기 위해 임시요소를 넣어놓는다.
            me._createHolder();

            me.isShown = false;
            me._originalDisplay = me.$el.css('display');

            if(me.options.remote) {
                me.$el.load(me.options.remote).done(function(){
                    me.options.show && core.util.waitImageLoad(me.$el.find('img')).done(function() {
                        me.show();
                    });
                });
            } else {
                me.options.show && core.util.waitImageLoad(me.$el.find('img')).done(function() {
                    me.show();
                });
            }


            // TODO
            me.$el.attr({
                'role': 'dialog',
                'aria-hidden': 'false',
                'aria-describedby': me.$('section').attr('id') || me.$('section').attr('id', me.cid+'_content').attr('id'),
                'aria-labelledby': me.$('h1').attr('id') || me.$('h1').attr('id', me.cid+'_title').attr('id')
            });

            me.on('mousewheel.modal', function(e) {
                e.stopPropagation();
            });
        },

        /**
         * zindex때문에 모달을 body바로 위로 옮긴 후에 띄우는데, 닫을 때 원래 위치로 복구시켜야 하므로,
         * 원래 위치에 임시 홀더를 만들어 놓는다.
         * @private
         */
        _createHolder: function() {
            var me = this;

            if(me.$el.parent().is('body')){ return; }

            me.$holder = $('<span class="d-modal-area" style="display:none;"></span>').insertAfter(me.$el);
            me.$el.appendTo('body');
        },
        /**
         * 원래 위치로 복구시키고 홀더는 제거
         * @private
         */
        _replaceHolder: function() {
            var me = this;

            if(me.$holder){
                me.$el.insertBefore(me.$holder);
                me.$holder.remove();
            }
        },

        /**
         * 토글
         */
        toggle: function() {
            var me = this;

            me[ me.isShown ? 'hide' : 'show' ]();
        },

        /**
         * 표시
         */
        show: function() {
            if(this.isShown && Modal.active === this) { return; }

            Modal.active = this;

            var me = this,
                opts = me.options,
                e = $.Event(Modal.ON_SHOW);

            me.trigger(e);
            if(me.isShown || e.isDefaultPrevented()) { return; }

            me.isShown = true;
            if(opts.overlay !== false){
                // 오버레이 생성
                me._overlay();
            }
            // 위치 배치
            me.layout();
            // 드래그 기능 빌드
            me._draggabled();
            if(!core.browser.isTouch){
                // esc키이벤트 바인딩
                me._escape();
                // 탭키로 포커스를 이동시킬 때 포커스가 레이어팝업 안에서만 돌도록 빌드
                me._enforceFocus();
            }

            if(opts.title) {
                me.$el.find(opts.cssTitle).html(opts.title || '알림');
            }

            me.$el.stop().addClass('d-modal-container')
                .css({
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    zIndex: 9900,
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    backgroundClip: 'padding-box'
                }).fadeIn('fast', function() {
                    me.trigger(Modal.ON_SHOWN, {module: this});
                    me.layout();

                    var $focusEl = me.$el.find('[data-autofocus=true]');
                    // 레이어내에 data-autofocus를 가진 엘리먼트에 포커스를 준다.
                    if($focusEl.size() > 0){
                        $focusEl.eq(0).focus();
                    } else {
                        // 레이어에 포커싱
                        me.$el.attr('tabindex', 0).focus();
                    }
                });

            // body를 비활성화(aria)
            $('body').attr('aria-hidden', 'true');

            // 버튼
            if(me.options.opener) {
                var modalid = '';
                if(!(modalid = me.$el.attr('id'))){
                    modalid = 'modal_' + core.getUniqId(16);
                    me.$el.attr('id', modalid);
                }
                $(me.options.opener).attr('aria-controls', modalid);
            }

            core.PubSub.trigger('hide:modal');
        },

        /**
         * 숨김
         */
        hide: function(e) {
            if(e) {
                e.preventDefault();
            }

            var me = this;
            e = $.Event(Modal.ON_HIDE);
            me.trigger(e);
            if(!me.isShown || e.isDefaultPrevented()) { return; }

            // 모달관련 글로벌 이벤트 제거
            $doc.off('focusin.modal');
            me.off('click.modal keyup.modal');

            me.isShown = false;
            if(!core.browser.isTouch){
                // esc 키이벤트 제거
                me._escape();
            }
            // dom에 추가된 것들 제거
            me.$el.hide().removeData(me.moduleName).removeClass('d-modal-container');
            me.off(me.getEventNamespace());
            // body밑으로 뺀 el를 다시 원래 위치로 되돌린다.
            me._replaceHolder();

            if(me.options.removeOnClose) {
                // 닫힐 때 dom에서 삭제하도록 옵션이 지정돼있으면, dom에서 삭제한다.
                me.$el.remove();
            }
            if(me.options.opener){
                // 레이어팝업을 띄운 버튼에 포커스를 준다.
                $(me.options.opener).removeAttr('aria-controls').focus();
            }

            if(me.$overlay) {
                // 오버레이를 제거
                me.$overlay.hide().remove(), me.$overlay = null;
            }
            // 비활성화를 푼다.
            $('body').removeAttr('aria-hidden');

            me.trigger(Modal.ON_HIDDEN);
            Modal.active = null;
        },


        /**
         * 도큐먼트의 가운데에 위치하도록 지정
         */
        layout: function(){
            var me = this,
                width = 0,
                height = 0,
                winHeight = core.util.getWinHeight();

            if(!me.isShown) {
                me.$el.css({'display': 'inline'});
            }
            width = me.$el.outerWidth();
            height = me.$el.outerHeight();
            me.$el.css({'display': ''});

            if(height > winHeight){
                // 레이어가 창보다 클 경우 top을 0으로 지정
                me.$el.css({
                    'top': 0,
                    'left': '50%',
                    'marginLeft': Math.ceil(width / 2) * -1,
                    'marginTop': ''
                });
            } else {
                me.$el.css({
                    'top': '50%',
                    'left': '50%',
                    'marginTop': Math.ceil(height / 2) * -1,
                    'marginLeft': Math.ceil(width / 2) * -1
                });
            }
        },

        /**
         * 타이틀 영역을 드래그기능 빌드
         * @private
         */
        _draggabled: function(){
            var me = this,
                options = me.options;

            if(!options.draggable || me.bindedDraggable) { return; }
            me.bindedDraggable = true;

            if (options.dragHandle) {
                me.$el.css('position', 'absolute');
                core.css3.prefix('user-select') && me.$(options.dragHandle).css(core.css3.prefix('user-select'), 'none');
                me.on('mousedown.modaldrag touchstart.modaldrag', options.dragHandle, function(e) {
                    e.preventDefault();

                    var isMouseDown = true,
                        pos = me.$el.position(),
                        size = {
                            width: me.$el.width(),
                            height: me.$el.height()
                        },
                        docSize = {
                            width: core.util.getDocWidth(),
                            height: core.util.getDocHeight()
                        },
                        oriPos = {left: e.pageX - pos.left, top: e.pageY - pos.top};

                    $doc.on('mousemove.modaldrag mouseup.modaldrag touchmove.modaldrag touchend.modaldrag touchcancel.modaldrag', function(e) {
                        switch(e.type) {
                            case 'mousemove':
                            case 'touchmove':
                                if(!isMouseDown){ return; }
                                /*if(e.pageX + size.width > docSize.width
                                 || e.pageY + size.height > docSize.height
                                 || e.pageX - oriPos.left < 0
                                 || e.pageY - oriPos.top < 0) {
                                 return;
                                 }*/

                                me.$el.css({
                                    left: e.pageX - oriPos.left,
                                    top: e.pageY - oriPos.top
                                });
                                break;
                            case 'mouseup':
                                isMouseDown = false;
                                $doc.off('.modaldrag');
                                break;
                        }
                    });
                });

                me.$el.find(options.dragHandle).css('cursor', 'move');
            }
        },

        /**
         * 모달이 띄워진 상태에서 탭키를 누를 때, 모달안에서만 포커스가 움직이게
         * @private
         */
        _enforceFocus: function() {
            var me = this;

            $doc
                .off('focusin.modal')
                .on('focusin.modal', me.proxy(function(e) {
                    if(me.$el[0] !== e.target && !$.contains(me.$el[0], e.target)) {
                        me.$el.find(':focusable').first().focus();
                        e.stopPropagation();
                    }
                }));
        },

        /**
         * esc키를 누를 때 닫히도록
         * @private
         */
        _escape: function() {
            var me = this;

            if(me.isShown && me.options.closeByEscape) {
                me.off('keyup.modal').on('keyup.modal', me.proxy(function(e) {
                    e.which === 27 && me.hide();
                }));
            } else {
                me.off('keyup.modal');
            }
        },

        /**
         * 오버레이 생성
         * @private
         */
        _overlay: function() {
            var me = this;
            if($('.d-modal-overlay').length > 0){ return false;} //140123_추가

            me.$overlay = $('<div class="d-modal-overlay" />');
            me.$overlay.css({
                'backgroundColor': '#ffffff',
                'opacity': 0.6,
                'position': 'fixed',
                'top': 0,
                'left': 0,
                'right': 0,
                'bottom': 0,
                'zIndex': 9000
            }).appendTo('body');

            me.$overlay.off('click.modal').on('click.modal', function(e) {
                if(e.target != e.currentTarget) { return; }
                me.$overlay.off('click.modal');
                me.hide();
            });
        },

        /**
         * 모달의 사이즈가 변경되었을 때 가운데위치를 재조절
         * @example
         * $('...').modal(); // 모달을 띄운다.
         * $('...').find('.content').html( '...');  // 모달내부의 컨텐츠를 변경
         * $('...').modal('center');    // 컨텐츠의 변경으로 인해 사이즈가 변경되었으로, 사이즈에 따라 화면가운데로 강제 이동
         */
        center: function(){
            this.layout();
        },

        /**
         * 열기
         */
        open: function(){
            this.show();
        },

        /**
         * 닫기
         */
        close: function() {
            this.hide();
        },

        /**
         *
         */
        release: function() {
            var me = this;

            me.callParent();
            me.$el.add(me.$overlay).off('.modal').remove();
            $doc.off('.modal');
            $win.off('.modal');
        }
    });

    /**
     * 열려 있는 레이어팝업을 닫는 static 함수
     * @name vinyl.ui.Modal.close
     */
    Modal.close = function (e) {
        if (!Modal.active) return;
        if (e) e.preventDefault();
        Modal.active.hide();
        Modal.active = null;
    };

    /**
     * 열려 있는 레이어팝업을 닫는 글로벌이벤트
     * @example
     * vinyl.PubSub.trigger('hide:modal')
     */
    core.PubSub.on('hide:modal', function (e, force) {
        if (force === false) {
            if(Modal.active){
                Modal.close();
            }
        }
    });

    /**
     * 열려 있는 레이어팝업을 가운데에 위치시키는 글로벌이벤트
     * @example
     * vinyl.PubSub.trigger('resize:modal')
     */
    core.PubSub.on('resize:modal', function() {
        if(Modal.active){
            Modal.active.center();
        }
    });

    //윈도우가 리사이징 될때 가운데에 자동으로 위치시킴
    $(window).on('resize.modal', function() {
        if(Modal.active){
            Modal.active.center();
        }
    });

    core.modal = function(el, options){
        $(el).modal(options);
    };

    /**
     * @class
     * @name vinyl.ui.AjaxModal
     * @description ajax로 불러들인 컨텐츠를 모달로 띄워주는 모듈
     * @extends vinyl.ui.View
     */
    core.ui.ajaxModal = function () {
        return function(url, options) {
            return $.ajax($.extend({
                url: url,
                cache: false
            }, options && options.ajax)).done(function(html) {
                var el = $(html.replace(/\n|\r/g, "")).appendTo('body');
                var modal = new Modal(el, core.extend({removeOnClose: true, show: true}, options));
                modal.getElement().buildUIControls();
                modal.on('modalhidden', function(){
                    el = null;
                    modal = null;
                });
            });
        };
    }();

    core.ui.alert = function () {
        /**
         * 얼럿레이어
         * @memberOf vinyl.ui
         * @name alert
         * @function
         * @param {String} msg 얼럿 메세지
         * @param {JSON} options 모달 옵션
         * @example
         * vinyl.ui.alert('안녕하세요');
         */
        return function (msg, options) {
            if(typeof msg !== 'string' && arguments.length === 0) {
                options = msg;
                msg = '';
            };
            var el = $(core.ui.alert.tmpl).appendTo('body').find('div.d-content').html(msg).end();
            var modal = new Modal(el, core.extend({removeOnClose: true, show: true}, options));
            modal.getElement().buildUIControls();
            modal.on('modalhidden', function(){
                el = null;
                modal = null;
            });
            return modal;
        };
    }();
    core.ui.alert.tmpl = ['<div class="layer_popup small d-alert" role="alert" style="display:none">',
        '<h1 class="title d-title">알림창</h1>',
        '<div class="cntt">',
        '<div class="d-content">&nbsp;</div>',
        '<div class="wrap_btn_c">',
        '<button type="button" class="btn_emphs_small" data-role="ok"><span><span>확인</span></span></button>',
        '</div>',
        '</div>',
        '<button type="button" class="d-close"><span>닫기</span></button>',
        '<span class="shadow"></span>',
        '</div>'].join('');
    ///////////////////////////////////////////////////////////////////////////////////////

})(window, jQuery, window[FRAMEWORK_NAME]);