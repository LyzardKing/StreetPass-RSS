const isFirefox = typeof browser !== 'undefined';
const browserAPI = isFirefox ? browser : chrome;

const form = document.getElementById('settingsForm');
const statusDiv = document.getElementById('status');

// Function to serialize form data into JSON
function serializeForm(form) {
  const formData = new FormData(form);
  const json = {};
  for (const [key, value] of formData.entries()) {
    if (key === 'skipPatterns') {
      json[key] = value.split('\n').map(s => s.trim()).filter(s => s);
    } else {
      json[key] = value;
    }
  }
  return json;
}

// Function to populate form fields from JSON
function populateForm(form, data) {
  for (const [key, value] of Object.entries(data)) {
    const field = form.elements[key];
    if (field) {
      if (field.type === 'checkbox') {
        field.checked = value === 'true' || value === true;
      } else {
        field.value = value;
      }
    }
  }
}

// Load settings
(async () => {
  try {
    const result = await browserAPI.storage.local.get('settings');
    const settings = result.settings || {};
    populateForm(form, settings);
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
})();

// Save settings on form submission
form.addEventListener('submit', async e => {
  e.preventDefault();
  const settings = serializeForm(form);
  await browserAPI.storage.local.set({ settings });
  statusDiv.textContent = 'Settings saved!';
  setTimeout(() => { statusDiv.textContent = ''; }, 1500);
});
