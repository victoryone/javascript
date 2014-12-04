/*!
 * @author common.date.js
 * @email comahead@vi-nyl.com
 * @create 2014-11-25
 * @license MIT License
 */
(function (ctx, $, core, undefined) {
    "use strict";

    /**
     * 날짜관련 유틸함수
     * @namespace
     * @name vinyl.date
     */
    core.addon('date', function () {
        var months = "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(","),
            fullMonths = "January,Febrary,March,April,May,June,July,Augst,September,October,November,December".split(",");


        function compare(d1, d2) {
            if(!(d1 instanceof Date)){ d1 = core.date.parse(d1); }
            if(!(d2 instanceof Date)){ d2 = core.date.parse(d2); }

            return d1.getTime() > d2.getTime() ? -1 : (d1.getTime() === d2.getTime() ? 0 : 1);
        }

        return /** @lends vinyl.date */{
            MONTHS_NAME: months,
            MONTHS_FULLNAME: fullMonths,

            /**
             * 날짜형식을 지정한 포맷의 문자열로 변환
             *
             * @param {Date} formatDate
             * @param {string} formatString} 포맷 문자열
             * @return {string} 결과 문자열
             *
             * @example
             * vinyl.date.format(new Date(), "yy:MM:dd");
             * =>
             */
            format: function (formatDate, formatString) {
                formatString || (formatString = 'yyyy-MM-dd');
                if (formatDate instanceof Date) {
                    var yyyy = formatDate.getFullYear(),
                        yy = yyyy.toString().substring(2),
                        M = formatDate.getMonth() + 1,
                        MM = M < 10 ? "0" + M : M,
                        MMM = this.MONTHS_NAME[M - 1],
                        MMMM = this.MONTHS_FULLNAME[M - 1],
                        d = formatDate.getDate(),
                        dd = d < 10 ? "0" + d : d,
                        h = formatDate.getHours(),
                        hh = h < 10 ? "0" + h : h,
                        m = formatDate.getMinutes(),
                        mm = m < 10 ? "0" + m : m,
                        s = formatDate.getSeconds(),
                        ss = s < 10 ? "0" + s : s,
                        x = h > 11 ? "PM" : "AM",
                        H = h % 12;

                    if (H === 0) {
                        H = 12;
                    }
                    return formatString.replace(/yyyy/g, yyyy).replace(/yy/g, yy).replace(/MMMM/g, MMMM).replace(/MMM/g, MMM).replace(/MM/g, MM).replace(/M/g, M).replace(/dd/g, dd).replace(/d/g, d).replace(/hh/g, hh).replace(/h/g, h).replace(/mm/g, mm).replace(/m/g, m).replace(/ss/g, ss).replace(/s/g, s).replace(/!!!!/g, MMMM).replace(/!!!/g, MMM).replace(/H/g, H).replace(/x/g, x);
                } else {
                    return "";
                }
            },

            /**
             *
             * @param {string} date
             * @returns {boolean}
             */
            isValid: function(date) {
                try {
                    return !isNaN( this.parse(date).getTime() );
                } catch(e){
                    return false;
                }
            },

            /**
             * date가 start와 end사이인지 여부
             *
             * @param {Date} date 날짜
             * @param {Date} start 시작일시
             * @param {Date} end 만료일시
             * @return {boolean}
             */
            between: function (date, start, end) {
                return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
            },

            /**
             * 날짜 비교
             *
             * @function
             * @name vinyl.date.compare
             * @param {Date} date1 날짜1
             * @param {Date} date2 날짜2
             * @return {number} -1: date1가 이후, 0: 동일, 1:date2가 이후
             */
            compare: compare,

            /**
             * 년월일이 동일한가
             *
             * @param {Date} date1 날짜1
             * @param {Date} date2 날짜2
             * @return {boolean}
             */
            equalsYMH: function(a, b) {
                var ret = true;
                if (!a || !a.getDate || !b || !b.getDate) { return false; }
                each(['getFullYear', 'getMonth', 'getDate'], function(fn) {
                    ret = ret && (a[fn]() === b[fn]());
                    if (!ret) { return false; }
                });
                return ret;
            },

            /**
             * value날짜가 date이후인지 여부
             *
             * @param {Date} value 날짜
             * @param {Date} date
             * @return {boolean}
             */
            isAfter: function (value, date) {
                return compare(value, date || new Date()) === 1;
            },

            /**
             * value날짜가 date이전인지 여부
             *
             * @param {Date} value 날짜
             * @param {Date} date
             * @return {boolean}
             */
            isBefore: function (value, date) {
                return compare(value, date || new Date()) === -1;
            },

            /**
             * 주어진 날짜를 기준으로 type만큼 가감된 날짜를 format형태로 반환(내가 이걸 왜 beforeDate로 명명 했을까나..;;;)
             * @param {Date} date 기준날짜
             * @param {string} type -2d, -3d, 4M, 2y ..
             * @param {string} format
             * @returns {Date|String}
             */
            beforeDate: function(date, type, format) {
                date = this.parse(date);
                var m = type.match(/([-+]*)([0-9]*)([a-z]+)/i),
                    g = m[1] === '-' ? -1 : 1,
                    d = (m[2]|0) * g;

                switch(m[3]) {
                    case 'd':
                        date.setDate(date.getDate() + d);
                        break;
                    case 'w':
                        date.setDate(date.getDate() + (d * 7));
                        break;
                    case 'M':
                        date.setMonth(date.getMonth() + d);
                        break;
                    case 'y':
                        date.setFullYear(date.getFullYear() + d);
                        break;
                }
                if(format) {
                    return this.format(date, format);
                }
                return date;
            },

            /**
             * 주어진 날짜 형식의 문자열을 Date객체로 변환
             *
             * @function
             * @name vinyl.date.parse
             * @param {string} dateStringInRange 날짜 형식의 문자열
             * @return {Date}
             */
            parse: (function() {
                var isoExp = /^\s*(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?\s*$/;
                return function (dateStringInRange) {
                    var date, month, parts;

                    if (dateStringInRange instanceof Date) {
                        return dateStringInRange;
                    }

                    dateStringInRange = (dateStringInRange+'').replace(/[^\d]+/g, '');
                    date = new Date(dateStringInRange);
                    if (!isNaN(date)) {
                        return date;
                    }

                    date = new Date(NaN);
                    parts = isoExp.exec(dateStringInRange);

                    if (parts) {
                        month = +parts[2];
                        date.setFullYear(parts[1]|0, month - 1, parts[3]|0);
                        date.setHours(parts[4]|0);
                        date.setMinutes(parts[5]|0);
                        date.setSeconds(parts[6]|0);
                        if (month != date.getMonth() + 1) {
                            date.setTime(NaN);
                        }
                        return date;
                    }
                    return new Date;
                };
            })(),

            /**
             * 두 날짜의 월 간격
             * @param {Date} d1 날짜 1
             * @param {Date} d2 날짜 2
             * @return {number}
             */
            monthDiff: function(d1, d2) {
                d1 = this.parse(d1);
                d2 = this.parse(d2);

                var months;
                months = (d2.getFullYear() - d1.getFullYear()) * 12;
                months -= d1.getMonth() + 1;
                months += d2.getMonth();
                return months;
            },

            /**
             * 주어진 년월의 일수를 반환
             *
             * @param {number} year 년도
             * @param {number} month 월
             * @return {Date}
             */
            daysInMonth: function(year, month) {
                var dd = new Date(year|0, month|0, 0);
                return dd.getDate();
            },

            /**
             * 주어진 시간이 현재부터 몇시간 이전인지 표현(예: -54000 -> 54초 이전)
             *
             * @function
             * @name vinyl.date.prettyDuration
             * @param {Date|Interval} time 시간
             * @param {Date|Interval} time (Optional) 기준시간
             * @return {Object}
             *
             * @example
             * vinyl.date.prettyDuration(new Date() - 51811); -> "52초 이전"
             */
            prettyDuration: (function() {
                var ints = {
                    '초': 1,
                    '분': 60,
                    '시': 3600,
                    '일': 86400,
                    '주': 604800,
                    '월': 2592000,
                    '년': 31536000
                };

                return function(time, std, tailWord) {
                    std || (std = +new Date);
                    tailWord || (tailWord = '이전');

                    if(time instanceof Date) {
                        time = time.getTime();
                    }
                    // time = +new Date(time);

                    var gap = (std - time) / 1000,
                        amount, measure;

                    for (var i in ints) {
                        if (gap > ints[i]) { measure = i; }
                    }

                    amount = gap / ints[measure];
                    amount = gap > ints.day ? (Math.round(amount * 100) / 100) : Math.round(amount);
                    amount += measure + ' ' + tailWord;

                    return amount;
                };
            }()),

            /**
             * 밀리초를 시,분,초로 변환
             * @param time
             * @returns {Object}
             */
            msToTime: function(amount) {
                var days = 0,
                    hours = 0,
                    mins = 0,
                    secs = 0;

                amount = amount / 1000;
                days = Math.floor(amount / 86400), amount = amount % 86400;
                hours = Math.floor(amount / 3600), amount = amount % 3600;
                mins = Math.floor(amount / 60), amount = amount % 60;
                secs = Math.floor(amount);

                return {
                    days: days,
                    hours: hours,
                    mins: mins,
                    secs: secs
                };
            },

            /**
             * 주어진 두 날짜의 간견을 시, 분, 초로 반환
             *
             * @function
             * @param {Date|Interval} time 시간
             * @param {Date|Interval} time 시간
             * @return {Object}
             *
             * @example
             * vinyl.date.timeDiff(new Date, new Date(new Date() - 51811));
             */
            diffTime: function(t1, t2) {
                if(!core.is(t1, 'date')) { t1 = new Date(t1); };
                if(!core.is(t2, 'date')) { t2 = new Date(t2); };

                var diff = t1.getTime() - t2.getTime(),
                    ddiff = diff;

                diff = Math.abs(diff);

                var ms = diff % 1000;
                diff /= 1000;

                var s = Math.floor(diff % 60);
                diff /= 60;

                var m = Math.floor(diff % 60);
                diff /= 60;

                var h = Math.floor(diff % 24);
                diff /= 24;

                var d = Math.floor(diff);

                var w = Math.floor(diff / 7);

                return {
                    ms: ms,
                    secs: s,
                    mins: m,
                    hours: h,
                    days: d,
                    weeks: w,
                    diff: ddiff
                };
            },

            /**
             * 주어진 날짜가 몇번째 주인가
             * @function
             * @param {Date} date 날짜
             * @returns {number}
             */
            weekOfYear : (function() {
                var ms1d = 1000 * 60 * 60 * 24,
                    ms7d = 7 * ms1d;

                return function(date) {
                    var DC3 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 3) / ms1d,
                        AWN = Math.floor(DC3 / 7),
                        Wyr = new Date(AWN * ms7d).getUTCFullYear();

                    return AWN - Math.floor(Date.UTC(Wyr, 0, 7) / ms7d) + 1;
                };
            }()),

            /**
             * 윤년인가
             * @param {number} y 년도
             * @returns {boolean}
             */
            isLeapYear: function ( y ) {
                if ( toString.call( y ) === '[object Date]' ) { y = y.getUTCFullYear(); }
                return (( y % 4 === 0 ) && ( y % 100 !== 0 )) || ( y % 400 === 0 );
            },

            /**
             * 날짜 가감함수
             * @param {Date} date 날짜
             * @param {string} interval 가감타입(ms, s, m, h, d, M, y)
             * @param {number} value 가감 크기
             * @returns {Date}
             * @example
             * // 2014-06-10에서 y(년도)를 -4 한 값을 계산
             * var d = vinyl.date.add(new Date(2014, 5, 10), 'y', -4); // 결과 => 2010-06-10
             */
            add: function(date, interval, value) {
                var d = new Date(date.getTime());
                if (!interval || value === 0) {
                    return d;
                }

                switch(interval) {
                    case "ms":
                        d.setMilliseconds(d.getMilliseconds() + value);
                        break;
                    case "s":
                        d.setSeconds(d.getSeconds() + value);
                        break;
                    case "m":
                        d.setMinutes(d.getMinutes() + value);
                        break;
                    case "h":
                        d.setHours(d.getHours() + value);
                        break;
                    case "d":
                        d.setDate(d.getDate() + value);
                        break;
                    case "M":
                        d.setMonth(d.getMonth() + value);
                        break;
                    case "y":
                        d.setFullYear(d.getFullYear() + value);
                        break;
                }
                return d;
            },

            /**
             * 시분초 normalize화 처리
             * @param h
             * @param M
             * @param s
             * @param ms
             * @returns {{day: number, hour: (*|number), min: (*|number), sec: (*|number), ms: (*|number)}}
             * @example
             * vinyl.date.normalize(0, 0, 120, 0) // => {day:0, hour: 0, min: 2, sec: 0, ms: 0} // 즉, 120초가 2분으로 변환
             */
            normalize: function(h, M, s, ms) {
                h = h || 0;
                M = M || 0;
                s = s || 0;
                ms = ms || 0;

                var d = 0;

                if(ms > 1000) {
                    s += Math.floor(ms / 1000);
                    ms = ms % 1000;
                }

                if(s > 60) {
                    M += Math.floor(s / 60);
                    s = s % 60;
                }

                if(M > 60) {
                    h += Math.floor(M / 60);
                    M = M % 60;
                }

                if(h > 24) {
                    d += Math.floor(h / 24);
                    h = h % 24;
                }

                return {
                    day: d,
                    hour: h,
                    min: M,
                    sec: s,
                    ms: ms
                }
            }
        };
    });

})(window, jQuery, window[LIB_NAME]);