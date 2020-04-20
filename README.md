# 巴哈姆特自動簽到（含公會、動畫瘋）
現在只要安裝即可自動簽到（當然還是要至少有進到巴哈任何一個頁面），不需要設定首頁囉～
如不需要自動簽到公會，請將 signGuild 變數 true 改為 false。

## 變數說明
true 為是，false 為否。
- **signGuild**: (true/false) 是否自動簽到公會？
- **answerAnime**: (true/false) 是否開啟每日動畫瘋作答？
- **autoGetAnimeAnsFromblackxblue**: (true/false) 是否自動從 blackxblue 的小屋創作獲取動畫瘋答案？
    - 註：
        - 若選擇是，在初次開啟時會提示是否訂閱；
            - 當如果答案提供者尚未發表答案，會跳出手動作答視窗，可以選擇作答或是延後提醒。
            - 若延後，當時間到了，會檢查答案出來了沒？如果答案出來了，就會自動作答；還沒，就會再跳視窗。
        - 若選擇否，每日尚未作答題目時，會自動跳出手動作答視窗。
    - **請注意，答案不保證正確性，若當日答錯無法領取獎勵，我方或答案提供方並不為此負責。**
- **dailyDelayNotice**: (數字) 如果當天 00:00 後幾分鐘內答案還沒出來，不要提醒我手動作答？1440 分鐘 = 24 小時 = 不提醒

## 腳本說明
手動作答畫面: (那個連結是可以點的)
![https://imgur.com/ti9Uf5J](https://imgur.com/ti9Uf5J.png "手動作答畫面")

手動作答結束的顯示:
![https://imgur.com/XOpOQ0q](https://imgur.com/XOpOQ0q.png "手動作答結束的顯示")

## 特別銘謝
- 感謝 [maple3142](https://home.gamer.com.tw/kirby123) 提供動畫瘋答題系統
- 感謝 [blackxblue](https://home.gamer.com.tw/blackxblue) 提供動畫瘋答案