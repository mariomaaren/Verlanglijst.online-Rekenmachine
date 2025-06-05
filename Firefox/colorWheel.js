class ColorWheel {
  constructor() {
    this.canvas = document.getElementById('colorWheel');
    this.ctx = this.canvas.getContext('2d');
    this.selector = document.querySelector('.color-wheel-selector');
    this.brightnessSlider = document.getElementById('brightnessSlider');
    this.colorPreview = document.getElementById('colorPreview');
    this.hexInput = document.getElementById('customColorHex');
    this.currentColor = '#000000';
    this.isDragging = false;
    
    this.init();
  }

  init() {
    this.drawColorWheel();
    this.setupEventListeners();
    this.updateColor('#000000');
  }

  drawColorWheel() {
    const radius = this.canvas.width / 2;
    const center = radius;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    for (let angle = 0; angle < 360; angle += 1) {
      const startAngle = (angle - 2) * Math.PI / 180;
      const endAngle = angle * Math.PI / 180;
      
      for (let r = 0; r < radius; r += 1) {
        const gradient = this.ctx.createRadialGradient(center, center, 0, center, center, radius);
        gradient.addColorStop(0, `hsl(${angle}, 100%, 50%)`);
        gradient.addColorStop(1, `hsl(${angle}, 100%, 50%)`);
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.moveTo(center, center);
        this.ctx.arc(center, center, r, startAngle, endAngle);
        this.ctx.closePath();
        this.ctx.fill();
      }
    }
  }

  getColorAtPosition(x, y) {
    const rect = this.canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const dx = x - rect.left - centerX;
    const dy = y - rect.top - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = centerX;
    
    if (distance > radius) return null;
    
    const angle = Math.atan2(dy, dx) * 180 / Math.PI + 180;
    const saturation = Math.min(100, (distance / radius) * 100);
    const brightness = parseInt(this.brightnessSlider.value);
    
    return this.hslToHex(angle, saturation, brightness);
  }

  hslToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    const toHex = x => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }

  updateColor(color) {
    this.currentColor = color;
    this.colorPreview.style.backgroundColor = color;
    this.hexInput.value = color;
    
    if (document.getElementById('theme').value === 'custom') {
      chrome.storage.sync.set({ bgColor: color });
    }
    
    const hsl = this.hexToHSL(color);
    const radius = this.canvas.width / 2;
    const angle = hsl.h * Math.PI / 180;
    const distance = (hsl.s / 100) * radius;
    const x = radius + Math.cos(angle) * distance;
    const y = radius + Math.sin(angle) * distance;
    
    this.selector.style.left = `${x - 5}px`;
    this.selector.style.top = `${y - 5}px`;
  }

  hexToHSL(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      
      h /= 6;
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  setupEventListeners() {
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      const color = this.getColorAtPosition(e.clientX, e.clientY);
      if (color) this.updateColor(color);
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const color = this.getColorAtPosition(e.clientX, e.clientY);
      if (color) this.updateColor(color);
    });

    document.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    this.brightnessSlider.addEventListener('input', () => {
      const hsl = this.hexToHSL(this.currentColor);
      this.updateColor(this.hslToHex(hsl.h, hsl.s, parseInt(this.brightnessSlider.value)));
    });

    this.hexInput.addEventListener('input', () => {
      const color = this.hexInput.value;
      if (/^#[0-9A-F]{6}$/i.test(color)) {
        this.updateColor(color.toUpperCase());
      }
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ColorWheel();
});