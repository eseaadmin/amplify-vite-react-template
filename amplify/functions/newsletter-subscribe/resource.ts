import { defineFunction } from '@aws-amplify/backend';

export const newsletterSubscribe = defineFunction({
  name: 'newsletter-subscribe',
  entry: './handler.ts',
  environment: {
    // This will be overridden in backend.ts with the actual table name
  },
});
