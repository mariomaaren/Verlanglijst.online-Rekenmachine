class ColorWheel {
  constructor() {
    this.canvas = document.getElementById('colorWheel')
    this.ctx = this.canvas.getContext('2d')
    this.selector = document.querySelector('.color-wheel-selector')
    this.brightnessSlider = document.getElementById('brightnessSlider')
    this.colorPreview = document.getElementById('colorPreview')
    this.hexInput = document.getElementById('customColorHex')

    this.hue = 0
    this.sat = 0
    this.light = 50
// why does this stupid thing not fucking work
    this.isDragging = false

    this.storageTimeoutId = null

    this.init()
  }

  init() {
    this.drawColorWheel()
    this.setupEventListeners()

    this.brightnessSlider.value = this.light
    this.applyColor()
  }

  drawColorWheel() {
    const size = this.canvas.width
    const radius = size / 2
    const cx = radius
    const cy = radius

    this.ctx.clearRect(0, 0, size, size)

    for (let angle = 0; angle < 360; angle++) {
      const start = (angle * Math.PI) / 180
      const end = ((angle + 1) * Math.PI) / 180
      this.ctx.beginPath()
      this.ctx.moveTo(cx, cy)
      this.ctx.arc(cx, cy, radius, start, end)
      this.ctx.closePath()
      this.ctx.fillStyle = `hsl(${angle}, 100%, 50%)`
      this.ctx.fill()
    }

    const grad = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
    grad.addColorStop(0,    'rgba(255,255,255,1)')
    grad.addColorStop(1,    'rgba(255,255,255,0)')
    this.ctx.fillStyle = grad
    this.ctx.beginPath()
    this.ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    this.ctx.closePath()
    this.ctx.fill()
  }

// better work now
  getHueSatFromPosition(x, y) {
    const rect = this.canvas.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = x - cx
    const dy = y - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    const radius = rect.width / 2

    if (dist > radius) {
      return null
    }

    let angle = (Math.atan2(dy, dx) * 180) / Math.PI
    if (angle < 0) angle += 360
    const sat = Math.round((dist / radius) * 100)
    return { h: angle, s: sat }
  }

  hslToHex(h, s, l) {
    h /= 360
    s /= 100
    l /= 100

    let r, g, b
    if (s === 0) {
      r = g = b = l
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
      }
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
    }

    const toHex = (val) => {
      const hx = Math.round(val * 255).toString(16)
      return hx.length === 1 ? '0' + hx : hx
    }
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
  }

  hexToHSL(hex) {
    const m = /^#?([A-F\d]{2})([A-F\d]{2})([A-F\d]{2})$/i.exec(hex)
    if (!m) return { h: 0, s: 0, l: 0 }

    let r = parseInt(m[1], 16) / 255
    let g = parseInt(m[2], 16) / 255
    let b = parseInt(m[3], 16) / 255

    const mx = Math.max(r, g, b)
    const mn = Math.min(r, g, b)
    let h, s
    let l = (mx + mn) / 2

    if (mx === mn) {
      h = s = 0
    } else {
      const d = mx - mn
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn)
      switch (mx) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    }
  }

  applyColor() {
    this.colorPreview.style.backgroundColor =
      `hsl(${this.hue}, ${this.sat}%, ${this.light}%)`

    const hex = this.hslToHex(this.hue, this.sat, this.light)
    this.hexInput.value = hex

    const radius = this.canvas.width / 2
    const angleRad = (this.hue * Math.PI) / 180
    const dist = (this.sat / 100) * radius
    const x = radius + Math.cos(angleRad) * dist
    const y = radius + Math.sin(angleRad) * dist
    this.selector.style.left = `${x - this.selector.offsetWidth / 2}px`
    this.selector.style.top = `${y - this.selector.offsetHeight / 2}px`

    this.updateSliderBackground()

    this.debounceStoreColor(hex)
  }

  updateSliderBackground() {
    const leftColor  = `hsl(${this.hue}, ${this.sat}%, 0%)`
    const midColor   = `hsl(${this.hue}, ${this.sat}%, 50%)`
    const rightColor = `hsl(${this.hue}, ${this.sat}%, 100%)`

    this.brightnessSlider.style.background =
      `linear-gradient(to right, ${leftColor}, ${midColor}, ${rightColor})`
  }

  // how was the solutuon so extremely simple bro I wasted my time
  debounceStoreColor(hexValue) {
    if (this.storageTimeoutId) {
      clearTimeout(this.storageTimeoutId)
    }
    this.storageTimeoutId = setTimeout(() => {
      if (document.getElementById('theme')?.value === 'custom') {
        chrome.storage.sync.set({ bgColor: hexValue })
      }
      this.storageTimeoutId = null
    }, 500)
  }

  setupEventListeners() {
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true
      const hs = this.getHueSatFromPosition(e.clientX, e.clientY)
      if (hs) {
        this.hue = hs.h
        this.sat = hs.s
        this.applyColor()
      }
    })

    this.canvas.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return
      const hs = this.getHueSatFromPosition(e.clientX, e.clientY)
      if (hs) {
        this.hue = hs.h
        this.sat = hs.s
        this.applyColor()
      }
    })

    document.addEventListener('mouseup', () => {
      this.isDragging = false
    })

    // thank you u/[deleted] guy on reddit
    this.canvas.addEventListener('click', (e) => {
      const hs = this.getHueSatFromPosition(e.clientX, e.clientY)
      if (hs) {
        this.hue = hs.h
        this.sat = hs.s
        this.applyColor()
      }
    })

    this.brightnessSlider.addEventListener('input', () => {
      this.light = parseInt(this.brightnessSlider.value, 10)
      this.applyColor()
    })

    this.hexInput.addEventListener('input', () => {
      const raw = this.hexInput.value
      if (/^#[0-9A-F]{6}$/i.test(raw)) {
        const hsl = this.hexToHSL(raw.toUpperCase())
        this.hue = hsl.h
        this.sat = hsl.s
        this.light = hsl.l
        this.brightnessSlider.value = hsl.l
        this.applyColor()
      }
    })
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ColorWheel()
})
