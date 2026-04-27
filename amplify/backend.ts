import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { newsletterSubscribe } from './functions/newsletter-subscribe/resource';
import { memberNotification } from './functions/member-notification/resource';
import { partnerNotification } from './functions/partner-notification/resource';
import { contactNotification } from './functions/contact-notification/resource';
import { Stack } from 'aws-cdk-lib';
import { StartingPosition } from 'aws-cdk-lib/aws-lambda';
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

const backend = defineBackend({
  auth,
  data,
  newsletterSubscribe,
  memberNotification,
  partnerNotification,
  contactNotification,
});

// Get the NewsSubscriber table and newsletter function
const newsSubscriberTable = backend.data.resources.tables['NewsSubscriber'];
const newsletterLambda = backend.newsletterSubscribe.resources.lambda;

// Add environment variable using CDK Stack
const lambdaStack = Stack.of(newsletterLambda);
newsletterLambda.node.addMetadata('environment', {
  NEWS_SUBSCRIBER_TABLE_NAME: newsSubscriberTable.tableName
});

// Use CDK escape hatch to add environment variable
const cfnFunction = newsletterLambda.node.defaultChild as any;
if (cfnFunction) {
  cfnFunction.environment = {
    variables: {
      NEWS_SUBSCRIBER_TABLE_NAME: newsSubscriberTable.tableName
    }
  };
}

// Grant write access
newsSubscriberTable.grantWriteData(newsletterLambda);

// Connect member-notification Lambda to Member table DynamoDB stream
const memberTable = backend.data.resources.tables['Member'];
const memberNotificationLambda = backend.memberNotification.resources.lambda;

memberTable.grantStreamRead(memberNotificationLambda);
memberNotificationLambda.addEventSource(
  new DynamoEventSource(memberTable, {
    startingPosition: StartingPosition.LATEST,
    batchSize: 1,
  })
);

// Connect partner-notification Lambda to Partner table DynamoDB stream
const partnerTable = backend.data.resources.tables['Partner'];
const partnerNotificationLambda = backend.partnerNotification.resources.lambda;

partnerTable.grantStreamRead(partnerNotificationLambda);
partnerNotificationLambda.addEventSource(
  new DynamoEventSource(partnerTable, {
    startingPosition: StartingPosition.LATEST,
    batchSize: 1,
  })
);

// Connect contact-notification Lambda to ContactInquiry table DynamoDB stream
const contactInquiryTable = backend.data.resources.tables['ContactInquiry'];
const contactNotificationLambda = backend.contactNotification.resources.lambda;

contactInquiryTable.grantStreamRead(contactNotificationLambda);
contactNotificationLambda.addEventSource(
  new DynamoEventSource(contactInquiryTable, {
    startingPosition: StartingPosition.LATEST,
    batchSize: 1,
  })
);
