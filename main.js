// ==UserScript==
// @name         巴哈姆特自動簽到（含公會、動畫瘋）
// @namespace    https://home.gamer.com.tw/moontai0724
// @version      3.4.2.5
// @description  巴哈姆特自動簽到腳本
// @author       moontai0724
// @match        https://*.gamer.com.tw/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @connect      www.gamer.com.tw
// @connect      guild.gamer.com.tw
// @connect      ani.gamer.com.tw
// @connect      home.gamer.com.tw
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @supportURL   https://home.gamer.com.tw/creationDetail.php?sn=3852242
// ==/UserScript==

(function () {
    'use strict';
    // 是否自動簽到公會？
    // true 為是，false 為否。
    var signGuild = true;

    // 是否開啟每日動畫瘋作答？
    // true 為是，false 為否。
    var answerAnime = true;

    // 是否自動從 blackxblue 小屋創作獲取每日動畫瘋答案？
    // true 為是，false 為否。
    // 若是，首次使用將跳出訂閱 blackxblue 小屋的提示。
    //       當如果答案提供者尚未發表答案，會跳出手動作答視窗，可以選擇作答或是延後提醒。
    //       若延後，當時間到了，會檢查答案出來了沒？如果答案出來了，就會自動作答；還沒，就會再跳視窗。
    // 若否，每日尚未作答題目時，將會跳出手動答題視窗。
    // 請注意，答案不保證正確性，若當日答錯無法領取獎勵，我方或答案提供方並不為此負責。
    var autoGetAnimeAnsFromblackxblue = false;

    // 如果當天 00:00 後幾分鐘內答案還沒出來，不要提醒我手動作答？1440 分鐘 = 24 小時 = 不提醒
    var dailyDelayNotice = 0;

    // ----------------------------------------------------------------------------------------------------

    // 程式開始
    var LastAutoSignTime = GM_getValue('LastAutoSignTime') ? Number(GM_getValue('LastAutoSignTime')) : 0;
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    if (!(today < LastAutoSignTime && LastAutoSignTime < today + 86400000)) {
        if (GM_getValue('AnimeQuizAnswered') == true) GM_setValue('AnimeQuizAnswered', false);
        checkSign().then(data => {
            switch (data.signin) {
                case 1:
                    console.log("Signed", JSON.stringify(data));
                    if (!signGuild) GM_setValue('LastAutoSignTime', (new Date()).getTime());
                    break;
                case 0:
                    startSign().then(data => console.log(data));
                    if (!signGuild) GM_setValue('LastAutoSignTime', (new Date()).getTime());
                    break;
                case -1:
                    console.log("Not logged in", JSON.stringify(data));
                    if (location.href != 'https://user.gamer.com.tw/login.php') {
                        if (window.confirm('您尚未登入！簽到作業無法正確執行。是否立刻導向至登入網頁？')) {
                            location.href = 'https://user.gamer.com.tw/login.php';
                        }
                    }
                    break;
            }

            if (signGuild && data.signin != -1) {
                GM_xmlhttpRequest({
                    method: "get",
                    url: "/ajax/topBar_AJAX.php?type=guild",
                    cache: false,
                    onload: data => {
                        data = data.response;
                        if (data != '') {
                            let guild_list = jQuery(data).find('a.TOP-msgpic').map((index, value) => (new URL(value.href)).searchParams.get('sn'));
                            console.log(guild_list, "length: " + guild_list.length);
                            guild_list.length > 0 ? (function sign(sort) {
                                GM_xmlhttpRequest({
                                    method: 'POST',
                                    url: 'https://guild.gamer.com.tw/ajax/guildSign.php',
                                    cache: false,
                                    data: 'sn=' + guild_list[sort],
                                    headers: {
                                        "Content-Type": "application/x-www-form-urlencoded",
                                    },
                                    onload: data => {
                                        console.log("signed: ", guild_list[sort]);
                                        sort < guild_list.length - 1 ? sign(sort + 1) : (console.log('Guild sign success!'), GM_setValue('LastAutoSignTime', (new Date()).getTime()));
                                    }
                                });
                            })(0) : (console.log('No guild.'), GM_setValue('LastAutoSignTime', (new Date()).getTime()));
                        }
                    }
                });
            }
        });
    }

    // 動畫瘋答題由 maple3142/動畫瘋工具箱 支援：https://greasyfork.org/zh-TW/scripts/39136
    if (answerAnime && GM_getValue('AnimeQuizAnswered') != true && BAHAID && (GM_getValue('answerAnimeDelayTime') ? GM_getValue('answerAnimeDelayTime') : 0) < (new Date()).getTime()) {
        if (GM_getValue('AnimeQuizAnswered') == undefined) {
            if (window.confirm('您選擇了自動由 blackxblue 小屋獲取答案，是否訂閱 blackxblue？（此訊息只會在初次開啟時出現）')) topNotify_follow('blackxblue');
        }
        if (autoGetAnimeAnsFromblackxblue) {
            getTodayAnswer().then(data => answerQuestion(data).then(function (result) {
                console.log("\u7B54\u984C\u6210\u529F: ".concat(result.gift));
            }, function (err) {
                console.error("\u56DE\u7B54\u554F\u984C\u5931\u6557: ".concat(err.msg));
            }), () => {
                if (((new Date(new Date().setHours(0, 0, 0, 0))).getTime() + dailyDelayNotice * 1000) < (new Date()).getTime()) {
                    getQuestion().then(question => {
                        if (question.error) GM_setValue('AnimeQuizAnswered', true);
                        else manualAnswer(question);
                    });
                }
            });
        } else getQuestion().then(question => {
            if (question.error) GM_setValue('AnimeQuizAnswered', true);
            else manualAnswer(question);
        });
    }

    // days: 已連續簽到天數

    // check
    // signed: {"signin": 1,"days": xxx}
    // not signed: {"signin":0,"days":0}
    // not logged in: {"signin":-1}
    function checkSign() {
        return new Promise(function (resolve) {
            GM_xmlhttpRequest({
                method: "POST",
                url: "https://www.gamer.com.tw/ajax/signin.php",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded;",
                },
                data: 'action=2',
                responseType: "json",
                cache: false,
                onload: data => resolve(data.response)
            });
        });
    }

    // sign
    // signed: {"code":-2,"message":"今天您已經簽到過了喔"}
    // not signed: {"nowd": xxx,"days": xxx,"message":"簽到成功"}
    // not logged in: {"signin":-1}
    function startSign() {
        return new Promise(function (resolve) {
            GM_xmlhttpRequest({
                method: "GET",
                url: "https://www.gamer.com.tw/ajax/get_csrf_token.php",
                cache: false,
                onload: token => GM_xmlhttpRequest({
                    method: "POST",
                    url: "https://www.gamer.com.tw/ajax/signin.php",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded;",
                    },
                    data: 'action=1&token=' + token.response,
                    responseType: "json",
                    cache: false,
                    onload: data => resolve(data.response)
                })
            });
        });
    }

    function getCORS(url) {
        return new Promise(function (res, rej) {
            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                responseType: 'text',
                onload: function onload(r) {
                    return res(r.response);
                },
                onerror: rej
            });
        });
    }

    // 從 blackxblue 創作獲取今日動畫瘋解答
    function getTodayAnswer() {
        return new Promise((resolve, reject) => {
            getCORS('https://home.gamer.com.tw/creationCategory.php?owner=blackxblue&c=370818').then(function (page) {
                var url = jQuery(page).find('.TS1')[0];
                url = new RegExp('\\d{2}/' + (new Date()).getDate().toString().padStart(2, '0')).test(url.textContent) ? url.getAttribute('href') : undefined;
                if (!url) {
                    reject('No url found.');
                    return 0;
                }
                getCORS('https://home.gamer.com.tw/' + url).then(page => resolve(/A:(\d)/.exec(jQuery(page).find('.MSG-list8C').text().replace(/\s/g, "").replace(/：/g, ":"))[1]));
            });
        });
    }

    function answerQuestion(t) {
        return new Promise(function (resolve, reject) {
            getQuestion().then(obj => {
                GM_xmlhttpRequest({
                    method: 'POST',
                    url: 'https://ani.gamer.com.tw/ajax/animeAnsQuestion.php',
                    responseType: "json",
                    cache: false,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded;",
                    },
                    data: 'token=' + obj.token + '&ans=' + t + '&t=' + Date.now(),
                    onload: o => {
                        GM_setValue('AnimeQuizAnswered', true);
                        if (o.response.error || o.response.msg === '答題錯誤') reject(o.response);
                        else resolve(o.response);
                    }
                });
            });
        });
    }

    function getQuestion() {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: 'https://ani.gamer.com.tw/ajax/animeGetQuestion.php?t=' + Date.now(),
                responseType: "json",
                cache: false,
                onload: data => resolve(data.response),
                onerror: reject
            })
        })
    }

    // 巴哈原生訂閱
    function topNotify_follow(t) {
        var c = "";
        c += '<form action="" method="POST" name="notifyfollow"><table border="0" width="400px"><tr>',
            c += '<td><input name="c1" type="checkbox" value="1" checked/>叭啦叭啦</td>',
            c += '<td><input name="c2" type="checkbox" value="2" checked/>哈啦區發表</td>',
            c += '<td><input name="c3" type="checkbox" value="4" checked/>小屋發表</td>',
            c += '<td><input name="c4" type="checkbox" value="16" checked/>他的推薦</td>',
            c += '<td><input name="c5" type="checkbox" value="32" checked/>實況頻道</td>',
            c += '</tr></table></form>',
            egg.mutbox(c, "訂閱 blackxblue 動態", {
                "訂閱": function () {
                    topNotify_follow2(t)
                }
            });
    }

    function topNotify_follow2(t) {
        var e = document.forms.notifyfollow,
            a = 0;
        return e.c1.checked && (a |= e.c1.value),
            e.c2.checked && (a |= e.c2.value),
            e.c3.checked && (a |= e.c3.value),
            e.c4.checked && (a |= e.c4.value),
            e.c5.checked && (a |= e.c5.value),
            GM_xmlhttpRequest({
                method: "POST",
                url: "https://home.gamer.com.tw/ajax/addFollow_AJAX.php",
                cache: false,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded;",
                },
                data: "who=" + t + "&v=" + a,
                onload: function (t) {
                    egg.lightbox.close(), egg.mutbox(t.response, "訂閱動態")
                }
            }), !1
    }

    // 手動回答
    function manualAnswer(data) {
        // black background
        let manualAnswer_Background = document.createElement("div");
        manualAnswer_Background.id = "manualAnswer_Background";
        manualAnswer_Background.setAttribute("onmousedown", "javascript:if(!jQuery(this).hasClass('mouseenter')) jQuery('#manualAnswer_Background').remove();");
        manualAnswer_Background.style = "background-color: rgba(0, 0, 0, 0.5); z-index: 95; position: fixed; top: 0px; bottom: 0px; left: 0px; right: 0px; width: 100%; height: 100%; padding-top: 35px;" +
            " border: 1px solid #a7c7c8;" +
            " display: flex; align-items: center; justify-content: center;" +
            " -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box;";
        document.body.appendChild(manualAnswer_Background);

        // window case
        let manualAnswer_Case = document.createElement("div");
        manualAnswer_Case.id = "manualAnswer_Case";
        manualAnswer_Case.setAttribute("onmouseenter", "javascipt:jQuery('#manualAnswer_Background').addClass('mouseenter');");
        manualAnswer_Case.setAttribute("onmouseleave", "javascipt:jQuery('#manualAnswer_Background').removeClass('mouseenter');");
        manualAnswer_Case.style = "position: absolute; min-height: 50%; min-width: 40%; overflow: hidden;" +
            " display: flex; align-item: stretch; flex-direction: column;" +
            " background-color: #FFFFFF; border: 1px solid #a7c7c8;";
        document.getElementById("manualAnswer_Background").appendChild(manualAnswer_Case);

        // title
        let manualAnswer_Title = document.createElement("div");
        manualAnswer_Title.setAttribute("style", "display: flex; align-items: center; justify-content: center; width: 100%; min-height: 35px;" +
            " background-color: #E5F7F8; color: #484b4b;" +
            " font-size: 22px; font-weight: bold; font-family: '微軟正黑體', 'Microsoft JhengHei', '黑體-繁', '蘋果儷中黑', 'sans-serif';");
        manualAnswer_Title.innerHTML = (new Date()).toLocaleString('zh-tw', { month: 'numeric', day: 'numeric' }) + " 動漫通 手動作答";
        document.getElementById("manualAnswer_Case").appendChild(manualAnswer_Title);

        // content
        let manualAnswer_Content = document.createElement("div");
        manualAnswer_Content.id = "manualAnswer_Content";
        manualAnswer_Content.setAttribute("style", "display: flex; align-items: center; justify-content: center; flex-flow: row wrap; flex-grow: 1; overflow: auto; padding: 10px;" +
            " background-color: #FFFFFF;" +
            " word-break: break-all; font-size: 16px; line-height: 150%; text-align: center; font-family: 微軟正黑體, Microsoft JhengHei, 黑體-繁, 蘋果儷中黑, sans-serif;" +
            " -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box;");
        manualAnswer_Content.innerHTML = '<div>關聯動漫：' + data.game + '<br>問題：' + data.question + '<br>1. ' + data.a1 + '<br>2. ' + data.a2 + '<br>3. ' + data.a3 + '<br>4. ' + data.a4 + '<br>出題者：' + data.userid + '<br>到官方粉絲團找答案：<a href="https://www.facebook.com/animategamer" target="_blank">https://www.facebook.com/animategamer</a></div>';
        document.getElementById("manualAnswer_Case").appendChild(manualAnswer_Content);

        // bottom element
        let manualAnswer_BottomArea = document.createElement("div");
        manualAnswer_BottomArea.id = "manualAnswer_BottomArea";
        manualAnswer_BottomArea.style = "display: flex; align-items: center; justify-content: center;" +
            " background-color: #E5F7F8;" +
            " width: 100%; min-height: 35px;";
        document.getElementById('manualAnswer_Case').appendChild(manualAnswer_BottomArea);

        // Answer button
        let manualAnswer_AnswerButton = document.createElement('button');
        manualAnswer_AnswerButton.innerHTML = '作答';
        manualAnswer_AnswerButton.id = 'manualAnswer_AnswerButton';
        document.getElementById('manualAnswer_BottomArea').appendChild(manualAnswer_AnswerButton);

        // Answer button
        let manualAnswer_getAnswerButton = document.createElement('button');
        manualAnswer_getAnswerButton.innerHTML = '獲取答案';
        manualAnswer_getAnswerButton.id = 'manualAnswer_getAnswerButton';
        manualAnswer_getAnswerButton.style = 'margin-left: 10px;';
        document.getElementById('manualAnswer_BottomArea').appendChild(manualAnswer_getAnswerButton);

        document.getElementById('manualAnswer_BottomArea').innerHTML += '<div style="margin-left: 10px;">延後 ' +
            '<input type="number" name="manualAnswer_DelayTime" min="1" max="1440" value="10">' +
            ' 分鐘後再提醒我<button id="manualAnswer_DelayButton" style="margin-left: 10px;">延時</button></div>';

        document.getElementById('manualAnswer_AnswerButton').onclick = () => {
            if (GM_getValue('AnimeQuizAnswered') != true) {
                let Ans = undefined, times = 0;
                do {
                    Ans = window.prompt('請輸入答案 (1,2,3,4)');
                    times++;
                } while (!(/^[1|2|3|4]?$/.test(Ans) || times > 10));

                if (/^[1|2|3|4]?$/.test(Ans)) {
                    answerQuestion(Ans).then(function (result) {
                        console.log("\u7B54\u984C\u6210\u529F: ".concat(result.gift));
                        document.getElementById('manualAnswer_Content').innerHTML = "\u7B54\u984C\u6210\u529F: ".concat(result.gift);
                    }, function (err) {
                        console.error("\u56DE\u7B54\u554F\u984C\u5931\u6557: ".concat(err.msg));
                        document.getElementById('manualAnswer_Content').innerHTML = "\u56DE\u7B54\u554F\u984C\u5931\u6557: ".concat(err.msg);
                    });
                    GM_setValue('AnimeQuizAnswered', true);
                    document.getElementById('manualAnswer_AnswerButton').innerHTML = '關閉';
                    document.getElementById('manualAnswer_AnswerButton').setAttribute('onclick', "jQuery('#manualAnswer_Background').remove();");
                }
            }
        }

        document.getElementById('manualAnswer_getAnswerButton').onclick = () => getTodayAnswer().then(ans => window.alert('從 blackxblue 小屋獲取的答案可能是：' + ans), err => window.alert('目前尚未有答案＞＜可至官方粉絲團尋找答案哦～'));

        document.getElementById('manualAnswer_DelayButton').onclick = () => {
            let delayTime = document.getElementsByName('manualAnswer_DelayTime')[0].value;
            if (1440 >= Number(delayTime) && Number(delayTime) >= 1) {
                GM_setValue('answerAnimeDelayTime', (new Date()).getTime() + Number(delayTime) * 60 * 1000);
                jQuery('#manualAnswer_Background').remove();
            } else {
                window.alert('延時時間必須介於 1 到 1440 之間！');
            }
        }
    }
    // manualAnswer({ "game": "\u9f8d\u738b\u7684\u5de5\u4f5c\uff01", "question": "\u9f8d\u738b\u7684\u5f1f\u5b50\u662f\u4ee5\u4e0b\u54ea\u4f4d?", "a1": "\u7a7a\u9280\u5b50", "a2": "\u96db\u9db4\u611b", "a3": "\u6c34\u8d8a\u6faa", "a4": "\u8c9e\u4efb\u7dbe\u4e43", "userid": "ww891113", "token": "01e0779c7298996032acdacac3261fac28d32e8bb44f4dda5badb111" });
})();