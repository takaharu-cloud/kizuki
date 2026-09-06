/* マエダ Share Note の「通知係」（Service Worker）
   ・サーバー（Apps Script → Firebase Cloud Messaging）から届いた通知を、ロック画面や通知センターに出す
   ・届いた数をアプリのアイコンの赤丸（バッジ）に出す
   ・通知をタップしたらアプリを開く
   ※ 通知の中身は「種類・カテゴリ・本文の冒頭」だけ（実名・現場名は載せない＝ロック画面にも出るため） */
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });

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
  e.waitUntil((async function(){
    try { if (self.navigator.clearAppBadge) await self.navigator.clearAppBadge(); } catch(err){}
    var url = (e.notification.data && e.notification.data.url) || './';
    var all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (var i = 0; i < all.length; i++) {
      if ('focus' in all[i]) { await all[i].focus(); try { all[i].postMessage({ type: 'sn-open-tab', url: url }); } catch (err) {} return; }   // 開いたままなら、その掲示板へ
    }
    if (self.clients.openWindow) await self.clients.openWindow(url);
  })());
});
