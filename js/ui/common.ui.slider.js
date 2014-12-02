!function(a,b,c,d){b.$win,b.$doc;b.define("ui.MoveDirection",{HORIZONTAL:"horizontal",VERTICAL:"vertical"}),b.define("ui.IndicatorType",{NORMAL:"normal",BG_ANIMATE:"bg_animate"}),b.define("ui.EffectType",{SLIDE_HORIZONTAL:"slide_horizontal",SLIDE_VERTICAL:"slide_vertical",ALPHA:"alpha",ALPHA_PNG:"alpha_png",EXPAND_SLIDE_HORIZONTAL:"expand_slide_horizontal"}),c("Transitioner",{$statics:{COMPLETE_TRASITION:"complete_transition"},$mixins:[c.Listener],defaults:{noneClass:"none",onClass:"on",effectType:"",duration:500,intervalTime:5e3,focustarget:"",startIndex:0,easing:"easeOutQuad"},selectors:{contentList:"",listContainer:"",playButton:"",pauseButton:""},events:{},initialize:function(a,b){this.callParent(a,b)!==!1&&(this.currentIndex,this.selectedIndex=this.currentIndex,this.maxLength,this.intervalID,this._effectHandler=this._getEffectHandler(this.options.effectType),this.maxLength=this.$contentList.length,this.$contentList.eq(this.options.startIndex).siblings().addClass(this.options.noneClass),this.setContent(this.options.startIndex,!1))},setContent:function(a,b){if(b=b==d?!0:b,!this.isAnimate&&this.currentIndex!=a){var c=this.$contentList.eq(a),e=this.$contentList.eq(this.currentIndex),f=this.currentIndex>a?-1:1;this.currentIndex=a,this._effectHandler(c,e,f,b)}},_alphaEffect:function(b){this.isAnimate=!0,this.$listContainer.append(b),b.removeClass(this.options.noneClass).css("opacity",0).stop().animate({opacity:1},{duration:this.options.duration,complete:a.proxy(this._setEffectCompleteCallback,this,b),easing:this.options.easing})},_alphaPNGEffect:function(b,c,d,e){this.isAnimate=!0,this.$listContainer.append(b),e?(c.stop().animate({opacity:0},{duration:this.options.duration,easing:this.options.easing}),b.removeClass(this.options.noneClass).css("opacity",0).stop().animate({opacity:1},{duration:this.options.duration,complete:a.proxy(this._setEffectCompleteCallback,this,b),easing:this.options.easing})):(c.stop().css("opacity",0),b.removeClass(this.options.noneClass).css("opacity",1),this._setEffectCompleteCallback(b))},_expandSlideToHorizontalEffect:function(b,c,d,e){this.isAnimate=!0;var f=-100*d;if(c.find(".d-expand-target").stop(),e){{b.find(".d-expand-target").css({width:"100%",left:"0%",top:"0%"})}b.css("left",100*d+"%"),b.removeClass(this.options.noneClass).stop().animate({left:0},{duration:this.options.duration,complete:a.proxy(function(){this._setEffectCompleteCallback(b),this._expandImgAnimate(b)},this),easing:this.options.easing}),c.stop().animate({left:f+"%"},{duration:this.options.duration,easing:this.options.easing})}else b.stop().removeClass(this.options.noneClass).css("left",0),c.stop().css("left",f),this._expandImgAnimate(b),this._setEffectCompleteCallback(b)},_expandImgAnimate:function(a){var b=a.find(".d-expand-target").css({width:"100%",left:"0%",top:"0%"});b.stop().animate({width:"106%",left:"-3%"},{duration:this.options.intervalTime-this.options.duration,easing:this.options.easing})},_slideToHorizontalEffect:function(b,c,d,e){this.isAnimate=!0;var f=-1*this.listWidth*d;e?(b.css("left",this.listWidth*d),b.removeClass(this.options.noneClass).stop().animate({left:0},{duration:this.options.duration,complete:a.proxy(this._setEffectCompleteCallback,this,b),easing:this.options.easing}),c.stop().animate({left:f},{duration:this.options.duration,easing:this.options.easing})):(b.stop().removeClass(this.options.noneClass).css("left",0),c.stop().css("left",f),this._setEffectCompleteCallback(b))},_slideToVerticalEffect:function(b,c,d){this.isAnimate=!0,b.css("top",this._listHeight*d),b.removeClass(this.options.noneClass).stop().stop().animate({top:0},{duration:this.options.duration,complete:a.proxy(this._setEffectCompleteCallback,this,b),easing:this.options.easing}),c.stop().animate({top:-1*this._listHeight*d},{duration:this.options.duration,easing:this.options.easing})},_setEffectCompleteCallback:function(a){a.siblings().addClass(this.options.noneClass),this.isAnimate=!1,this.selectedIndex!=this.currentIndex?(this.setContent(this.currentIndex),this.selectedIndex=this.currentIndex):this.trigger(c.Transitioner.COMPLETE_TRASITION,[this.currentIndex])},_getEffectHandler:function(a){switch(a){case c.EffectType.ALPHA:return this._alphaEffect;case c.EffectType.SLIDE_HORIZONTAL:return this.listWidth=this.$contentList.eq(0).width(),this._slideToHorizontalEffect;case c.EffectType.SLIDE_VERTICAL:return this._listHeight=this.$contentList.eq(0).height(),this._slideToVerticalEffect;case c.EffectType.ALPHA_PNG:var d=this.$contentList.find("img");return d.css("filter","inherit"),b.util.png24(d),this._alphaPNGEffect;case c.EffectType.EXPAND_SLIDE_HORIZONTAL:return this._expandSlideToHorizontalEffect;default:return this._alphaEffect}},release:function(){}}),c("AbBannerUI",{$statics:{},$mixins:[c.Listener],defaults:{noneClass:"none",isAutoPlay:!0,loop:!1,startIndex:0,disableClass:"disable"},selectors:{playButton:".d-play",pauseButton:".d-pause",nextButton:".d-next",prevButton:".d-prev"},events:{},initialize:function(a,b){this.callParent(a,b)!==!1&&(this.isAutoPlay=this.options.isAutoPlay,this.currentIndex=this.options.startIndex,this.maxLength,this._bindIndicatorEvent(),this.getAutoPlay()&&this.play())},_bindIndicatorEvent:function(){var c=this;b.isTouch&&this.$el.swipe({excludedElements:"label, input, select, textarea, .noSwipe",swipeLeft:a.proxy(c._nextHandler,this),swipeRight:a.proxy(c._prevHandler,this),fingers:1,threshold:0}),c.getAutoPlay()&&(this.$el.on("mouseenter focusin",function(){c.isPause=!0,c.getAutoPlay()&&c.pause()}),this.$el.on("mouseleave focusout",function(){c.isPause=!1,c.getAutoPlay()&&c.play()})),""!=this.selectors.nextButton&&(this.$el.on("click",this.selectors.prevButton,a.proxy(this._prevHandler,this)),this.$el.on("click",this.selectors.nextButton,a.proxy(this._nextHandler,this))),""!=this.selectors.playButton&&(this.$el.on("click",this.selectors.playButton,a.proxy(function(a){a.preventDefault(),this.options.isToggle&&(this.$playButton.addClass(this.options.noneClass),this.$pauseButton.removeClass(this.options.noneClass).focus()),this.setAutoPlay(!0)},this)),this.$el.on("click",this.selectors.pauseButton,a.proxy(function(a){a.preventDefault(),this.options.isToggle&&(this.$playButton.removeClass(this.options.noneClass).focus(),this.$pauseButton.addClass(this.options.noneClass)),this.setAutoPlay(!1)},this)))},setAutoPlay:function(a){this.isAutoPlay!=a&&(this.isAutoPlay=a,a?this.play():this.pause())},getAutoPlay:function(){return this.isAutoPlay},play:function(){},pause:function(){},_triggerSelected:function(){},select:function(a){this.$prevButton.removeClass(this.options.disableClass),this.$nextButton.removeClass(this.options.disableClass),this.options.loop||(0==a?this.$prevButton.addClass(this.options.disableClass):a==this.maxLength-1&&this.$nextButton.addClass(this.options.disableClass))},_prevHandler:function(a){a.preventDefault();var b=this.currentIndex-1;if(0>b){if(!this.options.loop)return;b=this.maxLength-1}this._triggerSelected(b)},_nextHandler:function(a){a.preventDefault();var b=this.currentIndex+1;if(b==this.maxLength){if(!this.options.loop)return;b=0}this._triggerSelected(b)}}),c("BasicBannerUI","AbBannerUI",{$statics:{},$mixins:[c.Listener],defaults:{intervalTime:3e3,isAutoPlay:!0,startIndex:0,loop:!1,onClass:"on",isToggle:!1,maxLength:0},selectors:{indicator:".d-icon",playButton:".d-play",pauseButton:".d-pause",prevButton:".d-prev",nextButton:".d-next"},events:{},initialize:function(a,b){this.callParent(a,b)!==!1&&(this.maxLength=this.options.maxLength,this._bindBasicIndicatorEvent(),this.isPlay=!0,this.getAutoPlay()&&this.play())},_bindBasicIndicatorEvent:function(){if(this.selectors.indicator.length){{var a=this;this.maxLength}this.$el.on("click",this.selectors.indicator,function(b){b.preventDefault();var c=a.$indicator.index(this);a._triggerSelected(c)})}},select:function(a){this.callParent(a),this.intervalID&&(this._clearTimer(),this._setTimer()),this.currentIndex=a;var b=this.$indicator.eq(a).addClass(this.options.onClass);this.$indicator.not(b).removeClass(this.options.onClass)},_triggerSelected:function(a){this.trigger("selected",a)},play:function(){this._setTimer(),this.isPlay=!0},pause:function(){this._clearTimer(),this.isPlay=!1},getIsPlay:function(){return this.isPlay},_setTimer:function(){var a=this;this.intervalID||(this.intervalID=setInterval(function(){var b=a.currentIndex+1;b>=a.maxLength&&(b=0),a._triggerSelected(b)},this.options.intervalTime))},_clearTimer:function(){clearInterval(this.intervalID),this.intervalID=d},release:function(){}}),c("BGAnimator",{$statics:{COMPLETE:"complete"},$mixins:[c.Listener],defaults:{moveType:c.MoveDirection.VERTICAL,duration:1e3,frame:30,startPosition:0,isPlayOnce:!0,dist:20},selectors:{},events:{},initialize:function(a,b){this.callParent(a,b)!==!1&&(this._setMoveType(),this.currentFrame=0,this.timer,this.moveType,this.isPlay=!0,this.startPosition=this.options.startPosition,this.intervalTime=this.options.duration/this.options.frame)},_setMoveType:function(){this.moveType=this.options.moveType==c.MoveDirection.HORIZONTAL?"background-position-x":"background-position-y"},play:function(){this.isPlay=!0;var a=this,b=this.options.frame;this.pause(),this.timer=setInterval(function(){var c;c=0==a.currentFrame?a.startPosition:a.getPosition(a.currentFrame),a.$el.css(a.moveType,c),a.currentFrame++,a.currentFrame>b&&(a.playComplete(),a.currentFrame=0)},this.intervalTime)},pause:function(){this.isPlay=!1,clearInterval(this.timer)},getIsPlay:function(){return this.isPlay},stop:function(){this.pause(),this.currentFrame=0,this.$el.css(this.moveType,this.startPosition)},getPosition:function(a){var b=this.options.dist*a+this.startPosition;return b},goToEnd:function(){this.stop(),this.currentFrame=this.options.frame-1;var a=this.getPosition(this.currentFrame);this.$el.css(this.moveType,a)},goToFirst:function(){this.stop(),this.currentFrame=0,this.$el.css(this.moveType,0)},playComplete:function(){this.trigger("complete"),this.options.isPlayOnce&&this.stop()},release:function(){}}),emart.bindjQuery(c.BGAnimator,"BGAnimator"),c("AnimateIndicatorUI","AbBannerUI",{$statics:{},$mixins:[c.Listener],defaults:{moveType:c.MoveDirection.VERTICAL,frame:30,startPosition:-20,isPlayOnce:!0,dist:20,isToggle:!1,intervalTime:3e3,isAutoPlay:!0,startIndex:0,loop:!1,onClass:"on"},selectors:{indicator:".d-icon",playButton:".d-play",pauseButton:".d-pause"},events:{},initialize:function(a,b){this.callParent(a,b)!==!1&&(this.maxLength=this.$indicator.length,this.isPause=!1,this._createBgAnimator(),this._bindAnimateIndicatorUIEvent(),this.getAutoPlay()&&this.play())},_createBgAnimator:function(){this.$indicator.BGAnimator({moveType:this.options.moveType,duration:this.options.intervalTime,frame:this.options.frame,startPosition:this.options.startPosition,isPlayOnce:this.options.isPlayOnce,dist:this.options.dist})},_bindAnimateIndicatorUIEvent:function(){var a=this;this.$indicator.on("complete",function(){var b=a.$indicator.index(this);if(a.getAutoPlay()){var b=b+1;b==a.maxLength&&(b=0),a._triggerSelected(b)}}),this.$el.on("click",this.selectors.indicator,function(b){b.preventDefault();var c=a.$indicator.index(this);a._triggerSelected(c)})},select:function(a){this.currentIndex=a;var b=this.$indicator.eq(a);this.$indicator.not(":eq("+a+")").BGAnimator("stop"),b.BGAnimator(this.isAutoPlay&&!this.isPause?"play":"goToFirst")},_triggerSelected:function(a){this.trigger("selected",a)},play:function(){this.select(this.currentIndex)},pause:function(){this.$indicator.eq(this.currentIndex).BGAnimator("pause")},release:function(){}}),c("BasicBanner","Transitioner",{bindjQuery:"BasicBanner",$statics:{SELECTED:"selected"},defaults:{onClass:"on",effectType:"",isAutoPlay:!0,intervalTime:5e3,indicatorType:c.IndicatorType.NORMAL,focustarget:"",startIndex:0,loop:!1,isToggle:!1,easing:"easeOutQuad",bgAniIndicator:{moveType:c.MoveDirection.VERTICAL,duration:1e3,frame:30,startPosition:0,isPlayOnce:!0,dist:20}},selectors:{contentList:"",prevButton:"",nextButton:"",indicator:"",playButton:"",pauseButton:""},events:{},initialize:function(a,b){this.callParent(a,b)!==!1&&(this.currentIndex,this.indicator,this.isAutoPlay=this.options.isAutoPlay,this.maxLength=this.$contentList.length,this._initUI(),this._createIndicator(),this._bindIndicatorEvent(),this.setContent(this.options.startIndex,!1))},_initUI:function(){this.maxLength<=1&&this.$playButton.add(this.$pauseButton).add(this.$indicator).hide(),this.options.loop&&(this.$prevButton.removeClass("disable"),this.$nextButton.removeClass("disable"))},play:function(){this.indicator.play()},pause:function(){this.indicator.pause()},getIsPlay:function(){return this.indicator.getIsPlay()},_createIndicator:function(){var a={indicator:this.selectors.indicator,playButton:this.selectors.playButton,pauseButton:this.selectors.pauseButton,nextButton:this.selectors.nextButton,prevButton:this.selectors.prevButton},b={selectors:a,intervalTime:this.options.intervalTime,isAutoPlay:this.options.isAutoPlay,startIndex:this.options.startIndex,onClass:this.options.onClass,isToggle:this.options.isToggle,loop:this.options.loop,maxLength:this.maxLength};switch(this.options.indicatorType){case c.IndicatorType.NORMAL:this.indicator=new c.BasicBannerUI(this.$el,b);break;case c.IndicatorType.BG_ANIMATE:b.moveType=this.options.bgAniIndicator.moveType,b.frame=this.options.bgAniIndicator.frame,b.startPosition=this.options.bgAniIndicator.startPosition,b.isPlayOnce=this.options.bgAniIndicator.isPlayOnce,b.dist=this.options.bgAniIndicator.dist,this.indicator=new c.AnimateIndicatorUI(this.$el,b)}},_bindIndicatorEvent:function(){var a=this;this.indicator.on("selected",function(b,c){a.setContent(c)})},_setNextPrevButtonState:function(a){this.options.loop?(this.$prevButton.removeClass(this.options.onClass).html(0==a?"마지막 내용 보기":"이전 내용 보기"),this.$nextButton.removeClass(this.options.onClass).html(a==this.maxLength-1?"처음 내용 보기":"다음 내용 보기")):(this.$prevButton.toggleClass(this.options.onClass,0!=a).html("이전 내용 보기"),this.$nextButton.removeClass(this.options.onClass,a==this.maxLength-1).html("다음 내용 보기"))},setContent:function(a,b){this.isAnimate||this.currentIndex==a||(this._setNextPrevButtonState(a),this.suprMethod("setContent",a,b),this._setIndicator(a),this.currentIndex=a)},_setIndicator:function(a){this.indicator&&this.indicator.select(a)},release:function(){}})}(jQuery,window.emart,window.emart.ui);