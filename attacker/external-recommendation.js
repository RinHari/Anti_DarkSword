/**
 * Attack Demo: malicious recommendation script
 * Safe demo only: modifies the UI to promote fake urgent content and logs visible page data.
 */
(function () {
    console.log('[Attacker] Malicious recommendation script loaded.');

    function injectWarningBanner() {
        if (document.getElementById('fake-security-banner')) return;

        const hero = document.querySelector('.hero, .hero-section, header, .top-section') || document.body.firstElementChild || document.body;
        const banner = document.createElement('div');
        banner.id = 'fake-security-banner';
        banner.style.background = 'linear-gradient(90deg, #7f1d1d, #b91c1c)';
        banner.style.color = '#ffffff';
        banner.style.padding = '14px 18px';
        banner.style.borderRadius = '12px';
        banner.style.margin = '12px auto';
        banner.style.maxWidth = '1100px';
        banner.style.boxShadow = '0 8px 20px rgba(127,29,29,0.25)';
        banner.innerHTML = `
            <strong>Security notice:</strong>
            unusual activity was detected. Re-authentication may be required before reading member content.
        `;

        if (hero.parentNode) {
            hero.parentNode.insertBefore(banner, hero.nextSibling);
        } else {
            document.body.prepend(banner);
        }
    }

    function rewriteVisibleNews() {
        const cards = Array.from(document.querySelectorAll('.news-card'));
        cards.slice(0, 2).forEach(function (card, index) {
            const title = card.querySelector('.news-title');
            const excerpt = card.querySelector('.news-excerpt');
            const category = card.querySelector('.news-category');

            if (title) {
                title.textContent = index === 0
                    ? 'Account verification required for full article access'
                    : 'Your personalized feed is temporarily locked';
            }
            if (excerpt) {
                excerpt.textContent = 'Demo only: a malicious third-party script can rewrite visible content and steer user behavior.';
            }
            if (category) {
                category.textContent = 'Alert';
            }
        });
    }

    function exposeVisibleState() {
        const userBadge = document.getElementById('user-badge');
        const searchInput = document.getElementById('search-input');
        const output = document.createElement('div');
        output.id = 'visible-state-dump';
        output.style.maxWidth = '1100px';
        output.style.margin = '12px auto';
        output.style.padding = '12px 16px';
        output.style.border = '1px dashed #9ca3af';
        output.style.borderRadius = '12px';
        output.style.background = '#f9fafb';
        output.style.color = '#111827';
        output.style.fontSize = '14px';
        output.textContent = `Demo visible data -> user badge: ${userBadge ? userBadge.textContent : '(not found)'} / search text: ${searchInput ? searchInput.value : '(not found)'}`;

        document.body.appendChild(output);
        console.log('[Attacker] Demo visible page data:', {
            userBadge: userBadge ? userBadge.textContent : null,
            searchText: searchInput ? searchInput.value : null
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(function () {
            injectWarningBanner();
            rewriteVisibleNews();
            exposeVisibleState();
        }, 700);
    });
})();