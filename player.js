/**
 * Player class
 */


function Player(PlayerID) {
	this.id = PlayerID;
	this.playerID =""; // we are using this for email or facebook user id...
	this.name = "";
	this.tableID = "";
	this.status = "empty";
	this.myturn = 0;
	this.facebookuser=false;
	this.playerLevel=1;
	this.mynumber=0;
	this.male=true;
	// need to add player chips
	this.chips=0;
	this.card1="empty";
	this.card2="empty";
	
	
}

// setters of player
Player.prototype.setID=function(playerID){
	this.id=playerID;
};
Player.prototype.setPlayerID = function(pictureID){
	this.playerID=pictureID;
};
Player.prototype.setName = function(name){
	this.name=name;
	
};

Player.prototype.settableID = function(tableID){
	this.tableID=tableID;
};
Player.prototype.setStatus = function(status){
	this.status=status;
};
Player.prototype.setMyTurn = function(myturn){
	this.myturn=myturn;
};

Player.prototype.setCard1 = function(card1){
	this.card1=card1;
};

Player.prototype.setcard2 = function(card2){
	this.card2=card2;
};

// gettters of player

Player.prototype.getID=function(){
	return this.id;
};
Player.prototype.getPlayerID = function(){
	return this.playerID;
};
Player.prototype.getName = function(){
	return this.name;
};
Player.prototype.gettableID = function(){
	return this.tableID;
};
Player.prototype.getStatus = function(){
	return this.status;
};
Player.prototype.getMyTurn = function(){
	return this.myturn;
};

Player.prototype.getCard1 = function(){
	return this.card1;
};
Player.prototype.getcard2 = function(){
	return this.card2;
};



module.exports=Player;