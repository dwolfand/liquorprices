'use strict';

module.exports = App.Router.map(function() {
    this.resource('liquors', { path: '/liquors/:category' });
    this.resource('specificLiquors', { path: '/specificLiquors/:category' });
    this.resource('detail', { path: '/detail/:liquor_id' }, function() {
    	this.route('inventory');
    	this.route('map');
    	this.route('price');
    	this.route('alerts');
    });
    this.resource('search', { path: '/search/:searchstring' });
    this.resource('subscriptions', { path: '/subscriptions/:account' });
});
