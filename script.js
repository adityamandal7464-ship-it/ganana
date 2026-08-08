let h = [
    [],
    [],
    []
];

document.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        if (document.activeElement.id === "textInput") toNumber();
        if (document.activeElement.id === "numInput") toAlphabet();
        if (document.activeElement.id === "sumInput") calcSum();
    }
});

function copyResult(id) {
    let t = document.getElementById(id).innerText;
    if (!t) return;
    navigator.clipboard.writeText(t);
}

function clearInput(i, r) {
    document.getElementById(i).value = "";
    document.getElementById(r).innerHTML = "";
}

function toggleHistory(id) {
    let b = document.getElementById(id);
    b.style.display = b.style.display === "block" ? "none" : "block";
}

function save(i, val) {
    h[i].unshift(val);
    document.getElementById("h" + (i + 1)).innerHTML =
        '<button class="clear-btn" onclick="clearHistory(' + (i + 1) + ')">Clear</button>' +
        h[i].map(x => "<p>" + x + "</p>").join("");
}

function clearHistory(n) {
    h[n - 1] = [];
    document.getElementById("h" + n).innerHTML =
        '<button class="clear-btn" onclick="clearHistory(' + n + ')">Clear</button>';
}

function toNumber() {
    let s = textInput.value.toUpperCase();
    if (!s.match(/^[A-Z]+$/)) return;

    let r = 0;
    for (let c of s) {
        r = r * 26 + (c.charCodeAt(0) - 64);
    }
    r1.innerHTML = r;
    save(0, s + " → " + r);
}

function toAlphabet() {
    let n = parseInt(numInput.value);
    if (isNaN(n) || n <= 0) return;

    let r = "",
        o = n;
    while (n > 0) {
        let rem = n % 26;
        if (rem === 0) { r = "Z" + r;
            n = Math.floor(n / 26) - 1; } else { r = String.fromCharCode(rem + 64) + r;
            n = Math.floor(n / 26); }
    }
    r2.innerHTML = r;
    save(1, o + " → " + r);
}

function calcSum() {
    let s = sumInput.value.toUpperCase();
    if (!s.match(/^[A-Z]+$/)) return;

    let t = 0;
    for (let c of s) {
        t += c.charCodeAt(0) - 64;
    }
    r3.innerHTML = t;
    save(2, s + " → " + t);
}

function toggleMode() {
    document.body.classList.toggle("light");
}