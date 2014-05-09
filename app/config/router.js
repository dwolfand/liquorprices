'use strict';

module.exports = App.Router.map(function() {
    this.resource('scotch');
    this.resource('vodka');
    this.resource('liquors', { path: '/liquors/:category' });
    this.resource('specificLiquors', { path: '/specificLiquors/:category' });
    this.resource('detail', { path: '/detail/:liquor_id' });
});
