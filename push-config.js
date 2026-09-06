/* 通知（プッシュ）の設定。Firebase の「ウェブアプリの構成」と「ウェブプッシュ証明書（鍵ペア）」をここに貼る。
   ここに書く値は公開してよいもの（サイトに埋め込む前提の値）。秘密の鍵（サービスアカウントの JSON）は Apps Script の
   スクリプト プロパティ FCM_SA_JSON に入れる（このリポジトリには絶対に置かない）。
   未設定（apiKey が空）のあいだは通知の機能はオフになり、アプリはこれまでどおり動く。 */
window.SN_PUSH = {
  firebase: {
    apiKey: "",
    authDomain: "",
    projectId: "",
    messagingSenderId: "",
    appId: ""
  },
  vapidKey: ""
};
