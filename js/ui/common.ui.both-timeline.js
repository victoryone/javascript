!function(a,b,c){"use strict";c("BothTimeline",{defaults:{arrowHeight:28,boxTopMargin:24,classPrefix:"bt_",itemSelector:">div>ul>li"},initialize:function(a,b){var c=this;c.callParent(a,b)!==!1&&(c.measure={left:0,center:0,right:0})},update:function(a){b.util.waitImageLoad(this.$el.find(this.options.itemSelector).filter(function(b){return b>=a}).find("img")).done(function(){this._update(a)}.bind(this))},_update:function(b){b=0|b;var c=this,d=c.$el.find(c.options.itemSelector).filter(function(a){return a>=b}),e=[],f=c.measure,g=c.options.arrowHeight,h=c.options.boxTopMargin;c.$el.css("visibility","hidden"),0===b&&(f.left=f.center=f.right=0),d.each(function(){var b,c,d,i=a(this),j=i.show().height();b=f.left<=f.right?"left":"right",c=f[b],d=Math.max(f.center-c,0),e.push({$target:i.hide(),css:b,top:c,arrowTop:d}),f[b]+=j+h,f.center=c+d+g});var i=c.options;a.each(e,function(a,b){b.$target.removeClass(i.classPrefix+"left "+i.classPrefix+"right").addClass(i.classPrefix+b.css).css({top:b.top}).fadeIn("slow").css({_backgroundPositionY:b.arrowTop})}),c.$el.css({visibility:"",height:Math.max(f.left,f.right)}),c.trigger("completed")}})}(jQuery,window[LIB_NAME],window[LIB_NAME].ui);