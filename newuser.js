// grab the user model
var User = require('./user');


var text = '{ "name":"irtaza","username":"irtaza","password":"poker" }';
var object = JSON.parse(text);


// create a new user
var newUser = User(object);

// save the user
newUser.save(function(err) {
  if (err) throw err;

  console.log('User created!');
});

module.exports = newUser;