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
  console.log('Partner notification triggered', JSON.stringify(event, null, 2));

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

      const partnerData = {
        org_name: newImage.org_name?.S || '',
        org_type: newImage.org_type?.S || '',
        contact_name: newImage.contact_name?.S || '',
        contact_title: newImage.contact_title?.S || '',
        contact_phone: newImage.contact_phone?.S || '',
        contact_email: newImage.contact_email?.S || '',
        programs: newImage.programs?.S || '미선택',
        cooperation_detail: newImage.cooperation_detail?.S || '',
        partner_agreed: newImage.partner_agreed?.BOOL ? '동의' : '미동의',
        created_at: newImage.created_at?.S || '',
      };

      const emailSubject = `[에너지안보환경협회] 새로운 기관협력 상담 신청 - ${partnerData.org_name}`;
      const emailBody = `
새로운 기관협력 상담 신청이 접수되었습니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
신청 기관 정보
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

기관명: ${partnerData.org_name}
기관 유형: ${partnerData.org_type}
담당자: ${partnerData.contact_name}${partnerData.contact_title ? ` (${partnerData.contact_title})` : ''}
연락처: ${partnerData.contact_phone}
이메일: ${partnerData.contact_email}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
협력 내용
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

관심 협력 프로그램: ${partnerData.programs}
협력 내용 및 목적: ${partnerData.cooperation_detail || '(미입력)'}

개인정보 수집·이용 동의: ${partnerData.partner_agreed}

신청일시: ${new Date(partnerData.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

담당자가 확인하시고 영업일 2~3일 내 연락 부탁드립니다.
`;

      try {
        await transporter.sendMail({
          from: `"에너지안보환경협회" <${process.env.GMAIL_USER}>`,
          to: ADMIN_EMAILS.join(', '),
          subject: emailSubject,
          text: emailBody,
        });
        console.log(`Email sent successfully for partner: ${partnerData.contact_email}`);
      } catch (error) {
        console.error('Error sending email:', error);
      }
    }
  }
};
