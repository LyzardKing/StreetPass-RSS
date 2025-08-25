// Listen for messages from content scripts to record feeds
const isFirefox = typeof browser !== 'undefined';
const browserAPI = isFirefox ? browser : chrome;

console.log('Background script loaded');

function storeFeeds(feeds) {
    browserAPI.storage.local.get('recordedFeeds')
        .then(result => {
            let recordedFeeds = Array.isArray(result.recordedFeeds) ? result.recordedFeeds : [];
            feeds.forEach(feed => {
                if (!recordedFeeds.some(f => f.href === feed.href)) {
                    recordedFeeds.unshift(feed);
                    browserAPI.action.setIcon({ path: 'icons/rss.png' });
                } else {
                    let parent = recordedFeeds.find(f => f.href === feed.href);
                    console.log('Existing feed found, updating articles:', parent, feed);
                    if (!parent.articles.some(a => a.url === feed.articles[0].url)) {
                        parent.articles.unshift(feed.articles[0]);
                    }
                }
            });
            browserAPI.storage.local.set({ recordedFeeds })
                .then(() => {
                    console.log('Feeds updated successfully');
                })
                .catch(err => {
                    console.error('Error setting recordedFeeds:', err);
                });
        })
        .catch(err => {
            console.error('Error getting recordedFeeds:', err);
        });
}

browserAPI.runtime.onMessage.addListener(function (message, sender) {
    if (message.action === 'recordFeeds' && Array.isArray(message.feeds)) {
        console.log('Storing feeds from message:', message.feeds);
        storeFeeds(message.feeds);
    }
});
