const fs = require('fs');
const path = require('path');

function directoryToTree(rootDir, depth) {
    const fullPath = path.resolve(process.cwd(), rootDir);
    const stats = fs.statSync(fullPath);
    const name = path.basename(fullPath);
    const relativePath = path.relative(process.cwd(), fullPath).replace(/\\/g, '/');
    const node = {
        path: relativePath,
        name: name,
        type: stats.isDirectory() ? 'dir' : 'file',
        size: stats.size
    };

    if (node.type === 'dir') {
        node.children = [];
        if (depth > 0) {
            const items = fs.readdirSync(fullPath);
            for (const item of items) {
                const itemPath = path.join(rootDir, item);
                const childNode = directoryToTree(itemPath, depth - 1);
                node.children.push(childNode);
            }
        }
    }

    return node;
}

module.exports = { directoryToTree };
