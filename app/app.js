// CSP導入
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' http://localhost:4000; style-src 'self' 'unsafe-inline'; img-src 'self' https://picsum.photos data:;"
    );
    next();
});

app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
    console.log(`App server running at http://localhost:${PORT}`);
});


// ニュースデータ
const MOCK_NEWS = [
    { id: 1, title: "Next-Gen AI Models Released", category: "Technology", excerpt: "The latest breakthrough in artificial intelligence brings human-like reasoning to daily tasks.", image: "https://picsum.photos/seed/tech1/400/250", date: "2 Hours Ago", score: 95 },
    { id: 2, title: "Global Markets Rally Amid Tech Surge", category: "Finance", excerpt: "Investors are bullish as major tech stocks hit all-time highs this quarter.", image: "https://picsum.photos/seed/finance/400/250", date: "4 Hours Ago", score: 82 },
    { id: 3, title: "New Exoplanet Discovered in Habitable Zone", category: "Science", excerpt: "Astronomers have found an Earth-sized planet orbiting a red dwarf 40 light-years away.", image: "https://picsum.photos/seed/space/400/250", date: "5 Hours Ago", score: 88 },
    { id: 4, title: "Electric Vehicle Sales Break Records", category: "Auto", excerpt: "The shift to sustainable transport accelerates as traditional automakers pivot to EV.", image: "https://picsum.photos/seed/auto/400/250", date: "6 Hours Ago", score: 75 },
    { id: 5, title: "Major Update to Web Standards Announced", category: "Dev", excerpt: "W3C introduces new CSS capabilities that will change how we build layouts.", image: "https://picsum.photos/seed/dev/400/250", date: "8 Hours Ago", score: 91 },
    { id: 6, title: "Minimalist Design Trends for 2026", category: "Design", excerpt: "Why less is more, and how glassmorphism is evolving in modern interfaces.", image: "https://picsum.photos/seed/design/400/250", date: "1 Day Ago", score: 85 }
];

window.App = {
    newsData: MOCK_NEWS
};

const AUTH_STORAGE_KEY = 'modern-news-auth';

function getStoredUser() {
    try {
        const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        console.error('Failed to parse auth state:', error);
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
    const userBadge = document.getElementById('user-badge');
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const heroLoginButton = document.getElementById('hero-login-button');
    const welcomeTitle = document.getElementById('welcome-title');
    const welcomeMessage = document.getElementById('welcome-message');
    const profileCard = document.getElementById('profile-card');
    const profileUsername = document.getElementById('profile-username');
    const profileEmail = document.getElementById('profile-email');

    if (user) {
        userBadge.textContent = user.username;
        loginButton.classList.add('hidden');
        logoutButton.classList.remove('hidden');
        heroLoginButton.classList.add('hidden');
        welcomeTitle.textContent = `Welcome back, ${user.username}`;
        welcomeMessage.textContent = 'Your personalized feed and member controls are active for this session.';
        profileCard.classList.remove('hidden');
        profileUsername.textContent = user.username;
        profileEmail.textContent = user.email;
        return;
    }

    userBadge.textContent = 'Guest';
    loginButton.classList.remove('hidden');
    logoutButton.classList.add('hidden');
    heroLoginButton.classList.remove('hidden');
    welcomeTitle.textContent = 'Welcome, guest';
    welcomeMessage.textContent = 'Log in to personalize your news feed and save articles for later.';
    profileCard.classList.add('hidden');
    profileUsername.textContent = '-';
    profileEmail.textContent = '-';
}

function openLoginModal() {
    document.getElementById('login-modal').classList.remove('hidden');
    document.getElementById('login-modal-backdrop').classList.remove('hidden');
}

function closeLoginModal() {
    document.getElementById('login-modal').classList.add('hidden');
    document.getElementById('login-modal-backdrop').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    const newsGrid = document.getElementById('news-grid');
    const searchInput = document.getElementById('search-input');
    const themeToggle = document.getElementById('theme-toggle');
    const loginButton = document.getElementById('login-button');
    const heroLoginButton = document.getElementById('hero-login-button');
    const logoutButton = document.getElementById('logout-button');
    const closeLoginModalButton = document.getElementById('close-login-modal');
    const loginModalBackdrop = document.getElementById('login-modal-backdrop');
    const loginForm = document.getElementById('login-form');

    function renderNews(articles) {
        newsGrid.innerHTML = '';
        if (articles.length === 0) {
            newsGrid.innerHTML = '<p>No news found for your query.</p>';
            return;
        }

        articles.forEach(article => {
            const card = document.createElement('div');
            card.className = 'news-card';
            card.innerHTML = `
                <img src="${article.image}" alt="News Image">
                <div class="news-category">${article.category}</div>
                <h3 class="news-title">${article.title}</h3>
                <p class="news-excerpt">${article.excerpt}</p>
                <div class="news-footer">
                    <span>${article.date}</span>
                    <a href="#" class="read-more">Read More &rarr;</a>
                </div>
            `;
            newsGrid.appendChild(card);
        });
    }

    window.App.renderNews = renderNews;
    renderNews(MOCK_NEWS);
    updateAuthUI(getStoredUser());

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = window.App.newsData.filter(article =>
            article.title.toLowerCase().includes(query) ||
            article.excerpt.toLowerCase().includes(query)
        );
        renderNews(filtered);
    });

    themeToggle.addEventListener('click', () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
        themeToggle.textContent = isDark ? '🌙' : '☀️';
    });

    loginButton.addEventListener('click', openLoginModal);
    heroLoginButton.addEventListener('click', openLoginModal);
    closeLoginModalButton.addEventListener('click', closeLoginModal);
    loginModalBackdrop.addEventListener('click', closeLoginModal);

    logoutButton.addEventListener('click', () => {
        setStoredUser(null);
        updateAuthUI(null);
    });

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(loginForm);
        const user = {
            username: String(formData.get('username') || '').trim() || 'demo_user',
            email: String(formData.get('email') || '').trim() || 'demo@example.com'
        };

        setStoredUser(user);
        updateAuthUI(user);
        closeLoginModal();
        loginForm.reset();
    });
});