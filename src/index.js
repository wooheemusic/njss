

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
const cn = isD ? null : []; // classnames to validate uniqueness

function njss(styles) {
    Object.keys(styles).forEach(_key => {
        const key = h(_key);
        if (cn) {
            if (cn.indexOf(key) !== -1) throw new Error(`classname '${key}' is duplicated.`)
            cn.push(key);
        }
        p(styles[_key], key).forEach(rule => r(rule));
    });
}

function append(arrA, arrB) {
    for (let i = 0; i < arrB.length; i++) {
        arrA.push(arrB[i]);
    }
    return arrA;
}

function p(style, classname, pseudo = '', media = '') { // parse
    const ruleChain = [];
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
        ruleChain.push(`.${classname}${pseudo}{${current.reduce((acc, e) => `${acc}${h(e)}:${c(style[e])};`, '')}}`)
    }
    ps.forEach(key => append(ruleChain, p(style[key], classname, pseudo + key, media)));
    ms.forEach(key => ruleChain.push(`${key}{${p(style[key], classname, pseudo, key).join('')}}`));
    return ruleChain;
}

const rules = [];
let sh; // sheet
if (typeof document !== `undefined`) {
    const se = document.createElement('style');
    se.setAttribute('id', 'njss-element');
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

let ml = 0; // memoized length
let ms = ''; // memoized string
function toString() {
    if (ml !== rules.length) {
        ml = rules.length;
        ms = rules.join('');
    }
    return ms;
}

njss.dev = dev;
njss.prod = prod;
njss.scan = scan;
njss.devScan = devScan;
njss.prodScan = prodScan;
njss.toString = toString;

export default njss;