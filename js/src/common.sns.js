/*!
 * @author common.sns.js
 * @email comahead@vi-nyl.com
 * @create 2014-11-25
 * @license MIT License
 */
(function (ctx, $, core, undefined) {
    "use strict";

    var $doc = core.$doc,
        win = window;

    var s = {
        PC: 1,
        MOBILE: 2,
        APP: 4
    };

    core.sns = /** @lends vinyl.sns */{
        types: /** @lends vinyl.sns.types */{ //['facebook', 'twitter', 'kakaotalk', 'kakaostory'/* , 'googleplus'*/],
            'facebook': /** @lends vinyl.sns.types.facebook */{
                name: '페이스북',
                support: s.PC | s.MOBILE,
                baseUrl: 'https://www.facebook.com/sharer.php?',
                makeParam: function(data) {
                    data.url = core.uri.addParam(data.url, {
                        '_t': +new Date
                    });
                    return 'u=' + encodeURIComponent(data.url) + (data.title && '&t=' + encodeURIComponent(data.title));
                }
            },
            'twitter': /** @lends vinyl.sns.types.twitter */{
                name: '트위터',
                support: s.PC | s.MOBILE,
                baseUrl: 'https://twitter.com/intent/tweet?',
                makeParam: function(data) {
                    data.desc = data.desc || '';

                    var length = 140 - data.url.length - 6, // ... 갯수
                        txt = data.title + ' - ' + data.desc;

                    txt = txt.length > length ? txt.substr(0, length) + '...' : txt;
                    return 'text=' + encodeURIComponent(txt + ' ' + data.url);
                }
            },
            'kakaotalk': /** @lends vinyl.sns.types.kakaotalk */{
                name: '카카오톡',
                support: s.APP | s.MOBILE,
                makeParam: function(data) {
                    return {
                        msg: data.title + "\n" + (data.desc||''),
                        url: data.url,
                        appid: "vinyl store",
                        appver: "0.1",
                        type: "link",
                        appname: "이마트스토어"
                    };
                }
            },
            'kakaostory': /** @lends vinyl.sns.types.kakaostory */{
                name: '카카오스토리',
                support: s.APP | s.MOBILE,
                makeParam: function(data) {
                    return {
                        post: data.title + "\n" + (data.desc||'')+"\n"+data.url,
                        appid: "vinyl.com",
                        appver: "1.0",
                        apiver: "1.0",
                        appname: "이마트 스토어"
                    };
                }
            },
            'line': /** @lends vinyl.sns.types.line */{
                name: '라인',
                support: s.APP | s.MOBILE,
                baseUrl: 'line://msg/text/',
                store: {
                    android: {
                        intentPrefix: "intent://msg/text/",
                        intentSuffix: "#Intent;scheme=line;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=jp.naver.line.android;end"
                    },
                    ios: "http://itunes.apple.com/jp/app/line/id443904275"
                },
                makeParam: function(data) {
                    return '';
                }
            },
            'googleplus': /** @lends vinyl.sns.types.googleplus */{
                name: '구글플러스',
                support: s.PC | s.MOBILE,
                baseUrl: 'https://plus.google.com/share?',
                makeParam: function(data) {
                    return 'url=' + encodeURIComponent(data.title + ' ' + data.url);
                }
            }
        },

        share: function(type, params) {
            var service = this.types[type];
            if(!service){ return; }

            params.url = (params.url+'').replace(/#$/g, '');
            params.url = params.url || location.href.replace(/#$/g, '');
            params.title = params.title||document.title;

            if(!core.browser.isMobile && service.support&s.MOBILE === 0) {
                alert("‘"+service.name+"’으로의 공유 기능은\n모바일 기기에서만 사용하실 수 있습니다");
                return;
            }

            this._send(type, params);
        },

        _send: function (type, params) {
            var service = this.types[type];
            if(!service){ return; }

            switch(type) {
                case 'facebook':
                case 'twitter':
                    if(window.isApp){
                        core.app&&core.app.cmd('open_out_webpage', 'link='+service.baseUrl + service.makeParam(params));
                    } else {
                        window.open(
                            service.baseUrl + service.makeParam(params),
                            type,
                            'menubar=no,height=300, width=550'
                        );
                    }
                    break;
                case 'kakaotalk':
                    if(!window.kakao){
                        alert('카카오톡 공유기능은 모바일기기에서만 가능합니다.');
                        return;
                    }
                    kakao.link('talk').send(service.makeParam(params));
                    break;
                case 'kakaostory':
                    if(!window.kakao){
                        alert('카카오스토리 공유기능은 모바일기기에서만 가능합니다.');
                        return;
                    }
                    kakao.link('story').send(service.makeParam(params));
                    break;
            }
        }
    };

})(window, jQuery, window[LIB_NAME]);