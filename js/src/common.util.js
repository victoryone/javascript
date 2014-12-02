/*!
 * @author common.util.js
 * @email comahead@vi-nyl.com
 * @create 2014-11-25
 * @license MIT License
 */
(function (ctx, $, core, undefined) {
    "use strict";

    /**
     * @namespace
     * @name vinyl.util
     */
    core.addon('util', function() {

        return /** @lends vinyl.util */{


            /**
             * ie하위버전에서 주어진 셀렉터에 해당하는 png 이미지가 정상적으로 출력되도록 AlphaImageLoader필터를 적용시켜 주는 함수
             * png
             */
            png24: function ( selector ) {
                var $target;
                if ( typeof (selector) == 'string') {
                    $target = $(selector + ' img');
                } else {
                    $target = selector.find(' img');
                }
                var c = new Array();
                $target.each(function(j) {
                    c[j] = new Image();
                    c[j].src = this.src;
                    if (navigator.userAgent.match(/msie/i))
                        this.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled='true',sizingMethod='scale',src='" + this.src + "')";
                });
            },

            /**
             * ie하위버전에서 페이지에 존재하는 모든 png 이미지가 정상적으로 출력되도록 AlphaImageLoader필터를 적용시켜 주는 함수
             * png Fix
             */
            pngFix: function () {
                var s, bg;
                $('img[@src*=".png"]', document.body).each(function () {
                    this.css('filter', 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + this.src + '\', sizingMethod=\'\')');
                    this.src = '/resource/images/core/blank.gif';
                });
                $('.pngfix', document.body).each(function () {
                    var $this = $(this);

                    s = $this.css('background-image');
                    if (s && /\.(png)/i.test(s)) {
                        bg = /url\("(.*)"\)/.exec(s)[1];
                        $this.css('background-image', 'none');
                        $this.css('filter', "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + bg + "',sizingMethod='scale')");
                    }
                });
            },

            /**
             * 페이지에 존재하는 플래쉬의 wmode모드를 opaque로 변경
             */
            wmode: function () {
                $('object').each(function () {
                    var $this;
                    if (this.classid.toLowerCase() === 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000' || this.type.toLowerCase() === 'application/x-shockwave-flash') {
                        if (!this.wmode || this.wmode.toLowerCase() === 'window') {
                            this.wmode = 'opaque';
                            $this = $(this);
                            if (typeof this.outerHTML === 'undefined') {
                                $this.replaceWith($this.clone(true));
                            } else {
                                this.outerHTML = this.outerHTML;
                            }
                        }
                    }
                });
                $('embed[type="application/x-shockwave-flash"]').each(function () {
                    var $this = $(this),
                        wm = $this.attr('wmode');
                    if (!wm || wm.toLowerCase() === 'window') {
                        $this.attr('wmode', 'opaque');
                        if (typeof this.outerHTML === 'undefined') {
                            $this.replaceWith($this.clone(true));
                        } else {
                            this.outerHTML = this.outerHTML;
                        }
                    }
                });
            },

            /**
             * 팝업을 띄우는 함수. (vinyl.openPopup으로도 사용가능)
             * @param {string} url 주소
             * @param {number=} width 너비.
             * @param {number=} height 높이.
             * @param {opts=} 팝업 창 모양 제어 옵션.
             */
            openPopup: function (url, width, height, opts) {
                opts = extend({

                }, opts);
                width = width || 600;
                height = height || 400;
                //var winCoords = vinyl.util.popupCoords(width, height),
                var target = opts.target || '',
                    feature = 'app_, ',
                    tmp = [];

                delete opts.name;
                for(var key in opts) {
                    tmp.push(key + '=' + opts[ key ]);
                }
                core.browser.isSafari && tmp.push('location=yes');
                tmp.push('height='+height);
                tmp.push('width='+width);
                /* + ', top=' + winCoords.top + ', left=' + winCoords.left;*/
                feature += tmp.join(', ');

                window.open(
                    url,
                    target,
                    feature
                );
            },

            /**
             * 팝업의 사이즈를 $el 사이즈에 맞게 조절
             */
            resizePopup: function($el) {
                if (!($el instanceof jQuery)) { $el = $($el); }
                window.resizeTo($el.width(), $el.height());
            },

            /**
             * 팝업의 사이즈에 따른 화면상의 중앙 위치좌표를 반환
             * @param {number} w 너비.
             * @param {number} h 높이.
             * @return {JSON} {left: 값, top: 값}
             */
            popupCoords: function (w, h) {
                var wLeft = window.screenLeft ? window.screenLeft : window.screenX,
                    wTop = window.screenTop ? window.screenTop : window.screenY,
                    wWidth = window.outerWidth ? window.outerWidth : document.documentElement.clientWidth,
                    wHeight = window.outerHeight ? window.outerHeight : document.documentElement.clientHeight;

                return {
                    left: wLeft + (wWidth / 2) - (w / 2),
                    top: wTop + (wHeight / 2) - (h / 2) - 25
                };
            },

            /**
             * data-src에 있는 이미지주소를 실제로 불러들인 다음, 주어진 사이즈내에서 가운데에 배치시켜주는 함수
             * @param {jQuery} $imgs
             * @param {Number} wrapWidth 최대 너비 값
             * @param {Number} wrapHeight 최대 높이 값
             * @param {Function} [onError] (optional) 이미지를 불어오지 못했을 경우 실행할 콜백함수
             * @return {Boolean} true 불러들인 이미지가 있었는지 여부
             */
            centeringImage: function ($imgs, wrapWidth, wrapHeight, onError) {
                var hasLazyImage = false;
                var dataSrcAttr = 'data-src';

                $imgs.filter('img[data-src]').each(function(i) {
                    var $img = $(this);
                    wrapWidth = wrapWidth || $img.parent().width();
                    wrapHeight = wrapHeight || $img.parent().height();

                    // 이미지가 로드되면, 실제 사이즈를 체크해서 가로이미지인지 세로이미지인지에 따라 기준이 되는 width, height에 지정한다.
                    $img.one('load', function() {
                        $img.removeAttr('width height').css({'width':'auto', 'height':'auto'});
                        if ($img.attr('data-no-height') === 'true' && this.width > wrapWidth) {
                            $img.css('width', wrapWidth);
                        } else if ($img.attr('data-no-width') === 'true' && this.height > wrapHeight) {
                            $img.css('height', wrapWidth);
                        } else {
                            var isHoriz = this.width > this.height;
                            if ( isHoriz ) { // 가로로 긴 이미지
                                $img.css('width', Math.min(this.width, wrapWidth));
                            } else { // 세로로 긴 이미지
                                $img.css('height', Math.min(this.height, wrapHeight));
                            }
                        }
                    }).attr('src', $img.attr('data-src')).removeAttr('data-src');
                });
                return hasLazyImage;
            },

            /**
             * data-src속성에 있는 이미지url를 src에 설정하여 로드시키는 함수
             * @param { jquery/string } target 이미지 요소
             * @param { jquery/string } loadingClip
             * @return { jquery } deferred
             */
            lazyImages: function(target, loadingClip) {
                var $imgs = $(target),
                    $loading = $(loadingClip),
                    len = $imgs.length,
                    def = $.Deferred();

                function loaded(e) {
                    if (e.type === 'error') {
                        def.reject(e.target);
                        return;
                    }
                    var $target;
                    if($target = $(this).data('target')) {
                        $target.css('background', 'url('+this.src+')');
                    }

                    len--;
                    if (!len) {
                        if ($loading) {
                            $loading.addClass("none");
                        }
                        def.resolve();
                    }
                }

                if(!len){
                    $loading.addClass("none");
                    def.resolve();
                } else {

                    if ($loading) {
                        $loading.removeClass("none");
                    }

                    $imgs.each(function(i) {
                        var $img = $imgs.eq(i);
                        if(!$img.is('img')) {
                            $img = $('<img>').data({
                                'target': $img[0],
                                'src': $img.attr('data-src')
                            });
                        }

                        $img.one("load.lazyload error.lazyload", loaded);
                        var src = $img.attr("data-src");

                        if (src) {
                            $img.attr("src", src);
                        } else if (this.complete) {
                            $img.trigger("load");
                        }
                    });

                }

                return def.promise();
            },

            // 정확한 사이즈계산을 위해 내부에 있는 이미지를 다 불러올 때까지 기다린다.
            waitImageLoad: function($imgs, allowError){
                var me = this,
                    defer = $.Deferred(),
                    count = $imgs.length,
                    loaded = function() {
                        count -= 1;
                        if(count <= 0){
                            defer.resolve();
                        }
                    };

                if(count === 0) {
                    defer.resolve();
                } else {
                    $imgs.each(function(i) {
                        if(this.complete){
                            loaded();
                        } else {
                            $imgs.eq(i).one('load' + (allowError === false?'' : ' error'), loaded);
                        }
                    });
                }

                return defer.promise();
            },

            /**
             * 도큐먼트의 높이를 반환
             * @return {Number}
             */
            getDocHeight: function() {
                var doc = document,
                    bd = doc.body,
                    de = doc.documentElement;

                return Math.max(
                    Math.max(bd.scrollHeight, de.scrollHeight),
                    Math.max(bd.offsetHeight, de.offsetHeight),
                    Math.max(bd.clientHeight, de.clientHeight)
                );
            },

            /**
             * 도큐먼트의 너비를 반환
             * @return {Number}
             */
            getDocWidth: function() {
                var doc = document,
                    bd = doc.body,
                    de = doc.documentElement;
                return Math.max(
                    Math.max(bd.scrollWidth, de.scrollWidth),
                    Math.max(bd.offsetWidth, de.offsetWidth),
                    Math.max(bd.clientWidth, de.clientWidth)
                );
            },

            /**
             * 창의 너비를 반환
             * @return {Number}
             */
            getWinWidth : function() {
                var w = 0;
                if (self.innerWidth) {
                    w = self.innerWidth;
                } else if (document.documentElement && document.documentElement.clientHeight) {
                    w = document.documentElement.clientWidth;
                } else if (document.body) {
                    w = document.body.clientWidth;
                }
                return w;
            },

            /**
             * 창의 높이를 반환
             * @return {Number}
             */
            getWinHeight : function() {
                var w = 0;
                if (self.innerHeight) {
                    w = self.innerHeight;
                } else if (document.documentElement && document.documentElement.clientHeight) {
                    w = document.documentElement.clientHeight;
                } else if (document.body) {
                    w = document.body.clientHeight;
                }
                return w;
            },


            /**
             * @function scroll top animate
             * @param { Integer } y target y
             * @param { Integer } data.triggerY
             * @param { Integer } data.duration
             * @param { function } data.triggerCallback
             * @param { function } data.completeCallback
             */
            scrollTopAnimate: function( y, data ){
                var $body = $("body");
                var duration = ( data == undefined || data.duration == undefined  ) ? 200 : data.duration;

                var isTrigger = false;
                var triggerFuncExe = function(){
                    if( data && data.triggerY != undefined && data.triggerY != "" && $body.scrollTop() < data.triggerY && !isTrigger){
                        isTrigger = true;
                        if( data && data.triggerCallback ){
                            data.triggerCallback();
                        }
                    }
                }

                $body.stop().animate({scrollTop:y}, {duration:duration,
                    step:function(){
                        triggerFuncExe();
                    }, complete:function(){
                        triggerFuncExe();
                        if( data && data.completeCallback ){
                            data.completeCallback();
                        }
                    }, ease: "easeOutQuad"
                });
            },

            /**
             * 주어진 요소의 사이즈 & 위치를 반환
             * @param elem
             * @returns {JSON} {width: 너비, height: 높이, offset: { top: 탑위치, left: 레프트위치}}
             */
            getDimensions: function( elem ) {
                var el = elem[0];
                if ( el.nodeType === 9 ) {
                    return {
                        width: elem.width(),
                        height: elem.height(),
                        offset: { top: 0, left: 0 }
                    };
                }
                if ( $.isWindow( el ) ) {
                    return {
                        width: elem.width(),
                        height: elem.height(),
                        offset: { top: elem.scrollTop(), left: elem.scrollLeft() }
                    };
                }
                if ( el.preventDefault ) {
                    return {
                        width: 0,
                        height: 0,
                        offset: { top: el.pageY, left: el.pageX }
                    };
                }
                return {
                    width: elem.outerWidth(),
                    height: elem.outerHeight(),
                    offset: elem.offset()
                };
            },

            bindCheckAll: function(el) {
                var $con = $(el);

                // 전체 선택
                $con.on('click.globalui', ' input:checkbox:enabled', function (e) {
                    var $el = $(this),
                        $checkes = $con.find('input:checkbox:enabled:not(.d-notcheck)'),
                        $checkAll = $checkes.filter('.d-checkall'),
                        $others = $checkes.not('.d-checkall');

                    if($el.hasClass('d-checkall')) {
                        $others.prop('checked', this.checked);
                    } else {
                        $checkAll.prop('checked', $others.not(':checked').size() === 0);
                    }
                    $checkAll.triggerHandler('checkallchanged');
                });

            },

            getFileName: function(str) {
                var paths = str.split(/\/|\\/g);
                return paths[paths.length - 1];
            },

            // 컨텐츠 사이즈에 맞게 창사이즈 조절
            resizeToContent: function() {
                var innerX, innerY,
                    pageX, pageY,
                    win = window,
                    doc = win.document;

                if (win.innerHeight) {
                    innerX = win.innerWidth;
                    innerY = win.innerHeight;
                } else if (doc.documentElement && doc.documentElement.clientHeight) {
                    innerX = doc.documentElement.clientWidth;
                    innerY = doc.documentElement.clientHeight;
                } else if (doc.body) {
                    innerX = doc.body.clientWidth;
                    innerY = doc.body.clientHeight;
                }

                pageX = doc.body.offsetWidth;
                pageY = doc.body.offsetHeight;

                win.resizeBy(pageX - innerX, pageY - innerY);
            },

            /**
             * 팝업 뛰우기
             */
            openPopup2: function(url, feature, callback) {
                feature = $.extend(feature,  {
                    name: 'popupWin',
                    width: 600,
                    height: 531,
                    align: 'center',
                    resizable: 'no',
                    scrollbars: 'no'
                });
                var f = [];
                core.each(feature, function(val, key){
                    f.push(key + '=' + val);
                });

                var popupWin = window.open('', feature.name, f.join(','));
                if (!popupWin || popupWin.outerWidth === 0 || popupWin.outerHeight === 0) {
                    alert("팝업 차단 기능이 설정되어있습니다\n\n차단 기능을 해제(팝업허용) 한 후 다시 이용해 주십시오.");
                    return;
                }

                if (popupWin.location.href === 'about:blank') {
                    popupWin.location.href = url;
                }

                var limit = 0,
                    fn = function() {
                        if (limit++ > 50) {
                            return;
                        }
                        if (!popupWin.document.body) {
                            setTimeout(fn, 100);
                            return;
                        }
                        callback && callback(popupWin);
                        popupWin.focus();
                    };

                if (!popupWin.document.body) {
                    setTimeout(fn, 100);
                } else {
                    fn();
                }
            }
            /**
             *
             * @param {String} scriptUrl URL
             * @param {Function} [callback] 콜백
             * @return {Deferred} deferred
             */
            /*
             loadScript: (function() {
             var doc = document,
             loaded = {};

             return function(url, callback) {
             var defer = $.Deferred();
             if(loaded[url]){
             callback&&callback();
             defer.resolve(url)
             return defer.promise();
             }

             var script = document.createElement('script');

             script.type = 'text/javascript';
             script.async = true;

             script.onerror = function() {
             defer.reject(url);
             //throw new Error(url + ' not loaded');
             };

             script.onreadystatechange = script.onload = function (e) {
             e = context.event || e;

             if (e.type == 'load' || this.readyState.test(/loaded|complete/)) {
             this.onreadystatechange = null;
             callback&&callback();
             defer.resolve(url);
             }
             };

             script.src = url;
             doc.getElementsByTagName('head')[0].appendChild(script);
             return defer.promise();
             };
             })()*/
        };
    });
    /**
     * vinyl.util.openPopup 함수의 별칭
     * @name vinyl.openPopup
     */
    core.openPopup = core.util.openPopup;
})(window, jQuery, window[FRAMEWORK_NAME]);