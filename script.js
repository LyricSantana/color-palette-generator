const input = document.getElementById("baseColor");

input.addEventListener("input", () => {
    const rgb = hexToRgb(input.value);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const palette = generatePalette(hsl);
    renderPalette(palette);
});

// Convert HEX to RGB
function hexToRgb(hex) {
    const value = hex.replace("#", "");
    return {
        r: parseInt(value.slice(0, 2), 16),
        g: parseInt(value.slice(2, 4), 16),
        b: parseInt(value.slice(4, 6), 16)
    };
}

// Convert RGB to HSL
function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if(max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return {h, s, l};
}

// Convert HSL to CSS string
function hslToCss({h, s, l}) {
    return `hsl(${Math.round(h*360)}, ${Math.round(s*100)}%, ${Math.round(l*100)}%)`;
}

// Convert HSL to RGB for display
function hslToRgb({h, s, l}) {
    let r, g, b;
    if(s === 0){
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q-p)*6*t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q-p)*(2/3 - t)*6;
            return p;
        };
        const q = l < 0.5 ? l*(1+s) : l+s-l*s;
        const p = 2*l - q;
        r = hue2rgb(p, q, h+1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h-1/3);
    }
    return {
        r: Math.round(r*255),
        g: Math.round(g*255),
        b: Math.round(b*255)
    };
}

// Convert RGB to HEX
function rgbToHex({r, g, b}) {
    const toHex = x => x.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Generate color palette
function generatePalette(hsl) {
    const {h, s, l} = hsl;
    const hueShift = 0.05;

    const top = [
        {h: h+hueShift, s, l: Math.min(1, l+0.2)},
        {h: h+hueShift, s, l: Math.min(1, l+0.1)},
        {h: h+hueShift, s, l: l},
        {h: h+hueShift, s, l: Math.max(0, l-0.1)},
        {h: h+hueShift, s, l: Math.max(0, l-0.2)}
    ];

    const middle = [
        {h, s, l: Math.min(1, l+0.2)},
        {h, s, l: Math.min(1, l+0.1)},
        {h, s, l},
        {h, s, l: Math.max(0, l-0.1)},
        {h, s, l: Math.max(0, l-0.2)}
    ];

    const bottom = [
        {h: h-hueShift, s, l: Math.min(1, l+0.2)},
        {h: h-hueShift, s, l: Math.min(1, l+0.1)},
        {h: h-hueShift, s, l: l},
        {h: h-hueShift, s, l: Math.max(0, l-0.1)},
        {h: h-hueShift, s, l: Math.max(0, l-0.2)}
    ];

    const wrapHue = color => ({...color, h: (color.h+1)%1});
    return [...top, ...middle, ...bottom].map(wrapHue);
}

// Render palette
function renderPalette(colors) {
    const container = document.getElementById("palette");
    container.innerHTML = "";

    colors.forEach(color => {
        const rgb = hslToRgb(color);
        const hex = rgbToHex(rgb);

        const div = document.createElement("div");  
        div.className = "color-card";
        div.style.background = hslToCss(color);

        div.innerHTML = `
        <div>${hex}</div>
        <div>rgb(${rgb.r}, ${rgb.g}, ${rgb.b})</div>
            <div>${hslToCss(color)}</div>
        `;

        container.appendChild(div);
    });
}