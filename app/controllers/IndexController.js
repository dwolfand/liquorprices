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
  otherTitle: "Other"
});
