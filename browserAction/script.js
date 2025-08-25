const isFirefox = typeof browser !== 'undefined';
const browserAPI = isFirefox ? browser : chrome;

const feedsList = document.getElementById('feedsList');
const feedItemTemplate = document.getElementById('feed-item-template');
const feedArticleTemplate = document.getElementById('feed-article-template');

function renderFeeds(feeds) {
    // Reset icon state
    browserAPI.action.setIcon({ path: '../icons/rss_bw.png' });
    feedsList.innerHTML = '';
    if (!feeds || feeds.length === 0) {
        feedsList.innerHTML = '<li>No feeds recorded yet.</li>';
        return;
    }
    feeds.forEach(async (feed, idx) => {
        if (feed.show === false) return;
        // Clone template
        const template = feedItemTemplate.content.cloneNode(true);
        const li = template.querySelector('li');
        const bin = li.querySelector('.feed-bin');
        const a = li.querySelector('.feed-link');
        const articlesContainer = li.querySelector('.feed-article-titles');

        // Set link
        a.href = await setUrl(feed.href);
        a.textContent = feed.title || feed.href;
        // Set bin icon handler
        bin.onclick = () => {
            feed.show = false;
            updateFeed(idx, feed);
        };
        // Set article children
        for (const article of feed.articles) {
            console.log('Article:', article);
            if (article.title) {
                const articleItem = feedArticleTemplate.content.cloneNode(true);
                const articleLink = articleItem.querySelector('.feed-article-link');
                articleLink.textContent = article.title;
                articleLink.href = article.url;
                articlesContainer.appendChild(articleItem);
            }
        }
        feedsList.appendChild(li);
    });
}

async function getSettings() {
    try {
        const result = await browserAPI.storage.local.get('settings');
        return result.settings || {};
    } catch (err) {
        console.error('Failed to get settings:', err);
        return {};
    }
}

async function setUrl(url) {
    let finalUrl = url;
    const settings = await getSettings();
    console.log('Settings:  ', settings);
    const openMethod = settings.openMethod || 'none';
    try {
        if (openMethod === 'none') {
            // Do nothing, keep the original URL
        } else if (openMethod === 'custom' && settings.customUrl) {
            finalUrl = settings.customUrl + encodeURI(url);
        } else {
            finalUrl = openMethod + encodeURI(url);
        }
        return finalUrl;
    } catch (err) {
        console.error('Failed to set URL:', err);
        return url;
    }
}

async function getFeeds() {
    try {
        const result = await browserAPI.storage.local.get('recordedFeeds');
        renderFeeds(result.recordedFeeds || []);
    } catch (err) {
        console.error('Failed to get feeds:', err);
    }
}

async function updateFeed(idx, updatedFeed) {
    try {
        const result = await browserAPI.storage.local.get('recordedFeeds');
        const feeds = result.recordedFeeds || [];
        feeds[idx] = updatedFeed;
        await browserAPI.storage.local.set({ recordedFeeds: feeds });
        await getFeeds();
    } catch (err) {
        console.error('Failed to update feed:', err);
    }
}

document.addEventListener('DOMContentLoaded', getFeeds);
