/*!
 * @author common.ui.pagenate.js
 * @email comahead@vi-nyl.com
 * @create 2014-11-25
 * @license MIT License
 */
(function (ctx, $, core, undefined) {
    "use strict";

    var $doc = core.$doc,
        $win = core.$win,
        strUtil = core.string,
        dateUtil = core.date,
        numberUtil = core.number,
        browser = core.browser,
        isTouch = browser.isTouch;

    //Paginate ////////////////////////////////////////////////////////////////////////////
    /**
     * @class
     * @name vinyl.ui.Paginate
     * @description 페이징모듈
     * @extends vinyl.ui.View
     */
    var Paginate = ui('Paginate', /** @lends vinyl.ui.Paginate# */{
        bindjQuery: 'paginate',
        $statics: /** @lends vinyl.ui.Paginate */{
            ON_PAGECLICK: 'paginatepageclick',
            ON_BEFORESEND: 'paginatebeforesend'
        },
        defaults: {
            pageSize: 10,       // 페이지 수
            page: 1,            // 기본 페이지
            totalCount: 0,      // 전체 리스트 수
            paramName: 'page',
            isRender: true,

            firstImgSrc: 'first.gif',
            prevImgSrc: 'prev.gif',
            nextImgSrc: 'next.gif',
            lastImgSrc: 'last.gif',

            firstClass: 'd-paginate-first',
            prevClass: 'd-paginate-prev',
            nextClass: 'd-paginate-next',
            lastClass: 'd-paginate-last',
            pageClass: 'd-paginate-page',
            pageListClass: 'd-paginate-list'
        },

        events: {
            // 페이지링크 클릭
            'click a, button': '_onPageClick'
        },
        selectors: {
        },
        /**
         *
         * @param el
         * @param options
         */
        initialize: function(el, options) {
            var me = this;

            if(me.callParent(el, options) === false) { return me.release(); }

            /*if(!me.options.ajax){
             throw new Error('ajax 옵션을 지정해 주세요.');
             }*/
            //me.totalCount = 0;
            me.rowTmpl = me.$('.'+me.options.pageListClass).first().html();
            me.$('.'+me.options.pageListClass).empty();

            me._configure();
            me._render();
            me.setPage(me.options.page);

            me.$el.show();
        },

        /**
         * 멤버변수 초기화
         * @private
         */
        _configure: function() {
            var me = this;

            me.page = 1;
            me.currPage = 0;
            //me.totalPage = Math.ceil(me.totalCount / me.options.pageSize);
        },


        /**
         * 페이지 번호 DOM 생성
         * @private
         */
        _render: function() {
            if(!this.options.isRender) { return; }

            var me = this,
                listNode = null,
                item = null,
                opts = me.options,
                total = opts.totalCount,
                totalPage = Math.ceil(total / opts.pageSize),
                nowGroupPage, start, end;


            me.$('.'+opts.firstClass).prop('disabled', total === 0 || me.page === 1);
            me.$('.'+opts.prevClass).prop('disabled', total === 0 || me.page <= 1);
            me.$('.'+opts.nextClass).prop('disabled', total === 0 || me.page >= totalPage);
            me.$('.'+opts.lastClass).prop('disabled', total === 0 || me.page === totalPage);

            if(total <= 0) {
                me.$el.find('.'+opts.pageListClass).empty();
                me.$items = null;
                return;
            }

            nowGroupPage = Math.floor((me.page - 1) / opts.pageSize);
            if(me.groupPage !== nowGroupPage || me.totalPage !== totalPage) {
                me.groupPage = nowGroupPage;
                me.totalPage = totalPage;

                start = nowGroupPage * opts.pageSize;
                end = Math.min(me.totalPage, start + opts.pageSize);

                listNode = $('<ul>');
                for (var i = start + 1; i <= end; i++) {
                    item = $($.trim(me.rowTmpl.replace(/\{0\}/g, i)));
                    item.find('.'+opts.pageClass).attr('data-page', i);
                    listNode.append(item);
                }
                me.$('.'+opts.pageListClass).empty().append(listNode.children());
                me.$items = me.$('.'+opts.pageClass);
                listNode = null;
            }

            me.$items.eq((me.page % opts.pageSize) - 1).activeItem('current');
        },

        _onPageClick: function(e) {
            e.preventDefault();

            var me = this,
                $btn = $(e.currentTarget),
                opts = me.options,
                page;

            if($btn.hasClass('disable')) {
                return;
            }

            if($btn.hasClass(opts.firstClass)) {
                // 첫 페이지
                page = 1;
            } else if($btn.hasClass(opts.prevClass)) {
                // 이전 페이지
                page = Math.max(1, me.page - 1);
            } else if($btn.hasClass(opts.nextClass)) {
                // 다음 페이지
                page = Math.min(me.totalPage, me.page + 1);
            } else if($btn.hasClass(opts.lastClass)) {
                // 마지막 페이지
                page = me.totalPage;
            } else {
                // 클릭한 페이지
                page = $btn.data('page');
            }

            me.triggerHandler(Paginate.ON_PAGECLICK, {page: page});
        },

        setPage: function(options) {
            var me = this;

            me.options = $.extend({}, me.options, options);
            me.page = me.options.page || 1;
            me._render();
        },

        /**
         * UI 새로고침
         * @param {Object} options 변경할 옵션
         */
        update: function(options) {
            var me = this;

            me.options = $.extend({}, me.options, options);
            me._configure();
            me._render();
        },

        release: function() {
            var me = this;

            me.callParent();
        }
    });
    ///////////////////////////////////////////////////////////////////////////////////////


})(window, jQuery, window[LIB_NAME]);