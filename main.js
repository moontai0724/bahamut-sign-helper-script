// ==UserScript==
// @name         巴哈姆特自動簽到（含公會、動畫瘋）
// @namespace    https://home.gamer.com.tw/moontai0724
// @version      4.0
// @description  巴哈姆特自動簽到腳本
// @author       moontai0724
// @match        https://*.gamer.com.tw/*
// @resource     popup_window https://raw.githubusercontent.com/moontai0724/bahamut-auto-sign-script/master/popup_window.html
// @grant        GM_getResourceText
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @connect      www.gamer.com.tw
// @connect      guild.gamer.com.tw
// @connect      ani.gamer.com.tw
// @connect      home.gamer.com.tw
// @connect      script.google.com
// @connect      script.googleusercontent.com
// @supportURL   https://home.gamer.com.tw/creationDetail.php?sn=3852242
// ==/UserScript==

(function () {
    'use strict';
    // 是否自動簽到公會？
    // true 為是，false 為否。
    const DO_SIGN_GUILD = true;

    // 是否開啟每日動畫瘋作答？開啟則為每日題目出來會跳視窗可作答。
    // true 為是，false 為否。
    const DO_ANSWER_ANIME = true;

    // 是否自動作答動畫瘋題目？
    // true 為是，false 為否。
    const AUTO_ANSWER_ANIME = false;

    // 答案來源是否採用 blackxblue 每日發表的資訊？
    // true 為是，false 為否。
    // 將會自動從 blackxblue 小屋創作獲取每日動畫瘋答案。
    // 若是，首次使用將跳出訂閱 blackxblue 小屋的提示。
    //       當如果答案提供者尚未發表答案，會跳出手動作答視窗，可以選擇作答或是延後提醒。
    //       若延後，當時間到了，會檢查答案出來了沒？如果答案出來了，就會自動作答；還沒，就會再跳視窗。
    // 若否，每日尚未作答題目時，將會跳出手動答題視窗。
    // 請注意，答案不保證正確性，若當日答錯無法領取獎勵，我方或答案提供方並不為此負責。
    const ANSWER_SOURCE_blackxblue = true;

    // ***上下兩種來源可同時啟用，會先採用 blackxblue 的資訊，若沒有，再搜尋資料庫。***

    // 答案來源是否採用非官方資料庫的資訊？
    // true 為是，false 為否。
    // 
    // ***使用此種方法搜索答案，最高可能會到 30 秒，建議作為備案使用。***
    // 
    // 若仍找不到答案，還是會跳手動作答視窗。
    // 詳細資料：https://home.gamer.com.tw/creationDetail.php?sn=3924920
    const ANSWER_SOURCE_DB = true;

    // 如果當天 00:00 後幾分鐘內答案還沒出來，不要提醒我手動作答？1440 分鐘 = 24 小時 = 不提醒
    const NOTICE_DELAY = 0;

    // ----------------------------------------------------------------------------------------------------

    // 程式開始
    const TODAY = new Date().toLocaleDateString("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit" });

    if (BAHAID) console.log("bas: ", "BAHAID: ", BAHAID);
    else {
        console.error("bas: ", "No BAHAID");
        if (GM_getValue("error_notify", null) !== TODAY) {
            window.alert("自動簽到遇到問題，無法正常運作！（僅提醒這一次，通常是沒登入造成問題，若已登入可能需重新登入。）");
            GM_setValue("error_notify", TODAY);
        }
        return;
    }

    let question = null;

    // 每日簽到
    const SIGN_DATE = GM_getValue("sign_date", null);
    /** @type {String[]} */
    let accounts_signed = GM_getValue("accounts_signed", []);

    if (SIGN_DATE !== TODAY)
        accounts_signed = [];

    if (accounts_signed.includes(BAHAID) === false)
        startDailySign();

    // 公會簽到
    const GUILD_SIGN_DATE = GM_getValue("guild_sign_date", null);
    /** @type {Object.<String, Number[]>} */
    let accounts_signed_guilds = GM_getValue("accounts_signed_guilds", []);

    if (GUILD_SIGN_DATE !== TODAY)
        accounts_signed_guilds = [];

    if (DO_SIGN_GUILD && accounts_signed_guilds.includes(BAHAID) === false)
        startGuildSign();

    // 動畫瘋題目
    const ANIME_ANSWER_DATE = GM_getValue("anime_answer_date", null);
    const ANIME_ANSWER_POSTPONE = GM_getValue("anime_answer_postpone", 0);
    /** @type {String[]} */
    let accounts_answered = GM_getValue("accounts_answered", []);

    if (ANIME_ANSWER_DATE !== TODAY)
        accounts_answered = [];

    if (DO_ANSWER_ANIME &&
        accounts_answered.includes(BAHAID) === false &&
        Date.now() - new Date(TODAY) > NOTICE_DELAY * 60000 &&
        Date.now() > ANIME_ANSWER_POSTPONE)
        startAnswerAnime();

    /**
     * Start daily sign.
     * @returns {void} Nothing, just do it!
     */
    function startDailySign() {
        console.log("bas: ", "開始每日簽到");
        submitDailySign().then(response => {
            if (response.data && response.data.days || response.error.code == 0 || response.error.message == "今天您已經簽到過了喔") {
                // 簽到成功或已簽到
                console.log("bas: ", "簽到成功！", response);
                GM_setValue("sign_date", TODAY);
                accounts_signed.push(BAHAID);
                GM_setValue("accounts_signed", accounts_signed);
            } else
                console.error("bas: ", "簽到發生錯誤！", response);
        });
    }

    // check
    // signed: {"days": 5, "signin": 1}
    // not signed: {"days": 0, "signin": 0}
    // not logged in: {"days": 0, "signin": 0}
    /**
     * 檢查每日簽到狀態
     * @returns {Promise} 伺服器回傳
     */
    function checkSign() {
        return new Promise(function (resolve) {
            GM_xmlhttpRequest({
                method: "POST",
                url: "https://www.gamer.com.tw/ajax/signin.php",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded;",
                },
                data: "action=2",
                responseType: "json",
                cache: false,
                onload: data => resolve(data.response.data)
            });
        });
    }

    // sign
    // signed: {"code": 0, "message": "今天您已經簽到過了喔"}
    // not signed: {"days": 5, "dialog": ""}
    // not logged in: {code: 401, message: "尚未登入", status: "NO_LOGIN", details: []}
    /**
     * 送出每日簽到
     * @returns {Promise} 伺服器回傳
     */
    function submitDailySign() {
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
                    data: "action=1&token=" + token.response,
                    responseType: "json",
                    cache: false,
                    onload: data => resolve(data.response)
                })
            });
        });
    }

    /**
     * Fetch guild list from https://home.gamer.com.tw/joinGuild.php
     * @returns {Promise<Number[]>} Array of guild numbers.
     */
    function getGuilds() {
        console.log("bas: ", "獲取公會列表");
        return new Promise(resolve => {
            GM_xmlhttpRequest({
                method: "GET",
                url: "https://home.gamer.com.tw/joinGuild.php",
                cache: false,
                onload: html => {
                    let guilds = Array.from(jQuery(html.response).find(".acgbox").map((index, element) => element.id.match(/\d+/)[0])).filter(value => !isNaN(value));
                    console.log("bas: ", "獲取到的公會列表: ", guilds);
                    resolve(guilds);
                }
            });
        });
    }

    /**
     * Start guild sign.
     * @returns {void} Nothing, just do it!
     */
    async function startGuildSign() {
        /** @type {Number[]} */
        let guilds = await getGuilds();

        Promise.all(guilds.map(submitGuildSign)).then(function (responses) {
            console.log("bas: ", "公會簽到結束", responses);
            GM_setValue("guild_sign_date", TODAY);
            accounts_signed_guilds.push(BAHAID);
            GM_setValue("accounts_signed_guilds", accounts_signed_guilds);
        }, function (error) {
            console.error("bas: ", "簽到公會時發生錯誤。", error);
        });
    }

    // signed: {error: 1, msg: "您今天已經簽到過了！"}
    /**
     * 送出公會簽到
     * @param {Number} sn 公會編號
     * @returns {Promise} 伺服器回傳
     */
    function submitGuildSign(sn) {
        console.log("bas: ", `開始公會 ${sn} 簽到`);
        return new Promise(function (resolve, reject) {
            GM_xmlhttpRequest({
                method: "POST",
                url: "https://guild.gamer.com.tw/ajax/guildSign.php",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                data: "sn=" + sn,
                cache: false,
                responseType: "json",
                onload: data => resolve(data.response),
                onerror: reject
            });
        });
    }

    // 動畫瘋答題由 maple3142/動畫瘋工具箱 支援：https://greasyfork.org/zh-TW/scripts/39136
    /**
     * 開始動畫瘋問題回答
     * @returns {void} Nothing, just do it!
     */
    async function startAnswerAnime() {
        let question = await getQuestion();
        if (!question.error && AUTO_ANSWER_ANIME === false) {
            console.log("bas: ", "進入手動作答動畫瘋", question);
            manualAnswer(question);
        } else if (!question.error && AUTO_ANSWER_ANIME === true) {
            console.log("bas: ", "進入自動作答動畫瘋", question);
            let answer = await getAnswer().catch(console.error);
            console.log("bas: ", "自動作答獲取到答案為：", answer);
            if (answer)
                submitAnswer(answer).then(result => console.log("bas: ", "答案送出成功", result)).catch(error => console.error("bas: ", "送出答案發生錯誤", error));
            else
                manualAnswer(question);
        } else {
            console.log("bas: ", "已作答過動畫瘋題目", question);
            GM_setValue("anime_answer_date", TODAY);
            accounts_answered.push(BAHAID);
            GM_setValue("accounts_answered", accounts_answered);
        }
    }

    let answer = null;
    /**
     * 獲取題目答案
     * @returns {Promise<Number | null>} 獲取到的答案
     */
    function getAnswer() {
        return new Promise(async function (resolve, reject) {
            if (answer) return resolve(answer);
            switch (ANSWER_SOURCE_blackxblue + ANSWER_SOURCE_DB * 2) {
                case 3:
                    answer = await getAnswer_blackxblue().catch(async err => await getAnswer_DB().catch(console.error));
                    console.log("bas: ", "獲取到答案為：", answer);
                    break;
                case 2:
                    answer = await getAnswer_DB().catch(console.error);
                    console.log("bas: ", "從資料庫獲取到答案為：", answer);
                    break;
                case 1:
                default:
                    answer = await getAnswer_blackxblue().catch(console.error);
                    console.log("bas: ", "從 blackxblue 小屋獲取到答案為：", answer);
                    break;
            }
            if (answer) resolve(answer);
            else reject("No answer found.");
        });
    }

    /**
     * 從 blackxblue 創作獲取今日動畫瘋解答
     * @returns {Promise<Number>} If answer found, return answer.
     */
    function getAnswer_blackxblue() {
        if (GM_getValue("anime_answer_date") == undefined)
            if (window.confirm("您選擇了由 blackxblue 小屋獲取答案，是否訂閱 blackxblue？（作答過問題就不會再出現提醒）"))
                follow("blackxblue");
        return new Promise(function (resolve, reject) {
            GM_xmlhttpRequest({
                method: "GET",
                url: "https://home.gamer.com.tw/creation.php?owner=blackxblue",
                responseType: "text",
                onload: function (page) {
                    let result = jQuery(page.response).find(".TS1").filter((index, element) => new RegExp(new Date().toLocaleDateString("zh-TW", { month: "2-digit", day: "2-digit" })).test(element.textContent));
                    console.log("bas: ", "從 blackxblue 小屋找到今日動畫瘋文章 ID：", result, result[0].getAttribute("href"));
                    if (result.length > 0) {
                        GM_xmlhttpRequest({
                            method: "GET",
                            url: "https://home.gamer.com.tw/" + result[0].getAttribute("href"),
                            responseType: "text",
                            onload: page => {
                                let result = /A:(\d)/.exec(jQuery(page.response).find(".MSG-list8C").text().replace(/\s/g, "").replace(/：/g, ":"));
                                if (result) {
                                    console.log("bas: ", "在創作中找到答案為：", result);
                                    resolve(result[1]);
                                } else {
                                    console.error("bas: ", "在創作中無法找到答案。");
                                    reject("No result found in post.");
                                }
                            }
                        });
                    } else {
                        console.error("bas: ", "沒有找到今日的創作。");
                        reject("No matched post found.");
                    }
                },
                onerror: reject
            });
        });
    }

    /**
     * 從資料庫獲取答案
     * @returns {Promise<Number>} If answer found, return answer.
     */
    function getAnswer_DB() {
        return new Promise(function (resolve, reject) {
            getQuestion().then(function (question) {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: "https://script.google.com/macros/s/AKfycbxYKwsjq6jB2Oo0xwz4bmkd3-5hdguopA6VJ5KD/exec?type=quiz&question=" + encodeURIComponent(question.question),
                    responseType: "json",
                    onload: function (response) {
                        if (response.response.success)
                            resolve(response.response.message.answer);
                        else
                            reject();
                    },
                    onerror: reject
                });
            }).catch(reject);
        });
    }

    /**
     * 作答動畫瘋題目
     * @param {Number} answer 有效答案 1 - 4
     * @returns {Promise<Boolean>} 答案正確與否
     */
    function submitAnswer(answer) {
        return new Promise(function (resolve, reject) {
            console.log("bas: ", "送交答案中...", answer);
            getQuestion().then(question => {
                GM_xmlhttpRequest({
                    method: "POST",
                    url: "https://ani.gamer.com.tw/ajax/animeAnsQuestion.php",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded;",
                    },
                    data: "token=" + question.token + "&ans=" + answer + "&t=" + Date.now(),
                    responseType: "json",
                    cache: false,
                    onload: response => {
                        console.log("bas: ", "答案已送交！", response);
                        if (response.response.error || response.response.msg === "答題錯誤") {
                            console.error("bas: ", "答案錯誤！", response, response.response);
                            reject(response.response);
                        } else {
                            console.log("bas: ", "答案正確", response, response.response);
                            GM_setValue("anime_answer_date", TODAY);
                            accounts_answered.push(BAHAID);
                            GM_setValue("accounts_answered", accounts_answered);
                            resolve(response.response);
                        }
                    }
                });
            }, reject);
        });
    }

    // not answered: { "game": "龍王的工作！", "question": "龍王的弟子是以下哪位?", "a1": "空銀子", "a2": "雛鶴愛", "a3": "水越澪", "a4": "貞任綾乃", "userid": "ww891113", "token": "01e0779c7298996032acdacac3261fac28d32e8bb44f4dda5badb111" }
    // answered: { "error": 1, "msg": "今日已經答過題目了，一天僅限一次機會" }
    /**
     * 獲取本日題目資料
     * @returns {JSON | Promise<JSON>} 題目資料
     */
    function getQuestion() {
        if (question) return Promise.resolve(question);
        return new Promise(function (resolve, reject) {
            GM_xmlhttpRequest({
                method: "GET",
                url: "https://ani.gamer.com.tw/ajax/animeGetQuestion.php?t=" + Date.now(),
                responseType: "json",
                cache: false,
                onload: data => {
                    question = data.response;
                    resolve(data.response);
                },
                onerror: reject
            });
        });
    }

    /**
     * 跳巴哈原生訂閱視窗
     * @param {String} user 巴友帳號
     * @returns {void} Nothing, just do it!
     */
    function follow(user) {
        var c = "";
        c += "<form action=\"\" method=\"POST\" name=\"notifyfollow\"><table border=\"0\" width=\"400px\"><tr>",
            c += "<td><input name=\"c1\" type=\"checkbox\" value=\"1\" checked/>叭啦叭啦</td>",
            c += "<td><input name=\"c2\" type=\"checkbox\" value=\"2\" checked/>哈啦區發表</td>",
            c += "<td><input name=\"c3\" type=\"checkbox\" value=\"4\" checked/>小屋發表</td>",
            c += "<td><input name=\"c4\" type=\"checkbox\" value=\"16\" checked/>他的推薦</td>",
            c += "<td><input name=\"c5\" type=\"checkbox\" value=\"32\" checked/>實況頻道</td>",
            c += "</tr></table></form>",
            egg.mutbox(c, `訂閱 ${user} 動態`, {
                "訂閱": function () {
                    submit_follow(user);
                }
            });
    }

    /**
     * 送出追蹤請求
     * @param {String} user 巴友帳號
     * @returns {void} Nothing, just do it!
     */
    function submit_follow(user) {
        var form = document.forms.notifyfollow,
            value = 0;
        return form.c1.checked && (value |= form.c1.value),
            form.c2.checked && (value |= form.c2.value),
            form.c3.checked && (value |= form.c3.value),
            form.c4.checked && (value |= form.c4.value),
            form.c5.checked && (value |= form.c5.value),
            GM_xmlhttpRequest({
                method: "GET",
                url: "https://home.gamer.com.tw/ajax/getCSRFToken.php",
                cache: false,
                onload: token => GM_xmlhttpRequest({
                    method: "POST",
                    url: "https://home.gamer.com.tw/ajax/addFollow_AJAX.php",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded;",
                    },
                    data: `who=${user}&v=${value}&token=${token.response}`,
                    cache: false,
                    onload: function (response) {
                        egg.lightbox.close(), egg.mutbox(response.response, "訂閱動態")
                    }
                })
            }), !1
    }

    /**
     * 跳出手動作答視窗
     * @param {JSON} question 題目資料
     * @returns {void} Nothing, just do it!
     */
    function manualAnswer(question) {
        jQuery("body").append(GM_getResourceText("popup_window"));

        jQuery(".bas.popup.header").text((new Date()).toLocaleString("zh-tw", { month: "2-digit", day: "2-digit" }) + " 動漫通").addClass(AUTO_ANSWER_ANIME ? "auto-answer-on" : "auto-answer-off");

        jQuery(".bas.popup.question span").text(question.question);
        jQuery(".bas.popup.option-1").text(question.a1).on("click", event => doAnswer(1));
        jQuery(".bas.popup.option-2").text(question.a2).on("click", event => doAnswer(2));
        jQuery(".bas.popup.option-3").text(question.a3).on("click", event => doAnswer(3));
        jQuery(".bas.popup.option-4").text(question.a4).on("click", event => doAnswer(4));
        jQuery(".bas.popup.author a").text(question.userid).attr("href", `https://home.gamer.com.tw/${question.userid}`);
        jQuery(".bas.popup.accociated-anime span").text(question.game);

        function doAnswer(answer) {
            console.log("bas: ", "User input answer: ", answer);
            submitAnswer(answer).then(function (result) {
                console.log("bas: ", result);
                console.log("bas: ", "作答成功！", result.gift);
                jQuery("main.bas.popup.body").text("作答成功！".concat(result.gift)).css("padding", "30px");
                jQuery("#bas-get-answer").prop("disabled", true);
                jQuery("#bas-delay").prop("disabled", true);
            }, function (err) {
                console.log("bas: ", err);
                console.error("bas: ", "作答發生問題！", err.msg);
                if (err.msg == "答題錯誤")
                    jQuery("main.bas.popup.body").text("答錯囉＞＜！").css("padding", "30px");
                else
                    jQuery("main.bas.popup.body").text("作答發生問題！".concat(err.msg).concat("＞＜！")).css("padding", "30px");
            });
        }

        jQuery("#bas-get-answer").on("click", () => {
            jQuery("#bas-get-answer").prop("disabled", true);
            getAnswer().then(ans => {
                window.alert("獲取的答案可能是：" + ans);
                jQuery("#bas-get-answer").prop("disabled", false);
            }, err => {
                window.alert("目前尚未有答案＞＜可至官方粉絲團尋找答案哦～");
                jQuery("#bas-get-answer").prop("disabled", false);
            });
        });

        jQuery("#bas-delay").on("click", () => {
            let delayTime = jQuery("#delay-time").val();
            if (1440 >= Number(delayTime) && Number(delayTime) >= 1) {
                GM_setValue("anime_answer_postpone", (new Date()).getTime() + Number(delayTime) * 60 * 1000);
                jQuery(".bas").remove();
            } else {
                window.alert("延時時間必須介於 1 到 1440 之間！");
            }
        });
    }
})();
