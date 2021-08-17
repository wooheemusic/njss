const presets = [
    '@babel/env',
    ['minify', {
        'builtIns': false
    }]
];

const comments = false;

module.exports = { presets, comments };