/**
 * 第三者部品 (Third-Party Widget Component)
 * Simulates a widget injected from another domain (like an ad platform or special campaign provider).
 */
(function() {
    console.log("[Third-Party] Campaign Widget Initializing...");

    document.addEventListener('DOMContentLoaded', () => {
        const container = document.getElementById('campaign-widget-container');
        if (!container) return;

        // Create the isolated widget
        const widget = document.createElement('div');
        widget.className = 'campaign-widget';
        
        widget.innerHTML = `
            <div class="campaign-content">
                <h3>🔥 Limited Time Spring Campaign!</h3>
                <p>Subscribe to premium news for 50% off. Stay ahead of the curve.</p>
            </div>
            <a href="#" class="campaign-btn" onclick="alert('Thanks for your interest!'); return false;">Claim Offer</a>
        `;

        // Simulate network delay for third party injection
        setTimeout(() => {
            container.appendChild(widget);
            console.log("[Third-Party] Campaign Widget Rendered.");
        }, 800);
    });
})();
