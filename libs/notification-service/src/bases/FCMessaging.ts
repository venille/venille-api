import * as messaging from 'firebase-admin/messaging';
import { FCMNotificationPayload } from '../interface';

async function sendNotification(
  token: string,
  payload: FCMNotificationPayload,
) {
  console.log('Sending FCM notification');
  try {
    const timestamp = new Date().getTime();

    const res = await messaging.getMessaging().send({
      token: token,
      data: {
        ...payload.data,
        ...(payload.notificationImage
          ? { image: String(payload.notificationImage) }
          : {}),
        timestamp: `${timestamp}`,
      },
      notification: {
        title: payload.title,
        body: payload.body,
        ...(payload.notificationImage
          ? { imageUrl: String(payload.notificationImage) }
          : {}),
      },
      android: {
        priority: 'high',
        notification: {
          ...(payload.notificationImage
            ? { imageUrl: String(payload.notificationImage) }
            : {}),
          visibility: 'public',
          priority: 'high',
          tag: `notification_${timestamp}`,
          channelId: 'default',
          notificationCount: 0,
        },
      },
      apns: {
        headers: {
          'apns-priority': '10',
          'apns-push-type': 'alert',
          'apns-collapse-id': `notification_${timestamp}`,
        },
        payload: {
          aps: {
            category: 'NEW_MESSAGE_CATEGORY',
            mutable_content: 1,
            content_available: 1,
            thread_id: `notification_${timestamp}`,
          },
        },
        fcmOptions: {
          ...(payload.notificationImage
            ? { imageUrl: String(payload.notificationImage) }
            : {}),
        },
      },
      webpush: {
        headers: {},
        notification: {
          image: payload?.notificationImage,
          tag: `notification_${timestamp}`,
        },
      },
    });
    console.log('FCM notification sent', res);
  } catch (err) {
    console.error('[SEND-FCM-NOTIFICATION-ERROR] : ', err);
  }
}

function sendNotificationBulk(
  tokens: string[],
  payload: { title: string; body: string },
) {
  try {
    messaging.getMessaging().sendEachForMulticast({
      tokens: tokens,
      android: {
        priority: 'high',
        data: {},
        fcmOptions: { analyticsLabel: '' },
        collapseKey: '',
        notification: {
          title: payload.title,
          body: payload.body,
        },
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: payload.title,
              body: payload.body,
            },
            sound: 'default', // Customize sound
          },
        },
        headers: {
          'apns-priority': '10', // Sends it immediately
          'apns-push-type': 'alert',
        },
      },
    });
  } catch (err) {
    console.error('[SEND-BULK-FCM-NOTIFICATION-ERROR] : ', err);
  }
}

export default {
  sendNotificationBulk,
  sendNotification,
};
