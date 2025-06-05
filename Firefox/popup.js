document.addEventListener('DOMContentLoaded', () => {
  const positionEl = document.getElementById('position');
  const darkEl = document.getElementById('dark');
  const currencyEl = document.getElementById('currency');
  const fontSizeEl = document.getElementById('fontSize');
  const borderEl = document.getElementById('border');
  const resetBtn = document.getElementById('reset');

  chrome.storage.sync.get(['position', 'dark', 'currency', 'fontSize', 'border'], data => {
    positionEl.value = data.position || 'bottom-right-fixed';
    darkEl.value = String(data.dark ?? true);
    currencyEl.value = data.currency || '€ ';
    fontSizeEl.value = data.fontSize || 14;
    borderEl.value = String(data.border ?? true);
  });

  positionEl.addEventListener('change', () => {
    chrome.storage.sync.set({ position: positionEl.value });
  });

  darkEl.addEventListener('change', () => {
    chrome.storage.sync.set({ dark: darkEl.value === 'true' });
  });

  currencyEl.addEventListener('input', () => {
    chrome.storage.sync.set({ currency: currencyEl.value });
  });

  fontSizeEl.addEventListener('input', () => {
    chrome.storage.sync.set({ fontSize: parseInt(fontSizeEl.value) });
  });

  borderEl.addEventListener('change', () => {
    chrome.storage.sync.set({ border: borderEl.value === 'true' });
  });

  resetBtn.addEventListener('click', () => {
    chrome.storage.sync.set({
      dark: true,
      position: 'bottom-right-fixed',
      currency: '€ ',
      fontSize: 14,
      border: true
    }, () => location.reload());
  });
});
