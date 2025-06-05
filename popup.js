document.addEventListener('DOMContentLoaded', () => {
  const positionEl = document.getElementById('position');
  const themeEl = document.getElementById('theme');
  const colorPickerContainer = document.getElementById('colorPickerContainer');
  const currencyEl = document.getElementById('currency');
  const fontSizeEl = document.getElementById('fontSize');
  const borderEl = document.getElementById('border');
  const resetBtn = document.getElementById('reset');

  // Load settings
  chrome.storage.sync.get({
    position: 'bottom-right-fixed',
    theme: 'dark',
    bgColor: '#000000',
    currency: '€ ',
    fontSize: 14,
    border: true
  }, (data) => {
    positionEl.value = data.position;
    themeEl.value = data.theme;
    currencyEl.value = data.currency;
    fontSizeEl.value = data.fontSize;
    borderEl.value = String(data.border);

    if (data.theme === 'custom') {
      colorPickerContainer.classList.remove('hidden');
    }
  });

  // Theme change handler
  themeEl.addEventListener('change', () => {
    const theme = themeEl.value;
    if (theme === 'custom') {
      colorPickerContainer.classList.remove('hidden');
      chrome.storage.sync.set({
        theme: 'custom',
        bgColor: document.getElementById('colorPreview').style.backgroundColor || '#000000'
      });
    } else {
      colorPickerContainer.classList.add('hidden');
      chrome.storage.sync.set({
        theme: theme,
        bgColor: null
      });
    }
  });

  // Other setting handlers
  positionEl.addEventListener('change', () => {
    chrome.storage.sync.set({ position: positionEl.value });
  });

  currencyEl.addEventListener('input', () => {
    chrome.storage.sync.set({ currency: currencyEl.value });
  });

  fontSizeEl.addEventListener('change', () => {
    const size = parseInt(fontSizeEl.value);
    if (!isNaN(size) && size >= 10 && size <= 50) {
      chrome.storage.sync.set({ fontSize: size });
    }
  });

  borderEl.addEventListener('change', () => {
    chrome.storage.sync.set({ border: borderEl.value === 'true' });
  });

  // Reset button
  resetBtn.addEventListener('click', () => {
    chrome.storage.sync.set({
      position: 'bottom-right-fixed',
      theme: 'dark',
      bgColor: '#000000',
      currency: '€ ',
      fontSize: 14,
      border: true
    }, () => {
      positionEl.value = 'bottom-right-fixed';
      themeEl.value = 'dark';
      colorPickerContainer.classList.add('hidden');
      currencyEl.value = '€ ';
      fontSizeEl.value = 14;
      borderEl.value = 'true';
    });
  });
});