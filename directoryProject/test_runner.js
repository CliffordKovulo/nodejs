const { directoryToTree } = require('./directoryToTree');
const { assert } = require('chai');

function omitSizeProperty(node) {
    const { size, ...rest } = node;
    if (rest.children) {
        rest.children = rest.children.map(omitSizeProperty);
    }
    return rest;
}

function runTest(rootDir, depth, expected) {
    const result = directoryToTree(rootDir, depth);
    const resultWithoutSize = omitSizeProperty(result);
    const expectedWithoutSize = omitSizeProperty(expected);

    console.log('Actual output:', JSON.stringify(resultWithoutSize, null, 2));
    console.log('Expected output:', JSON.stringify(expectedWithoutSize, null, 2));

    assert.deepEqual(resultWithoutSize, expectedWithoutSize);
}

module.exports = { runTest };
