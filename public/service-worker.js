self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.', event);

  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('Invalid JSON:', event.data.text());
    }
  }

  console.log('Push Data:', data); // <- add this

  const title = data.title || 'Default title';
  const options = {
    body: data.body || 'Default body',
    // icon: '/logo192.png',
    // badge: '/logo192.png'
    icon: '../pic2.png',
    badge: '../pic2.png'
    
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
