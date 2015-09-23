var http = require('http');
var socket=require('socket.io');
var cluster = require("cluster");// we use cluster for horizontal scale up
var Table=require("./table.js");
var Player=require("./player.js");


var db = require('./db.js');
var User = require('./user.js');


//var authenticate = require('./authenticate');




var table=[];
var ClientSockets=[]


//in this section we are going to make 15 tables

	for(var i=0; i<15 ; i++){
		table[i]=new Table(i); 
	}
//

var numCPUs = require("os").cpus().length;
//console.log(numCPUs+" ");
var port = process.env.PORT || 8080;
var server;
 server=http.createServer(function(request, response) {
	    console.log("Request for:  " + request.url);
	    response.writeHead(200);
	    response.end("hello world\n");
	  }).listen(port,process.env.IP);
/*if (cluster.isMaster) {
	  for (var i = 0; i < numCPUs; i++) {
	    cluster.fork();
	  }
	  cluster.on("exit", function(worker, code, signal) {  
		  cluster.fork();
	  });
	} 
else {
	
	  server=http.createServer(function(request, response) {
	    console.log("Request for:  " + request.url);
	    response.writeHead(200);
	    response.end("hello world\n");
	  }).listen(8080,'localhost');
}
*/





//console.log("Server Is Running and Up at Port 8080");
var io= socket.listen(server,function () {  
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});


// Trigger Tables to get ready to play



io.sockets.on('connection',function(client){






/*
var DecideWinner=function(i,player){

	try{
	var list=[];
	list.push(table[i].card1);
	list.push(table[i].card2);
	list.push(table[i].card2);
	list.push(player.card1);
	list.push(player.card2);
	list.sort();
	}catch(e){
		console.log(e);
	}finally{
	console.log(list);	
	}
	

	
}

*/
/*
client.on('FBSignUp',function(data){
	var d=JSON.parse(data);

  User.findOne(d, function(err, users) {
	  if(err) 
	  {
		   console.log("wrong username password"); 
		   throw err; 
	  }
	  else
		  {
		       if(users === null)
		    	   {
		    		  var newUser = User(d);

				newUser.save(function(err) {
 					 if (err) throw err; 
 					 console.log('User created!');
 					 });
		    	   }
		       else
		    	   {
		    	   console.log("User's already exists");
		    	   }
	          
		  }
	 

  
});

});

*/

client.on('SignUp',function(data){
	var d=JSON.parse(data);

	var newUser = User(d);


	newUser.save(function(err) {
  if (err) throw err;

  console.log('User created!');
});

});

		
//=============================================================================================

	client.on('authenticate',function(data){
		// here we need to authenticate player login info
		var player_login_detail=JSON.parse(data);
		//User.authenticate(JSON.parse('{ "username":"hamza","password":"poker" }'),c);
		var query=JSON.parse('{ "username":"hamza","password":"poker" }');
		var query = {
				"username" : player_login_detail.id,
				"password" : player_login_detail.password
				}
		
		User.authenticate(query,function(user){
			if(user){
				console.log("okay");

			client.emit("PlayerInfoFromServer",{"name":user.name,"chips":user.chips,"level":user.level,"id":client.id});
			
			client.emit("ResponseCode",{"code":1});
				var lobby = {
				"table1" : table[0].getPlayingPlayer(),
				"table2" : table[1].getPlayingPlayer(),
				"table3" : table[2].getPlayingPlayer(),
				"table4" : table[3].getPlayingPlayer(),
				"table5" : table[4].getPlayingPlayer(),
				"table6" : table[5].getPlayingPlayer(),
				"table7" : table[6].getPlayingPlayer(),
				"table8" : table[7].getPlayingPlayer(),
				"table9" : table[8].getPlayingPlayer(),
				"table10" : table[9].getPlayingPlayer(),
				"table11" : table[10].getPlayingPlayer(),
				"table12" : table[11].getPlayingPlayer(),
				"table13" : table[12].getPlayingPlayer(),
				"table14" : table[13].getPlayingPlayer(),
				"table15" : table[14].getPlayingPlayer()
				}
				client.emit("LobbyInfo",lobby);
			}else{
				client.emit("ResponseCode",{"code":0});
			}
		});
		
	
	});


// =====================================================================================================

	client.on('SelectTable',function(data){
			var Data=JSON.parse(data);
			var tempPlayer=new Player(client.id);
			tempPlayer.chips=Data.chips;
			tempPlayer.setPlayerID(Data.playerID);
			tempPlayer.setName(Data.name);
			tempPlayer.setStatus("waiting");
			tempPlayer.facebookuser=Data.facebookuser;
			tempPlayer.playerLevel=Data.playerLevel;
			tempPlayer.settableID(Data.tableID);

			console.log("Name: = "+Data.name+" PlayerID: = "+Data.playerID);


			var yourturn=table[Data.tableID].addPlayer(tempPlayer);
			client.emit("YourTurnNumber",{"turn":yourturn});
			console.log(tempPlayer.gettableID());
			
			var tableInfo={

				"Player1":table[tempPlayer.gettableID()].player1,
				"Player2":table[tempPlayer.gettableID()].player2,
				"Player3":table[tempPlayer.gettableID()].player3,
				"Player4":table[tempPlayer.gettableID()].player4,
				"Player5":table[tempPlayer.gettableID()].player5,
				"Player6":table[tempPlayer.gettableID()].player6,
				"Player7":table[tempPlayer.gettableID()].player7,
				"Card1":table[tempPlayer.gettableID()].card1,
				"Card2":table[tempPlayer.gettableID()].card2,
				"Card3":table[tempPlayer.gettableID()].card3,
				"TableStats":table[tempPlayer.gettableID()].tableStatus
			}
				

// this is the update that sould be send to every player on the table;
if(table[tempPlayer.gettableID()].player1.status!="empty"){
io.sockets.socket(table[tempPlayer.gettableID()].player1.id, true).emit("PlayersOnTable",tableInfo);
}
if(table[tempPlayer.gettableID()].player2.status!="empty"){
io.sockets.socket(table[tempPlayer.gettableID()].player2.id, true).emit("PlayersOnTable",tableInfo);
}

if(table[tempPlayer.gettableID()].player3.status!="empty"){
io.sockets.socket(table[tempPlayer.gettableID()].player3.id, true).emit("PlayersOnTable",tableInfo);
}

if(table[tempPlayer.gettableID()].player4.status!="empty"){
io.sockets.socket(table[tempPlayer.gettableID()].player4.id, true).emit("PlayersOnTable",tableInfo);
}

if(table[tempPlayer.gettableID()].player5.status!="empty"){
io.sockets.socket(table[tempPlayer.gettableID()].player5.id, true).emit("PlayersOnTable",tableInfo);
}

if(table[tempPlayer.gettableID()].player6.status!="empty"){
io.sockets.socket(table[tempPlayer.gettableID()].player6.id, true).emit("PlayersOnTable",tableInfo);
}

if(table[tempPlayer.gettableID()].player7.status!="empty"){
io.sockets.socket(table[tempPlayer.gettableID()].player7.id, true).emit("PlayersOnTable",tableInfo);
}


				//client.emit("PlayersOnTable",tableInfo);


				var lobby = {
				"table1" : table[0].getPlayingPlayer(),
				"table2" : table[1].getPlayingPlayer(),
				"table3" : table[2].getPlayingPlayer(),
				"table4" : table[3].getPlayingPlayer(),
				"table5" : table[4].getPlayingPlayer(),
				"table6" : table[5].getPlayingPlayer(),
				"table7" : table[6].getPlayingPlayer(),
				"table8" : table[7].getPlayingPlayer(),
				"table9" : table[8].getPlayingPlayer(),
				"table10" : table[9].getPlayingPlayer(),
				"table11" : table[10].getPlayingPlayer(),
				"table12" : table[11].getPlayingPlayer(),
				"table13" : table[12].getPlayingPlayer(),
				"table14" : table[13].getPlayingPlayer(),
				"table15" : table[14].getPlayingPlayer()
				}

				io.sockets.emit("LobbyInfo",lobby);






	});

//=============================================Raise===========================================

client.on('Raise',function(data){


	var Data=JSON.parse(data);

	if(table[Data.tableID].player1.id===client.id){

		
			if(table[Data.tableID].player1.chips>=20){
				table[Data.tableID].player1.status="raise";
				table[Data.tableID].player1.chips-=10;
				table[Data.tableID].p1+=10;

			}else if(table[Data.tableID].player1.chips===10){
				table[Data.tableID].player1.status="call";
				table[Data.tableID].player1.chips-=10;
				table[Data.tableID].p1+=10;
			}

		if(table[Data.tableID].player2.status==="Playing" || table[Data.tableID].player2.status==="raise"){

			table[Data.tableID].player2.status="Turn";
			io.sockets.socket(table[Data.tableID].player2.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player3.status==="Playing" || table[Data.tableID].player3.status==="raise"){

			table[Data.tableID].player3.status="Turn";
			io.sockets.socket(table[Data.tableID].player3.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player4.status==="Playing" || table[Data.tableID].player4.status==="raise"){

			table[Data.tableID].player4.status="Turn";
			io.sockets.socket(table[Data.tableID].player4.id, true).emit("Turn","");

		}else if(table[Data.tableID].player5.status==="Playing" || table[Data.tableID].player5.status==="raise"){

			table[Data.tableID].player5.status="Turn";
			io.sockets.socket(table[Data.tableID].player5.id, true).emit("Turn","");

		}else if(table[Data.tableID].player6.status==="Playing" || table[Data.tableID].player6.status==="raise"){

			table[Data.tableID].player6.status="Turn";
			io.sockets.socket(table[Data.tableID].player6.id, true).emit("Turn","");

		}else if(table[Data.tableID].player7.status==="Playing" || table[Data.tableID].player7.status==="raise"){

			table[Data.tableID].player7.status="Turn";
			io.sockets.socket(table[Data.tableID].player7.id, true).emit("Turn","");
		
		}else{
			table[Data.tableID].player1.status="Turn";
			io.sockets.socket(table[Data.tableID].player1.id, true).emit("Turn","");
		}








	}else if(table[Data.tableID].player2.id===client.id){

			if(table[Data.tableID].player2.chips>=20){
				table[Data.tableID].player2.status="raise";
				table[Data.tableID].player2.chips-=10;
				table[Data.tableID].p2+=10;
			}else if(table[Data.tableID].player2.chips===10){
				table[Data.tableID].player2.status="call";
				table[Data.tableID].player2.chips-=10;
				table[Data.tableID].p2+=10;
			}
		
		 if(table[Data.tableID].player3.status==="Playing" || table[Data.tableID].player3.status==="raise"){

			table[Data.tableID].player3.status="Turn";
			io.sockets.socket(table[Data.tableID].player3.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player4.status==="Playing" || table[Data.tableID].player4.status==="raise"){

			table[Data.tableID].player4.status="Turn";
			io.sockets.socket(table[Data.tableID].player4.id, true).emit("Turn","");

		}else if(table[Data.tableID].player5.status==="Playing" || table[Data.tableID].player5.status==="raise"){

			table[Data.tableID].player5.status="Turn";
			io.sockets.socket(table[Data.tableID].player5.id, true).emit("Turn","");

		}else if(table[Data.tableID].player6.status==="Playing" || table[Data.tableID].player6.status==="raise"){

			table[Data.tableID].player6.status="Turn";
			io.sockets.socket(table[Data.tableID].player6.id, true).emit("Turn","");

		}else if(table[Data.tableID].player7.status==="Playing" || table[Data.tableID].player7.status==="raise"){

			table[Data.tableID].player7.status="Turn";
			io.sockets.socket(table[Data.tableID].player7.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player1.status==="Playing" || table[Data.tableID].player1.status==="raise"){

			table[Data.tableID].player1.status="Turn";
			io.sockets.socket(table[Data.tableID].player1.id, true).emit("Turn","");
		}else{
			table[Data.tableID].player2.status="Turn";
			io.sockets.socket(table[Data.tableID].player2.id, true).emit("Turn","");
		}


	}else if(table[Data.tableID].player3.id===client.id){

		if(table[Data.tableID].player3.chips>=20){
				table[Data.tableID].player3.status="raise";
				table[Data.tableID].player3.chips-=10;
				table[Data.tableID].p3+=10;
			}else if(table[Data.tableID].player3.chips===10){
				table[Data.tableID].player3.status="call";
				table[Data.tableID].player3.chips-=10;
				table[Data.tableID].p3+=10;
			}

		 if(table[Data.tableID].player4.status==="Playing" || table[Data.tableID].player4.status==="raise"){

			table[Data.tableID].player4.status="Turn";
			io.sockets.socket(table[Data.tableID].player4.id, true).emit("Turn","");

		}else if(table[Data.tableID].player5.status==="Playing" || table[Data.tableID].player5.status==="raise"){

			table[Data.tableID].player5.status="Turn";
			io.sockets.socket(table[Data.tableID].player5.id, true).emit("Turn","");

		}else if(table[Data.tableID].player6.status==="Playing" || table[Data.tableID].player6.status==="raise"){

			table[Data.tableID].player6.status="Turn";
			io.sockets.socket(table[Data.tableID].player6.id, true).emit("Turn","");

		}else if(table[Data.tableID].player7.status==="Playing" || table[Data.tableID].player7.status==="raise"){

			table[Data.tableID].player7.status="Turn";
			io.sockets.socket(table[Data.tableID].player7.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player1.status==="Playing" || table[Data.tableID].player1.status==="raise"){

			table[Data.tableID].player1.status="Turn";
			io.sockets.socket(table[Data.tableID].player1.id, true).emit("Turn","");
		}
		else if(table[Data.tableID].player2.status==="Playing" || table[Data.tableID].player2.status==="raise"){

			table[Data.tableID].player2.status="Turn";
			io.sockets.socket(table[Data.tableID].player2.id, true).emit("Turn","");
		
		}else{
			table[Data.tableID].player3.status="Turn";
			io.sockets.socket(table[Data.tableID].player3.id, true).emit("Turn","");
		}

		
	}else if(table[Data.tableID].player4.id===client.id){

		if(table[Data.tableID].player4.chips>=20){
				table[Data.tableID].player4.status="raise";
				table[Data.tableID].player4.chips-=10;
				table[Data.tableID].p4+=10;
			}else if(table[Data.tableID].player4.chips===10){
				table[Data.tableID].player4.status="call";
				table[Data.tableID].player4.chips-=10;
				table[Data.tableID].p4+=10;
			}

 if(table[Data.tableID].player5.status==="Playing" || table[Data.tableID].player5.status==="raise"){

			table[Data.tableID].player5.status="Turn";
			io.sockets.socket(table[Data.tableID].player5.id, true).emit("Turn","");

		}else if(table[Data.tableID].player6.status==="Playing" || table[Data.tableID].player6.status==="raise"){

			table[Data.tableID].player6.status="Turn";
			io.sockets.socket(table[Data.tableID].player6.id, true).emit("Turn","");

		}else if(table[Data.tableID].player7.status==="Playing" || table[Data.tableID].player7.status==="raise"){

			table[Data.tableID].player7.status="Turn";
			io.sockets.socket(table[Data.tableID].player7.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player1.status==="Playing" || table[Data.tableID].player1.status==="raise"){

			table[Data.tableID].player1.status="Turn";
			io.sockets.socket(table[Data.tableID].player1.id, true).emit("Turn","");
		}
		else if(table[Data.tableID].player2.status==="Playing" || table[Data.tableID].player2.status==="raise"){

			table[Data.tableID].player2.status="Turn";
			io.sockets.socket(table[Data.tableID].player2.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player3.status==="Playing" || table[Data.tableID].player3.status==="raise"){

			table[Data.tableID].player3.status="Turn";
			io.sockets.socket(table[Data.tableID].player3.id, true).emit("Turn","");

		}else{
			table[Data.tableID].player4.status="Turn";
			io.sockets.socket(table[Data.tableID].player4.id, true).emit("Turn","");
		}

		
	}else if(table[Data.tableID].player5.id===client.id){

		if(table[Data.tableID].player5.chips>=20){
				table[Data.tableID].player5.status="raise";
				table[Data.tableID].player5.chips-=10;
				table[Data.tableID].p5+=10;
			}else if(table[Data.tableID].player5.chips===10){
				table[Data.tableID].player5.status="call";
				table[Data.tableID].player5.chips-=10;
				table[Data.tableID].p5+=10;
			}


 		if(table[Data.tableID].player6.status==="Playing" || table[Data.tableID].player6.status==="raise"){

			table[Data.tableID].player6.status="Turn";
			io.sockets.socket(table[Data.tableID].player6.id, true).emit("Turn","");

		}else if(table[Data.tableID].player7.status==="Playing" || table[Data.tableID].player7.status==="raise"){

			table[Data.tableID].player7.status="Turn";
			io.sockets.socket(table[Data.tableID].player7.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player1.status==="Playing" || table[Data.tableID].player1.status==="raise"){

			table[Data.tableID].player1.status="Turn";
			io.sockets.socket(table[Data.tableID].player1.id, true).emit("Turn","");
		}
		else if(table[Data.tableID].player2.status==="Playing" || table[Data.tableID].player2.status==="raise"){

			table[Data.tableID].player2.status="Turn";
			io.sockets.socket(table[Data.tableID].player2.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player3.status==="Playing" || table[Data.tableID].player3.status==="raise"){

			table[Data.tableID].player3.status="Turn";
			io.sockets.socket(table[Data.tableID].player3.id, true).emit("Turn","");

		}else if(table[Data.tableID].player4.status==="Playing" || table[Data.tableID].player4.status==="raise"){

			table[Data.tableID].player4.status="Turn";
			io.sockets.socket(table[Data.tableID].player4.id, true).emit("Turn","");

		}else{
			table[Data.tableID].player5.status="Turn";
			io.sockets.socket(table[Data.tableID].player5.id, true).emit("Turn","");
		}



		
	}else if(table[Data.tableID].player6.id===client.id){

		if(table[Data.tableID].player6.chips>=20){
				table[Data.tableID].player6.status="raise";
				table[Data.tableID].player6.chips-=10;
				table[Data.tableID].p6+=10;
			}else if(table[Data.tableID].player6.chips===10){
				table[Data.tableID].player6.status="call";
				table[Data.tableID].player6.chips-=10;
				table[Data.tableID].p6+=10;
			}
		if(table[Data.tableID].player7.status==="Playing" || table[Data.tableID].player7.status==="raise"){

			table[Data.tableID].player7.status="Turn";
			io.sockets.socket(table[Data.tableID].player7.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player1.status==="Playing" || table[Data.tableID].player1.status==="raise"){

			table[Data.tableID].player1.status="Turn";
			io.sockets.socket(table[Data.tableID].player1.id, true).emit("Turn","");
		}
		else if(table[Data.tableID].player2.status==="Playing" || table[Data.tableID].player2.status==="raise"){

			table[Data.tableID].player2.status="Turn";
			io.sockets.socket(table[Data.tableID].player2.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player3.status==="Playing" || table[Data.tableID].player3.status==="raise"){

			table[Data.tableID].player3.status="Turn";
			io.sockets.socket(table[Data.tableID].player3.id, true).emit("Turn","");

		}else if(table[Data.tableID].player4.status==="Playing" || table[Data.tableID].player4.status==="raise"){

			table[Data.tableID].player4.status="Turn";
			io.sockets.socket(table[Data.tableID].player4.id, true).emit("Turn","");

		}else if(table[Data.tableID].player5.status==="Playing" || table[Data.tableID].player5.status==="raise"){

			table[Data.tableID].player5.status="Turn";
			io.sockets.socket(table[Data.tableID].player5.id, true).emit("Turn","");

		}else{
			table[Data.tableID].player6.status="Turn";
			io.sockets.socket(table[Data.tableID].player6.id, true).emit("Turn","");
		}
		
	}else if(table[Data.tableID].player7.id===client.id){

		if(table[Data.tableID].player7.chips>=20){
				table[Data.tableID].player7.status="raise";
				table[Data.tableID].player7.chips-=10;
				table[Data.tableID].p7+=10;
			}else if(table[Data.tableID].player7.chips===10){
				table[Data.tableID].player7.status="call";
				table[Data.tableID].player7.chips-=10;
				table[Data.tableID].p7+=10;
			}


		 if(table[Data.tableID].player1.status==="Playing" || table[Data.tableID].player1.status==="raise"){

			table[Data.tableID].player1.status="Turn";
			io.sockets.socket(table[Data.tableID].player1.id, true).emit("Turn","");
		}
		else if(table[Data.tableID].player2.status==="Playing" || table[Data.tableID].player2.status==="raise"){

			table[Data.tableID].player2.status="Turn";
			io.sockets.socket(table[Data.tableID].player2.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player3.status==="Playing" || table[Data.tableID].player3.status==="raise"){

			table[Data.tableID].player3.status="Turn";
			io.sockets.socket(table[Data.tableID].player3.id, true).emit("Turn","");

		}else if(table[Data.tableID].player4.status==="Playing" || table[Data.tableID].player4.status==="raise"){

			table[Data.tableID].player4.status="Turn";
			io.sockets.socket(table[Data.tableID].player4.id, true).emit("Turn","");

		}else if(table[Data.tableID].player5.status==="Playing" || table[Data.tableID].player5.status==="raise"){

			table[Data.tableID].player5.status="Turn";
			io.sockets.socket(table[Data.tableID].player5.id, true).emit("Turn","");

		}else if(table[Data.tableID].player6.status==="Playing" || table[Data.tableID].player6.status==="raise"){

			table[Data.tableID].player6.status="Turn";
			io.sockets.socket(table[Data.tableID].player6.id, true).emit("Turn","");
		
		}else{
			table[Data.tableID].player7.status="Turn";
			io.sockets.socket(table[Data.tableID].player7.id, true).emit("Turn","");
		}
		
	}


			var tableInfo={

				"Player1":table[Data.tableID].player1,
				"Player2":table[Data.tableID].player2,
				"Player3":table[Data.tableID].player3,
				"Player4":table[Data.tableID].player4,
				"Player5":table[Data.tableID].player5,
				"Player6":table[Data.tableID].player6,
				"Player7":table[Data.tableID].player7,
				"Card1":table[Data.tableID].card1,
				"Card2":table[Data.tableID].card2,
				"Card3":table[Data.tableID].card3,
				"TableStats":table[Data.tableID].tableStatus
			}
				


			 var TableBets = {
				"p1" : table[Data.tableID].p1,
				"p2" : table[Data.tableID].p2,
				"p3" : table[Data.tableID].p3,
				"p4" : table[Data.tableID].p4,
				"p5" : table[Data.tableID].p5,
				"p6" : table[Data.tableID].p6,
				"p7" : table[Data.tableID].p7
				}
				


// this is the update that sould be send to every player on the table;
if(table[Data.tableID].player1.status!="empty"){
io.sockets.socket(table[Data.tableID].player1.id, true).emit("PlayersOnTable",tableInfo);
io.sockets.socket(table[Data.tableID].player1.id, true).emit("PlayersBets",TableBets);
}
if(table[Data.tableID].player2.status!="empty"){
io.sockets.socket(table[Data.tableID].player2.id, true).emit("PlayersOnTable",tableInfo);
io.sockets.socket(table[Data.tableID].player2.id, true).emit("PlayersBets",TableBets);
}

if(table[Data.tableID].player3.status!="empty"){
io.sockets.socket(table[Data.tableID].player3.id, true).emit("PlayersOnTable",tableInfo);
io.sockets.socket(table[Data.tableID].player3.id, true).emit("PlayersBets",TableBets);
}

if(table[Data.tableID].player4.status!="empty"){
io.sockets.socket(table[Data.tableID].player4.id, true).emit("PlayersOnTable",tableInfo);
io.sockets.socket(table[Data.tableID].player4.id, true).emit("PlayersBets",TableBets);
}

if(table[Data.tableID].player5.status!="empty"){
io.sockets.socket(table[Data.tableID].player5.id, true).emit("PlayersOnTable",tableInfo);
io.sockets.socket(table[Data.tableID].player5.id, true).emit("PlayersBets",TableBets);
}

if(table[Data.tableID].player6.status!="empty"){
io.sockets.socket(table[Data.tableID].player6.id, true).emit("PlayersOnTable",tableInfo);
io.sockets.socket(table[Data.tableID].player6.id, true).emit("PlayersBets",TableBets);
}

if(table[Data.tableID].player7.status!="empty"){
io.sockets.socket(table[Data.tableID].player7.id, true).emit("PlayersOnTable",tableInfo);
io.sockets.socket(table[Data.tableID].player7.id, true).emit("PlayersBets",TableBets);
}
}










);
//=============================================Call============================================
client.on('Call',function(data){

	var Data=JSON.parse(data);

	if(table[Data.tableID].player1.id===client.id){

		table[Data.tableID].player1.status="call";


		if(table[Data.tableID].player2.status==="Playing" || table[Data.tableID].player2.status==="raise"){

			table[Data.tableID].player2.status="Turn";
			io.sockets.socket(table[Data.tableID].player2.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player3.status==="Playing" || table[Data.tableID].player3.status==="raise"){

			table[Data.tableID].player3.status="Turn";
			io.sockets.socket(table[Data.tableID].player3.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player4.status==="Playing" || table[Data.tableID].player4.status==="raise"){

			table[Data.tableID].player4.status="Turn";
			io.sockets.socket(table[Data.tableID].player4.id, true).emit("Turn","");

		}else if(table[Data.tableID].player5.status==="Playing" || table[Data.tableID].player5.status==="raise"){

			table[Data.tableID].player5.status="Turn";
			io.sockets.socket(table[Data.tableID].player5.id, true).emit("Turn","");

		}else if(table[Data.tableID].player6.status==="Playing" || table[Data.tableID].player6.status==="raise"){

			table[Data.tableID].player6.status="Turn";
			io.sockets.socket(table[Data.tableID].player6.id, true).emit("Turn","");

		}else if(table[Data.tableID].player7.status==="Playing" || table[Data.tableID].player7.status==="raise"){

			table[Data.tableID].player7.status="Turn";
			io.sockets.socket(table[Data.tableID].player7.id, true).emit("Turn","");
		
		}








	}else if(table[Data.tableID].player2.id===client.id){

		table[Data.tableID].player2.status="call";

	
		
		 if(table[Data.tableID].player3.status==="Playing" || table[Data.tableID].player3.status==="raise"){

			table[Data.tableID].player3.status="Turn";
			io.sockets.socket(table[Data.tableID].player3.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player4.status==="Playing" || table[Data.tableID].player4.status==="raise"){

			table[Data.tableID].player4.status="Turn";
			io.sockets.socket(table[Data.tableID].player4.id, true).emit("Turn","");

		}else if(table[Data.tableID].player5.status==="Playing" || table[Data.tableID].player5.status==="raise"){

			table[Data.tableID].player5.status="Turn";
			io.sockets.socket(table[Data.tableID].player5.id, true).emit("Turn","");

		}else if(table[Data.tableID].player6.status==="Playing" || table[Data.tableID].player6.status==="raise"){

			table[Data.tableID].player6.status="Turn";
			io.sockets.socket(table[Data.tableID].player6.id, true).emit("Turn","");

		}else if(table[Data.tableID].player7.status==="Playing" || table[Data.tableID].player7.status==="raise"){

			table[Data.tableID].player7.status="Turn";
			io.sockets.socket(table[Data.tableID].player7.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player1.status==="Playing" || table[Data.tableID].player1.status==="raise"){

			table[Data.tableID].player1.status="Turn";
			io.sockets.socket(table[Data.tableID].player1.id, true).emit("Turn","");
		}


	}else if(table[Data.tableID].player3.id===client.id){

		table[Data.tableID].player3.status="call";



		 if(table[Data.tableID].player4.status==="Playing" || table[Data.tableID].player4.status==="raise"){

			table[Data.tableID].player4.status="Turn";
			io.sockets.socket(table[Data.tableID].player4.id, true).emit("Turn","");

		}else if(table[Data.tableID].player5.status==="Playing" || table[Data.tableID].player5.status==="raise"){

			table[Data.tableID].player5.status="Turn";
			io.sockets.socket(table[Data.tableID].player5.id, true).emit("Turn","");

		}else if(table[Data.tableID].player6.status==="Playing" || table[Data.tableID].player6.status==="raise"){

			table[Data.tableID].player6.status="Turn";
			io.sockets.socket(table[Data.tableID].player6.id, true).emit("Turn","");

		}else if(table[Data.tableID].player7.status==="Playing" || table[Data.tableID].player7.status==="raise"){

			table[Data.tableID].player7.status="Turn";
			io.sockets.socket(table[Data.tableID].player7.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player1.status==="Playing" || table[Data.tableID].player1.status==="raise"){

			table[Data.tableID].player1.status="Turn";
			io.sockets.socket(table[Data.tableID].player1.id, true).emit("Turn","");
		}
		else if(table[Data.tableID].player2.status==="Playing" || table[Data.tableID].player2.status==="raise"){

			table[Data.tableID].player2.status="Turn";
			io.sockets.socket(table[Data.tableID].player2.id, true).emit("Turn","");
		
		}

		
	}else if(table[Data.tableID].player4.id===client.id){

		table[Data.tableID].player4.status="call";


 if(table[Data.tableID].player5.status==="Playing" || table[Data.tableID].player5.status==="raise"){

			table[Data.tableID].player5.status="Turn";
			io.sockets.socket(table[Data.tableID].player5.id, true).emit("Turn","");

		}else if(table[Data.tableID].player6.status==="Playing" || table[Data.tableID].player6.status==="raise"){

			table[Data.tableID].player6.status="Turn";
			io.sockets.socket(table[Data.tableID].player6.id, true).emit("Turn","");

		}else if(table[Data.tableID].player7.status==="Playing" || table[Data.tableID].player7.status==="raise"){

			table[Data.tableID].player7.status="Turn";
			io.sockets.socket(table[Data.tableID].player7.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player1.status==="Playing" || table[Data.tableID].player1.status==="raise"){

			table[Data.tableID].player1.status="Turn";
			io.sockets.socket(table[Data.tableID].player1.id, true).emit("Turn","");
		}
		else if(table[Data.tableID].player2.status==="Playing" || table[Data.tableID].player2.status==="raise"){

			table[Data.tableID].player2.status="Turn";
			io.sockets.socket(table[Data.tableID].player2.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player3.status==="Playing" || table[Data.tableID].player3.status==="raise"){

			table[Data.tableID].player3.status="Turn";
			io.sockets.socket(table[Data.tableID].player3.id, true).emit("Turn","");

		}

		
	}else if(table[Data.tableID].player5.id===client.id){

		table[Data.tableID].player5.status="call";



 		if(table[Data.tableID].player6.status==="Playing" || table[Data.tableID].player6.status==="raise"){

			table[Data.tableID].player6.status="Turn";
			io.sockets.socket(table[Data.tableID].player6.id, true).emit("Turn","");

		}else if(table[Data.tableID].player7.status==="Playing" || table[Data.tableID].player7.status==="raise"){

			table[Data.tableID].player7.status="Turn";
			io.sockets.socket(table[Data.tableID].player7.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player1.status==="Playing" || table[Data.tableID].player1.status==="raise"){

			table[Data.tableID].player1.status="Turn";
			io.sockets.socket(table[Data.tableID].player1.id, true).emit("Turn","");
		}
		else if(table[Data.tableID].player2.status==="Playing" || table[Data.tableID].player2.status==="raise"){

			table[Data.tableID].player2.status="Turn";
			io.sockets.socket(table[Data.tableID].player2.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player3.status==="Playing" || table[Data.tableID].player3.status==="raise"){

			table[Data.tableID].player3.status="Turn";
			io.sockets.socket(table[Data.tableID].player3.id, true).emit("Turn","");

		}else if(table[Data.tableID].player4.status==="Playing" || table[Data.tableID].player4.status==="raise"){

			table[Data.tableID].player4.status="Turn";
			io.sockets.socket(table[Data.tableID].player4.id, true).emit("Turn","");

		}



		
	}else if(table[Data.tableID].player6.id===client.id){

		table[Data.tableID].player6.status="call";

		if(table[Data.tableID].player7.status==="Playing" || table[Data.tableID].player7.status==="raise"){

			table[Data.tableID].player7.status="Turn";
			io.sockets.socket(table[Data.tableID].player7.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player1.status==="Playing" || table[Data.tableID].player1.status==="raise"){

			table[Data.tableID].player1.status="Turn";
			io.sockets.socket(table[Data.tableID].player1.id, true).emit("Turn","");
		}
		else if(table[Data.tableID].player2.status==="Playing" || table[Data.tableID].player2.status==="raise"){

			table[Data.tableID].player2.status="Turn";
			io.sockets.socket(table[Data.tableID].player2.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player3.status==="Playing" || table[Data.tableID].player3.status==="raise"){

			table[Data.tableID].player3.status="Turn";
			io.sockets.socket(table[Data.tableID].player3.id, true).emit("Turn","");

		}else if(table[Data.tableID].player4.status==="Playing" || table[Data.tableID].player4.status==="raise"){

			table[Data.tableID].player4.status="Turn";
			io.sockets.socket(table[Data.tableID].player4.id, true).emit("Turn","");

		}else if(table[Data.tableID].player5.status==="Playing" || table[Data.tableID].player5.status==="raise"){

			table[Data.tableID].player5.status="Turn";
			io.sockets.socket(table[Data.tableID].player5.id, true).emit("Turn","");

		}
		
	}else if(table[Data.tableID].player7.id===client.id){

		table[Data.tableID].player7.status="call";


		 if(table[Data.tableID].player1.status==="Playing" || table[Data.tableID].player1.status==="raise"){

			table[Data.tableID].player1.status="Turn";
			io.sockets.socket(table[Data.tableID].player1.id, true).emit("Turn","");
		}
		else if(table[Data.tableID].player2.status==="Playing" || table[Data.tableID].player2.status==="raise"){

			table[Data.tableID].player2.status="Turn";
			io.sockets.socket(table[Data.tableID].player2.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player3.status==="Playing" || table[Data.tableID].player3.status==="raise"){

			table[Data.tableID].player3.status="Turn";
			io.sockets.socket(table[Data.tableID].player3.id, true).emit("Turn","");

		}else if(table[Data.tableID].player4.status==="Playing" || table[Data.tableID].player4.status==="raise"){

			table[Data.tableID].player4.status="Turn";
			io.sockets.socket(table[Data.tableID].player4.id, true).emit("Turn","");

		}else if(table[Data.tableID].player5.status==="Playing" || table[Data.tableID].player5.status==="raise"){

			table[Data.tableID].player5.status="Turn";
			io.sockets.socket(table[Data.tableID].player5.id, true).emit("Turn","");

		}else if(table[Data.tableID].player6.status==="Playing" || table[Data.tableID].player6.status==="raise"){

			table[Data.tableID].player6.status="Turn";
			io.sockets.socket(table[Data.tableID].player6.id, true).emit("Turn","");
		
		}
		
	}


			var tableInfo={

				"Player1":table[Data.tableID].player1,
				"Player2":table[Data.tableID].player2,
				"Player3":table[Data.tableID].player3,
				"Player4":table[Data.tableID].player4,
				"Player5":table[Data.tableID].player5,
				"Player6":table[Data.tableID].player6,
				"Player7":table[Data.tableID].player7,
				"Card1":table[Data.tableID].card1,
				"Card2":table[Data.tableID].card2,
				"Card3":table[Data.tableID].card3,
				"TableStats":table[Data.tableID].tableStatus
			}
				

// this is the update that sould be send to every player on the table;
if(table[Data.tableID].player1.status!="empty"){
io.sockets.socket(table[Data.tableID].player1.id, true).emit("PlayersOnTable",tableInfo);
}
if(table[Data.tableID].player2.status!="empty"){
io.sockets.socket(table[Data.tableID].player2.id, true).emit("PlayersOnTable",tableInfo);
}

if(table[Data.tableID].player3.status!="empty"){
io.sockets.socket(table[Data.tableID].player3.id, true).emit("PlayersOnTable",tableInfo);
}

if(table[Data.tableID].player4.status!="empty"){
io.sockets.socket(table[Data.tableID].player4.id, true).emit("PlayersOnTable",tableInfo);
}

if(table[Data.tableID].player5.status!="empty"){
io.sockets.socket(table[Data.tableID].player5.id, true).emit("PlayersOnTable",tableInfo);
}

if(table[Data.tableID].player6.status!="empty"){
io.sockets.socket(table[Data.tableID].player6.id, true).emit("PlayersOnTable",tableInfo);
}

if(table[Data.tableID].player7.status!="empty"){
io.sockets.socket(table[Data.tableID].player7.id, true).emit("PlayersOnTable",tableInfo);
}



	});
//==============================================Fold===========================================

client.on('Fold',function(data){

	var Data=JSON.parse(data);
	

	if(table[Data.tableID].player1.id===client.id){
		table[Data.tableID].player1.card1="";
		table[Data.tableID].player1.card2="";
		table[Data.tableID].player1.status="fold";


		if(table[Data.tableID].player2.status==="Playing" || table[Data.tableID].player2.status==="raise"){

			table[Data.tableID].player2.status="Turn";
			io.sockets.socket(table[Data.tableID].player2.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player3.status==="Playing" || table[Data.tableID].player3.status==="raise"){

			table[Data.tableID].player3.status="Turn";
			io.sockets.socket(table[Data.tableID].player3.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player4.status==="Playing" || table[Data.tableID].player4.status==="raise"){

			table[Data.tableID].player4.status="Turn";
			io.sockets.socket(table[Data.tableID].player4.id, true).emit("Turn","");

		}else if(table[Data.tableID].player5.status==="Playing" || table[Data.tableID].player5.status==="raise"){

			table[Data.tableID].player5.status="Turn";
			io.sockets.socket(table[Data.tableID].player5.id, true).emit("Turn","");

		}else if(table[Data.tableID].player6.status==="Playing" || table[Data.tableID].player6.status==="raise"){

			table[Data.tableID].player6.status="Turn";
			io.sockets.socket(table[Data.tableID].player6.id, true).emit("Turn","");

		}else if(table[Data.tableID].player7.status==="Playing" || table[Data.tableID].player7.status==="raise"){

			table[Data.tableID].player7.status="Turn";
			io.sockets.socket(table[Data.tableID].player7.id, true).emit("Turn","");
		
		}








	}else if(table[Data.tableID].player2.id===client.id){
		table[Data.tableID].player2.card1="";
		table[Data.tableID].player2.card2="";
		table[Data.tableID].player2.status="fold";

	
		
		 if(table[Data.tableID].player3.status==="Playing" || table[Data.tableID].player3.status==="raise"){

			table[Data.tableID].player3.status="Turn";
			io.sockets.socket(table[Data.tableID].player3.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player4.status==="Playing" || table[Data.tableID].player4.status==="raise"){

			table[Data.tableID].player4.status="Turn";
			io.sockets.socket(table[Data.tableID].player4.id, true).emit("Turn","");

		}else if(table[Data.tableID].player5.status==="Playing" || table[Data.tableID].player5.status==="raise"){

			table[Data.tableID].player5.status="Turn";
			io.sockets.socket(table[Data.tableID].player5.id, true).emit("Turn","");

		}else if(table[Data.tableID].player6.status==="Playing" || table[Data.tableID].player6.status==="raise"){

			table[Data.tableID].player6.status="Turn";
			io.sockets.socket(table[Data.tableID].player6.id, true).emit("Turn","");

		}else if(table[Data.tableID].player7.status==="Playing" || table[Data.tableID].player7.status==="raise"){

			table[Data.tableID].player7.status="Turn";
			io.sockets.socket(table[Data.tableID].player7.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player1.status==="Playing" || table[Data.tableID].player1.status==="raise"){

			table[Data.tableID].player1.status="Turn";
			io.sockets.socket(table[Data.tableID].player1.id, true).emit("Turn","");
		}


	}else if(table[Data.tableID].player3.id===client.id){
		table[Data.tableID].player3.card1="";
		table[Data.tableID].player3.card2="";
		table[Data.tableID].player3.status="fold";



		 if(table[Data.tableID].player4.status==="Playing" || table[Data.tableID].player4.status==="raise"){

			table[Data.tableID].player4.status="Turn";
			io.sockets.socket(table[Data.tableID].player4.id, true).emit("Turn","");

		}else if(table[Data.tableID].player5.status==="Playing" || table[Data.tableID].player5.status==="raise"){

			table[Data.tableID].player5.status="Turn";
			io.sockets.socket(table[Data.tableID].player5.id, true).emit("Turn","");

		}else if(table[Data.tableID].player6.status==="Playing" || table[Data.tableID].player6.status==="raise"){

			table[Data.tableID].player6.status="Turn";
			io.sockets.socket(table[Data.tableID].player6.id, true).emit("Turn","");

		}else if(table[Data.tableID].player7.status==="Playing" || table[Data.tableID].player7.status==="raise"){

			table[Data.tableID].player7.status="Turn";
			io.sockets.socket(table[Data.tableID].player7.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player1.status==="Playing" || table[Data.tableID].player1.status==="raise"){

			table[Data.tableID].player1.status="Turn";
			io.sockets.socket(table[Data.tableID].player1.id, true).emit("Turn","");
		}
		else if(table[Data.tableID].player2.status==="Playing" || table[Data.tableID].player2.status==="raise"){

			table[Data.tableID].player2.status="Turn";
			io.sockets.socket(table[Data.tableID].player2.id, true).emit("Turn","");
		
		}

		
	}else if(table[Data.tableID].player4.id===client.id){
		table[Data.tableID].player4.card1="";
		table[Data.tableID].player4.card2="";
		table[Data.tableID].player4.status="fold";


 if(table[Data.tableID].player5.status==="Playing" || table[Data.tableID].player5.status==="raise"){

			table[Data.tableID].player5.status="Turn";
			io.sockets.socket(table[Data.tableID].player5.id, true).emit("Turn","");

		}else if(table[Data.tableID].player6.status==="Playing" || table[Data.tableID].player6.status==="raise"){

			table[Data.tableID].player6.status="Turn";
			io.sockets.socket(table[Data.tableID].player6.id, true).emit("Turn","");

		}else if(table[Data.tableID].player7.status==="Playing" || table[Data.tableID].player7.status==="raise"){

			table[Data.tableID].player7.status="Turn";
			io.sockets.socket(table[Data.tableID].player7.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player1.status==="Playing" || table[Data.tableID].player1.status==="raise"){

			table[Data.tableID].player1.status="Turn";
			io.sockets.socket(table[Data.tableID].player1.id, true).emit("Turn","");
		}
		else if(table[Data.tableID].player2.status==="Playing" || table[Data.tableID].player2.status==="raise"){

			table[Data.tableID].player2.status="Turn";
			io.sockets.socket(table[Data.tableID].player2.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player3.status==="Playing" || table[Data.tableID].player3.status==="raise"){

			table[Data.tableID].player3.status="Turn";
			io.sockets.socket(table[Data.tableID].player3.id, true).emit("Turn","");

		}

		
	}else if(table[Data.tableID].player5.id===client.id){
		table[Data.tableID].player5.card1="";
		table[Data.tableID].player5.card2="";
		table[Data.tableID].player5.status="fold";



 		if(table[Data.tableID].player6.status==="Playing" || table[Data.tableID].player6.status==="raise"){

			table[Data.tableID].player6.status="Turn";
			io.sockets.socket(table[Data.tableID].player6.id, true).emit("Turn","");

		}else if(table[Data.tableID].player7.status==="Playing" || table[Data.tableID].player7.status==="raise"){

			table[Data.tableID].player7.status="Turn";
			io.sockets.socket(table[Data.tableID].player7.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player1.status==="Playing" || table[Data.tableID].player1.status==="raise"){

			table[Data.tableID].player1.status="Turn";
			io.sockets.socket(table[Data.tableID].player1.id, true).emit("Turn","");
		}
		else if(table[Data.tableID].player2.status==="Playing" || table[Data.tableID].player2.status==="raise"){

			table[Data.tableID].player2.status="Turn";
			io.sockets.socket(table[Data.tableID].player2.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player3.status==="Playing" || table[Data.tableID].player3.status==="raise"){

			table[Data.tableID].player3.status="Turn";
			io.sockets.socket(table[Data.tableID].player3.id, true).emit("Turn","");

		}else if(table[Data.tableID].player4.status==="Playing" || table[Data.tableID].player4.status==="raise"){

			table[Data.tableID].player4.status="Turn";
			io.sockets.socket(table[Data.tableID].player4.id, true).emit("Turn","");

		}



		
	}else if(table[Data.tableID].player6.id===client.id){
		table[Data.tableID].player6.card1="";
		table[Data.tableID].player6.card2="";
		table[Data.tableID].player6.status="fold";

		if(table[Data.tableID].player7.status==="Playing" || table[Data.tableID].player7.status==="raise"){

			table[Data.tableID].player7.status="Turn";
			io.sockets.socket(table[Data.tableID].player7.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player1.status==="Playing" || table[Data.tableID].player1.status==="raise"){

			table[Data.tableID].player1.status="Turn";
			io.sockets.socket(table[Data.tableID].player1.id, true).emit("Turn","");
		}
		else if(table[Data.tableID].player2.status==="Playing" || table[Data.tableID].player2.status==="raise"){

			table[Data.tableID].player2.status="Turn";
			io.sockets.socket(table[Data.tableID].player2.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player3.status==="Playing" || table[Data.tableID].player3.status==="raise"){

			table[Data.tableID].player3.status="Turn";
			io.sockets.socket(table[Data.tableID].player3.id, true).emit("Turn","");

		}else if(table[Data.tableID].player4.status==="Playing" || table[Data.tableID].player4.status==="raise"){

			table[Data.tableID].player4.status="Turn";
			io.sockets.socket(table[Data.tableID].player4.id, true).emit("Turn","");

		}else if(table[Data.tableID].player5.status==="Playing" || table[Data.tableID].player5.status==="raise"){

			table[Data.tableID].player5.status="Turn";
			io.sockets.socket(table[Data.tableID].player5.id, true).emit("Turn","");

		}
		
	}else if(table[Data.tableID].player7.id===client.id){
		table[Data.tableID].player7.card1="";
		table[Data.tableID].player7.card2="";
		table[Data.tableID].player7.status="fold";


		 if(table[Data.tableID].player1.status==="Playing" || table[Data.tableID].player1.status==="raise"){

			table[Data.tableID].player1.status="Turn";
			io.sockets.socket(table[Data.tableID].player1.id, true).emit("Turn","");
		}
		else if(table[Data.tableID].player2.status==="Playing" || table[Data.tableID].player2.status==="raise"){

			table[Data.tableID].player2.status="Turn";
			io.sockets.socket(table[Data.tableID].player2.id, true).emit("Turn","");
		
		}else if(table[Data.tableID].player3.status==="Playing" || table[Data.tableID].player3.status==="raise"){

			table[Data.tableID].player3.status="Turn";
			io.sockets.socket(table[Data.tableID].player3.id, true).emit("Turn","");

		}else if(table[Data.tableID].player4.status==="Playing" || table[Data.tableID].player4.status==="raise"){

			table[Data.tableID].player4.status="Turn";
			io.sockets.socket(table[Data.tableID].player4.id, true).emit("Turn","");

		}else if(table[Data.tableID].player5.status==="Playing" || table[Data.tableID].player5.status==="raise"){

			table[Data.tableID].player5.status="Turn";
			io.sockets.socket(table[Data.tableID].player5.id, true).emit("Turn","");

		}else if(table[Data.tableID].player6.status==="Playing" || table[Data.tableID].player6.status==="raise"){

			table[Data.tableID].player6.status="Turn";
			io.sockets.socket(table[Data.tableID].player6.id, true).emit("Turn","");
		
		}
		
	}




			var tableInfo={

				"Player1":table[Data.tableID].player1,
				"Player2":table[Data.tableID].player2,
				"Player3":table[Data.tableID].player3,
				"Player4":table[Data.tableID].player4,
				"Player5":table[Data.tableID].player5,
				"Player6":table[Data.tableID].player6,
				"Player7":table[Data.tableID].player7,
				"Card1":table[Data.tableID].card1,
				"Card2":table[Data.tableID].card2,
				"Card3":table[Data.tableID].card3,
				"TableStats":table[Data.tableID].tableStatus
			}
				


	


// this is the update that sould be send to every player on the table;
if(table[Data.tableID].player1.status!="empty"){
io.sockets.socket(table[Data.tableID].player1.id, true).emit("PlayersOnTable",tableInfo);
}
if(table[Data.tableID].player2.status!="empty"){
io.sockets.socket(table[Data.tableID].player2.id, true).emit("PlayersOnTable",tableInfo);
}

if(table[Data.tableID].player3.status!="empty"){
io.sockets.socket(table[Data.tableID].player3.id, true).emit("PlayersOnTable",tableInfo);
}

if(table[Data.tableID].player4.status!="empty"){
io.sockets.socket(table[Data.tableID].player4.id, true).emit("PlayersOnTable",tableInfo);
}

if(table[Data.tableID].player5.status!="empty"){
io.sockets.socket(table[Data.tableID].player5.id, true).emit("PlayersOnTable",tableInfo);
}

if(table[Data.tableID].player6.status!="empty"){
io.sockets.socket(table[Data.tableID].player6.id, true).emit("PlayersOnTable",tableInfo);
}

if(table[Data.tableID].player7.status!="empty"){
io.sockets.socket(table[Data.tableID].player7.id, true).emit("PlayersOnTable",tableInfo);
}



});

//==============================================================================================	
	
	client.on('disconnect',function(){
		


		for(i=0;i<15;i++){

			if(table[i].removePlayer(client.id)){
                

                if(table[i].playerPlaying<2){
                	table[i].tableStatus="available";
if(table[i].player1.status!="empty"){

table[i].player1.status="waiting";
table[i].player1.card1="";
table[i].player1.card2="";
}
if(table[i].player2.status!="empty"){
table[i].player2.status="waiting";
table[i].player2.card1="";
table[i].player2.card2="";
}

if(table[i].player3.status!="empty"){
table[i].player3.status="waiting";
table[i].player3.card1="";
table[i].player3.card2="";
}

if(table[i].player4.status!="empty"){
table[i].player4.status="waiting";
table[i].player4.card1="";
table[i].player4.card2="";
}

if(table[i].player5.status!="empty"){
table[i].player5.status="waiting";
table[i].player5.card1="";
table[i].player5.card2="";	

}

if(table[i].player6.status!="empty"){
table[i].player6.status="waiting";
table[i].player6.card1="";
table[i].player6.card2="";
}

if(table[i].player7.status!="empty"){
table[i].player7.status="waiting";
table[i].player7.card1="";
table[i].player7.card2="";
}

table[i].card1="";
table[i].card2="";
table[i].card3="";

                }



                else{
					
if(table[i].player1.status==="Playing" || table[i].player1.status==="raise"){

table[i].player1.status="Turn";
io.sockets.socket(table[i].player1.id, true).emit("Turn","");

}

if(table[i].player2.status==="Playing" || table[i].player2.status==="raise"){

table[i].player2.status="Turn";
io.sockets.socket(table[i].player2.id, true).emit("Turn","");

}


if(table[i].player3.status==="Playing" || table[i].player3.status==="raise"){

table[i].player3.status="Turn";
io.sockets.socket(table[i].player3.id, true).emit("Turn","");

}


if(table[i].player4.status==="Playing" || table[i].player4.status==="raise"){

table[i].player4.status="Turn";
io.sockets.socket(table[i].player4.id, true).emit("Turn","");

}


if(table[i].player5.status==="Playing" || table[i].player5.status==="raise"){

table[i].player5.status="Turn";
io.sockets.socket(table[i].player5.id, true).emit("Turn","");

}

if(table[i].player6.status==="Playing" || table[i].player6.status==="raise"){

table[i].player6.status="Turn";
io.sockets.socket(table[i].player6.id, true).emit("Turn","");

}


if(table[i].player7.status==="Playing" || table[i].player7.status==="raise"){

table[i].player7.status="Turn";
io.sockets.socket(table[i].player7.id, true).emit("Turn","");

}



        }
                
              	var tableInfo={

				"Player1":table[i].player1,
				"Player2":table[i].player2,
				"Player3":table[i].player3,
				"Player4":table[i].player4,
				"Player5":table[i].player5,
				"Player6":table[i].player6,
				"Player7":table[i].player7,
				"Card1":table[i].card1,
				"Card2":table[i].card2,
				"Card3":table[i].card3,
				"TableStats":table[i].tableStatus
			}
				

// this is the update that sould be send to every player on the table;
if(table[i].player1.status!="empty"){
io.sockets.socket(table[i].player1.id, true).emit("PlayersOnTable",tableInfo);
}
if(table[i].player2.status!="empty"){
io.sockets.socket(table[i].player2.id, true).emit("PlayersOnTable",tableInfo);
}

if(table[i].player3.status!="empty"){
io.sockets.socket(table[i].player3.id, true).emit("PlayersOnTable",tableInfo);
}

if(table[i].player4.status!="empty"){
io.sockets.socket(table[i].player4.id, true).emit("PlayersOnTable",tableInfo);
}

if(table[i].player5.status!="empty"){
io.sockets.socket(table[i].player5.id, true).emit("PlayersOnTable",tableInfo);
}

if(table[i].player6.status!="empty"){
io.sockets.socket(table[i].player6.id, true).emit("PlayersOnTable",tableInfo);
}

if(table[i].player7.status!="empty"){
io.sockets.socket(table[i].player7.id, true).emit("PlayersOnTable",tableInfo);
}


				//client.emit("PlayersOnTable",tableInfo);


				var lobby = {
				"table1" : table[0].getPlayingPlayer(),
				"table2" : table[1].getPlayingPlayer(),
				"table3" : table[2].getPlayingPlayer(),
				"table4" : table[3].getPlayingPlayer(),
				"table5" : table[4].getPlayingPlayer(),
				"table6" : table[5].getPlayingPlayer(),
				"table7" : table[6].getPlayingPlayer(),
				"table8" : table[7].getPlayingPlayer(),
				"table9" : table[8].getPlayingPlayer(),
				"table10" : table[9].getPlayingPlayer(),
				"table11" : table[10].getPlayingPlayer(),
				"table12" : table[11].getPlayingPlayer(),
				"table13" : table[12].getPlayingPlayer(),
				"table14" : table[13].getPlayingPlayer(),
				"table15" : table[14].getPlayingPlayer()
				}

				io.sockets.emit("LobbyInfo",lobby);


				break;
 
			}
		}
		console.log("client disconnected"+client.id);
		
	});
	

});


var interval = setInterval(function() {
  

i=0;

	for(i=0;i<15;i++){

	//	console.log("Status of "+i+" "+table[i].tableStatus+" "+table[i].playerPlaying);

	if(table[i].tableStatus==="Playing"){
			//decide winner if all players called
			var check=0;
			if(table[i].player1.status=="raise" || table[i].player1.status=="Playing" || table[i].player1.status=="Turn"){
				check++;
			}	
			if(table[i].player2.status=="raise" || table[i].player2.status=="Playing" || table[i].player2.status=="Turn"){
				check++;
			}
			if(table[i].player3.status=="raise" || table[i].player3.status=="Playing" || table[i].player3.status=="Turn"){
				check++;
			}
			if(table[i].player4.status=="raise" || table[i].player4.status=="Playing" || table[i].player4.status=="Turn"){
				check++;
			}
			if(table[i].player5.status=="raise" || table[i].player5.status=="Playing" || table[i].player5.status=="Turn"){
			 	check++;
			}
			if(table[i].player6.status=="raise" || table[i].player6.status=="Playing" || table[i].player6.status=="Turn"){
				check++;
			}
		    if(table[i].player7.status=="raise" || table[i].player7.status=="Playing" || table[i].player7.status=="Turn"){
		    	check++;
			}

			var point1=0;
			var point2=0;
			var point3=0;
			var point4=0;
			var point5=0;
			var point6=0;
			var point7=0;

			if(check==0){
					
						var list=[];
						list.push(0);
						list.push(0);
						list.push(0);
						list.push(0);
						list.push(0);

						if(table[i].player1.status==="call"){
						list[0]=(table[i].card1)%13;
						list[1]=(table[i].card2)%13;
						list[2]=(table[i].card3)%13;
						list[3]=(table[i].player1.card1)%13;
						list[4]=(table[i].player1.card2)%13;
						point1+=list[3];
						point1+=list[4];
							for(j=0;j<5;j++){
								for(k=j;k<5;k++){
									if(list[j]>list[k]){
										var t=list[j];
										list[j]=list[k];
										list[k]=t;
									}
								}
							}
							console.log("\nHamza Dataaatatat 1st"+list);
							point1+=1000;
								// ============== Set Decider
								var temp=list[0];
								for(p=1;p<5;p++){
									temp++;
									if(temp==list[p]){
										point1+=point1;
									}else{
										temp=list[p];
									}
								}
								//=====Frequencies;
								var templist=[];
								for(y=0;y<13;y++){templist.push(0);}
								for(x=0;x<13;x++){
									for(t=0;t<5;t++){
										if(x==list[t]){
											templist[x]++;
										}
									}
								}
								// frequency checked
								for(q=0;q<13;q++){
									point1+=templist[q]*1500;
								}

								console.log("Player1 Point = "+point1);
						}

						if(table[i].player2.status==="call"){
						list[0]=(table[i].card1)%13;
						list[1]=(table[i].card2)%13;
						list[2]=(table[i].card3)%13;
						list[3]=(table[i].player2.card1)%13;
						list[4]=(table[i].player2.card2)%13;
						point2+=list[3];
						point2+=list[4];
							for(j=0;j<5;j++){
								for(k=j;k<5;k++){
									if(list[j]>list[k]){
										var t=list[j];
										list[j]=list[k];
										list[k]=t;
									}
								}
							}
							console.log("\nHamza Dataaatatat 1st"+list);
							point2+=1000;
								// ============== Set Decider
								var temp=list[0];
								for(p=1;p<5;p++){
									temp++;
									if(temp==list[p]){
										point2+=point2;
									}else{
										temp=list[p];
									}
								}
								//=====Frequencies;
								var templist=[];
								for(y=0;y<13;y++){templist.push(0);}
								for(x=0;x<13;x++){
									for(t=0;t<5;t++){
										if(x==list[t]){
											templist[x]++;
										}
									}
								}
								// frequency checked
								for(q=0;q<13;q++){
									point2+=templist[q]*1500;
								}

								console.log("Player2 Point = "+point2);
						}
						if(table[i].player3.status==="call"){
						list[0]=(table[i].card1)%13;
						list[1]=(table[i].card2)%13;
						list[2]=(table[i].card3)%13;
						list[3]=(table[i].player3.card1)%13;
						list[4]=(table[i].player3.card2)%13;
						point3+=list[3];
						point3+=list[4];
							for(j=0;j<5;j++){
								for(k=j;k<5;k++){
									if(list[j]>list[k]){
										var t=list[j];
										list[j]=list[k];
										list[k]=t;
									}
								}
							}
							console.log("\nHamza Dataaatatat 1st"+list);
							point3+=1000;
								// ============== Set Decider
								var temp=list[0];
								for(p=1;p<5;p++){
									temp++;
									if(temp==list[p]){
										point3+=point3;
									}else{
										temp=list[p];
									}
								}
								//=====Frequencies;
								var templist=[];
								for(y=0;y<13;y++){templist.push(0);}
								for(x=0;x<13;x++){
									for(t=0;t<5;t++){
										if(x==list[t]){
											templist[x]++;
										}
									}
								}
								// frequency checked
								for(q=0;q<13;q++){
									point3+=templist[q]*1500;
								}

								console.log("Player3 Point = "+point3);
						}
						if(table[i].player4.status==="call"){
						list[0]=(table[i].card1)%13;
						list[1]=(table[i].card2)%13;
						list[2]=(table[i].card3)%13;
						list[3]=(table[i].player4.card1)%13;
						list[4]=(table[i].player4.card2)%13;
						point4+=list[3];
						point4+=list[4];
							for(j=0;j<5;j++){
								for(k=j;k<5;k++){
									if(list[j]>list[k]){
										var t=list[j];
										list[j]=list[k];
										list[k]=t;
									}
								}
							}
							console.log("\nHamza Dataaatatat 1st"+list);
							point4+=1000;
								// ============== Set Decider
								var temp=list[0];
								for(p=1;p<5;p++){
									temp++;
									if(temp==list[p]){
										point4+=point4;
									}else{
										temp=list[p];
									}
								}
								//=====Frequencies;
								var templist=[];
								for(y=0;y<13;y++){templist.push(0);}
								for(x=0;x<13;x++){
									for(t=0;t<5;t++){
										if(x==list[t]){
											templist[x]++;
										}
									}
								}
								// frequency checked
								for(q=0;q<13;q++){
									point4+=templist[q]*1500;
								}

								console.log("Player4 Point = "+point4);
						}
						if(table[i].player5.status==="call"){
						list[0]=(table[i].card1)%13;
						list[1]=(table[i].card2)%13;
						list[2]=(table[i].card3)%13;
						list[3]=(table[i].player5.card1)%13;
						list[4]=(table[i].player5.card2)%13;
						point5+=list[3];
						point5+=list[4];
							for(j=0;j<5;j++){
								for(k=j;k<5;k++){
									if(list[j]>list[k]){
										var t=list[j];
										list[j]=list[k];
										list[k]=t;
									}
								}
							}
							console.log("\nHamza Dataaatatat 1st"+list);
							point5+=1000;
								// ============== Set Decider
								var temp=list[0];
								for(p=1;p<5;p++){
									temp++;
									if(temp==list[p]){
										point5+=point5;
									}else{
										temp=list[p];
									}
								}
								//=====Frequencies;
								var templist=[];
								for(y=0;y<13;y++){templist.push(0);}
								for(x=0;x<13;x++){
									for(t=0;t<5;t++){
										if(x==list[t]){
											templist[x]++;
										}
									}
								}
								// frequency checked
								for(q=0;q<13;q++){
									point5+=templist[q]*1500;
								}

								console.log("Player5 Point = "+point5);
						}

						if(table[i].player6.status==="call"){
						list[0]=(table[i].card1)%13;
						list[1]=(table[i].card2)%13;
						list[2]=(table[i].card3)%13;
						list[3]=(table[i].player6.card1)%13;
						list[4]=(table[i].player6.card2)%13;
						point6+=list[3];
						point6+=list[4];
							for(j=0;j<5;j++){
								for(k=j;k<5;k++){
									if(list[j]>list[k]){
										var t=list[j];
										list[j]=list[k];
										list[k]=t;
									}
								}
							}
							console.log("\nHamza Dataaatatat 1st"+list);
							point6+=1000;
								// ============== Set Decider
								var temp=list[0];
								for(p=1;p<5;p++){
									temp++;
									if(temp==list[p]){
										point6+=point6;
									}else{
										temp=list[p];
									}
								}
								//=====Frequencies;
								var templist=[];
								for(y=0;y<13;y++){templist.push(0);}
								for(x=0;x<13;x++){
									for(t=0;t<5;t++){
										if(x==list[t]){
											templist[x]++;
										}
									}
								}
								// frequency checked
								for(q=0;q<13;q++){
									point6+=templist[q]*1500;
								}

								console.log("Player6 Point = "+point6);
						}

						if(table[i].player7.status==="call"){
						list[0]=(table[i].card1)%13;
						list[1]=(table[i].card2)%13;
						list[2]=(table[i].card3)%13;
						list[3]=(table[i].player7.card1)%13;
						list[4]=(table[i].player7.card2)%13;
						point7+=list[3];
						point7+=list[4];
							for(j=0;j<5;j++){
								for(k=j;k<5;k++){
									if(list[j]>list[k]){
										var t=list[j];
										list[j]=list[k];
										list[k]=t;
									}
								}
							}
							console.log("\nHamza Dataaatatat 1st"+list);
							point7+=1000;
								// ============== Set Decider
								var temp=list[0];
								for(p=1;p<5;p++){
									temp++;
									if(temp==list[p]){
										point7+=point7;
									}else{
										temp=list[p];
									}
								}
								//=====Frequencies;
								var templist=[];
								for(y=0;y<13;y++){templist.push(0);}
								for(x=0;x<13;x++){
									for(t=0;t<5;t++){
										if(x==list[t]){
											templist[x]++;
										}
									}
								}
								// frequency checked
								for(q=0;q<13;q++){
									point7+=templist[q]*1500;
								}

								console.log("Player7 Point = "+point7);
						}


						var winner=[];
						for(w=0;w<7;w++){
							winner.push(0);
						}
						winner[0]=point1;
						winner[1]=point2;
						winner[2]=point3;
						winner[3]=point4;
						winner[4]=point5;
						winner[5]=point6;
						winner[6]=point7;

						for(j=0;j<7;j++){
							for(k=j;k<7;k++){
								if(winner[j]>winner[k]){
									var temp=winner[j];
									winner[j]=winner[k];
									winner[k]=temp;
								}
							}
						}

						var win=winner[6];

						if(win==point1){
							table[i].player1.chips+=table[i].p2+table[i].p3+table[i].p1+table[i].p4+table[i].p5+table[i].p6+table[i].p7;
						}
						else if(win==point2){
							table[i].player2.chips+=table[i].p2+table[i].p3+table[i].p1+table[i].p4+table[i].p5+table[i].p6+table[i].p7;
						}
						else if(win==point3){
							table[i].player3.chips+=table[i].p2+table[i].p3+table[i].p1+table[i].p4+table[i].p5+table[i].p6+table[i].p7;
						}
						else if(win==point4){
							table[i].player4.chips+=table[i].p2+table[i].p3+table[i].p1+table[i].p4+table[i].p5+table[i].p6+table[i].p7;
						}
						else if(win==point5){
							table[i].player5.chips+=table[i].p2+table[i].p3+table[i].p1+table[i].p4+table[i].p5+table[i].p6+table[i].p7;
						}
						else if(win==point6){
							table[i].player6.chips+=table[i].p2+table[i].p3+table[i].p1+table[i].p4+table[i].p5+table[i].p6+table[i].p7;
						}
						else if(win==point7){
							table[i].player7.chips+=table[i].p2+table[i].p3+table[i].p1+table[i].p4+table[i].p5+table[i].p6+table[i].p7;
						}
						table[i].p1=0;
						table[i].p2=0;
						table[i].p3=0;
						table[i].p4=0;
						table[i].p5=0;
						table[i].p6=0;
						table[i].p7=0;

			table[i].tableStatus="available";

			if(table[i].player1.status!="empty"){
				//table[i].player1.playerID;
             var conditions = { "username" : table[i].player1.playerID }
 			 , update = { "chips":table[i].player1.chips}
  			, options = { "":"" };

			User.update(conditions, update, options, callback);

			function callback (err, numAffected) {
  // numAffected is the number of updated documents
}


			table[i].player1.status="waiting";
			table[i].player1.card1="";
			table[i].player1.card2="";
			}	
			if(table[i].player2.status!="empty"){
		 var conditions = { "username" : table[i].player2.playerID }
 			 , update = { "chips":table[i].player2.chips};
  			//, options = { "":"" };

			User.update(conditions, update, options, callback);

		function callback (err, numAffected) {
  // numAffected is the number of updated documents
}
				table[i].player2.status="waiting";
				table[i].player2.card1="";
			table[i].player2.card2="";
			}
			if(table[i].player3.status!="empty"){


				 var conditions = { "username" : table[i].player3.playerID }
 			 , update = { "chips":table[i].player3.chips}
  			, options = { "":"" };

			User.update(conditions, update, options, callback);

		function callback (err, numAffected) {
  // numAffected is the number of updated documents
}
	
			table[i].player3.status="waiting";
			table[i].player3.card1="";
			table[i].player3.card2="";

			}
			if(table[i].player4.status!="empty"){
		
 var conditions = { "username" : table[i].player4.playerID }
 			 , update = { "chips":table[i].player4.chips}
  			, options = { "":"" };

			User.update(conditions, update, options, callback);

		function callback (err, numAffected) {
  // numAffected is the number of updated documents
}


			table[i].player4.status="waiting";
			table[i].player4.card1="";
			table[i].player4.card2="";

			}
			 if(table[i].player5.status!="empty"){

 var conditions = { "username" : table[i].player5.playerID }
 			 , update = { "chips":table[i].player5.chips}
  			, options = { "":"" };

			User.update(conditions, update, options, callback);

		function callback (err, numAffected) {
  // numAffected is the number of updated documents
}

			
			table[i].player5.status="waiting";
			table[i].player5.card1="";
			table[i].player5.card2="";

			}
			 if(table[i].player6.status!="empty"){


 var conditions = { "username" : table[i].player6.playerID }
 			 , update = { "chips":table[i].player6.chips}
 			 , options = { "":"" };

			User.update(conditions, update, options, callback);

			function callback (err, numAffected) {
  			// numAffected is the number of updated documents
			}
		
			table[i].player6.status="waiting";
			table[i].player6.card1="";
			table[i].player6.card2="";

			}
			 if(table[i].player7.status!="empty"){

 var conditions = { "username" : table[i].player7.playerID }
 			 , update = { "chips":table[i].player7.chips}
  			, options = { "":"" };

			User.update(conditions, update, options, callback);

			
function callback (err, numAffected) {
  // numAffected is the number of updated documents
}


			table[i].player7.status="waiting";
			table[i].player7.card1="";
			table[i].player7.card2="";

			}
						table[i].ResetDeck();
table[i].card1="";
table[i].card2="";
table[i].card3="";
				
				var tableInfo={

				"Player1":table[i].player1,
				"Player2":table[i].player2,
				"Player3":table[i].player3,
				"Player4":table[i].player4,
				"Player5":table[i].player5,
				"Player6":table[i].player6,
				"Player7":table[i].player7,
				"Card1":table[i].card1,
				"Card2":table[i].card2,
				"Card3":table[i].card3,
				"TableStatus":table[i].tableStatus
			}


				 var TableBets = {
				"p1" : table[i].p1,
				"p2" : table[i].p2,
				"p3" : table[i].p3,
				"p4" : table[i].p4,
				"p5" : table[i].p5,
				"p6" : table[i].p6,
				"p7" : table[i].p7
				}
				

// this is the update that sould be send to every player on the table;
if(table[i].player1.status!="empty"){
io.sockets.socket(table[i].player1.id, true).emit("PlayersOnTable",tableInfo);
io.sockets.socket(table[i].player1.id, true).emit("PlayersBets",TableBets);
}
if(table[i].player2.status!="empty"){
io.sockets.socket(table[i].player2.id, true).emit("PlayersOnTable",tableInfo);
io.sockets.socket(table[i].player2.id, true).emit("PlayersBets",TableBets);
}

if(table[i].player3.status!="empty"){
io.sockets.socket(table[i].player3.id, true).emit("PlayersOnTable",tableInfo);
io.sockets.socket(table[i].player3.id, true).emit("PlayersBets",TableBets);

}

if(table[i].player4.status!="empty"){
io.sockets.socket(table[i].player4.id, true).emit("PlayersOnTable",tableInfo);
io.sockets.socket(table[i].player4.id, true).emit("PlayersBets",TableBets);

}

if(table[i].player5.status!="empty"){
io.sockets.socket(table[i].player5.id, true).emit("PlayersOnTable",tableInfo);
io.sockets.socket(table[i].player5.id, true).emit("PlayersBets",TableBets);

}

if(table[i].player6.status!="empty"){
io.sockets.socket(table[i].player6.id, true).emit("PlayersOnTable",tableInfo);
io.sockets.socket(table[i].player6.id, true).emit("PlayersBets",TableBets);

}

if(table[i].player7.status!="empty"){
io.sockets.socket(table[i].player7.id, true).emit("PlayersOnTable",tableInfo);
io.sockets.socket(table[i].player7.id, true).emit("PlayersBets",TableBets);

}
					

				
			}
	}
		else if(table[i].tableStatus==="available"  &&   table[i].playerPlaying>=2){
			

			table[i].tableStatus="Playing";
			
			table[i].ResetDeck();

			table[i].card1=table[i].GiveCardAfterShuffle();
			table[i].card2=table[i].GiveCardAfterShuffle();
			table[i].card3=table[i].GiveCardAfterShuffle();




			if(table[i].player1.status!="empty"){
			table[i].player1.status="Playing";
			
			table[i].player1.card1=table[i].GiveCardAfterShuffle();
			table[i].player1.card2=table[i].GiveCardAfterShuffle();

			}	
			if(table[i].player2.status!="empty"){
				table[i].player2.card1=table[i].GiveCardAfterShuffle();
				table[i].player2.card2=table[i].GiveCardAfterShuffle();
				table[i].player2.status="Playing";
			
			}
			if(table[i].player3.status!="empty"){
			
			table[i].player3.card1=table[i].GiveCardAfterShuffle();
			table[i].player3.card2=table[i].GiveCardAfterShuffle();
			table[i].player3.status="Playing";

			}
			if(table[i].player4.status!="empty"){
				table[i].player4.card1=table[i].GiveCardAfterShuffle();
			table[i].player4.card2=table[i].GiveCardAfterShuffle();
			table[i].player4.status="Playing";

			}
			 if(table[i].player5.status!="empty"){
				table[i].player5.card1=table[i].GiveCardAfterShuffle();
			table[i].player5.card2=table[i].GiveCardAfterShuffle();
			table[i].player5.status="Playing";

			}
			 if(table[i].player6.status!="empty"){
				table[i].player6.card1=table[i].GiveCardAfterShuffle();
			table[i].player6.card2=table[i].GiveCardAfterShuffle();
			table[i].player6.status="Playing";

			}
			 if(table[i].player7.status!="empty"){

			table[i].player7.card1=table[i].GiveCardAfterShuffle();
			table[i].player7.card2=table[i].GiveCardAfterShuffle();
			table[i].player7.status="Playing";

			}




			if(table[i].player1.status!="empty"){
				table[i].player1.status="Turn";
				io.sockets.socket(table[i].player1.id, true).emit("Turn","");
	
			}	
			else if(table[i].player2.status!="empty"){

				table[i].player2.status="Turn";
				io.sockets.socket(table[i].player2.id, true).emit("Turn","");
	
			}
			else if(table[i].player3.status!="empty"){
				table[i].player3.status="Turn";
				io.sockets.socket(table[i].player3.id, true).emit("Turn","");
	
			}
			else if(table[i].player4.status!="empty"){
				table[i].player4.status="Turn";
				io.sockets.socket(table[i].player4.id, true).emit("Turn","");

			}
			else if(table[i].player5.status!="empty"){
				table[i].player5.status="Turn";
				io.sockets.socket(table[i].player5.id, true).emit("Turn","");

			}
			else if(table[i].player6.status!="empty"){
				table[i].player6.status="Turn";
				io.sockets.socket(table[i].player6.id, true).emit("Turn","");

			}
			else if(table[i].player7.status!="empty"){
				table[i].player7.status="Turn";
				io.sockets.socket(table[i].player7.id, true).emit("Turn","");
	
			}




			// sending complete data of table

			var tableInfo={

				"Player1":table[i].player1,
				"Player2":table[i].player2,
				"Player3":table[i].player3,
				"Player4":table[i].player4,
				"Player5":table[i].player5,
				"Player6":table[i].player6,
				"Player7":table[i].player7,
				"Card1":table[i].card1,
				"Card2":table[i].card2,
				"Card3":table[i].card3,
				"TableStatus":table[i].tableStatus
			}


			
			
	}


			    var TableBets = {
				"p1" : table[i].p1,
				"p2" : table[i].p2,
				"p3" : table[i].p3,
				"p4" : table[i].p4,
				"p5" : table[i].p5,
				"p6" : table[i].p6,
				"p7" : table[i].p7
				}
				

// this is the update that sould be send to every player on the table;
if(table[i].player1.status!="empty"){
io.sockets.socket(table[i].player1.id, true).emit("PlayersOnTable",tableInfo);
io.sockets.socket(table[i].player1.id, true).emit("PlayersBets",TableBets);
}
if(table[i].player2.status!="empty"){
io.sockets.socket(table[i].player2.id, true).emit("PlayersOnTable",tableInfo);
io.sockets.socket(table[i].player2.id, true).emit("PlayersBets",TableBets);
}

if(table[i].player3.status!="empty"){
io.sockets.socket(table[i].player3.id, true).emit("PlayersOnTable",tableInfo);
io.sockets.socket(table[i].player3.id, true).emit("PlayersBets",TableBets);

}

if(table[i].player4.status!="empty"){
io.sockets.socket(table[i].player4.id, true).emit("PlayersOnTable",tableInfo);
io.sockets.socket(table[i].player4.id, true).emit("PlayersBets",TableBets);

}

if(table[i].player5.status!="empty"){
io.sockets.socket(table[i].player5.id, true).emit("PlayersOnTable",tableInfo);
io.sockets.socket(table[i].player5.id, true).emit("PlayersBets",TableBets);

}

if(table[i].player6.status!="empty"){
io.sockets.socket(table[i].player6.id, true).emit("PlayersOnTable",tableInfo);
io.sockets.socket(table[i].player6.id, true).emit("PlayersBets",TableBets);

}

if(table[i].player7.status!="empty"){
io.sockets.socket(table[i].player7.id, true).emit("PlayersOnTable",tableInfo);
io.sockets.socket(table[i].player7.id, true).emit("PlayersBets",TableBets);

}


}










		
    },10000);

