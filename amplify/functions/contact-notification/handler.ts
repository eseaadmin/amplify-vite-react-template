import type { DynamoDBStreamHandler } from 'aws-lambda';
import nodemailer from 'nodemailer';

declare const process: {
  env: {
    GMAIL_USER?: string;
    GMAIL_APP_PASSWORD?: string;
  };
};

const ADMIN_EMAILS = [
  'kkorokk@hanmail.net',
  'esea.admin@gmail.com',
  'crime21c@hanmail.net'
];

export const handler: DynamoDBStreamHandler = async (event) => {
  console.log('Contact notification triggered', JSON.stringify(event, null, 2));

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  for (const record of event.Records) {
    if (record.eventName === 'INSERT' && record.dynamodb?.NewImage) {
      const newImage = record.dynamodb.NewImage;

      const contactData = {
        name: newImage.name?.S || '',
        email: newImage.email?.S || '',
        affiliation: newImage.affiliation?.S || '',
        phone: newImage.phone?.S || '',
        category: newImage.category?.S || '',
        subject: newImage.subject?.S || '',
        message: newImage.message?.S || '',
        preferred_reply: newImage.preferred_reply?.S || '이메일',
        agreed: newImage.agreed?.BOOL ? '동의' : '미동의',
        status: newImage.status?.S || '',
        created_at: newImage.created_at?.S || '',
      };

      const emailSubject = `[에너지안보환경협회] 새로운 문의 접수 - ${contactData.subject}`;
      const emailBody = `
새로운 문의가 접수되었습니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
문의자 정보
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

이름: ${contactData.name}
이메일: ${contactData.email}
연락처: ${contactData.phone || '(미입력)'}
소속/직함: ${contactData.affiliation || '(미입력)'}
문의 유형: ${contactData.category || '(미선택)'}
답변 선호 방법: ${contactData.preferred_reply}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
문의 내용
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

제목: ${contactData.subject}
내용:
${contactData.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
기타 정보
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

개인정보 수집·이용 동의: ${contactData.agreed}
처리 상태: ${contactData.status}
접수일시: ${new Date(contactData.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

담당자가 확인 후 영업일 1~2일 내 답변 부탁드립니다.
`;

      try {
        await transporter.sendMail({
          from: `"에너지안보환경협회" <${process.env.GMAIL_USER}>`,
          to: ADMIN_EMAILS.join(', '),
          subject: emailSubject,
          text: emailBody,
        });
        console.log(`Email sent successfully for inquiry: ${contactData.email}`);
      } catch (error) {
        console.error('Error sending email:', error);
      }
    }
  }
};
