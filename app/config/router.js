'use strict';

module.exports = App.Router.map(function() {
    this.resource('liquors', { path: '/liquors/:category' });
    this.resource('specificLiquors', { path: '/specificLiquors/:category' });
    this.resource('detail', { path: '/detail/:liquor_id' });
    this.resource('search', { path: '/search/:searchstring' });
});
