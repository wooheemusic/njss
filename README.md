# njss
This module enables classname-based css-in-js.

## Restrictions
- A css rule disallows any other selectors except one class selector and optionally pseudo selectors. (or throws an error in the dev mode)
- A css rule has a unique classname.
- A class attribute of a DOM element has only one classname.

> I think we have no reason to use css-in-js unless we follow the restrictions. We have to re-use sets of css properties under the javascript overwriting merge rule, not in css weird priority rules.

## Usage
```js
import njss from 'njss';

const {rgb, skew, rem} = njss;

njss({
    '@keyframes move': {
        '0%': {
            offsetDistance: '0%',
        },
        '100%': {
            offsetDistance: '100%',
        }
    },
    bigDog: {
        color: 'red',
    },
    '@media (orientation: landscape)': {
        bigDog: {
            color: rgb(100, 50, 50, 0.5),
            transform: skew(20,20),
            transition: [1, 'linear'],
            margin: [rem(1), 4, 5, 6],
            '@media (min-width: 1000px)': {
                ':hover': {
                    color: 'blue',
                    ':focus': {
                        color: 'green'
                    }
                },
            }
        },
    },
});
```

## HTML
This module does not require something like `getClassName(style)`.
```html
<div class="big-dog">bow-wow</div>
```

## result
```css
.big-dog{color:red;}@media (orientation: landscape){.big-dog{color:rgb(100, 50, 50, 0.5);transform:skew(20deg, 20deg);transition:1s linear;margin:1rem 4px 5px 6px;}@media (min-width: 1000px){.big-dog:hover{color:blue;}.big-dog:hover:focus{color:green;}}}@keyframes move{0%{offset-distance:0%;}100%{offset-distance:100%;}}
```

## Validations in the dev mode
This module validates styles only in the dev mode. If you do not use it in the `node` environment, you have to execute `njss.dev()` on your own to force the dev mode. `njss.prod()` is the opposite.
> This module is supposed to validate classname duplications. But it does not. It has to collect classnames in the njss module, but it contradicts live-reloading situations. I do not know any trick to escape live-reloadings.

## `njss-loader`
> not implemented
- For production build, `njss-loader` collects imported `*.css.js` files, append them to one global css file(create it if it doesn't exist) and remove `.css.js`-importing expressions and `njss`-relevant expressions.

## `npx njss`
> not implemented

## For server-side rendering
Append `njss.toString()` to html responses.
```js
`<style>${njss.toString()}</style>` // part of a html string
```




