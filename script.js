const input = document.getElementById("baseColor");
const toast = document.getElementById("toast");
const showValuesCheckbox = document.getElementById("showValues");
const urlParams = new URLSearchParams(window.location.search);
const colorFromUrl = urlParams.get("color");
const copyLinkButton = document.getElementById("copyLink");
const copyFormatSelect = document.getElementById("copyFormat");
const exportJsonButton = document.getElementById("exportJson");
const exportCssButton = document.getElementById("exportCss");
const exportPngButton = document.getElementById("exportPng");
const warmthSlider = document.getElementById("warmth");
const warmthValue = document.getElementById("warmthValue");

let toastTimeout;

input.addEventListener("input", () => {
    const rgb = hexToRgb(input.value);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const palette = generatePalette(hsl);
    renderPalette(palette);

    const params = new URLSearchParams(window.location.search);
    params.set("color", input.value.replace("#", ""));
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
});

exportJsonButton.addEventListener("click", () => {
    const paletteColors = Array.from(document.querySelectorAll(".color-card"))
        .map(card => card.querySelector(".color-values div")?.textContent || "");

    const data = JSON.stringify(paletteColors, null, 2); // pretty format
    const blob = new Blob([data], {type: "application/json"});
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "palette.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Palette exported as JSON!");
});

exportCssButton.addEventListener("click", () => {
    const paletteColors = Array.from(document.querySelectorAll(".color-card"))
        .map((card, i) => `--color-${i + 1}: ${card.querySelector(".color-values div")?.textContent || ""};`);

    const cssText = `:root {\n  ${paletteColors.join("\n  ")}\n}`;
    navigator.clipboard.writeText(cssText);
    showToast("CSS variables copied to clipboard!");
});


exportPngButton.addEventListener("click", () => {
    const paletteCards = document.querySelectorAll(".color-card");
    const size = 100; // size of each color square
    const padding = 10;
    const cols = 5;
    const rows = Math.ceil(paletteCards.length / cols);
    const canvas = document.createElement("canvas");

    canvas.width = cols * size + (cols + 1) * padding;
    canvas.height = rows * size + (rows + 1) * padding;

    const ctx = canvas.getContext("2d");

    paletteCards.forEach((card, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        const hex = card.querySelector(".color-values div")?.textContent || "#000";

        const x = col * size + (col + 1) * padding;
        const y = row * size + (row + 1) * padding;

        ctx.fillStyle = hex;
        ctx.fillRect(x, y, size, size);
    });

    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "palette.png";
        a.click();
        URL.revokeObjectURL(url);
        showToast("Palette exported as PNG!");
    });
});

warmthSlider.addEventListener("input", () => {
    warmthValue.textContent = `${warmthSlider.value}%`;  // update display
    const rgb = hexToRgb(input.value);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const palette = generatePalette(hsl);
    renderPalette(palette);
});


showValuesCheckbox.addEventListener("change", () => {
    document.body.classList.toggle(
        "hide-values",
        !showValuesCheckbox.checked
    );
});

copyLinkButton.addEventListener("click", () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("Palette link copied!");
})

if(colorFromUrl) {
    input.value = `#${colorFromUrl}`;
    const rgb = hexToRgb(input.value);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const palette = generatePalette(hsl);
    renderPalette(palette);
}

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

function hslToHex({h, s, l}) {
    l = Math.max(0, Math.min(1, l));
    s = Math.max(0, Math.min(1, s));

    const a = s * Math.min(l, 1 -l);
    const f = n => {
        const k = (n + h * 12) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

// Generate color palette
function generatePalette(hsl) {
    const {h, s, l} = hsl;
    
    // Convert slider (0–100) to a range (-0.1 to 0.1)
    const intensity = (warmthSlider.value - 50) / 500; // -0.1 to 0.1
    const hueShift = 0.05 + intensity;  // adjust base shift

    const top = [
        {h: h + hueShift, s, l: Math.min(1, l + 0.2)},
        {h: h + hueShift, s, l: Math.min(1, l + 0.1)},
        {h: h + hueShift, s, l: l},
        {h: h + hueShift, s, l: Math.max(0, l - 0.1)},
        {h: h + hueShift, s, l: Math.max(0, l - 0.2)}
    ];

    const middle = [
        {h, s, l: Math.min(1, l + 0.2)},
        {h, s, l: Math.min(1, l + 0.1)},
        {h, s, l},
        {h, s, l: Math.max(0, l - 0.1)},
        {h, s, l: Math.max(0, l - 0.2)}
    ];

    const bottom = [
        {h: h - hueShift, s, l: Math.min(1, l + 0.2)},
        {h: h - hueShift, s, l: Math.min(1, l + 0.1)},
        {h: h - hueShift, s, l: l},
        {h: h - hueShift, s, l: Math.max(0, l - 0.1)},
        {h: h - hueShift, s, l: Math.max(0, l - 0.2)}
    ];

    const wrapHue = color => ({...color, h: (color.h + 1) % 1});
    return [...top, ...middle, ...bottom].map(wrapHue);
}


function getTextColor({l}) {
    return l > 0.6 ? "#111" : "#fff";
}

function showToast(message = "HEX copied to clipboard") {
    toast.textContent = message;
    toast.classList.remove("show");
    void toast.offsetWidth;
    toast.classList.add("show");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 1500);
}

// Render palette
function renderPalette(colors) {
    const container = document.getElementById("palette");
    container.innerHTML = "";

    colors.forEach((color, index) => {
        const rgb = hslToRgb(color);
        const hex = rgbToHex(rgb);

        const div = document.createElement("div");  
        div.className = "color-card";
        div.style.background = hslToCss(color);
        div.style.color = getTextColor(color);
        div.addEventListener("click", () => {
            let textToCopy;
            const selectedFormat = copyFormatSelect.value;

            if(selectedFormat === "hex") {
                textToCopy = hex;
            } else if(selectedFormat === "rgb") {
                textToCopy = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
            } else if(selectedFormat === "hsl") {
                textToCopy = hslToCss(color);
            }
            navigator.clipboard.writeText(textToCopy);
            showToast(`${selectedFormat.toUpperCase()} copied to clipboard!`);
        });
        if(index === 7) {
            div.classList.add("base-color");
        }
        div.innerHTML = `
        <div class="color-values">
        <div>${hex}</div>
        <div>rgb(${rgb.r}, ${rgb.g}, ${rgb.b})</div>
        <div>${hslToCss(color)}</div>
        </div>
        `;

        container.appendChild(div);
    });
}

