;(function() {
  const banner = document.createElement('div');
  banner.id = 'live-total-banner';
  Object.assign(banner.style, {
    position:     'fixed',
    padding:      '10px 15px',
    borderRadius: '8px',
    boxShadow:    '0 2px 6px rgba(0,0,0,0.2)',
    zIndex:       10000,
    fontFamily:   'sans-serif',
    fontSize:     '14px',

    backgroundColor: 'black',
    color:           'white',
    border:          '2px solid white',
    bottom:          '0',
    right:           '0',
    display:         'none'  // start hidden, wordt zichtbaar bij /mijnlijstjes
  });
  document.body.appendChild(banner);

  let settings = {
    dark: true,
    interval: 200,
    position: 'bottom-right-fixed',  // aangepaste positie naam
    currency: '€ '
  };
  let updateTimer = null;

  function loadSettings(callback) {
    chrome.storage.sync.get(
      {
        dark: true,
        interval: 200,
        position: 'bottom-right-fixed',
        currency: '€ '
      },
      opts => {
        settings.dark     = opts.dark;
        settings.interval = opts.interval;
        settings.position = opts.position;
        settings.currency = opts.currency;
        applyDarkSetting();
        applyPositionSetting();
        if (typeof callback === 'function') {
          callback();
        }
      }
    );
  }

  function applyDarkSetting() {
    // We forceren kleuren, dus niks doen hier
  }

  function applyPositionSetting() {
    banner.style.top    = '';
    banner.style.bottom = '';
    banner.style.left   = '';
    banner.style.right  = '';

    if (settings.position === 'bottom-right-fixed') {
      banner.style.bottom          = '0';
      banner.style.right           = '0';
      banner.style.backgroundColor = 'black';
      banner.style.color           = 'white';
      banner.style.border          = '2px solid white';
      banner.style.display         = 'block';
    } else {
      switch (settings.position) {
        case 'bottom-right':
          banner.style.bottom = '10px';
          banner.style.right  = '10px';
          break;
        case 'bottom-left':
          banner.style.bottom = '10px';
          banner.style.left   = '10px';
          break;
        case 'top-right':
          banner.style.top   = '10px';
          banner.style.right = '10px';
          break;
        case 'top-left':
          banner.style.top  = '10px';
          banner.style.left = '10px';
          break;
      }
    }
  }

  function collectPrices() {
    return Array.from(document.querySelectorAll('span.product-price'))
      .filter(el => !el.closest('#live-total-banner'));
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
      if (changes.dark) {
        settings.dark = changes.dark.newValue;
        applyDarkSetting();
      }
      if (changes.interval) {
        settings.interval = changes.interval.newValue;
      }
      if (changes.position) {
        settings.position = changes.position.newValue;
        applyPositionSetting();
      }
      if (changes.currency) {
        settings.currency = changes.currency.newValue;
      }
      scheduleUpdate();
    }
  });

  loadSettings(updateBanner);
})();
  