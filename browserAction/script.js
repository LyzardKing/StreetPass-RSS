const isFirefox = typeof browser !== 'undefined';
const browserAPI = isFirefox ? browser : chrome;

const feedsList = document.createElement('ul');
feedsList.id = 'feedsList';
document.body.appendChild(feedsList);


function renderFeeds(feeds) {
    browserAPI.action.setIcon({ path: '../icons/rss_bw.png' });
    feedsList.innerHTML = '';
    if (feeds.length === 0) {
        feedsList.innerHTML = '<li>No feeds recorded yet.</li>';
        return;
    }
    feeds.forEach((feed, idx) => {
        if (feed.show === false) return; // Hide if explicitly set to false
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.flexDirection = 'column';
        li.style.alignItems = 'flex-start';
        const topRow = document.createElement('div');
        topRow.style.display = 'flex';
        topRow.style.alignItems = 'center';
        // Bin icon
        const bin = document.createElement('span');
        bin.textContent = '🗑️';
        bin.title = 'Hide feed';
        bin.setAttribute('aria-label', bin.title);
        bin.style.cursor = 'pointer';
        bin.style.marginRight = '8px';
        bin.onclick = () => {
            feed.show = false;
            updateFeed(idx, feed);
        };
        topRow.appendChild(bin);
        // Link
        const a = document.createElement('a');
        let openMethod = 'none';
        browserAPI.storage.local.get('settings').then(result => {
            openMethod = result.settings?.openMethod;
            if (openMethod === 'none') {
                a.href = feed.href;
            } else if (openMethod === 'custom' && result.settings?.customUrl) {
                a.href = result.settings.customUrl + encodeURI(feed.href);
            } else {
                a.href = openMethod + encodeURI(feed.href);
            }
        });
        a.textContent = feed.title || feed.href;
        a.target = '_blank';
        topRow.appendChild(a);
        topRow.appendChild(document.createTextNode(` (${feed.type}) `));
        li.appendChild(topRow);
        // Article title under the element
        const articlesContainer = document.createElement('details');
        articlesContainer.appendChild(document.createElement('summary')).textContent = `Articles (${feed.articles.length})`;
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
        li.appendChild(articlesContainer);
        feedsList.appendChild(li);
    });
}

function updateFeed(idx, updatedFeed) {
    browserAPI.storage.local.get('recordedFeeds').then(result => {
        const feeds = result.recordedFeeds || [];
        feeds[idx] = updatedFeed;
        browserAPI.storage.local.set({ recordedFeeds: feeds })
            .then(getFeeds)
            .catch(err => console.error('Failed to update feed:', err));
    }).catch(err => console.error('Failed to get feeds:', err));
}

function getFeeds() {
    browserAPI.storage.local.get('recordedFeeds').then(result => {
        const feeds = result.recordedFeeds || [];
        renderFeeds(feeds);
    }).catch(err => console.error('Failed to get feeds:', err));
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('myHeading').style.color = 'red';
    getFeeds();
});
