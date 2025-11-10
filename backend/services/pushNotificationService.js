const webpush = require('web-push');

class PushNotificationService {
  constructor() {
    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(
        'mailto:admin@claryx-erp.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      );
    }
  }

  async sendNotification(subscription, payload) {
    if (!process.env.VAPID_PUBLIC_KEY) {
      console.log('Push notifications not configured');
      return;
    }

    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload));
      console.log('Push notification sent');
    } catch (error) {
      console.error('Push notification failed:', error);
    }
  }

  async sendToAll(subscriptions, payload) {
    const promises = subscriptions.map(sub => 
      this.sendNotification(sub, payload)
    );
    await Promise.allSettled(promises);
  }

  generateVapidKeys() {
    return webpush.generateVAPIDKeys();
  }
}

module.exports = new PushNotificationService();