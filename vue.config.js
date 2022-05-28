module.exports = {
    pluginOptions: {
        electronBuilder: {
            preload: 'src/preload.js',
            builderOptions: {
                productName: 'Traktor Library Manager',
                appId: 'com.tlm.app',
            },
        },
    },

    lintOnSave: false,
};
