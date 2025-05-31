document.addEventListener('DOMContentLoaded', () => {
    const darkCheckbox = document.getElementById('dark');
    const intervalInput = document.getElementById('interval');
    const saveBtn      = document.getElementById('save');
  
    chrome.storage.sync.get({ dark: true, interval: 200 }, opts => {
      darkCheckbox.checked = opts.dark;
      intervalInput.value  = opts.interval;
    });
  
    saveBtn.addEventListener('click', () => {
      const dark     = darkCheckbox.checked;
      const interval = parseInt(intervalInput.value, 10) || 200;
      chrome.storage.sync.set({ dark, interval }, () => {
        window.close();
      });
    });
  });
  