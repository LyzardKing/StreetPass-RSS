const isFirefox = typeof browser !== 'undefined';
const browserAPI = isFirefox ? browser : chrome;

const form = document.getElementById('settingsForm');
const hideFeedsCheckbox = document.getElementById('hideFeeds');
const openMethodSelect = document.getElementById('openMethod');
const customUrlInput = document.getElementById('customUrl');
const customUrlContainer = document.getElementById('customUrlContainer');
const statusDiv = document.getElementById('status');

// Show/hide customUrl input based on openMethod
openMethodSelect.addEventListener('change', () => {
  customUrlContainer.style.display = openMethodSelect.value === 'custom' ? 'block' : 'none';
});

// Load settings
browserAPI.storage.local.get('settings').then(result => {
  const settings = result.settings || {};
  hideFeedsCheckbox.checked = !!settings.hideFeeds;
  openMethodSelect.value = settings.openMethod || 'none';
  customUrlInput.value = settings.customUrl || '';
  customUrlContainer.style.display = openMethodSelect.value === 'custom' ? 'block' : 'none';
});

form.addEventListener('submit', async e => {
  e.preventDefault();
  const settings = {
    hideFeeds: hideFeedsCheckbox.checked,
    openMethod: openMethodSelect.value,
    customUrl: customUrlInput.value
  };
  await browserAPI.storage.local.set({ settings });
  statusDiv.textContent = 'Settings saved!';
  setTimeout(() => { statusDiv.textContent = ''; }, 1500);
});
