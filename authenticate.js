
var User = require('./user');


var text = '{ "username":"hamza","password":"poker" }';
var obj = JSON.parse(text);

//console.log("file users are ==> " + obj.username);


// to get user specified in above string parsed as XML object
User.findOne(obj, function(err, users) {
	  if(err) 
	  {
		   console.log("wrong username password"); 
		   throw err; 
	  }
	  else
		  {
		       if(users === null)
		    	   {
		    	   console.log("Wrong Username or password " );
		    	  
		    	   }
		       else
		    	   {
		    	   console.log("User's Details are ==> " + users);
		    	   }
	          
		  }
	});  

//to get all users from db
/*
User.find({}, function(err, users) {
	  if(err) 
	  {
		   console.log("wrong username password"); 
		   throw err; 
	  }
	  else
		  {
		       if(users === null)
		    	   {
		    	   console.log("No Users" );
		    	  
		    	   }
		       else
		    	   {
		    	   console.log("User's Details are ==> " + users);
		    	   }
	          
		  }
	});

*/







