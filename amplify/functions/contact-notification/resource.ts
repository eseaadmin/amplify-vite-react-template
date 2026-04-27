import { defineFunction, secret } from '@aws-amplify/backend';

export const contactNotification = defineFunction({
  name: 'contact-notification',
  entry: './handler.ts',
  environment: {
    GMAIL_USER: secret('GMAIL_USER'),
    GMAIL_APP_PASSWORD: secret('GMAIL_APP_PASSWORD'),
  },
});
