(function() {
  const banner = document.createElement('div');
  banner.id = 'live-total-banner';
  Object.assign(banner.style, {
    position: 'fixed',
    padding: '10px 15px',
    borderRadius: '8px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    zIndex: 10000,
    fontFamily: 'sans-serif',
    fontSize: '14px',
    backgroundColor: 'black',
    color: 'white',
    border: '2px solid white',
    bottom: '0',
    right: '0',
    display: 'none',
    transition: 'background-color 0.3s ease, color 0.3s ease, border 0.3s ease'
  });
  document.body.appendChild(banner);

  let settings = {
    theme: 'dark',
    bgColor: null,
    interval: 200,
    position: 'bottom-right-fixed',
    currency: '€ ',
    fontSize: 14,
    border: true
  };
  let updateTimer = null;

  function loadSettings(callback) {
    chrome.storage.sync.get(
      {
        theme: 'dark',
        bgColor: null,
        interval: 200,
        position: 'bottom-right-fixed',
        currency: '€ ',
        fontSize: 14,
        border: true
      },
      opts => {
        settings = { ...settings, ...opts };
        applyThemeSettings();
        applyPositionSetting();
        if (typeof callback === 'function') {
          callback();
        }
      }
    );
  }

  function applyThemeSettings() {
    if (settings.theme === 'custom' && settings.bgColor) {
      banner.style.backgroundColor = settings.bgColor;
      banner.style.color = 'white';
    } else if (settings.theme === 'light') {
      banner.style.backgroundColor = 'white';
      banner.style.color = 'black';
    } else {
      banner.style.backgroundColor = 'black';
      banner.style.color = 'white';
    }

    if (settings.border) {
      if (settings.theme === 'light') {
        banner.style.border = '2px solid black';
      } else {
        banner.style.border = '2px solid white';
      }
    } else {
      banner.style.border = 'none';
    }

    banner.style.fontSize = settings.fontSize + 'px';
  }

  function applyPositionSetting() {
    banner.style.top = '';
    banner.style.bottom = '';
    banner.style.left = '';
    banner.style.right = '';

    if (settings.position === 'bottom-right-fixed') {
      banner.style.bottom = '0';
      banner.style.right = '0';
    } else {
      switch (settings.position) {
        case 'bottom-right':
          banner.style.bottom = '10px';
          banner.style.right = '10px';
          break;
        case 'bottom-left':
          banner.style.bottom = '10px';
          banner.style.left = '10px';
          break;
        case 'top-right':
          banner.style.top = '10px';
          banner.style.right = '10px';
          break;
        case 'top-left':
          banner.style.top = '10px';
          banner.style.left = '10px';
          break;
      }
    }
  }

  function collectPrices() {
    return Array.from(
      document.querySelectorAll('span.product-price')
    ).filter(el => !el.closest('#live-total-banner'));
  }

  function parsePrice(text) {
    let num = text.replace(/[^\d,.-]/g, '').replace(',', '.');
    return parseFloat(num) || 0;
  }

  function calculateSum() {
    const els = collectPrices();
    const sum = els.reduce((tot, el) => tot + parsePrice(el.textContent), 0);
    banner.textContent = settings.currency + sum.toFixed(2);
  }

  function updateBanner() {
    if (window.location.href.includes('/mijnlijstjes')) {
      banner.style.display = 'block';
      calculateSum();
    } else {
      banner.style.display = 'none';
    }
  }

  function scheduleUpdate() {
    clearTimeout(updateTimer);
    updateTimer = setTimeout(updateBanner, settings.interval);
  }

  const observer = new MutationObserver(scheduleUpdate);
  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener('popstate', updateBanner);
  const origPush = history.pushState;
  history.pushState = function() {
    origPush.apply(this, arguments);
    updateBanner();
  };

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync') {
      let needsUpdate = false;
      
      if (changes.theme || changes.bgColor) {
        settings.theme = changes.theme?.newValue ?? settings.theme;
        settings.bgColor = changes.bgColor?.newValue ?? settings.bgColor;
        applyThemeSettings();
        needsUpdate = true;
      }
      
      if (changes.position) {
        settings.position = changes.position.newValue;
        applyPositionSetting();
        needsUpdate = true;
      }
      
      if (changes.currency) {
        settings.currency = changes.currency.newValue;
        needsUpdate = true;
      }
      
      if (changes.fontSize) {
        settings.fontSize = changes.fontSize.newValue;
        banner.style.fontSize = settings.fontSize + 'px';
        needsUpdate = true;
      }
      
      if (changes.border) {
        settings.border = changes.border.newValue;
        applyThemeSettings();
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        scheduleUpdate();
      }
    }
  });

  loadSettings(updateBanner);
})();