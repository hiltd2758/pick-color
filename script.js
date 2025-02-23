
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const showToast = (message, duration = 2000) => {
    const toast = document.querySelector('.toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
};

const parseColor = (color) => {
    color = color.trim().toLowerCase();
    
    const colorNames = new Set([
'red', 'blue', 'green', 'yellow', 'black', 'white',
'orange', 'purple', 'pink', 'brown', 'gray', 'cyan',
'magenta', 'lime', 'teal', 'indigo', 'violet', 'gold',
'silver', 'beige', 'coral', 'crimson', 'turquoise', 'olive'
]);
    if (colorNames.has(color)) return color;

    const hexRegex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
    if (hexRegex.test(color)) {
        if (color[0] !== '#') color = '#' + color;
        if (color.length === 4) {
            color = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
        }
        return color;
    }

    const rgbRegex = /^rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(,\s*(\d*\.?\d+))?\)$/;
    if (rgbRegex.test(color)) {
        const matches = color.match(rgbRegex);
        const [r, g, b] = [matches[1], matches[2], matches[3]].map(Number);
        if (r <= 255 && g <= 255 && b <= 255) return color;
    }

    const hslRegex = /^hsla?\((\d{1,3}),\s*(\d{1,3})%,\s*(\d{1,3})%(,\s*(\d*\.?\d+))?\)$/;
    if (hslRegex.test(color)) {
        const matches = color.match(hslRegex);
        const [h, s, l] = [matches[1], matches[2], matches[3]].map(Number);
        if (h <= 360 && s <= 100 && l <= 100) return color;
    }

    return null;
};


const state = {
    mode: 'solid',
    color: '#4CAF50',
    gradient: {
        color1: '#ff0000',
        color2: '#0000ff',
        angle: 90
    }
};

const elements = {
    colorInput: document.querySelector('#color'),
    colorPicker: document.querySelector('#colorPicker'),
    colorDisplay: document.querySelector('.color-display'),
    colorInfo: document.querySelector('.color-info'),
    colorValue: document.querySelector('.color-value'),
    copyButton: document.querySelector('.copy-button'),
    modeBtns: document.querySelectorAll('.mode-btn'),
    gradientControls: document.querySelector('.gradient-controls'),
    solidControls: document.querySelector('.solid-controls'),
    gradientColor1: document.querySelector('#gradientColor1'),
    gradientColor2: document.querySelector('#gradientColor2'),
    gradientAngle: document.querySelector('#gradientAngle'),
    angleValue: document.querySelector('#angleValue'),
    colorPalette: document.querySelector('.color-palette'),
    toast: document.querySelector('.toast')
};

const predefinedColors = [
    '#ff0000', '#ff4500', '#ffa500', '#ffff00', '#9acd32', '#90ee90',
    '#00ff00', '#00fa9a', '#00ffff', '#0000ff', '#9932cc', '#ff00ff',
    '#000000', '#808080', '#c0c0c0', '#ffffff'
];

predefinedColors.forEach(color => {
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    swatch.style.backgroundColor = color;
    swatch.setAttribute('role', 'option');
    swatch.setAttribute('aria-label', color);
    swatch.addEventListener('click', () => {
        state.color = color;
        updateUI();
    });
    elements.colorPalette.appendChild(swatch);
});

const updateUI = () => {
    if (state.mode === 'solid') {
        elements.colorDisplay.style.background = state.color;
        elements.colorInput.value = state.color;
        elements.colorPicker.value = state.color;
        elements.colorValue.textContent = `Current color: ${state.color}`;
    } else {
        const gradient = `linear-gradient(${state.gradient.angle}deg, ${state.gradient.color1}, ${state.gradient.color2})`;
        elements.colorDisplay.style.background = gradient;
        elements.colorValue.textContent = `Current gradient: ${gradient}`;
    }
};

const handleColorInput = debounce((value) => {
    const parsedColor = parseColor(value);
    if (parsedColor) {
        state.color = parsedColor;
        updateUI();
    } else {
        elements.colorDisplay.textContent = "Invalid color value";
        elements.colorValue.textContent = 'Please enter a valid color value';
    }
}, 300);

const handleGradientChange = () => {
    state.gradient = {
        color1: elements.gradientColor1.value,
        color2: elements.gradientColor2.value,
        angle: parseInt(elements.gradientAngle.value)
    };
    updateUI();
};

const handleModeSwitch = (mode) => {
    state.mode = mode;
    elements.modeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    elements.gradientControls.classList.toggle('active', mode === 'gradient');
    elements.solidControls.classList.toggle('active', mode === 'solid');
    updateUI();
};

const copyToClipboard = async () => {
    const textToCopy = state.mode === 'solid' 
        ? state.color
        : `linear-gradient(${state.gradient.angle}deg, ${state.gradient.color1}, ${state.gradient.color2})`;
    
    try {
        await navigator.clipboard.writeText(textToCopy);
        showToast('Copied to clipboard!');
    } catch (err) {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showToast('Copied to clipboard!');
        } catch (err) {
            showToast('Failed to copy');
        }
        document.body.removeChild(textArea);
    }
};

elements.colorInput.addEventListener('input', (e) => handleColorInput(e.target.value));
elements.colorPicker.addEventListener('input', (e) => {
    state.color = e.target.value;
    updateUI();
});

elements.gradientColor1.addEventListener('input', handleGradientChange);
elements.gradientColor2.addEventListener('input', handleGradientChange);
elements.gradientAngle.addEventListener('input', (e) => {
    elements.angleValue.textContent = `${e.target.value}°`;
    handleGradientChange();
});

elements.modeBtns.forEach(btn => {
    btn.addEventListener('click', () => handleModeSwitch(btn.dataset.mode));
});

elements.copyButton.addEventListener('click', copyToClipboard);

elements.colorPalette.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.target.click();
    }
});

elements.colorInput.addEventListener('paste', (e) => {
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
    elements.colorInput.value = pastedText;
    handleColorInput(pastedText);
});


updateUI();


if (!window.CSS || !CSS.supports('color', '#fff')) {
    showToast('Your browser may have limited color support');
}


window.addEventListener('error', (e) => {
    console.error('Error:', e.message);
    showToast('Something went wrong. Please try again.');
});



