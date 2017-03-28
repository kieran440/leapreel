var lastThrow = null;
var leapInfo = null;
var isServerConnected = null;
var controller = null;
var options = null;
var isConnected = null;

// how many seconds it should wait after a throw before allowing image dragging again
const throwTimer = 0.8; 
// the minimum velocity to drag a image
const dragVelocityThreshold = 100;
// the minimum velocity to throw
const throwVelocityThreshold = 800;
// should be the same as data-throwable value
const throwVelocity = 1.5;
// the image HTML id
const imageID = 'image';

// leap motion html element ID
const leapID = 'leapInfo';
// leap motion warning messages
const leapServerMessage = 'Waiting for the Leap Motion Controller server...';
const leapConnectMessage = 'Please connect your Leap Motion Controller if you want to use it.';
const leapConnectedMessage = '';

init();

function init()
{
	lastThrow = new Date();

	leapInfo = this.leapInfo = document.getElementById(leapID);
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
		leapInfo.innerHTML = leapServerMessage;
		leapInfo.style.display = 'block';
	}
	else if(isConnected)
	{
		leapInfo.innerHTML = leapConnectedMessage;

		if (leapConnectedMessage === ''){
			leapInfo.style.display = 'none';
		}
	}
	else if(!isConnected)
	{
		leapInfo.innerHTML = leapConnectMessage;
		leapInfo.style.display = 'block';
	}
}

function onFrame(frame)
{
    if(!isConnected || !frame.valid || frame.hands.length <= 0 || !canDoGesture()) {
    	return;
    }

    //console.log("Frame event for frame " + frame.id);

	var velocityX = frame.hands[0].palmVelocity[0];
	//console.log(velocityX);

	// stepping Right or Left?
	var steppingRight = velocityX >= 0 ? true : false;
	//console.log(steppingRight);

	if (velocityX < -throwVelocityThreshold || velocityX > throwVelocityThreshold){
		// make sure to change direction before throwing! Just one step in the right direction :)
		jumpSteps(1, steppingRight);
		$('#' + imageID).reel('velocity', throwVelocity);
		lastThrow = new Date();
		// no need to go further when throwing
		return;
	} 

	var transform = Math.round(velocityX / dragVelocityThreshold);
	//console.log(transform);

	jumpSteps(transform, steppingRight);
}

function jumpSteps(nSteps, steppingRight){
	var stepCode = steppingRight ? 'stepRight' : 'stepLeft';

	// make it positive
	nSteps = Math.abs(nSteps);

	// for performance reasons (at least in chrome and firefox), it's better to use a while loop (vs. for)
	while(nSteps--){
		$('#' + imageID).trigger(stepCode);
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