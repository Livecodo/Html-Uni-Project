var _translations = {};          /* loaded JSON */
var _currentLocale = "en";       /* active locale string */

/* ReqI6 – locale → BCP-47 region tag map */
var LOCALE_REGION_MAP = {
    "en": "en-GB",
    "es": "es-ES"
};

/* ReqI9 – locale → currency map */
var LOCALE_CURRENCY_MAP = {
    "en": "GBP",
    "es": "EUR"
};

function applyTranslations(locale) {
    /* ReqI3 */
    var dict = _translations[locale];
    if (!dict) return;

    var elements = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        var key = el.getAttribute("data-i18n");   /* e.g. "navigation.home" */
        var val = resolveKey(dict, key);
        if (val !== null) {
            el.textContent = val;
        }
    }

    /* Also translate placeholder attributes */
    var phEls = document.querySelectorAll("[data-i18n-placeholder]");
    for (var j = 0; j < phEls.length; j++) {
        var phEl = phEls[j];
        var phKey = phEl.getAttribute("data-i18n-placeholder");
        var phVal = resolveKey(dict, phKey);
        if (phVal !== null) {
            phEl.placeholder = phVal;
        }
    }
}

/* Helper – walk a dot-separated key through a nested object */
function resolveKey(obj, key) {
    var parts = key.split(".");
    var cur = obj;
    for (var k = 0; k < parts.length; k++) {
        if (cur === null || cur === undefined || typeof cur !== "object") return null;
        cur = cur[parts[k]];
    }
    return (cur !== undefined && cur !== null) ? String(cur) : null;
}

function switchLanguage(locale) {
    /* ReqI4 */
    if (!_translations[locale]) {
        console.warn("i18n: unknown locale '" + locale + "' – falling back to en");
        locale = "en";
    }

    _currentLocale = locale;

    /* Persist preference – ReqI4 */
    localStorage.setItem("i18n_locale", locale);

    /* Update <html lang> to BCP-47 region tag – ReqI8 */
    var regionTag = LOCALE_REGION_MAP[locale] || locale;
    document.documentElement.lang = regionTag;

    /* Apply text translations – ReqI3 */
    applyTranslations(locale);

    /* Apply Intl-based formatting – ReqI6 integration */
    applyDateFormat(locale);    /* ReqI8 */
    applyPriceFormat(locale);   /* ReqI9 */
    applyNumberFormat(locale);  /* ReqI10 */
    applyPercentFormat(locale); /* ReqI10 */

    /* Sync the selector widget – ReqI7 */
    syncSelector(locale);
}

function syncSelector(locale) {
    /* ReqI7 */
    var sel = document.getElementById("lang-selector");
    if (sel && sel.value !== locale) {
        sel.value = locale;
    }
}

function createDateFormatter(locale) {
    /* ReqI8 */
    var regionTag = LOCALE_REGION_MAP[locale] || locale;
    return new Intl.DateTimeFormat(regionTag, {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

function formatDate(dateStr, formatter) {
    /* ReqI8 – validate input */
    if (!dateStr || typeof dateStr !== "string") return null;
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return formatter.format(d);
}

function applyDateFormat(locale) {
    /* ReqI8 – update the DOM */
    var formatter = createDateFormatter(locale);
    var elements = document.querySelectorAll("[data-date]");
    for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        var rawDate = el.getAttribute("data-date");
        var formatted = formatDate(rawDate, formatter);
        if (formatted !== null) {
            el.textContent = formatted;
        }
    }
}

function createCurrencyFormatter(locale) {
    /* ReqI9 */
    var regionTag = LOCALE_REGION_MAP[locale] || locale;
    var currency = LOCALE_CURRENCY_MAP[locale] || "GBP";
    return new Intl.NumberFormat(regionTag, {
        style: "currency",
        currency: currency
    });
}

function formatPrice(priceStr, formatter) {
    /* ReqI9 – validate numeric value */
    var num = parseFloat(priceStr);
    if (isNaN(num)) return null;
    return formatter.format(num);
}

function applyPriceFormat(locale) {
    /* ReqI9 – update the DOM */
    var formatter = createCurrencyFormatter(locale);
    var elements = document.querySelectorAll("[data-price]");
    for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        var rawPrice = el.getAttribute("data-price");
        var formatted = formatPrice(rawPrice, formatter);
        if (formatted !== null) {
            el.textContent = formatted;
        }
    }
}

function createNumberFormatter(locale) {
    /* ReqI10 */
    var regionTag = LOCALE_REGION_MAP[locale] || locale;
    return new Intl.NumberFormat(regionTag, {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

function formatNumber(numStr, formatter) {
    /* ReqI10 – validate */
    var num = parseFloat(numStr);
    if (isNaN(num)) return null;
    return formatter.format(num);
}

function applyNumberFormat(locale) {
    /* ReqI10 – update the DOM */
    var formatter = createNumberFormatter(locale);
    var elements = document.querySelectorAll("[data-number]");
    for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        var rawNum = el.getAttribute("data-number");
        var formatted = formatNumber(rawNum, formatter);
        if (formatted !== null) {
            el.textContent = formatted;
        }
    }
}

function createPercentFormatter(locale) {
    /* ReqI10 */
    var regionTag = LOCALE_REGION_MAP[locale] || locale;
    return new Intl.NumberFormat(regionTag, {
        style: "percent",
        minimumFractionDigits: 0,
        maximumFractionDigits: 1
    });
}

function formatPercent(numStr, formatter) {
    /* ReqI10 – validate; value stored as fraction (e.g. 0.2 = 20%) */
    var num = parseFloat(numStr);
    if (isNaN(num)) return null;
    return formatter.format(num);
}

function applyPercentFormat(locale) {
    /* ReqI10 – update the DOM */
    var formatter = createPercentFormatter(locale);
    var elements = document.querySelectorAll("[data-percentage]");
    for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        var rawPct = el.getAttribute("data-percentage");
        var formatted = formatPercent(rawPct, formatter);
        if (formatted !== null) {
            el.textContent = formatted;
        }
    }
}

(function initI18n() {
    /* ReqI5 – defensive scaffold: bail out if no translatable elements */
    var markers = document.querySelectorAll("[data-i18n]");
    if (markers.length === 0) return;

    /* ReqI6 – resolve path to translations.json relative to this script.
       We traverse up from the script's src to find the root. */
    var scriptSrc = (function () {
        var scripts = document.getElementsByTagName("script");
        for (var s = 0; s < scripts.length; s++) {
            if (scripts[s].src && scripts[s].src.indexOf("i18n.js") !== -1) {
                return scripts[s].src;
            }
        }
        return "";
    }());

    var jsonPath = scriptSrc
        ? scriptSrc.replace("i18n.js", "translations.json")
        : "js/i18n/translations.json";

    /* ReqI6 – fetch translations, then switch to saved/default language */
    fetch(jsonPath)
        .then(function (response) {
            if (!response.ok) {
                throw new Error("i18n: HTTP " + response.status + " loading translations");
            }
            return response.json();
        })
        .then(function (data) {
            _translations = data;

            /* ReqI6 – retrieve saved language or default to English */
            var savedLocale = localStorage.getItem("i18n_locale") || "en";

            /* ReqI7 – inject the language selector into every page */
            injectSelector();

            /* ReqI6 – call switchLanguage with the saved/default locale */
            switchLanguage(savedLocale);
        })
        .catch(function (err) {
            console.error("i18n: Failed to load translations –", err);
        });
}());

function injectSelector() {
    /* ReqI7 – check element does not already exist */
    if (document.getElementById("lang-selector")) return;

    var nav = document.querySelector("nav");
    if (!nav) return;

    /* Build the wrapper */
    var wrapper = document.createElement("div");
    wrapper.id = "lang-selector-wrapper";

    var label = document.createElement("span");
    label.textContent = "Language";
    label.setAttribute("aria-label", "Language");
    label.id = "lang-label";

    /* ReqI7 – selector <select>; use onchange property (no addEventListener) */
    var sel = document.createElement("select");
    sel.id = "lang-selector";
    sel.title = "Select language";

    var optEn = document.createElement("option");
    optEn.value = "en";
    optEn.textContent = "English";

    var optEs = document.createElement("option");
    optEs.value = "es";
    optEs.textContent = "Español";

    sel.appendChild(optEn);
    sel.appendChild(optEs);

    /* ReqI7 – wire handler without addEventListener */
    sel.onchange = function () {
        switchLanguage(this.value);
    };

    wrapper.appendChild(label);
    wrapper.appendChild(sel);
    nav.appendChild(wrapper);
}
