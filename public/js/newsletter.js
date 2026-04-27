// Newsletter subscription handler using direct GraphQL API calls.
// Wrapped in an IIFE to avoid global name collisions with other page scripts.
(() => {
let newsletterAmplifyConfig = null;

async function getNewsletterAmplifyConfig() {
  if (!newsletterAmplifyConfig) {
    const res = await fetch('/amplify_outputs.json');
    newsletterAmplifyConfig = await res.json();
  }
  return { endpoint: newsletterAmplifyConfig.data.url, apiKey: newsletterAmplifyConfig.data.api_key };
}

async function subscribeToNewsletter(email) {
    const { endpoint, apiKey } = await getNewsletterAmplifyConfig();

    const mutation = `
        mutation CreateNewsSubscriber($email: String!, $subscribed_at: String!) {
            createNewsSubscriber(input: {
                email: $email
                subscribed_at: $subscribed_at
            }) {
                email
                subscribed_at
            }
        }
    `;

    const variables = {
        email: email.toLowerCase().trim(),
        subscribed_at: new Date().toISOString()
    };

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
        },
        body: JSON.stringify({ query: mutation, variables })
    });

    const result = await response.json();

    if (result.errors) {
        throw new Error(result.errors[0].message);
    }

    return result.data.createNewsSubscriber;
}

function handleNewsletterForm(form, buttonText = '무료 구독하기') {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const emailInput = form.querySelector('input[name="email"]');
        const email = emailInput.value;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('올바른 이메일 주소를 입력해주세요.');
            return;
        }

        try {
            btn.disabled = true;
            btn.textContent = '구독 중...';

            await subscribeToNewsletter(email);

            btn.textContent = '✓ 구독 완료!';
            btn.style.background = '#15803d';
            form.reset();
        } catch (error) {
            console.error('구독 실패:', error);
            btn.textContent = '구독 실패 - 다시 시도해주세요';
            btn.style.background = '#dc2626';
            btn.disabled = false;

            setTimeout(() => {
                btn.textContent = buttonText;
                btn.style.background = '';
            }, 3000);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        handleNewsletterForm(newsletterForm, '무료 구독하기');
    }

    const subForm = document.getElementById('sub-form');
    if (subForm) {
        handleNewsletterForm(subForm, '무료 구독');
    }
});
})();
