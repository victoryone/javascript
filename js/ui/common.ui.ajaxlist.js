!function(a,b,c){"use strict";{var d=c.ui,e=c.browser;e.isTouch,d("AjaxList",{defaults:{},initialize:function(a,c){var d,e=this;return e.callParent(a,c)===!1?e.release():(d=e.options,d.paginate&&(e.paginate=new Paginate(d.paginate.target,d.pginate),e.paginate.on("paginatepageclick",function(a,b){e.load(b.page||1)}),e.on("pageloaded",function(a,c){var f=b.trim(e.$(".d-data").html());if(f)try{e.paginate.setPage(b.parseJSON(f))}catch(a){throw new Error("ajax결과값에 들어있는 json형식이 잘못 되었습니다.\n("+d.url+")")}else e.paginate.update({page:c.page})})),void e._init())},_init:function(){},getCurrentPage:function(){return this.page},load:function(a,c){var d=this,e=d.options;if(!d._isLoading)return d._isLoading=!0,d.triggerHandler("preload",{page:a}),c||(c={}),c.page=a,b.ajax({url:e.url,type:e.type,data:c}).done(function(b){d.$el.html(b),d.page=a,d.triggerHandler("pageloaded",{page:a})}).always(function(){d._isLoading=!1,d.triggerHandler("loadcomplete")})}})}}(window,jQuery,window[FRAMEWORK_NAME]);