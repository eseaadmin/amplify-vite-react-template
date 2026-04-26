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
  console.log('Member notification triggered', JSON.stringify(event, null, 2));

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

      const memberData = {
        name: newImage.name?.S || '',
        email: newImage.email?.S || '',
        phone: newImage.phone?.S || '',
        affiliation: newImage.affiliation?.S || '',
        member_type: newImage.member_type?.S || '',
        interest: newImage.interest?.S || '',
        motivation: newImage.motivation?.S || '',
        recv_channels: newImage.recv_channels?.S || '없음',
        agreed: newImage.agreed?.BOOL ? '동의' : '미동의',
        marketing: newImage.marketing?.BOOL ? '동의' : '미동의',
        applied_at: newImage.applied_at?.S || '',
      };

      const emailSubject = `[에너지안보환경협회] 새로운 회원 가입 신청 - ${memberData.name}`;
      const emailBody = `
새로운 개인회원 가입 신청이 접수되었습니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
신청자 정보
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

이름: ${memberData.name}
이메일: ${memberData.email}
전화번호: ${memberData.phone}
소속: ${memberData.affiliation}
회원 유형: ${memberData.member_type}
관심 분야: ${memberData.interest}
가입 동기: ${memberData.motivation}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
수신 채널 및 동의 현황
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

브리핑 수신 채널: ${memberData.recv_channels}
개인정보 수집·이용 동의: ${memberData.agreed}
마케팅 정보 수신 동의: ${memberData.marketing}

신청일시: ${new Date(memberData.applied_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

회원 관리 시스템에서 신청 내용을 확인하시고 처리해 주시기 바랍니다.
`;

      try {
        await transporter.sendMail({
          from: `"에너지안보환경협회" <${process.env.GMAIL_USER}>`,
          to: ADMIN_EMAILS.join(', '),
          subject: emailSubject,
          text: emailBody,
        });
        console.log(`Email sent successfully for member: ${memberData.email}`);
      } catch (error) {
        console.error('Error sending email:', error);
      }
    }
  }
};
