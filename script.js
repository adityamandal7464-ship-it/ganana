let h = [
    [],
    [],
    []
];

const STORAGE_KEY = "ganana_history_v1";
const THEME_KEY = "ganana_theme_v1";
const toastEl = () => document.getElementById("toast");

document.addEventListener("DOMContentLoaded", () => {
    loadState();
});

document.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        if (document.activeElement.id === "textInput") toNumber();
        if (document.activeElement.id === "numInput") toAlphabet();
        if (document.activeElement.id === "sumInput") calcSum();
    }
});

function showToast(msg, ms = 1500) {
    const t = toastEl();
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t.__timeout);
    t.__timeout = setTimeout(() => {
        t.classList.remove("show");
    }, ms);
}

function copyResult(id) {
    let t = document.getElementById(id).innerText;
    if (!t) return showToast("Nothing to copy");
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t).then(() => {
            showToast("Copied to clipboard");
        }, () => {
            fallbackCopy(t);
        });
    } else {
        fallbackCopy(t);
    }
}

function fallbackCopy(text) {
    try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        showToast("Copied to clipboard");
    } catch (e) {
        showToast("Copy failed");
    }
}

function clearInput(i, r) {
    const inp = document.getElementById(i);
    const res = document.getElementById(r);
    if (inp) inp.value = "";
    if (res) res.innerHTML = "";
    showToast("Cleared");
}

function toggleHistory(id) {
    let b = document.getElementById(id);
    b.style.display = b.style.display === "block" ? "none" : "block";
}

function save(i, val) {
    h[i].unshift(val);
    // keep a reasonable limit
    if (h[i].length > 200) h[i].length = 200;
    renderHistory(i);
    persistState();
}

function renderHistory(i) {
    const container = document.getElementById("h" + (i + 1));
    if (!container) return;
    container.innerHTML =
        '<button class="clear-btn" onclick="clearHistory(' + (i + 1) + ')">Clear</button>' +
        h[i].map(x => "<p>" + x + "</p>").join("");
}

function clearHistory(n) {
    h[n - 1] = [];
    renderHistory(n - 1);
    persistState();
    showToast("History cleared");
}

function toNumber() {
    let el = document.getElementById("textInput");
    if (!el) return;
    let s = el.value.toUpperCase();
    if (!s.match(/^[A-Z]+$/)) return showToast("Enter only letters");
    // Use BigInt for very large conversions
    let r = BigInt(0);
    for (let c of s) {
        r = r * BigInt(26) + BigInt(c.charCodeAt(0) - 64);
    }
    document.getElementById("r1").innerHTML = r.toString();
    save(0, s + " → " + r.toString());
    showToast("Calculated");
}

function toAlphabet() {
    let el = document.getElementById("numInput");
    if (!el) return;
    let nRaw = el.value;
    if (!nRaw || !/^[0-9]+$/.test(nRaw)) return showToast("Enter a positive number");
    // use BigInt
    let n = BigInt(nRaw);
    if (n <= 0) return showToast("Enter a positive number");
    let r = "";
    let o = n.toString();
    while (n > 0) {
        const rem = Number(n % BigInt(26));
        if (rem === 0) {
            r = "Z" + r;
            n = (n / BigInt(26)) - BigInt(1);
        } else {
            r = String.fromCharCode(rem + 64) + r;
            n = n / BigInt(26);
        }
    }
    document.getElementById("r2").innerHTML = r;
    save(1, o + " → " + r);
    showToast("Calculated");
}

function calcSum() {
    let el = document.getElementById("sumInput");
    if (!el) return;
    let s = el.value.toUpperCase();
    if (!s.match(/^[A-Z]+$/)) return showToast("Enter only letters");
    let t = 0;
    for (let c of s) {
        t += c.charCodeAt(0) - 64;
    }
    document.getElementById("r3").innerHTML = t;
    save(2, s + " → " + t);
    showToast("Calculated");
}

function toggleMode() {
    document.body.classList.toggle("light");
    // persist current theme
    const isLight = document.body.classList.contains("light");
    try {
        localStorage.setItem(THEME_KEY, isLight ? "light" : "dark");
    } catch (e) {}
}

// Persistence helpers
function persistState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(h));
    } catch (e) {
        // ignore quota errors
    }
}

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length === 3) {
                h = parsed;
            }
        }
    } catch (e) { /* ignore */ }

    // render histories
    for (let i = 0; i < 3; i++) renderHistory(i);

    // load theme: prefer saved, else system preference
    try {
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (savedTheme === "light") {
            document.body.classList.add("light");
        } else if (savedTheme === "dark") {
            document.body.classList.remove("light");
        } else {
            // no saved theme -> follow system preference
            if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
                document.body.classList.add("light");
            }
        }
    } catch (e) {}
}
