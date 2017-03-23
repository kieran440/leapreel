var lastThrow = null;
var leapInfo = null;
var isServerConnected = null;
var controller = null;
var options = null;
var isConnected = null;
var canDrag = true;
// how long it should wait after a throw before allowing image dragging after a throw
const throwTimer = 0.08; 
// the minimum velocity to drag a image
const dragVelocityThreshold = 100;
// the minimum velocity to throw
const throwVelocityThreshold = 1000;
// should be the same as data-throwable value
const throwVelocity = 1.5;

init();

function init()
{
	lastThrow = new Date();

	leapInfo = this.leapInfo = document.getElementById('leapInfo');
	isServerConnected = false;
	isConnected: true;
	options = {enableGestures: false};

	// give initial feedback regarding leap motion controller
	updateInfo();

	controller = new Leap.Controller();
	controller.connect();

	controller.on('streamingStarted', (function(){
		isConnected = true;
		updateInfo();
	}));

	controller.on('deviceStopped', (function(){
		isConnected = false;
		updateInfo();
	}));

	controller.on('connect', (function()
	{
		isServerConnected = true;
		updateInfo();
	}));

	Leap.loop(options, onFrame);
}

function updateInfo()
{
	if(!isServerConnected)
	{
		leapInfo.innerHTML = 'Waiting for the Leap Motion Controller server...';
		leapInfo.style.display = 'block';
	}
	else if(isConnected)
	{
		leapInfo.innerHTML = '';
		leapInfo.style.display = 'none';
	}
	else if(!isConnected)
	{
		leapInfo.innerHTML = 'Please connect your Leap Motion Controller if you want to use it.';
		leapInfo.style.display = 'block';
	}
}

function onFrame(frame)
{
	//console.log("Frame event for frame " + frame.id);

    if(!isConnected || !frame.valid) return;

  	// Retrieves first hand - no need to get it by ID, since we're not fetching hand based time behaviour
  	if (frame.hands.length > 0) {

  		hand = frame.hands[0];

  		var velocityX = hand.palmVelocity[0];

  		// debug
  		console.log(velocityX);

  		if (!canDoGesture()){
  			return;
  		}

  		if (velocityX > dragVelocityThreshold){
  			$('#image').trigger("stepRight");
  		}
  		else if (velocityX < -dragVelocityThreshold){
  			$('#image').trigger("stepLeft");
  		}

  		if (velocityX < -throwVelocityThreshold || velocityX > throwVelocityThreshold){
			$('#image').reel('velocity', throwVelocity);
			lastThrow = new Date();
  		} 

  	}
}

function canDoGesture()
{
	var now = new Date();
	var diff = now.getTime() - lastThrow.getTime();

	var days = Math.floor(diff / (1000 * 60 * 60 * 24));
	diff -=  days * (1000 * 60 * 60 * 24);

	var hours = Math.floor(diff / (1000 * 60 * 60));
	diff -= hours * (1000 * 60 * 60);

	var mins = Math.floor(diff / (1000 * 60));
	diff -= mins * (1000 * 60);

	var seconds = Math.floor(diff / (1000));
	diff -= seconds * (1000);

	if (days > 0 || hours > 0 || mins > 0 || seconds > throwTimer) {
		return true;
	}

	return false;
}