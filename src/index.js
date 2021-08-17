

// function convertNumber(n, hint) {
//     switch (hint) {
//         // insert cases not px
//         default:
//             return `${n}px`;
//     }
// }
// function converShorthand(arr, hint) {
//     switch (hint) {
//         case 'flex':
//             return `${arr[0]} ${arr[1]} ${convert(arr[2])}`;
//         default:
//             return arr.join(' ');
//     }
// }
// function convert(v, hint) {
//     return Number.isNaN(v) ? v : convertNumber(v, hint);
// }

const h = s => s.replace(/[A-Z]/g, l => `-${l.toLowerCase()}`); // hyphenate
const c = a => a; // convert
const tk = s => /[.#*,\s>+~\[\]]/.test(s);

let isD = Boolean(process && process.env && process.env.NODE_ENV === 'development'); // isDevMode
const cn = []; // classnames to validate uniqueness

function njss(styles) {
    Object.keys(styles).forEach(key => {
        key = h(key);
        if (isD && cn.indexOf(key) !== -1) throw new Error(`classname '${key}' is duplicated.`)
        cn.push(key);
        p(styles[key], key);
    });
}

function p(style, classname, pseudo = '', media = '') { // parse
    const current = [];
    const ps = []; // to defer
    const ms = []; // to defer
    Object.keys(style).forEach(key => {
        if (key[0] === '@') {
            if (media) {
                if (isD) throw new Error(`duplicated media queries in classname '${classname}'`);
            } else {
                ms.push(key);
            }
        } else if (tk(key)) {
            throw new Error(`Only pseudo classes or elements are allowed. '${key}' in '${classname}'`)
        } else if (key[0] === ':') {
            ps.push(key)
        } else {
            current.push(key);
        }
    })
    if (current.length > 0) {
        const properties = current.reduce((acc, e) => `${acc}${h(e)}:${c(style[e])};`,'');
        const rule = `.${classname}${pseudo}{${properties}}`
        const mediaRule = media? `${media}{${rule}}`: rule;
        r(mediaRule);
    }
    ps.forEach(key => p(style[key], classname, pseudo+key, media));
    ms.forEach(key => p(style[key], classname, pseudo, key));
}

const rules = [];
let sh; // sheet
if (typeof document !== `undefined`) {
    const se = document.createElement('style');
    se.setAttribute('id', 'njss');
    document.head.appendChild(se);
    sh = se.sheet;
}
function r(rule) { // addRule
    rules.push(rule);
    sh && sh.insertRule(rule, sh.cssRules.length)
}

function dev() {
    isD = true;
}

function prod() {
    isD = false;
}

function scan() {
    // not yet
}

function devScan() {
    isD && scan();
}

function prodScan() {
    if (!isD) {
        // not yet
    }
}

function toString() {
    return rules.join('');
}

njss.dev = dev;
njss.prod = prod;
njss.scan = scan;
njss.devScan = devScan;
njss.prodScan = prodScan;
njss.toString = toString;

export default njss;