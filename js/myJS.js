/* ReqJ1 */
function getForm() {
    return document.forms["contactForm"] || null;
}

/* ReqJ1 */
function getEl(id) {
    return document.getElementById(id) || null;
}

/* ReqJ2 */
function updatePreview() {
    var form = getForm();
    if (!form) return;

    var previewBox = getEl("preview");
    if (!previewBox) return;

    var name = (getEl("name") || {}).value || "";
    var email = (getEl("email") || {}).value || "";
    var phone = (getEl("phone") || {}).value || "";
    var country = (getEl("country") || {}).value || "";
    var message = (getEl("message") || {}).value || "";

    var html = "<strong>Live Preview</strong><br>";
    html += "Name: " + (name || "<em>—</em>") + "<br>";
    html += "Email: " + (email || "<em>—</em>") + "<br>";
    html += "Phone: " + (phone || "<em>—</em>") + "<br>";
    html += "Country: " + (country || "<em>—</em>") + "<br>";
    html += "Message: " + (message.length > 0
        ? message.substring(0, 80) + (message.length > 80 ? "…" : "")
        : "<em>—</em>");

    previewBox.innerHTML = html;
}

/* ReqJ3 */
function checkValidityState(input) {
    if (!input) return; /* ReqJ1 */

    if (input.validity.valid) {
        input.classList.remove("invalid");
        input.classList.add("valid");
    } else {
        input.classList.remove("valid");
        input.classList.add("invalid");
    }

    updatePreview(); /* ReqJ2 */
}

/* ReqJ4 */
function validateForm() {
    var form = getForm();
    if (!form) return true; /* ReqJ1 */

    hideError();

    if (!form.checkValidity()) { /* ReqJ4 */
        return false;
    }

    return checkCustomRules(form); /* ReqJ5 */
}

/* ReqJ5 */
function showError(msg, field) {
    var box = getEl("error-box");
    if (box) {
        box.textContent = "⚠ " + msg;
        box.style.display = "block";
    }

    if (field) {
        field.focus(); /* ReqJ6 */
    }
}

function hideError() {
    var box = getEl("error-box");
    if (box) {
        box.textContent = "";
        box.style.display = "none";
    }
}

/* ReqJ5 */
function checkCustomRules(form) {
    if (!form) return true; /* ReqJ1 */

    var nameEl = getEl("name");
    var messageEl = getEl("message");
    var phoneEl = getEl("phone");

    if (nameEl && nameEl.value.trim().split(/\s+/).length < 2) {
        showError("Please enter your full name (first and last name).", nameEl);
        return false; /* ReqJ6 */
    }

    if (messageEl && messageEl.value.trim().length < 10) {
        showError("Message must be at least 10 characters long.", messageEl);
        return false;
    }

    if (phoneEl && phoneEl.value && !/^[0-9]{10}$/.test(phoneEl.value)) {
        showError("Phone number must be exactly 10 digits (e.g., 0712345678).", phoneEl);
        return false;
    }

    return true;
}

/* ReqJ7 */
function handleKey(event, input) {
    if (!input) return; /* ReqJ1 */

    var key = event.key;

    if (key === "Enter") {
        input.style.outline = "3px solid #2a7f62";
        input.style.boxShadow = "0 0 6px rgba(42,127,98,0.5)";
        setTimeout(function () {
            input.style.outline = "";
            input.style.boxShadow = "";
        }, 800);

    } else if (key === "Escape") {
        input.value = "";
        input.style.outline = "3px solid #e74c3c";
        input.style.boxShadow = "0 0 6px rgba(231,76,60,0.4)";
        input.classList.remove("valid", "invalid");
        setTimeout(function () {
            input.style.outline = "";
            input.style.boxShadow = "";
        }, 800);
        updatePreview(); /* ReqJ2 */

    } else {
        checkValidityState(input); /* ReqJ3 */
    }
}

/* ReqJ8 */
function highlightField(input) {
    if (!input) return; /* ReqJ1 */
    input.style.backgroundColor = "#eef6fb";
    input.style.borderColor = "#1f4b99";
}

/* ReqJ8 */
function unhighlightField(input) {
    if (!input) return; /* ReqJ1 */
    input.style.backgroundColor = "";

    if (input.classList.contains("valid")) {
        input.style.borderColor = "#2a7f62";
    } else if (input.classList.contains("invalid")) {
        input.style.borderColor = "#e74c3c";
    } else {
        input.style.borderColor = "";
    }
}

function addExpense() {
    var tableBody = getEl("tableBody");
    if (!tableBody) return; /* ReqJ1 */

    var dateEl = getEl("date");
    var categoryEl = getEl("category");
    var descEl = getEl("desc");
    var amountEl = getEl("amount");

    if (!dateEl || !categoryEl || !descEl || !amountEl) return; /* ReqJ1 */

    if (!dateEl.value || !categoryEl.value || !descEl.value || !amountEl.value) {
        alert("Please fill in all expense fields.");
        return;
    }

    var row = tableBody.insertRow();
    row.insertCell(0).textContent = dateEl.value;
    row.insertCell(1).textContent = categoryEl.value;
    row.insertCell(2).textContent = descEl.value;
    row.insertCell(3).textContent = parseFloat(amountEl.value).toFixed(2) + " \u20AC";

    var btn = document.createElement("button");
    btn.textContent = "Delete";
    btn.onclick = function () { row.remove(); };
    row.insertCell(4).appendChild(btn);
}

/* ── Wire up all handlers via property assignment (no addEventListener) ── */

/* ReqJ4 – contact form submit */
var contactForm = getEl("contactForm");
if (contactForm) {
    contactForm.onsubmit = function () { return validateForm(); }; /* ReqJ4 */
}

/* ReqJ7, ReqJ8 – name field */
var nameEl = getEl("name");
if (nameEl) {
    nameEl.onkeyup = function (e) { handleKey(e, this); }; /* ReqJ7 */
    nameEl.oninput = function () { checkValidityState(this); }; /* ReqJ3 */
    nameEl.onmouseenter = function () { highlightField(this); }; /* ReqJ8 */
    nameEl.onmouseleave = function () { unhighlightField(this); }; /* ReqJ8 */
}

/* ReqJ7, ReqJ8 – email field */
var emailEl = getEl("email");
if (emailEl) {
    emailEl.onkeyup = function (e) { handleKey(e, this); }; /* ReqJ7 */
    emailEl.oninput = function () { checkValidityState(this); updatePreview(); }; /* ReqJ2, ReqJ3 */
    emailEl.onmouseenter = function () { highlightField(this); }; /* ReqJ8 */
    emailEl.onmouseleave = function () { unhighlightField(this); }; /* ReqJ8 */
}

/* ReqJ7, ReqJ8 – password field */
var passwordEl = getEl("password");
if (passwordEl) {
    passwordEl.onkeyup = function (e) { handleKey(e, this); }; /* ReqJ7 */
    passwordEl.onmouseenter = function () { highlightField(this); }; /* ReqJ8 */
    passwordEl.onmouseleave = function () { unhighlightField(this); }; /* ReqJ8 */
}

/* ReqJ7, ReqJ8 – phone field */
var phoneEl = getEl("phone");
if (phoneEl) {
    phoneEl.onkeyup = function (e) { handleKey(e, this); }; /* ReqJ7 */
    phoneEl.oninput = function () { checkValidityState(this); updatePreview(); }; /* ReqJ2, ReqJ3 */
    phoneEl.onmouseenter = function () { highlightField(this); }; /* ReqJ8 */
    phoneEl.onmouseleave = function () { unhighlightField(this); }; /* ReqJ8 */
}

/* ReqJ2, ReqJ7, ReqJ8 – message textarea */
var messageEl = getEl("message");
if (messageEl) {
    messageEl.onkeyup = function (e) { handleKey(e, this); }; /* ReqJ7 */
    messageEl.oninput = function () { checkValidityState(this); updatePreview(); }; /* ReqJ2, ReqJ3 */
    messageEl.onmouseenter = function () { highlightField(this); }; /* ReqJ8 */
    messageEl.onmouseleave = function () { unhighlightField(this); }; /* ReqJ8 */
}

/* ReqJ2 – country select */
var countryEl = getEl("country");
if (countryEl) {
    countryEl.onchange = function () { updatePreview(); }; /* ReqJ2 */
}

/* ReqJ5 – reset button */
var resetBtn = getEl("resetBtn");
if (resetBtn) {
    resetBtn.onclick = function () { hideError(); updatePreview(); }; /* ReqJ5 */
}

/* expenses page – Add Expense button */
var addExpenseBtn = getEl("addExpenseBtn");
if (addExpenseBtn) {
    addExpenseBtn.onclick = function () { addExpense(); };
}
