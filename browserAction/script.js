const isFirefox = typeof browser !== 'undefined';
const browserAPI = isFirefox ? browser : chrome;

const feedsList = document.getElementById('feedsList');
const feedItemTemplate = document.getElementById('feed-item-template');


function renderFeeds(feeds) {
    // Reset icon state
    browserAPI.action.setIcon({ path: '../icons/rss_bw.png' });
    feedsList.innerHTML = '';
    if (!feeds || feeds.length === 0) {
        feedsList.innerHTML = '<li>No feeds recorded yet.</li>';
        return;
    }
    feeds.forEach((feed, idx) => {
        if (feed.show === false) return;
        // Clone template
        const template = feedItemTemplate.content.cloneNode(true);
        const li = template.querySelector('li');
        const bin = li.querySelector('.feed-bin');
        const a = li.querySelector('.feed-link');
        const articlesContainer = li.querySelector('.feed-article-titles');

        // Set link
        a.href = feed.href;
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
                const articleTitle = document.createElement('a');
                articleTitle.className = 'article';
                articleTitle.textContent = article.title;
                articleTitle.href = article.url;
                articlesContainer.appendChild(articleTitle);
            }
        }
        feedsList.appendChild(li);
    });
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
