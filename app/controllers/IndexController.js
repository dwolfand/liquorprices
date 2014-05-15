'use strict';

module.exports = App.IndexController = Ember.ArrayController.extend({
  liquors: {},
  today: new moment().format('MMMM Do YYYY'),

  //Setup the section titles to pass to the view
  scotchTitle: "Scotch",
  vodkaTitle: "Vodka",
  rumTitle: "Rum",
  tequilaTitle: "Tequila",
  whiskeyTitle: "Whiskey",

  scotchUrl: "#/liquors/SCOTCH",
  vodkaUrl: "#/liquors/VODKA",
  rumUrl: "#/liquors/RUM",
  tequilaUrl: "#/liquors/TEQUILA",
  whiskeyUrl: "#/liquors/WHISKEY"
});
