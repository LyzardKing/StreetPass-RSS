const isFirefox = typeof browser !== 'undefined';
const browserAPI = isFirefox ? browser : chrome;

function searchFeedsOnPage() {
    url = window.location.href;
    title = document.title || null;
    try {
        const feedLinks = Array.from(document.querySelectorAll('link[rel="alternate"]'));
        const filteredLinks = feedLinks.filter(link =>
            (link.type === 'application/rss+xml' || link.type === 'application/atom+xml') &&
            // Workaround for sites that use "comments" feeds for every article
            // Example: OMG! Ubuntu! https://www.omgubuntu.co.uk/
            !link.title.toLowerCase().includes('comments')
        );

        if (filteredLinks.length > 0) {
            const feeds = filteredLinks.map(link => ({
                title: link.title,
                href: link.href,
                articles: [{
                    url: url,
                    title: title
                }],
                type: link.type,
                show: true
            }));
            console.log('Found feeds:', feeds);
            browserAPI.runtime.sendMessage({ action: 'recordFeeds', feeds });
        } else {
            console.log('No feeds found on this page.');
        }
    } catch (err) {
        console.error('Error searching for feeds:', err);
    }
}

searchFeedsOnPage();
