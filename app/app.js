const AUTH_STORAGE_KEY = "modern-news-auth";

window.App = {
    newsData: [],
    rawNewsData: [],
    renderNews: () => { },
};

function getStoredUser() {
    try {
        const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        console.error("Failed to parse auth state:", error);
        return null;
    }
}

function setStoredUser(user) {
    if (!user) {
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
        return;
    }
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

function updateAuthUI(user) {
    const userBadge = document.getElementById("user-badge");
    const loginButton = document.getElementById("login-button");
    const logoutButton = document.getElementById("logout-button");
    const heroLoginButton = document.getElementById("hero-login-button");
    const welcomeTitle = document.getElementById("welcome-title");
    const welcomeMessage = document.getElementById("welcome-message");
    const profileCard = document.getElementById("profile-card");
    const profileUsername = document.getElementById("profile-username");
    const profileEmail = document.getElementById("profile-email");

    if (!userBadge || !loginButton || !logoutButton || !heroLoginButton || !welcomeTitle || !welcomeMessage || !profileCard || !profileUsername || !profileEmail) {
        return;
    }

    if (user) {
        userBadge.textContent = user.username;
        loginButton.classList.add("hidden");
        logoutButton.classList.remove("hidden");
        heroLoginButton.classList.add("hidden");
        welcomeTitle.textContent = `Welcome back, ${user.username}`;
        welcomeMessage.textContent = "Your personalized feed and member controls are active for this session.";
        profileCard.classList.remove("hidden");
        profileUsername.textContent = user.username;
        profileEmail.textContent = user.email;
        return;
    }

    userBadge.textContent = "Guest";
    loginButton.classList.remove("hidden");
    logoutButton.classList.add("hidden");
    heroLoginButton.classList.remove("hidden");
    welcomeTitle.textContent = "Welcome, guest";
    welcomeMessage.textContent = "Log in to personalize your news feed and save articles for later.";
    profileCard.classList.add("hidden");
    profileUsername.textContent = "-";
    profileEmail.textContent = "-";
}

function openLoginModal() {
    document.getElementById("login-modal")?.classList.remove("hidden");
    document.getElementById("login-modal-backdrop")?.classList.remove("hidden");
}

function closeLoginModal() {
    document.getElementById("login-modal")?.classList.add("hidden");
    document.getElementById("login-modal-backdrop")?.classList.add("hidden");
}

function normalizeArticles(newsData) {
    const articles = newsData?.articles || [];

    return articles.map((article, index) => ({
        id: index + 1,
        title: article.title || "No title",
        category: article.source?.name || "News",
        excerpt: article.description || "No description available.",
        image: article.urlToImage || `https://picsum.photos/seed/fallback${index}/400/250`,
        date: article.publishedAt
            ? new Date(article.publishedAt).toLocaleString()
            : "Unknown date",
        score: Math.max(50, 100 - index),
        url: article.url || "#"
    }));
}

async function loadNewsFromServer() {
    try {
        const response = await fetch("/news");

        if (!response.ok) {
            throw new Error("Failed to fetch /news");
        }

        const data = await response.json();
        return normalizeArticles(data);
    } catch (error) {
        console.error("Error loading news:", error);
        return null;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const newsGrid = document.getElementById("news-grid");
    const searchInput = document.getElementById("search-input");
    const themeToggle = document.getElementById("theme-toggle");
    const loginButton = document.getElementById("login-button");
    const heroLoginButton = document.getElementById("hero-login-button");
    const logoutButton = document.getElementById("logout-button");
    const closeLoginModalButton = document.getElementById("close-login-modal");
    const loginModalBackdrop = document.getElementById("login-modal-backdrop");
    const loginForm = document.getElementById("login-form");
    const latestButton = document.getElementById("btn-latest");
    const recommendedButton = document.getElementById("btn-recommended");

    function renderNews(articles) {
        if (!newsGrid) return;

        newsGrid.innerHTML = "";

        if (!articles || articles.length === 0) {
            newsGrid.innerHTML = "<p>No news found for your query.</p>";
            return;
        }

        articles.forEach((article) => {
            const card = document.createElement("div");
            card.className = "news-card";
            card.innerHTML = `
                <img src="${article.image}" alt="News Image">
                <div class="news-category">${article.category}</div>
                <h3 class="news-title">${article.title}</h3>
                <p class="news-excerpt">${article.excerpt}</p>
                <div class="news-footer">
                    <span>${article.date}</span>
                    <a href="${article.url}" class="read-more" target="_blank" rel="noopener noreferrer">Read More &rarr;</a>
                </div>
            `;
            newsGrid.appendChild(card);
        });
    }

    function setActiveFeedButton(activeButton) {
        [latestButton, recommendedButton].forEach((button) => {
            button?.classList.remove("active");
        });
        activeButton?.classList.add("active");
    }

    function showLatest() {
        const latest = [...window.App.rawNewsData];
        window.App.newsData = latest;
        renderNews(latest);
        setActiveFeedButton(latestButton);
    }

    function showRecommended() {
        const recommended = [...window.App.rawNewsData].sort((a, b) => b.score - a.score);
        window.App.newsData = recommended;
        renderNews(recommended);
        setActiveFeedButton(recommendedButton);
    }

    window.App.renderNews = renderNews;

    const fetchedArticles = await loadNewsFromServer();
    window.App.rawNewsData = fetchedArticles;
    window.App.newsData = fetchedArticles;
    renderNews(fetchedArticles);

    updateAuthUI(getStoredUser());

    searchInput?.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();

        const filtered = window.App.newsData.filter((article) =>
            article.title.toLowerCase().includes(query) ||
            article.excerpt.toLowerCase().includes(query) ||
            article.category.toLowerCase().includes(query)
        );

        renderNews(filtered);
    });

    themeToggle?.addEventListener("click", () => {
        const isDark = document.body.getAttribute("data-theme") === "dark";
        document.body.setAttribute("data-theme", isDark ? "light" : "dark");
        themeToggle.textContent = isDark ? "🌙" : "☀️";
    });

    latestButton?.addEventListener("click", showLatest);
    recommendedButton?.addEventListener("click", showRecommended);

    loginButton?.addEventListener("click", openLoginModal);
    heroLoginButton?.addEventListener("click", openLoginModal);
    closeLoginModalButton?.addEventListener("click", closeLoginModal);
    loginModalBackdrop?.addEventListener("click", closeLoginModal);

    logoutButton?.addEventListener("click", () => {
        setStoredUser(null);
        updateAuthUI(null);
    });

    loginForm?.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(loginForm);
        const user = {
            username: String(formData.get("username") || "").trim() || "demo_user",
            email: String(formData.get("email") || "").trim() || "demo@example.com"
        };

        setStoredUser(user);
        updateAuthUI(user);
        closeLoginModal();
        loginForm.reset();
    });
});