const h = s => s.replace(/[A-Z]/g, l => `-${l.toLowerCase()}`); // hyphenate
const vs = s => /[.#*,\s>+~\[\]]/.test(s); // validateSelector

function c(prop, key) { // convert
    if (typeof prop === 'object') {
        if (Array.isArray(prop)) {
            return csh(prop, key);
        }
        throw new Error(`The CSS property '${key}' is invalid or has an invalid value.`);
    }
    return csp(prop, key);
};

function isN(v) { // isNumber
    return typeof v === 'number' && !Number.isNaN(v);
}

function pf(v, p) { // prefix
    return `${p}(${v})`;
}
function sf(v, s) { // suffix
    return `${v}${s}`;
}

function px(prop) { // number to px 
    return isN(prop) ? sf(prop, 'px'): prop;
}

function s(prop) { // number to second
    return isN(prop) ? sf(prop, 's') : prop;
}

function percent(prop) {
    return isN(prop) ? sf(prop, '%'): prop;
}

function deg(prop) {
    return isN(prop) ? sf(prop, 'deg') : prop;
}

function csp(prop, key) { // convertSingleProperty
    switch (key) {
        case 'z-index':
        case 'tab-size':
        case 'opacity':
        case 'order':
        case 'flex':
        case 'flex-grow':
        case 'flex-shrink':
        case 'animation-iteration-count':
        case 'columns':
        case 'column-count':
            return String(prop);
        case 'animation-duration':
        case 'animation-delay':
        case 'transition-duration':
        case 'transition-delay':
            return s(prop);
        default:
            return px(prop);
    }
}

// TODO: transition: margin-left 4s, color 1s; 
function csh(prop, key) { // convertShorthand
    switch (key) {
        case 'transition':
            return prop.map(e => s(e)).join(' ');
        case 'transition-timing-function':
        case 'transition-property':
            return prop.join(', ');
        case 'transition-duration':
        case 'transition-delay':
            return prop.map(e => s(e)).join(', ');
        case 'animation':
            return prop.map((e, i) => (i === 0 || i === 2) ? s(e) : e).join(' ');
        case 'columns':
            return prop.join(' ');
        case 'flex':
            if (prop.length < 2) return prop.join(' ');
            return `${prop[0]} ${prop[1]} ${px(prop[2])}`
        default:
            return prop.map(e => px(e)).join(' ');
    }
}

// let isD = Boolean(process && process.env && process.env.NODE_ENV === 'development'); // isDevMode
// const cn = isD ? [] : null; // classnames to validate uniqueness

function njss(styles) { // export default
    p(styles).forEach(rule => r(rule));
}

function append(arrA, arrB) {
    for (let i = 0; i < arrB.length; i++) {
        arrA.push(arrB[i]);
    }
    return arrA;
}

function p(style, className = '', pseudo = '', isKeyFrames = false, isUnderMedia = false) {
    const ruleChain = [];
    const current = []; // collect css properties
    const ps = []; // deferred, collect pseudo selector
    const ms = []; // deferred, collect media query
    const kf = []; // deferred, collect keyframes
    Object.keys(style).forEach(key => {
        if (!key) return;
        if (key[0] === '@') {
            if (key[1] === 'k' || key[1] === '-') {
                if (pseudo !== '' || className !== '') throw new Error('@keyframes cannot be nested');
                kf.push(key);
            } else {
                ms.push(key);
            }
        } else if (vs(key)) {
            throw new Error(`'${key}' is inappropriate. Refer to the restrictions on https://github.com/wooheemusic/njss`)
        } else if (key[0] === ':') {
            if (className === '') throw new Error(`A classname should precede '${key}'`);
            ps.push(key);
        } else if (className === '') {
            // const hkey = h(key);
            // if (!isKeyFrames && !isUnderMedia && cn) {
            //     if (cn.indexOf(hkey) !== -1) throw new Error(`The classname '${key}' is not unique.`);
            //     cn.push(hkey);
            // }
            // append(ruleChain, p(style[key], hkey, '', isKeyFrames, isUnderMedia));
            append(ruleChain, p(style[key], h(key), '', isKeyFrames, isUnderMedia));
        } else {
            current.push(key);
        }
    })
    if (current.length > 0) {
        ruleChain.push(`${isKeyFrames ? '' : '.'}${className}${pseudo}{${current.reduce(
            (acc, k) => {
                const hk = h(k);
                const v = c(style[k], hk);
                return v ? `${acc}${hk}:${v};` : acc;
            }, '')}}`);
    };
    ps.forEach(key => append(ruleChain, p(style[key], className, pseudo + key)));
    ms.forEach(key => ruleChain.push(`${key}{${p(style[key], className, pseudo, false, true).join('')}}`));
    kf.forEach(key => ruleChain.push(`${key}{${p(style[key], className, pseudo, true).join('')}}`));
    return ruleChain;
}

const rs = []; // rules
let sh; // sheet
if (typeof document !== `undefined`) {
    const se = document.createElement('style');
    se.setAttribute('id', 'njss-element');
    document.head.appendChild(se);
    sh = se.sheet;
}
function r(rule) { // addRule
    rs.push(rule);
    sh && sh.insertRule(rule, sh.cssRules.length)
}

// function dev() {
//     isD = true;
// }

// function prod() {
//     isD = false;
// }

// function scan() {
//     // not yet
// }

// function devScan() {
//     isD && scan();
// }

// function prodScan() {
//     if (!isD) {
//         // not yet
//     }
// }

let ml = 0; // memoized length
let ms = ''; // memoized string
function toString() {
    if (ml !== rs.length) {
        ml = rs.length;
        ms = rs.join('');
    }
    return ms;
}

// njss.dev = dev;
// njss.prod = prod;
// njss.scan = scan;
// njss.devScan = devScan;
// njss.prodScan = prodScan;
njss.toString = toString;


const ua = [
    'turn', 'deg', 's', 'rad', 'ms',
    'em', 'ex', 'ch', 'rem', 'lh', 'vw', 'vh', 'vmin', 'vmax',
    'cm', 'mm', 'Q', 'in', 'pc', 'pt', 'px'
]
ua.forEach(e => (njss[e] = n => sf(n, e)));
njss.percent = percent;

const ps = [ // pure single
    'url', 'scaleX', 'scaleY', 'scaleZ',
];
const pa = [ // pure array
    'rgb', 'rgba',
    'matrix', 'matrix3d',
    'scale', 'scale3d',
];

const pxs = ['perspective', 'translateX', 'translateY', 'translateZ']
const pxa = ['translate', 'translate3d']

const ds = ['rotate', 'rotateX', 'rotateY', 'rotateZ', 'skewX', 'skewY']; // deg single
const da = ['skew'];

ps.forEach(e => (njss[e] = (arg) => pf(arg, e)));
ds.forEach(e => (njss[e] = (arg) => pf(deg(arg), e)));
pxs.forEach(e => (njss[e] = (arg) => pf(px(arg), e)));

pa.forEach(e => (njss[e] = (...args) => pf(args.join(', '), e)));
da.forEach(e => (njss[e] = (...args) => pf(args.map(v => deg(v)).join(', '), e)));
pxa.forEach(e => (njss[e] = (...args) => pf(args.map(v => px(v)).join(', '), e)));

njss.hsl = (...args) => pf(args.map((v, i) => (i === 1 || i === 2) ? percent(v) : v).join(', '), 'hsl');
njss.hsla = (...args) => pf(args.map((v, i) => (i === 1 || i === 2) ? percent(v) : v).join(', '), 'hsla');
njss.rotate3d = (...args) => pf(args.map((e, i) => i === 3 ? deg(e) : e).join(', '), 'rotate3d');

export default njss;