/*!
 * @author common.ui.ajaxlist.js
 * @email comahead@vi-nyl.com
 * @create 2014-11-25
 * @license MIT License
 */
(function (ctx, $, core, undefined) {
    "use strict";

    var ui = core.ui,
        browser = core.browser,
        isTouch = browser.isTouch;

    //AjaxList ////////////////////////////////////////////////////////////////////////////
    /*
     ////////////////////////////////////////////////////////
     // 본 코드는 스크립트파트에서 그냥 작성해본 샘플입니다.
     // 이를 사용하셔도 되고 따로 구현하셔도 됩니다..^^
     var list = new ui.AjaxList('.board_list', {
     url: 'CAP1_2_list_ajax.html',
     paginate: { // 페이징 요소
     target: '.paging'
     }
     });

     // 처음 페이지 진입시 1페이지를 불러옴
     list.load(1, {
     storeCode: '',
     lectCode: '',
     weeks: [], // 검색부분에서 체크된 값을 배열로 설정 예) ['mo', 'we', 'fr']
     keyword: '',  // 검색부분의 강좌명 값
     status: '',     // 리스트헤더부분의 '전체,접수중(ing),접수마감(end)' 중 하나 예) '' or 'ing' or 'end'
     sort: ''
     });
     /////////////////////////////////////////////////////////
     */
    var AjaxList = ui('AjaxList', /** @lends vinyl.ui.AjaxList# */ {
        defaults: {
        },
        initialize: function(el, options) {
            var me = this,
                opts;

            if(me.callParent(el, options) === false) { return me.release(); }

            opts = me.options;
            if(opts.paginate) {
                me.paginate = new Paginate(opts.paginate.target, opts.pginate);
                me.paginate.on('paginatepageclick', function(e, data) {
                    me.load(data.page || 1);
                });
                me.on('pageloaded', function(e, data) {
                    var info = $.trim(me.$('.d-data').html());
                    if(info) {
                        try {
                            me.paginate.setPage($.parseJSON(info));
                        } catch(e) {
                            throw new Error('ajax결과값에 들어있는 json형식이 잘못 되었습니다.\n('+opts.url+')');
                        }
                    } else {
                        me.paginate.update({page: data.page})
                    }
                });
            }

            me._init();
        },

        _init: function() {
            var me = this;

            //me.load();
        },

        getCurrentPage: function() {
            return this.page;
        },

        load: function(p, data) {
            var me = this,
                opts = me.options;

            if(me._isLoading) {return;}
            me._isLoading = true;
            me.triggerHandler('preload', {page: p});

            data || (data = {});
            data['page'] = p;

            return $.ajax({
                url: opts.url,
                type: opts.type,
                data: data
            }).done(function(html) {
                me.$el.html(html);
                me.page = p;

                me.triggerHandler('pageloaded', {page: p});
            }).always(function() {
                me._isLoading = false;
                me.triggerHandler('loadcomplete');
            });
        }
    });
    ///////////////////////////////////////////////////////////////////////////////////////

})(window, jQuery, window[LIB_NAME]);