/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/* Globals * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

const initializationTime = 2500;

var timeBetweenBeeps = 750;

var sequence = [];
var pushedPad = [];
var timeIsUp = [];

var gameOverTime = 6000;

var speedLevel;
var speedRate = 75;

var simonTouches;

var gameLevelCookie = "gameLevelCookie";
var speedLevelCookie = "speedLevelCookie";

// Starting cookies' values.
if(getCookie(gameLevelCookie) !== ""){
  // If cookie exists, then set the game level to its value.
  $(".form-check-input[name='inlineRadioOptions1']")[getCookie(gameLevelCookie) - 1].checked = true;
}else{
  // Else, set the cookie value.
  setCookie(gameLevelCookie,selectedLevel(1),1);
}

if(getCookie(speedLevelCookie) !== ""){
  // If cookie exists, then set the speed level to its value.
  $(".form-check-input[name='inlineRadioOptions2']")[getCookie(speedLevelCookie) - 1].checked = true;
}else{
  // Else, set the cookie value.
  setCookie(speedLevelCookie,selectedLevel(2),1);
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/* On Click Event Listener (ON/OFF Button) * * * * * * * * * * * * * * * * * * * * */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

$(".center img").on("click", function () {
  // Refresh cookies' values.
  setCookie(gameLevelCookie,selectedLevel(1),1);
  setCookie(speedLevelCookie,selectedLevel(2),1);

  // Check the GAME and SPEED levels in the settings panel.
  if(getCookie(gameLevelCookie) !== ""){
    selectGameLevel(getCookie(gameLevelCookie));
    selectSpeedLevel(getCookie(speedLevelCookie));
  }else{
    selectGameLevel(selectedLevel(1));
    selectSpeedLevel(selectedLevel(2));
  }
  
  // Just a touch of style when clicking the ON/OFF button.
  lowerBrightness(this);        // Reducing brightness of the ON/OFF button.
  restoreBrightness(this, 250); // Restoring brightness of the ON/OFF button.
  playIntroSound();             // Play intro sound.
  blinkPadsNTimes(7);           // Animation before the starting game.

  // Starts the game after initializationTime milliseconds.
  setTimeout(startGame, initializationTime);

});

function userTurn(){
  clearTimeout(timeIsUp[0]);
  timeIsUp.pop();
  simonTouches -= 2;
  pushedPad.push(parseInt($(this).attr("src").charAt(4)));
  timeIsUp.push(setTimeout(gameOver, gameOverTime));

  lowerBrightness(this);
  restoreBrightness(this, 250);
  pushPadSound();
  playPadSound(parseInt($(this).attr("src").charAt(4)));
  checkSequence(sequence, pushedPad);
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/* Game logic  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function startGame(){
  // Allow user to push pads.
  $(".clickable img").on("click", userTurn);

  // Select a random number between 1 and 4.
  var randomNumber = Math.floor(Math.random() * 4) + 1;
  sequence.push(randomNumber);

  // Check and change time between beeps if round is 5, 9 or 13.
  if(sequence.length - 1 === 5){
    timeBetweenBeeps -= speedRate;
  }
  if(sequence.length - 1 === 9){
    timeBetweenBeeps -= speedRate;
  }
  if(sequence.length - 1 === 13){
    timeBetweenBeeps -= speedRate;
  }

  // Simon turn.
  simonTouches = 0;
  for(var i = 0; i < sequence.length; i++){
    setTimeout(playPadSound, timeBetweenBeeps * i, sequence[i]);
    setTimeout(higherBrightness, timeBetweenBeeps * i, sequence[i]);
  }
}

function checkSequence(seq, pad){
  // Check for mistakes.
  for(var i = 0; i < pad.length; i++){
    if(seq[i] !== pad[i]){
      setTimeout(gameOver, 500);

      // Do not allow user to push pads.
      $(".clickable img").off("click", userTurn);
      return -1; // Unexpected condition -> User mistake.
    }
  }

  // No mistakes detected. New round.
  if(seq.length === pad.length){
    // Do not allow user to push pads.
    $(".clickable img").off("click", userTurn);
    
    pushedPad = [];
    setTimeout(startGame, 1500);
  }
}

function gameOver(){
  // Just a touch of style when game is over.
  playGameOverSound();
  blinkPadsNTimes(3);

  clearTimeout(timeIsUp[0]);

  // Show message according to the player performance.
  setTimeout(printGameOverMessage, 750);

  // setCookie(gameLevelCookie,selectedLevel(1),1);
  // setCookie(speedLevelCookie,selectedLevel(2),1);
}

function printGameOverMessage(){

  $("#ModalCenter .modal-body p").html("You have reached level <strong>" + (sequence.length - 1) + "</strong>!");

  if(sequence.length - 1 < 5){
    $("#ModalCenter .modal-body .message").text("Simon: I'm sure you can do better!");
  }
  if(sequence.length - 1 >= 5 && sequence.length - 1 < 9){
    $("#ModalCenter .modal-body .message").text("Simon: Hum... it looks like you're getting the hang of it!");
  }
  if(sequence.length - 1 >= 9 && sequence.length - 1 < 13){
    $("#ModalCenter .modal-body .message").text("Simon: wow... this attempt was impressive!");
  }
  if(sequence.length - 1 >= 13){
    $("#ModalCenter .modal-body .message").text("Simon: unbelievable... you are on fire!");
  }

  $("#ModalCenter").modal('show');
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/* Brightness Functions  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function restoreBrightness(e,timeOut){
  setTimeout(function () {
    $(e).css("filter", "brightness(1)");
  }, timeOut);
}

function lowerBrightness(e){
  setTimeout(function () {
    $(e).css("filter", "brightness(75%)");
  }, 100);
}

function higherBrightness(e){
  var pad;
  switch (e) {
    case 1:
      pad = $(".upper-left img");
      break;
    case 2:
      pad = $(".upper-right img");
      break;
    case 3:
      pad = $(".lower-left img");
      break;
    case 4:
      pad = $(".lower-right img");
      break;
    default:
      alert("Ops... this is an error!");
  }
  pad.css("filter", "brightness(125%)");
  restoreBrightness(pad, timeBetweenBeeps - 250);

  if(timeIsUp.length > 0){
    clearTimeout(timeIsUp[0]);
    timeIsUp.pop();
  }
  timeIsUp.push(setTimeout(gameOver, gameOverTime));
}

function blinkPadsNTimes(times){
  var ms = 250; // Milliseconds;

  for(var i = 0; i < times; i++){
    setTimeout(function () {
      $(".clickable").css("filter", "brightness(125%)");
    }, ms * i);

    setTimeout(function () {
      $(".clickable").css("filter", "brightness(1)");
    }, (ms * i) + (ms / 2));
  }
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/* Playing Sounds  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function playIntroSound(){
  var intro = new Audio("sfx/on.mp3");
  intro.play();
}

function playGameOverSound(){
  var wrongAnswer = new Audio("sfx/wrong.mp3");
  wrongAnswer.play();
}

function pushPadSound(){
  var push = new Audio("sfx/push.mp3");
  push.play();
}

function playPadSound(pad){
  simonTouches++;
  $(".lower-left-corner p").text(simonTouches);

  switch (pad) {
    case 1:
      var green = new Audio("sfx/green.mp3");
      green.play();
      break;
    case 2:
      var red = new Audio("sfx/red.mp3");
      red.play();
      break;
    case 3:
      var yellow = new Audio("sfx/yellow.mp3");
      yellow.play();
      break;
    case 4:
      var blue = new Audio("sfx/blue.mp3");
      blue.play();
      break;
    default:
      alert("Ops... this is an error!");
  }
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/* Level Settings  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function selectedLevel(number){
  /*
    number: 1 or 2.
    Check the index.html file (other settings can be added in the future).
      1 - inlineRadioOptions1
      2 - inlineRadioOptions2
  */
  var query = ".form-check-input[name='inlineRadioOptions" + number + "']";
  for(var i = 0; i < $(query).length; i++){
    if( $(query)[i].checked ){
      return i + 1; /* Expected condition */
    }
  }
  return -1; /* Unexpected condition */
}

function selectGameLevel(gameLevel) {
  switch (gameLevel) {
    case 1:
      gameOverTime = 2000;
      break;
    case 2:
      gameOverTime = 4000;
      break;
    case 3:
      gameOverTime = 6000;
      break;
  }
}

function selectSpeedLevel(gameLevel) {
  switch (gameLevel) {
    case 1:
      speedRate = 100;
      break;
    case 2:
      speedRate = 75;
      break;
    case 3:
      speedRate = 50;
      break;
  }
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function delCookie(cname){
  var name = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = name;
}