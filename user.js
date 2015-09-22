
var Mongoose = require( 'mongoose' );

var Schema = Mongoose.Schema;

// create a schema
var userSchema = new Schema({
  name: String,
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  chips: Number,
  level: Number
});




//userSchema.statics.LoggedIn=false;
userSchema.statics.authenticate=function(query,cb){
	
	User.findOne(query, function(err, users) {
	  if(err) 
	  {
		   console.log("wrong username password"); 
		   console.log(err);
		   return cb(err);
	  }
	  else
		  {
		       if(users === null)
		    	   {
		    	   	console.log("Wrong Username or password " );
		    	   	return cb(null);
		    	   }
		       else
		    	   {
		    	   	console.log("Connected" );
		    	   	return cb(users);
		    	   }
	          
		  }
	}); 

}; 



// the schema is useless so far
// we need to create a model using it
var User = Mongoose.model('users', userSchema);


// make this available to our users in our Node applications
module.exports = User; 



