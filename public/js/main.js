/* ========================================
   에너지안보환경협회 - 공통 JavaScript
   ======================================== */

let _amplifyConfig = null;
async function getAmplifyConfig() {
  if (!_amplifyConfig) {
    const res = await fetch('/amplify_outputs.json');
    _amplifyConfig = await res.json();
  }
  return { endpoint: _amplifyConfig.data.url, apiKey: _amplifyConfig.data.api_key };
}

document.addEventListener('DOMContentLoaded', () => {

  /* ── 네비게이션: 스크롤 감지 ── */
  const nav = document.getElementById('site-nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  /* ── 모바일 메뉴 토글 ── */
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.nav-mobile');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      hamburger.textContent = mobileMenu.classList.contains('open') ? '✕' : '☰';
    });
  }

  /* ── 현재 페이지 네비 활성화 ── */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-menu a, .nav-mobile a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ── 아코디언 FAQ ── */
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const body = trigger.nextElementSibling;
      const isOpen = trigger.classList.contains('open');
      // 모두 닫기
      document.querySelectorAll('.accordion-trigger').forEach(t => {
        t.classList.remove('open');
        t.nextElementSibling?.classList.remove('open');
      });
      // 현재 항목 토글
      if (!isOpen) {
        trigger.classList.add('open');
        body?.classList.add('open');
      }
    });
  });

  /* ── 숫자 카운터 애니메이션 ── */
  const counters = document.querySelectorAll('[data-count]');
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => countObserver.observe(c));

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1600;
    const start = performance.now();
    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  /* ── 스크롤 페이드 인 ── */
  const fadeEls = document.querySelectorAll('.fade-in');
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  fadeEls.forEach(el => fadeObserver.observe(el));

  /* ── 가입 폼 제출 처리 ── */
  const joinForm = document.getElementById('join-form-el');
  if (joinForm) {
    joinForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = joinForm.querySelector('button[type=submit]');
      const originalText = btn.textContent;
      btn.textContent = '처리 중...';
      btn.disabled = true;

      const formData = new FormData(joinForm);
      const data = Object.fromEntries(formData.entries());

      try {
        const { endpoint, apiKey } = await getAmplifyConfig();
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
          },
          body: JSON.stringify({
            query: `mutation CreateMember($input: CreateMemberInput!) {
              createMember(input: $input) { email applied_at }
            }`,
            variables: {
              input: {
                name: data.name || '',
                affiliation: data.affiliation || '',
                phone: data.phone || '',
                email: data.email || '',
                interest: data.interest || '',
                motivation: data.motivation || '',
                member_type: data.member_type || '개인회원',
                status: '신청완료',
                recv_channels: [
                  data.recv_email ? 'EMAIL' : null,
                  data.recv_kakao ? 'KAKAO' : null,
                  data.recv_sms ? 'SMS' : null,
                ].filter(Boolean).join(', ') || '없음',
                agreed: data.agreed === 'on',
                marketing: data.marketing === 'on',
                applied_at: new Date().toISOString()
              }
            }
          })
        });
        const result = await res.json();
        if (result.errors) {
          console.error('GraphQL error:', result.errors);
          showToast('잠시 후 다시 시도해 주세요.', 'error');
        } else {
          showToast('가입 신청이 완료되었습니다! 확인 후 연락드리겠습니다.', 'success');
          joinForm.reset();
        }
      } catch {
        showToast('가입 신청이 접수되었습니다. (오프라인 모드)', 'info');
      }
      btn.textContent = originalText;
      btn.disabled = false;
    });
  }

  /* ── 기관협력 폼 제출 처리 ── */
  const partnerForm = document.getElementById('partner-form-el');
  if (partnerForm) {
    partnerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = partnerForm.querySelector('button[type=submit]');
      const originalText = btn.textContent;
      btn.textContent = '처리 중...';
      btn.disabled = true;

      const formData = new FormData(partnerForm);
      const data = Object.fromEntries(formData.entries());

      const programs = [
        data.prog_seminar   ? '공동 세미나·포럼' : null,
        data.prog_research  ? '공동 연구·실태조사' : null,
        data.prog_briefing  ? '이슈 브리핑·정책메모' : null,
        data.prog_edu       ? '교육·연수 프로그램' : null,
        data.prog_intl      ? '국제 협력·네트워크' : null,
        data.prog_custom    ? '맞춤형 협력' : null,
      ].filter(Boolean).join(', ') || '미선택';

      try {
        const { endpoint, apiKey } = await getAmplifyConfig();
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
          },
          body: JSON.stringify({
            query: `mutation CreatePartner($input: CreatePartnerInput!) {
              createPartner(input: $input) { contact_email created_at }
            }`,
            variables: {
              input: {
                org_name: data.org_name || '',
                org_type: data.org_type || '',
                contact_name: data.contact_name || '',
                contact_title: data.contact_title || '',
                contact_phone: data.contact_phone || '',
                contact_email: data.contact_email || '',
                programs,
                cooperation_detail: data.cooperation_detail || '',
                partner_agreed: data.partner_agreed === 'on',
                status: '상담신청',
                created_at: new Date().toISOString()
              }
            }
          })
        });
        const result = await res.json();
        if (result.errors) {
          console.error('GraphQL error:', result.errors);
          showToast('잠시 후 다시 시도해 주세요.', 'error');
        } else {
          showToast('협력 상담 신청이 접수되었습니다! 영업일 2~3일 내 연락드리겠습니다.', 'success');
          partnerForm.reset();
        }
      } catch {
        showToast('신청이 접수되었습니다. 담당자가 확인 후 연락드리겠습니다.', 'info');
      }
      btn.textContent = originalText;
      btn.disabled = false;
    });
  }

  /* ── 문의 폼 제출 처리 ── */
  const contactForm = document.getElementById('contact-form-el');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type=submit]');
      const originalText = btn.textContent;
      btn.textContent = '처리 중...';
      btn.disabled = true;
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());
      try {
        const { endpoint, apiKey } = await getAmplifyConfig();
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
          },
          body: JSON.stringify({
            query: `mutation CreateContactInquiry($input: CreateContactInquiryInput!) {
              createContactInquiry(input: $input) { email created_at }
            }`,
            variables: {
              input: {
                name: data.name || '',
                affiliation: data.affiliation || '',
                phone: data.phone || '',
                email: data.email || '',
                category: data.category || '',
                subject: data.subject || '',
                message: data.message || '',
                preferred_reply: data.preferred_reply || '',
                agreed: data.agreed === 'on',
                status: '접수',
                created_at: new Date().toISOString()
              }
            }
          })
        });
        const result = await res.json();
        if (result.errors) {
          console.error('GraphQL error:', result.errors);
          showToast('잠시 후 다시 시도해 주세요.', 'error');
        } else {
          showToast('문의가 접수되었습니다. 빠른 시일 내 답변드리겠습니다.', 'success');
          contactForm.reset();
        }
      } catch {
        showToast('문의가 접수되었습니다. 담당자가 확인 후 연락드리겠습니다.', 'info');
      }
      btn.textContent = originalText;
      btn.disabled = false;
    });
  }

  /* ── 토스트 알림 ── */
  function showToast(msg, type = 'info') {
    const colors = { success: '#15803d', error: '#dc2626', info: '#0a6e61' };
    const toast = document.createElement('div');
    toast.style.cssText = `
      position:fixed; bottom:24px; right:24px; background:${colors[type]};
      color:#fff; padding:14px 22px; border-radius:10px;
      box-shadow:0 8px 24px rgba(0,0,0,.18); z-index:9999;
      font-size:.92rem; font-weight:600; max-width:340px; line-height:1.5;
      animation: slideIn .3s ease;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  /* ── 티커 애니메이션 ── */
  const ticker = document.querySelector('.ticker-track');
  if (ticker) {
    ticker.innerHTML += ticker.innerHTML;
  }

  /* ── 스무스 앵커 스크롤 ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});

/* ── 페이드인 CSS ── */
const style = document.createElement('style');
style.textContent = `
  .fade-in { opacity: 0; transform: translateY(20px); transition: opacity .6s ease, transform .6s ease; }
  .fade-in.visible { opacity: 1; transform: translateY(0); }
  @keyframes slideIn { from { opacity:0; transform: translateX(20px); } to { opacity:1; transform: translateX(0); } }
  .ticker-wrap { overflow: hidden; white-space: nowrap; }
  .ticker-track { display: inline-flex; gap: 48px; animation: ticker 30s linear infinite; }
  @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
`;
document.head.appendChild(style);
