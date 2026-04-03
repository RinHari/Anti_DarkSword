/**
 * 外部 JavaScript ファイル (External Script for Recommendations)
 * This script simulates an external service that provides recommendation algorithms.
 */
(function() {
    console.log("[External System] Recommendation Engine Loaded.");

    document.addEventListener('DOMContentLoaded', () => {
        const btnLatest = document.getElementById('btn-latest');
        const btnRecommended = document.getElementById('btn-recommended');

        if (!btnLatest || !btnRecommended) return;

        // Wait to make sure main app is initialized if race condition
        setTimeout(() => {
            if (!window.App) return;

            // Recommendation Logic: Sorts by "score" rather than date (ID)
            btnRecommended.addEventListener('click', () => {
                btnRecommended.classList.add('active');
                btnLatest.classList.remove('active');

                const recommendedData = [...window.App.newsData].sort((a, b) => b.score - a.score);
                window.App.renderNews(recommendedData);
                console.log("[External System] Sorted feed by Recommendation Score.");
            });

            btnLatest.addEventListener('click', () => {
                btnLatest.classList.add('active');
                btnRecommended.classList.remove('active');
                
                // Latest logic: sort by ID ascending (or descending usually, but keeping original order here)
                const latestData = [...window.App.newsData].sort((a, b) => a.id - b.id);
                window.App.renderNews(latestData);
                console.log("[External System] Sorted feed by Latest.");
            });
        }, 100);
    });
})();
