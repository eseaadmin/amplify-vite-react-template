import { defineFunction, secret } from '@aws-amplify/backend';

export const memberNotification = defineFunction({
  name: 'member-notification',
  entry: './handler.ts',
  environment: {
    GMAIL_USER: secret('GMAIL_USER'),
    GMAIL_APP_PASSWORD: secret('GMAIL_APP_PASSWORD'),
  },
});
