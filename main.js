// ==UserScript==
// @name         巴哈姆特自動簽到（含公會、動畫瘋）
// @namespace    https://home.gamer.com.tw/moontai0724
// @version      4.0
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
    const AUTO_ANSWER_ANIME_blackxblue = true;

    // ***上下兩種來源可同時啟用，會先採用 blackxblue 的資訊，若沒有，再搜尋資料庫。***

    // 答案來源是否採用非官方資料庫的資訊？
    // true 為是，false 為否。
    // 
    // ***使用此種方法搜索答案，最高可能會到 30 秒，建議作為備案使用。***
    // 
    // 若仍找不到答案，還是會跳手動作答視窗。
    // 詳細資料：https://home.gamer.com.tw/creationDetail.php?sn=3924920
    const AUTO_ANSWER_ANIME_DB = false;

    // 如果當天 00:00 後幾分鐘內答案還沒出來，不要提醒我手動作答？1440 分鐘 = 24 小時 = 不提醒
    const NOTICE_DELAY = 0;

    // ----------------------------------------------------------------------------------------------------

    // 程式開始
    if (BAHAID) console.log("BAHAID: ", BAHAID);
    else console.error("No BAHAID", BAHAID);

    if (!BAHAID) return;

    let question = null;
    const TODAY = new Date().toLocaleDateString("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit" });

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

    // 動漫瘋題目
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
        console.log("開始每日簽到");
        submitDailySign().then(response => {
            if (response.data && response.data.days || response.error.code == 0 || response.error.message == "今天您已經簽到過了喔") {
                // 簽到成功或已簽到
                console.log("簽到成功！", response);
                GM_setValue("sign_date", TODAY);
                accounts_signed.push(BAHAID);
                GM_setValue("accounts_signed", accounts_signed);
            } else
                console.error("簽到發生錯誤！", response);
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
        console.log("獲取公會列表");
        return new Promise(resolve => {
            GM_xmlhttpRequest({
                method: "GET",
                url: "https://home.gamer.com.tw/joinGuild.php",
                cache: false,
                onload: html => {
                    let guilds = Array.from(jQuery(html.response).find(".acgbox").map((index, element) => element.id.match(/\d+/)[0])).filter(value => !isNaN(value));
                    console.log("獲取到的公會列表: ", guilds);
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
        let guilds = await getGuilds();
        /** @type {Number[]} */

        Promise.all(guilds.map(submitGuildSign)).then(function (responses) {
            console.log("公會簽到結束", responses);
            GM_setValue("guild_sign_date", TODAY);
            accounts_signed_guilds.push(BAHAID);
            GM_setValue("accounts_signed_guilds", accounts_signed_guilds);
        }, function (error) {
            console.error("簽到公會時發生錯誤。", error);
        });
    }

    // signed: {error: 1, msg: "您今天已經簽到過了！"}
    /**
     * 送出公會簽到
     * @param {Number} sn 公會編號
     * @returns {Promise} 伺服器回傳
     */
    function submitGuildSign(sn) {
        console.log(`開始公會 ${sn} 簽到`);
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
    async function startAnswerAnime() {
        let question = await getQuestion();
        console.log("獲取到本日問題為：", question);
        if (!question.error && AUTO_ANSWER_ANIME === false) {
            console.log("進入手動作答動畫瘋");
            let answer = await getAnswer().catch(console.error);
            console.log("答案：", answer);
            manualAnswer(question);
        } else if (!question.error && AUTO_ANSWER_ANIME === true) {
            console.log("進入自動作答動畫瘋");
            let answer = await getAnswer().catch(console.error);
            console.log("自動作答獲取到答案為：", answer);
            if (answer)
                submitAnswer(answer);
        } else {
            console.log("已作答過動畫瘋題目", question);
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
            switch (AUTO_ANSWER_ANIME_blackxblue + AUTO_ANSWER_ANIME_DB * 2) {
                case 3:
                    answer = await getAnswer_blackxblue().catch(async err => await getAnswer_DB().catch(console.error));
                    console.log("獲取到答案為：", answer);
                    break;
                case 2:
                    answer = await getAnswer_DB().catch(console.error);
                    console.log("從資料庫獲取到答案為：", answer);
                    break;
                case 1:
                default:
                    answer = await getAnswer_blackxblue().catch(console.error);
                    console.log("從 blackxblue 小屋獲取到答案為：", answer);
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
        return new Promise(function (resolve, reject) {
            GM_xmlhttpRequest({
                method: "GET",
                url: "https://home.gamer.com.tw/creation.php?owner=blackxblue",
                responseType: "text",
                onload: function (page) {
                    let result = jQuery(page.response).find(".TS1").filter((index, element) => new RegExp(new Date().toLocaleDateString("zh-TW", { month: "2-digit", day: "2-digit" })).test(element.textContent));
                    console.log("從 blackxblue 小屋找到今日動漫瘋文章 ID：", result, result[0].getAttribute("href"));
                    if (result.length > 0) {
                        GM_xmlhttpRequest({
                            method: "GET",
                            url: "https://home.gamer.com.tw/" + result[0].getAttribute("href"),
                            responseType: "text",
                            onload: page => {
                                let result = /A:(\d)/.exec(jQuery(page.response).find(".MSG-list8C").text().replace(/\s/g, "").replace(/：/g, ":"));
                                if (result) {
                                    console.log("在創作中找到答案為：", result);
                                    resolve(result[1]);
                                } else {
                                    console.error("在創作中無法找到答案。");
                                    reject("No result found in post.");
                                }
                            }
                        });
                    } else {
                        console.error("沒有找到今日的創作。");
                        reject("No matched post found.");
                    }
                },
                onerror: reject
            });
        });
    }

    let pandingDB = false;
    /**
     * 從資料庫獲取答案
     * @returns {Promise<Number>} If answer found, return answer.
     */
    function getAnswer_DB() {
        return new Promise(function (resolve, reject) {
            if (pandingDB) reject("請耐心等待。");
            pandingDB = true;
            getQuestion().then(function (question) {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: "https://script.google.com/macros/s/AKfycbxYKwsjq6jB2Oo0xwz4bmkd3-5hdguopA6VJ5KD/exec?type=quiz&question=" + encodeURIComponent(question.question),
                    responseType: "json",
                    onload: function (response) {
                        pandingDB = false;
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
                        console.log("答案已送交！", response);
                        if (response.response.error || response.response.msg === "答題錯誤") {
                            console.error("答案錯誤！", response, response.response);
                            reject(response.response);
                        } else {
                            console.log("答案正確", response, response.response);
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
                method: "POST",
                url: `https://home.gamer.com.tw/ajax/addFollow_AJAX.php?who=${user}&v=${value}`,
                cache: false,
                onload: function (response) {
                    egg.lightbox.close(), egg.mutbox(response.response, "訂閱動態")
                }
            }), !1
    }

    /**
     * 跳出手動作答視窗
     * @param {JSON} question 題目資料
     * @returns {void} Nothing, just do it!
     */
    function manualAnswer(question) {
        // black background
        let manualAnswer_Background = document.createElement("div");
        manualAnswer_Background.id = "manualAnswer_Background";
        manualAnswer_Background.setAttribute("onmousedown", "javascript:if(!jQuery(this).hasClass(\"mouseenter\")) jQuery(\"#manualAnswer_Background\").remove();");
        manualAnswer_Background.style = "background-color: rgba(0, 0, 0, 0.5); z-index: 95; position: fixed; top: 0px; bottom: 0px; left: 0px; right: 0px; width: 100%; height: 100%; padding-top: 35px;" +
            " border: 1px solid #a7c7c8;" +
            " display: flex; align-items: center; justify-content: center;" +
            " -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box;";
        document.body.appendChild(manualAnswer_Background);

        // window case
        let manualAnswer_Case = document.createElement("div");
        manualAnswer_Case.id = "manualAnswer_Case";
        manualAnswer_Case.setAttribute("onmouseenter", "javascipt:jQuery(\"#manualAnswer_Background\").addClass(\"mouseenter\");");
        manualAnswer_Case.setAttribute("onmouseleave", "javascipt:jQuery(\"#manualAnswer_Background\").removeClass(\"mouseenter\");");
        manualAnswer_Case.style = "position: absolute; min-height: 50%; min-width: 40%; overflow: hidden;" +
            " display: flex; align-item: stretch; flex-direction: column;" +
            " background-color: #FFFFFF; border: 1px solid #a7c7c8;";
        document.getElementById("manualAnswer_Background").appendChild(manualAnswer_Case);

        // title
        let manualAnswer_Title = document.createElement("div");
        manualAnswer_Title.setAttribute("style", "display: flex; align-items: center; justify-content: center; width: 100%; min-height: 35px;" +
            " background-color: #E5F7F8; color: #484b4b;" +
            " font-size: 22px; font-weight: bold; font-family: \"微軟正黑體\", \"Microsoft JhengHei\", \"黑體-繁\", \"蘋果儷中黑\", \"sans-serif\";");
        manualAnswer_Title.innerHTML = (new Date()).toLocaleString("zh-tw", { month: "2-digit", day: "2-digit" }) + " 動漫通 手動作答";
        document.getElementById("manualAnswer_Case").appendChild(manualAnswer_Title);

        // content
        let manualAnswer_Content = document.createElement("div");
        manualAnswer_Content.id = "manualAnswer_Content";
        manualAnswer_Content.setAttribute("style", "display: flex; align-items: center; justify-content: center; flex-flow: row wrap; flex-grow: 1; overflow: auto; padding: 10px;" +
            " background-color: #FFFFFF;" +
            " word-break: break-all; font-size: 16px; line-height: 150%; text-align: center; font-family: 微軟正黑體, Microsoft JhengHei, 黑體-繁, 蘋果儷中黑, sans-serif;" +
            " -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box;");
        manualAnswer_Content.innerHTML = "<div>關聯動漫：" + question.game + "<br>問題：" + question.question + "<br>1. " + question.a1 + "<br>2. " + question.a2 + "<br>3. " + question.a3 + "<br>4. " + question.a4 + "<br>出題者：" + question.userid + "<br>到官方粉絲團找答案：<a href=\"https://www.facebook.com/animategamer\" target=\"_blank\">https://www.facebook.com/animategamer</a></div>";
        document.getElementById("manualAnswer_Case").appendChild(manualAnswer_Content);

        // bottom element
        let manualAnswer_BottomArea = document.createElement("div");
        manualAnswer_BottomArea.id = "manualAnswer_BottomArea";
        manualAnswer_BottomArea.style = "display: flex; align-items: center; justify-content: center;" +
            " background-color: #E5F7F8;" +
            " width: 100%; min-height: 35px;";
        document.getElementById("manualAnswer_Case").appendChild(manualAnswer_BottomArea);

        // Answer button
        let manualAnswer_AnswerButton = document.createElement("button");
        manualAnswer_AnswerButton.innerHTML = "作答";
        manualAnswer_AnswerButton.id = "manualAnswer_AnswerButton";
        document.getElementById("manualAnswer_BottomArea").appendChild(manualAnswer_AnswerButton);

        // Answer button
        let manualAnswer_getAnswerButton = document.createElement("button");
        manualAnswer_getAnswerButton.innerHTML = "獲取答案";
        manualAnswer_getAnswerButton.id = "manualAnswer_getAnswerButton";
        manualAnswer_getAnswerButton.style = "margin-left: 10px;";
        document.getElementById("manualAnswer_BottomArea").appendChild(manualAnswer_getAnswerButton);

        document.getElementById("manualAnswer_BottomArea").innerHTML += "<div style=\"margin-left: 10px;\">延後 " +
            "<input type=\"number\" name=\"manualAnswer_DelayTime\" min=\"1\" max=\"1440\" value=\"10\">" +
            " 分鐘後再提醒我<button id=\"manualAnswer_DelayButton\" style=\"margin-left: 10px;\">延時</button></div>";

        document.getElementById("manualAnswer_AnswerButton").onclick = () => {
            let Ans = undefined
            Ans = window.prompt("請輸入答案 (1,2,3,4)");

            if (/^[1-4]?$/.test(Ans) && false) {
                submitAnswer(Ans).then(function (result) {
                    console.log(result);
                    console.log("\u7B54\u984C\u6210\u529F: ".concat(result.gift));
                    document.getElementById("manualAnswer_Content").innerHTML = "\u7B54\u984C\u6210\u529F: ".concat(result.gift);
                }, function (err) {
                    console.log(err);
                    console.error("\u56DE\u7B54\u554F\u984C\u5931\u6557: ".concat(err.msg));
                    document.getElementById("manualAnswer_Content").innerHTML = "\u56DE\u7B54\u554F\u984C\u5931\u6557: ".concat(err.msg);
                });
                document.getElementById("manualAnswer_AnswerButton").innerHTML = "關閉";
                document.getElementById("manualAnswer_AnswerButton").setAttribute("onclick", "jQuery(\"#manualAnswer_Background\").remove();");
            } else {
                window.alert("答案為錯誤格式！");
            }
        }

        document.getElementById("manualAnswer_getAnswerButton").onclick = () => getAnswer().then(ans => window.alert("獲取的答案可能是：" + ans), err => window.alert("目前尚未有答案＞＜可至官方粉絲團尋找答案哦～"));

        document.getElementById("manualAnswer_DelayButton").onclick = () => {
            let delayTime = document.getElementsByName("manualAnswer_DelayTime")[0].value;
            if (1440 >= Number(delayTime) && Number(delayTime) >= 1) {
                GM_setValue("anime_answer_postpone", (new Date()).getTime() + Number(delayTime) * 60 * 1000);
                jQuery("#manualAnswer_Background").remove();
            } else {
                window.alert("延時時間必須介於 1 到 1440 之間！");
            }
        }
    }
})();
