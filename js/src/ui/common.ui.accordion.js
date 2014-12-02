/*!
 * @author common.ui.accordion.js
 * @email comahead@vi-nyl.com
 * @create 2014-11-25
 * @license MIT License
 */
(function (ctx, $, core, undefined) {
    "use strict";

    /**
     * 아코디언 모듈
     * @class
     * @name vinyl.ui.Accordion
     * @author 김부윤
     */
    ui('Accordion', /**@lends vinyl.ui.Accordion */{
        bindjQuery: 'accordion',


        defaults:{
            selectedClass : "on",
            disabledTitleClass : "disable",
            noneClass : "none",
            isSlideType: false,
            slideTime: 300,
            collapseOthers: true,
            defaultOpenIndex:-1,
            isMoveTop: false
        },

        selectors: {
            list : ".d-accord-content",
            toggleClassTarget: ".d-accord-content",
            toggleButton : ".d-toggle-button",				// 토글버튼
            content : ".cont",											// 컨텐츠 요소
            closeButton: ".d-close"								// 닫기 버튼
        },

        events: {
        },

        /**
         * 생성자
         * @param el
         * @param options
         */
        initialize: function(el, options) {
            var me = this;

            if( me.callParent(el, options) === false ) { return; }
            me.isAniComplete = true;
            me.currentIndex = -1;
            me.$contentList = null;

            if( me.options.isSlideType == "false" ){ me.options.isSlideType = false }

            if( me.options.defaultOpenIndex != -1 ){
                me._handleExpand( this.options.defaultOpenIndex );
            }

            me._setHandlerOption();
            me._bindEvent();
        },

        /**
         * _option.isSlideType에 따라 핸들러 함수 설정
         * @private
         */
        _setHandlerOption: function(){
            var me = this;

            me.collapse = me._handleCollapse;
            me.expand = me._handleExpand;
            if( me.options.isSlideType ){
                me.collapse = me._slideCollapse;
                me.expand = me._slideExpand;
            }
        },

        /**
         * 이벤트 바인딩
         */
        _bindEvent : function() {
            var me = this;
            var gnbTimer = null;
            var clicked = false;
            var isTouch = vinyl.browser.isTouch;

            function setClickedTimer(){
                clicked = true;
                clearTimeout( gnbTimer );
                gnbTimer = setTimeout(function(){
                    clicked = false;
                }, 500 );
            }

            this.$el.on("click dblclick", this.selectors.toggleButton, function(e){
                e.preventDefault();

                if( isTouch && clicked ){
                    return
                }


                if( isTouch ){setClickedTimer();}

                var $t = $(this);
                if ( $t.hasClass( me.options.disabledTitleClass ) ){
                    return;
                }

                var $currentTarget = $t.closest(me.selectors.list);
                var $classTarget;
                if( me.selectors.toggleClassTarget == me.selectors.list ){
                    $classTarget = $currentTarget;
                }else{
                    $classTarget = $currentTarget.find(me.selectors.toggleClassTarget);
                }

                me.$contentList = me.$el.find( me.selectors.list );
                var index = me.$contentList.index( $currentTarget );

                if( $currentTarget.find(me.selectors.content).length ){
                    e.preventDefault();
                }

                if ( $classTarget.hasClass( me.options.selectedClass ) ) {
                    me.collapse( index );
                } else {
                    me.expand( index );
                }
            });

            this.on("click", this.selectors.closeButton, function(e){
                e.preventDefault();
                var $targetList = $(this).closest(me.selectors.list);
                var index = me.$list.index($targetList);
                me.collapse( index, me.options.duration );
            });
        },

        /**
         * 거리에 따른 duration 계산
         * @return { Integer }
         */
        _getDuration:function( dist, value ){
            var time = (dist/value)*this.options.slideTime;
            if( time < 200 ){  time = 200 };
            if( time > 700 ){  time = 700 };
            return Math.round(time);
        },

        /**
         * slide effect expand handler
         * @param { Integer } target index
         */
        _slideExpand: function( index ){
            var ev;
            var targetData = this._getTargetData(index);
            if( !targetData.isExe ){
                return;
            }

            this.trigger( ev = $.Event('expand'), {index: index} );
            if(ev.isDefaultPrevented()){ return; }

            var $targetCont = targetData.$targetCont,
                $scaleTarget = targetData.$scaleTarget,
                $classTarget = targetData.$classTarget;

            this.isAniComplete = false;
            $scaleTarget.removeClass( this.options.noneClass );
            $classTarget.addClass( this.options.selectedClass );

            $scaleTarget.height("");
            var targetHeight = $scaleTarget.outerHeight();
            var duration = this._getDuration(targetHeight,700);//this.options.slideTime;

            if( this.options.collapseOthers && index != this.currentIndex ){
                this.isAniComplete = true;
                this._slideCollapse( this.currentIndex, duration );
            }

            $scaleTarget.stop().height(0).animate({"height": targetHeight }, duration, $.proxy(function(){
                this.isAniComplete = true;
                this.trigger( 'expanded' );
                $scaleTarget.height("");
                if(this.options.isMoveTop) {
                    $('html, body').stop().animate({'scrollTop': $classTarget.offset().top},  300 );
                }
            }, this));

            this.currentIndex = index;
        },

        _getTargetData: function( index ){
            var $targetCont;
            if( this.$contentList ){
                $targetCont = this.$contentList.eq(index);
            }else{
                $targetCont = this.$el.find( this.selectors.list ).eq(index);
            }

            var $scaleTarget = $targetCont.find( this.selectors.content );

            var isExe = true;
            if( !this.isAniComplete || $scaleTarget.length == 0 ){
                isExe = false
            }

            var $classTarget;
            if( this.selectors.toggleClassTarget == this.selectors.list ){
                $classTarget = $targetCont;
            }else{
                $classTarget = $targetCont.find(this.selectors.toggleClassTarget);
            }

            return {
                $targetCont : $targetCont,
                $scaleTarget : $scaleTarget,
                $classTarget : $classTarget,
                isExe: isExe
            }
        },


        /**
         * slide effect collapse handler
         * @private
         * @param { Integer } target index
         */
        _slideCollapse: function( index, duration ){

            var targetData = this._getTargetData(index);
            if( !targetData.isExe ){
                return;
            }

            var ev;
            this.trigger( ev = $.Event('collapse'), {index: index} );
            if(ev.isDefaultPrevented()){ return; }

            var $targetCont = targetData.$targetCont,
                $scaleTarget = targetData.$scaleTarget,
                $classTarget = targetData.$classTarget;

            this.isAniComplete = false;


            if( duration == undefined ){
                duration = this.options.slideTime;
            }

            $scaleTarget.stop().animate({"height":0 }, duration, $.proxy(function(){
                $scaleTarget.addClass( this.options.noneClass );
                $classTarget.removeClass( this.options.selectedClass );
                this.trigger( 'collapsed', {index: index} );
                this.isAniComplete = true;
            },this));
        },

        /**
         * expand handler
         * @private
         * @param { Integer } target index
         */
        _handleExpand : function( index ) {
            var targetData = this._getTargetData(index);
            if( !targetData.isExe ){
                return;
            }

            var ev;
            this.trigger( ev = $.Event('expand'), {index: index} );
            if(ev.isDefaultPrevented()){ return; }

            var $targetCont = targetData.$targetCont,
                $scaleTarget = targetData.$scaleTarget,
                $classTarget = targetData.$classTarget;

            $scaleTarget.removeClass( this.options.noneClass );
            $classTarget.addClass( this.options.selectedClass );

            if( this.options.collapseOthers && index != this.currentIndex ){
                this._handleCollapse( this.currentIndex );
            }
            $scaleTarget.removeClass( this.options.noneClass );

            if(this.options.isMoveTop) {
                $('html, body').scrollTop($classTarget.offset().top);
            }


            this.currentIndex = index;
            this.trigger( 'expanded', {index: index} );
        },

        /**
         * collapse handler
         * @private
         * @param { Integer } target index
         */
        _handleCollapse : function( index ) {
            var targetData = this._getTargetData(index);
            if( !targetData.isExe ){
                return;
            }

            var ev;
            this.trigger( ev = $.Event('collapse'), {index: index} );
            if(ev.isDefaultPrevented()){ return; }

            var $targetCont = targetData.$targetCont,
                $scaleTarget = targetData.$scaleTarget,
                $classTarget = targetData.$classTarget;

            $classTarget.removeClass( this.options.selectedClass );
            $scaleTarget.addClass( this.options.noneClass );
            this.trigger( 'collapsed', {index: index} );
        },

        release: function(){

        }
    });

})(window, jQuery, window[FRAMEWORK_NAME]);