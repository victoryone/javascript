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
     * @param {string} types (Optional) "tab,selectbox,calendar,placeholder"
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


})(window, jQuery, window[LIB_NAME]);