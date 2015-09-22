/**
 * table class
 */
var Player=require("./player.js");

function Table(tableID){





	this.startingcardnumber=0;


	this.Deck=[];

	for (x=0;x<52;x++){
		this.Deck.push(false);
	}

	this.id = tableID;
	this.readyToPlayCounter = 0;
	this.playerPlaying = 0;
	
	this.p1=0;
	this.p2=0;
	this.p3=0;
	this.p4=0;
	this.p5=0;
	this.p6=0;
	this.p7=0;

	this.player1 = new Player("");
	this.player2 = new Player("");
	this.player3 = new Player("");
	this.player4 = new Player("");
	this.player5 = new Player("");
	this.player6 = new Player("");
	this.player7 = new Player("");
	
	

	this.card1="empty";
	this.card2="empty";
	this.card3="empty";


	this.tableStatus="available";

}




Table.prototype.addPlayer=function(player){
	// find free index first then we will add player on that index;
	if(this.player1.getStatus()==="empty"){
		this.playerPlaying++;
		this.player1=player;
		
		return 1;

		
	}else if(this.player2.getStatus()==="empty"){
	
		this.playerPlaying++;
		this.player2=player;

		return 2;
		
	}
	else if(this.player3.getStatus()==="empty"){
		
		this.playerPlaying++;
		this.player3=player;
		
		return 3;
	}
	else if(this.player4.getStatus()==="empty"){
	
		this.playerPlaying++;
		
		this.player4=player;

		return 4;
	}
	else if(this.player5.getStatus()==="empty"){
	
		this.playerPlaying++;
		this.player5=player;

		return 5;
		
	}
	else if(this.player6.getStatus()==="empty"){
		
		this.playerPlaying++;
		this.player6=player;

		
		return 6;
	
		
	}
	else if(this.player7.getStatus()==="empty"){
		
		this.playerPlaying++;
		this.player7=player;

		return 7;
		
	}


	





};



Table.prototype.ReadyToPlay = function(){
	this.tableStatus="playing";
	this.card1=this.GiveCardAfterShuffle();
	this.card2=this.GiveCardAfterShuffle();
	this.card3=this.GiveCardAfterShuffle();





};

Table.prototype.removePlayer=function(playerid){
	
	if(this.player1.getID()===playerid){

	


		this.player1 = new Player("");
		this.playerPlaying--;
		return true;
	}
	else if(this.player2.getID()===playerid){



		this.player2=new Player("");
		this.playerPlaying--;
		return true;
	}
	else if(this.player3.getID()===playerid){


		this.player3=new Player("");
		this.playerPlaying--;
		return true;
	}
	else if(this.player4.getID()===playerid){
		



		this.player4=new Player("");
		this.playerPlaying--;
		return true;
	}
	else if(this.player5.getID()===playerid){


		this.player5=new Player("");
		this.playerPlaying--;
		return true;
	}
	else if(this.player6.getID()===playerid){


		this.player6=new Player("");
		this.playerPlaying--;
		return true;
	}
	else if(this.player7.getID()===playerid){


		this.player7=new Player("");
		this.playerPlaying--;
		return true;
	}


if(this.playerPlaying<2){
	this.tableStatus="available";
}

	return false;


	
};


Table.prototype.getTableID=function(){
	return this.id;
};

Table.prototype.getPlayingPlayer=function(){
	return this.playerPlaying;
};






Table.prototype.GiveCardAfterShuffle=function(){
	this.startingcardnumber=Math.floor(Math.random() * (51 - 0 ) + 0);
	while(this.Deck[this.startingcardnumber]){
		this.startingcardnumber=Math.floor(Math.random() * (51 - 0 ) + 0);
	}
	this.Deck[this.startingcardnumber]=true;
	return (this.startingcardnumber+1).toString();
};



Table.prototype.ResetDeck = function(){
	/* body... */


	for(i=0;i<52;i++){
		this.Deck[i]=false;
		console.log("ok ke awaz arhi ha "+this.Deck[i]+" at "+i+" "+this.tableStatus+" "+this.playerPlaying+"\n");
	}
};


module.exports=Table;