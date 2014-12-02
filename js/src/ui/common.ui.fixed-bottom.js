/*!
 * @author 김승일
 * @email comahead@vi-nyl.com
 * @description 이마트 코어 라이브러리
 * @license MIT License
 */
(function($, core, ui, undefined) {
	"use strict";

    // 푸터에 어떤 요소를 fixed모드의 플로팅으로 뛰우고자 할 때 사용
    // 현재 이마트 뮤직에서 사용됨.
	ui('FixedBottom', {
		bindjQuery: 'fixedBottom',
		defaults: {
			minWidth: 1000,     // 최소 가로사이즈
			offsetTarget: ''    // 더이상 내려가지 않도록 기준이 되는 요소(셀렉터)
		},
        /**
         *
         * @constructor
         * @param el
         * @param options
         */
		initialize: function(el, options) {
			var me = this;
			if(me.callParent(el, options) === false){ return; }

			if(me.options.offsetTarget){
				me.$offsetTarget = $(me.options.offsetTarget);
			}

			me.winHeight = core.util.getWinHeight();    // 윈도우창 높이
			me.winWidth = core.util.getWinWidth();      // 윈도우창 너비
			me.scrollTop = core.$win.scrollTop();       // 스크롤탑
			me.scrollLeft = core.$win.scrollLeft();     // 스크롤레프트
			me._bindEvents();
			me._reposition();
		},
        /**
         *
         * @private
         */
		_bindEvents: function() {
			var me = this,
				$win = core.$win,
				util = core.util;

			$win.on('resize.'+me.cid, function() {
				me.winHeight = $win.innerHeight();
				me.winWidth = $win.innerWidth();
				me._reposition();
			}).on('scroll.'+me.cid, function() {				
				me.scrollTop = $win.scrollTop();
				me.scrollLeft = $win.scrollLeft();
				me._reposition();
			}).triggerHandler('resize.'+me.cid);

            // 컨텐츠 내부에서 ajax로 컨텐츠를 변경할 때 document사이즈가
            // 변경되므로 이때 다시 재배치를 시킨다.
			core.$doc.on('ajaxComplete.fixedbottom', function(){
				me._reposition();
			});
		},

        /**
         * 브라우저의 상태에 따라 재배치
         * @private
         */
		_reposition: function() {
			var me = this,
				$win = core.$win,
				util = core.util,
				opts = me.options,

				docHeight = util.getDocHeight(),
				scrollHeight = me.scrollTop + me.winHeight,
				contentHeight = me.$offsetTarget.size() > 0 ? me.$offsetTarget.offset().top : docHeight;

			me.$el.css({
				left: -me.scrollLeft,
				bottom: contentHeight >= scrollHeight ? 0 :  (scrollHeight - contentHeight),
				width: Math.max(opts.minWidth, me.winWidth)
			});
		},

        release: function(){
            core.$win.off('.'+this.cid);
        }
	});

})(jQuery, window[LIB_NAME], window[LIB_NAME].ui);