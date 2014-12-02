/*!
 * @author common.ui.tab.js
 * @email comahead@vi-nyl.com
 * @create 2014-11-25
 * @license MIT License
 */
(function (ctx, $, core, undefined) {
    "use strict";

    var ui = core.ui,
        browser = core.browser,
        isTouch = browser.isTouch;

    //Tab ////////////////////////////////////////////////////////////////////////////////
    /**
     * @class
     * @name vinyl.ui.Tab
     * @description 페이징모듈
     * @extends vinyl.ui.View
     */
    ui('Tab', /** @lends vinyl.ui.Tab# */{
        bindjQuery: 'tab',
        $statics: /** @lends vinyl.ui.Tab */{
            ON_TAB_CHANGED: 'tabchanged'
        },
        defaults: {
            selectedIndex: 0,
            onClassName: 'on',
            tabType: 'inner'
        },

        events: {
        },
        selectors: {
            //tabs: '>ul>li'
        },
        /**
         * 생성자
         * @param el
         * @param options
         */
        initialize: function(el, options) {
            var me = this;

            if(me.callParent(el, options) === false) { return me.release(); }

            me.$tabs = me.$el.is('ul') ? me.$('>li') : me.$('>ul>li');
            me.$tabs.on('click', '>a, >button', function(e) {
                e.preventDefault();

                me.selectTab($(e.currentTarget).parent().index());
            });

            // 컨텐츠가 li바깥에 위치한 탭인 경우
            if(me.options.tabType === 'outer') {
                var selectors = [];
                // 탭버튼의 href에 있는 #아이디 를 가져와서 컨텐츠를 조회
                me.$tabs.each(function() {
                    selectors.push($(this).find('a').attr('href'));
                });

                if(selectors.length) {
                    me.$contents = $(selectors.join(', '));
                }
                me._buildARIA();
            }

            me.selectTab(me.options.selectedIndex);
        },

        /**
         * aria 속성 빌드
         */
        _buildARIA: function() {
            var me = this,
                tablistid = 'tab_' + me.cid,
                tabid, panelid;

            me.$el.attr('role', 'tablist');
            me.$tabs.each(function(i) {
                if(!me.$contents.eq(i).attr('id')) {
                    me.$contents.eq(i).attr('id', tabid = (tablistid + '_' + i));
                }
                var panelid = me.$contents.eq(i).attr('id');
                me.$contents.eq(i).attr({
                    'aria-labelledby': tabid,
                    'role': 'tabpanel',
                    'aria-hidden': 'true'
                });

                $(this).attr({
                    'id': tabid,
                    'role': 'tab',
                    'aria-selected': 'false',
                    'aria-controls': panelid
                });
            });

            me.on('tabchanged', function(e, data) {
                me.$tabs.attr('aria-selected', 'false').eq(data.selectedIndex).attr('aria-selected', 'true');
                me.$contents.attr('aria-hidden', 'true').eq(data.selectedIndex).attr('aria-hidden', 'false');
            });

        },

        activeTab: function(index) {
            var me = this, e;
            if(index < 0){ index = 0; }
            if(me.$tabs.length && index >= me.$tabs.length) {
                index = me.$tabs.length - 1;
            }


            me.$tabs.eq(index).activeItem(me.options.onClassName);

            // 컨텐츠가 li바깥에 위치한 탭인 경우
            if(me.options.tabType === 'outer' && me.$contents) {
                me.$contents.hide().eq(index).show();
            }
        },

        /**
         * index에 해당하는 탭을 활성화
         * @param {Number} index 탭버튼 인덱스
         */
        selectTab: function(index) {
            var me = this, e;
            if(index < 0 || (me.$tabs.length && index >= me.$tabs.length)) {
                throw new Error('index 가 범위를 벗어났습니다.');
            }

            me.triggerHandler(e = $.Event('tabchange'), {selectedIndex: index});
            if(e.isDefaultPrevented()) { return; }

            me.$tabs.eq(index).activeItem(me.options.onClassName);

            // 컨텐츠가 li바깥에 위치한 탭인 경우
            if(me.options.tabType === 'outer' && me.$contents) {
                me.$contents.hide().eq(index).show();
            }
            me.triggerHandler('tabchanged', {selectedIndex: index});

        }
    });
    ///////////////////////////////////////////////////////////////////////////////////////

})(window, jQuery, window[FRAMEWORK_NAME]);