const presets = [
    '@babel/env',
    ['minify', {
        'builtIns': false
    }]
];

const comments = false;
const sourceMaps = 'inline';

module.exports = { presets, comments, sourceMaps };