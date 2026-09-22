# kizuki — マエダ Share Note 配布ページ（通知の包み）

`https://takaharu-cloud.github.io/kizuki/` で配る PWA の包みです。中身の画面は Apps Script のウェブアプリ（`index.html` の iframe）で、この包みはホーム画面への追加とプッシュ通知（Service Worker）を受け持ちます。

## セキュリティ＝この中に秘密は無い（2026-09-22 記載）

- `push-config.js` の `apiKey`（`AIza…`）は **Firebase の Web 用 API キー＝公開して使う前提の「識別子」** で、秘密鍵ではありません。Google 公式「Firebase 関連の API でのみ使用する場合は、コードに Firebase API キーを含めても問題ありません」（https://firebase.google.com/docs/projects/api-keys?hl=ja ）。
- ただし **Google Cloud 側で制限をかけて運用する**（2026-09-22 実施）：
  - アプリの制限＝HTTP リファラー `https://takaharu-cloud.github.io/*` と `https://*.googleusercontent.com/*`（後者は Share Note の Apps Script 画面が「資料棚」の動画を Drive API で再生するため）
  - API の制限＝Firebase Installations API・FCM Registration API・Firebase Management API・Cloud Logging API・Google Drive API の5つ
- `vapidKey` はウェブプッシュの**公開鍵**（公開して使うもの）。Apps Script の URL も公開情報。
- **本当の秘密**（FCM のサービスアカウント鍵など）は Apps Script のスクリプト プロパティに置き、このリポジトリには入れない。
- GitGuardian・GitHub secret scanning がこのキーを検出したら、「公開前提・制限済み」として閉じてよい（GitHub の検出 #1 は 2026-09-22 にこの理由で閉じた）。
