// Listen for messages from content scripts to record feeds
const isFirefox = typeof browser !== 'undefined';
const browserAPI = isFirefox ? browser : chrome;

console.log('Background script loaded');

async function initializeDB(dbName, version, storeName, keyPath) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, version);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: keyPath });
                console.log("Object store ", storeName, " created");
            }
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            console.log("IndexedDB initialized successfully");
            resolve(db);
        };

        request.onerror = (event) => {
            console.error("IndexedDB initialization error:", event.target.error);
            reject(event.target.error);
        };
    });
}

async function storeFeeds(feeds) {
    // Workaround for sites that use "comments" feeds for every article
    // Example: OMG! Ubuntu! https://www.omgubuntu.co.uk/
    const filteredFeeds = [];
    for (const link of feeds) {
        const isBlacklistedLink = await isBlacklisted(link.href);
        if (!link.title.toLowerCase().includes('comments') && !isBlacklistedLink) {
            filteredFeeds.push(link);
        }
    }

    if (filteredFeeds.length === 0) {
        console.log('All feeds were filtered out (possibly due to blacklist)');
        return;
    }
    console.log('Filtered feeds to store:', filteredFeeds);
    addFeedsToDB(filteredFeeds);
}

async function addFeedsToDB(filteredFeeds) {
    const db = await initializeDB("StreetPassRSS", 1, "feeds", "href");
    if (!db) {
        console.error('IndexedDB not initialized');
        return;
    }
    const transaction = db.transaction(['feeds'], 'readwrite');
    const objectStore = transaction.objectStore('feeds');
    filteredFeeds.forEach(feed => {
        const getRequest = objectStore.get(feed.href);
        getRequest.onsuccess = (event) => {
            const data = event.target.result;
            if (!data) {
                objectStore.add(feed);
                browserAPI.action.setIcon({ path: 'icons/rss.png' });
            } else {
                console.log('Existing feed found in DB, updating articles:', data, feed);
                if (!data.articles.some(a => a.url === feed.articles[0].url)) {
                    data.articles.unshift(feed.articles[0]);
                    objectStore.put(data);
                }
            }
        };
        getRequest.onerror = (event) => {
            console.error('Error retrieving feed from DB:', event);
        };
    });
    transaction.oncomplete = () => {
        console.log('Feeds transaction completed');
    };
    transaction.onerror = (event) => {
        console.error('Transaction error:', event);
    };
}

// async function getSettings() {
//     return await initializeDB("StreetPassRSS", 1, "settings", "name");
// }

async function getSettings() {
    try {
        const result = await browserAPI.storage.local.get('settings');
        return result.settings || {};
    } catch (err) {
        console.error('Failed to get settings:', err);
        return {};
    }
}

async function getSkipPatterns() {
    const settings = await getSettings();
    let result = settings.skipPatterns || getDefaultSkipPatterns();
    return result;
}

function getDefaultSkipPatterns() {
    return [
        'github\\.com/.+?(private\\.atom)|stackoverflow\\.com/feeds|reddit\\.com/.+?/\\.rss'
    ];
}

// Refactored isBlacklisted to handle asynchronous getSkipPatterns directly within the function
async function isBlacklisted(url) {
    const skipPatterns = await getSkipPatterns();
    if (skipPatterns && Array.isArray(skipPatterns)) {
        return skipPatterns.some(pattern => {
            try {
                const regex = new RegExp(pattern);
                return regex.test(url);
            } catch (e) {
                console.error('Invalid regex pattern:', pattern, e);
                return false;
            }
        });
    }
    return false;
}

browserAPI.runtime.onMessage.addListener(function (message, sender) {
    if (message.action === 'recordFeeds' && Array.isArray(message.feeds)) {
        console.log('Storing feeds from message:', message.feeds);
        storeFeeds(message.feeds);
    }
});
