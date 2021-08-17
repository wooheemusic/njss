# `njss`
This module enables classname-based css-in-js.

## Restrictions
- A css rule disallows any other selectors except one class selector and optionally pseudo classes or elements. (throws an error in dev mode)
- A css rule has a unique classname. (throws an error in dev mode)
- A class attribute of an DOM element has only one classname.

> I think we have no reason to use css-in-js unless we follow the restrictions. We have to re-use sets of css properties under the javascript overwriting merge rule, not in css weird priority rules.

## Usage
```js
njss({
    bigDog: {
        width: '100px',
        ':hover': {
            width: '120px'
        },
    },
    'small-cat': {
        width: '50px',
    },
})
```
```html
<div class="big-dog">bow-wow</div>
<div class="small-cat">meow</div>
```

## `njss-loader`
> not implemented
- For production build, `njss-loader` collects imported `*.css.js` files, append them to one global css file(create it if it doesn't exist) and remove `.css.js`-importing expressions and `njss`-relevant expressions.

## `npx njss`
> not implemented

## Auto-check restrictions in dev mode
This module checks `process.env.NODE_ENV === 'development'` to throw errors for the restrictions above. If codes are not in the node environment, alternatively enable 'dev mode' by calling `njss.dev()`. Or call `njss.prod()` to suppress them.

## For server-side rendering
Append `njss.toString()` to html responses.
```js
`<script>${njss.toString()}</script>` // part of a html string
```

## Convert numbers and parse arrays for shorthands
> not yet



