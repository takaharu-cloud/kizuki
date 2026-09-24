/* マエダ Share Note の「通知係」（Service Worker）
   ・サーバー（Apps Script → Firebase Cloud Messaging）から届いた通知を、ロック画面や通知センターに出す
   ・届いた数をアプリのアイコンの赤丸（バッジ）に出す
   ・通知をタップしたらアプリを開く（2課定例の🔔だけは Meet・議事録を開く）
   ※ 通知の中身は「種類・カテゴリ・本文の冒頭」だけ（実名・現場名は載せない＝ロック画面にも出るため） */
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });

/* アプリの外で開いてよい先（2課定例の Meet・議事録＝2026-09-23 15_ プラン）。Apps Script 側の pushLink_ と同じ3つ。
   この3つで始まる https だけ開く。それ以外のアプリの外の先は開かず、アプリを開く */
var OUTER_ALLOW = ['https://meet.google.com/', 'https://drive.google.com/', 'https://docs.google.com/'];
function outerLink(u){
  var s = String(u || '');
  if (!s || s.length > 500 || /[\s"'<>\\]/.test(s)) return '';
  for (var i = 0; i < OUTER_ALLOW.length; i++) if (s.indexOf(OUTER_ALLOW[i]) === 0) return s;
  return '';
}
function inApp(u){ try { return new URL(u, self.registration.scope).href.indexOf(self.registration.scope) === 0; } catch(err){ return false; } }

self.addEventListener('push', function(e){
  var j = {};
  try { j = e.data ? e.data.json() : {}; } catch(err){ j = { data: { title: 'マエダ Share Note', body: e.data ? e.data.text() : '' } }; }
  var d = j.data || j.notification || j || {};
  var title = d.title || 'マエダ Share Note';
  var body  = d.body  || '';
  var url   = d.url   || './';
  var tag   = d.tag   || ('sn-' + Date.now());
  e.waitUntil((async function(){
    await self.registration.showNotification(title, { body: body, tag: tag, icon: 'icon.png', badge: 'icon.png', data: { url: url } });
    try {
      var ns = await self.registration.getNotifications();
      if (self.navigator.setAppBadge) await self.navigator.setAppBadge(ns.length || 1);   // アイコンの赤丸＝まだ見ていない通知の数
    } catch(err){}
  })());
});

self.addEventListener('notificationclick', function(e){
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || './';
  var outer = outerLink(url);
  if (outer) {   // Meet・議事録：タップの許しが切れないうちに、何も待たずに最初に開く（開いたままのアプリには戻さない）
    var opening = null;
    try { if (self.clients.openWindow) opening = self.clients.openWindow(outer); } catch(err){}
    e.waitUntil((async function(){
      try { await opening; } catch(err){}
      try { if (self.navigator.clearAppBadge) await self.navigator.clearAppBadge(); } catch(err){}
    })());
    return;
  }
  if (!inApp(url)) url = './';   // 許していないアプリの外の先は開かない（アプリを開くだけ）
  e.waitUntil((async function(){
    try { if (self.navigator.clearAppBadge) await self.navigator.clearAppBadge(); } catch(err){}
    var all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (var i = 0; i < all.length; i++) {
      if ('focus' in all[i]) { await all[i].focus(); try { all[i].postMessage({ type: 'sn-open-tab', url: url }); } catch (err) {} return; }   // 開いたままなら、その掲示板へ
    }
    if (self.clients.openWindow) await self.clients.openWindow(url);
  })());
});
