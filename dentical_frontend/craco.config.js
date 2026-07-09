const path = require('path');

module.exports = {
    webpack: {
        configure: {
            resolve: {
                alias: {
                    'react-reconciler': path.resolve(__dirname, './node_modules/react-reconciler'),
                    'its-fine': path.resolve(__dirname, './node_modules/its-fine')
                }
            }
        }
    }
}; 