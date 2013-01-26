// Variables
  //Système
    var width = 1024,
    //width of the canvas
      height = 600,
    //height of the canvas
      c = document.getElementById('c'),
    //canvas itself
      ctx = c.getContext('2d');
      
      var showDebug = false;
      var leftOffset = 0;
      var topOffset = 0;
      
      //CONSTANTES
      var g_maxVSpeed = 100;
      var g_thrustForce = -5;
      var g_gravity = 3;
      var g_obstacleInterval = 500;
      var g_generalSpeed = 20;
      //END
      
      //VARIABLES GAMEPLAY
      var score;
      var player;
      var obstacles;
      
      //INIT
      //states : 0 intro, 1 play
      var currentState = 0;
      
      var ballRunning = false;
    //and two-dimensional graphic context of the
    //canvas, the only one supported by all
    //browsers for now
      
    c.width = width;
    c.height = height;
    //setting canvas size
var tutoImg = new Image();
tutoImg.src = "img/tuto.png";

function virusClass(options)
{
  this.x = options.x;
  this.y = options.y;
  this.width = 64;
  this.height = 32;
  this.isAlive = true;
  this.verticalVelocity = 0;
  this.Thrust = function()
  {
    this.verticalVelocity += g_thrustForce;
  }
  
  this.Update = function()
  {
    this.verticalVelocity += g_gravity;
    
    if(this.verticalVelocity > g_maxVSpeed)
    {
      this.verticalVelocity = g_maxVSpeed;
    }
    else if(this.verticalVelocity < -g_maxVSpeed)
    {
      this.verticalVelocity = -g_maxVSpeed;
    }
    this.y += this.verticalVelocity;
  }
}

//function

function globuleClass(options)
{
  this.x = options.x;
  this.y = options.y;
  this.width = 64;
  this.height = 32;
}

function AjoutGlobule(){
  //obstacles = new Array();
  obstacles.push(new globuleClass({x:1050, y:Math.round((Math.random()*1200)/2)}));
}

var clear = function()
{
  ctx.fillStyle = '#800000';

//clear whole surface
  ctx.beginPath();
//start drawing
  ctx.rect(0, 0, width, height);
//draw rectangle from point (0, 0) to
//(width, height) covering whole canvas
  ctx.closePath();
//end drawing
  ctx.fill();
//fill rectangle with active
//color selected before
}

function GetGeneralSpeed()
{
  return g_generalSpeed;
}

function InitElts()
{
  player = new virusClass({x:32, y:height/2});
  obstacles = new Array();
  AjoutGlobule();
}

function DistFrom(originX, originY, targetX, targetY)
{
  var distPow2 = Math.pow(targetX-originX, 2) + Math.pow(targetY-originY, 2);
  return Math.sqrt(distPow2);
}

var gapx = 0;
var gapy = 0;
var isMouseDown = false;
var mouseX;
var mouseY;
var clicked = false;
function TakeInput()
{
}
$("#c").mousemove(function(e)
{
  // ALERTE WTF
  mouseX = e.pageX - leftOffset - 20; // WTF SOLUTION DEBILE
  // ALERTE WTF
  mouseY = e.pageY - topOffset;
  
});
$("#c").mousedown(function()
{
  isMouseDown = true;
});
$("#c").mouseup(function()
{
  if(isMouseDown)
  {
    isMouseDown = false;
  }
});
$("#c").click(function(e)
{
  if(currentState == 0)
  {
    currentState = 1;
  }
});

  
function FAIL(){
      g_generalSpeed=0;
}


function UpdateElements()
{
  if(isMouseDown)
    player.Thrust();
  player.Update();
  
  //collisions ici.
  if(player.y < 0)
  {
    player.y = 0;
    player.verticalVelocity = 0;
  }
  else if(player.y + player.height > height)
  {
    player.y = height - player.height;
    player.verticalVelocity = 0;
  }

  
  //Animation des Globules Blancs
  for(var i = 0; i<obstacles.length; i++){
    obstacles[i].x-=GetGeneralSpeed();
  }
  if((width-g_obstacleInterval)>obstacles[obstacles.length-1].x){
      obstacles.push(new globuleClass({x:1050, y:Math.round(50+((Math.random()*1000))/2)}));
    }

  //Gestion des collision des Globules Blanc
  for(var i = 0; i<obstacles.length; i++)
    {
    var alex = DistFrom(32, player.y, obstacles[i].x, obstacles[i].y);
    $("#debug").val(i) ;
      if(alex < 50)
      {
        FAIL();
      }
    }

  
  //$("#debug").val(i) ;
  //alert(obstacles.length);

}

function DrawAll()
{
  ctx.fillStyle = "#080";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.fillStyle = "#FFF";
  for(var i = 0; i<obstacles.length; i++){
    ctx.beginPath();
    ctx.arc(obstacles[i].x, obstacles[i].y, 30, 0, 2*Math.PI);
    ctx.fill();
    ctx.closePath();
  }

  //ctx.fillRect(ennemis.x, ennemis.y, ennemis.width, ennemis.height);
/* var i=0;
var destRotatedx;
var destRotatedy;
for(i=0;i<elements.length;i++)
{
var centerx = elements[i].x;
var centery = elements[i].y;
ctx.fillStyle = GetColorFromIndex(i);
if(i == selectedElement)
ctx.strokeStyle = "#FFF"
else
ctx.strokeStyle = "#000";
ctx.beginPath();
ctx.arc(elements[i].x,elements[i].y,elements[i].width,0,2*Math.PI);
ctx.fill();
ctx.stroke();
ctx.closePath();
destRotatedx = (elements[i].width + 10) * Math.cos(elements[i].direction);
destRotatedy = (elements[i].width + 10) * Math.sin(elements[i].direction);
ctx.fillStyle = GetColorFromIndex(i+1);
ctx.beginPath();
ctx.arc(centerx + destRotatedx, centery+destRotatedy, 8, 0, 2*Math.PI);
ctx.fill();
ctx.stroke();
ctx.closePath();
if(i == selectedElement)
{
ctx.beginPath();
ctx.lineWidth = 1;
ctx.moveTo(centerx, centery)
ctx.lineTo(centerx + gapx, centery + gapy);
//ctx.lineTo(centerx + gapx, centery);
//ctx.lineTo(centerx, centery);
ctx.stroke();
ctx.closePath();
}
}
for(i=0; i<animations.length; i++)
{
animations[i].Draw(ctx);
}
if(musicRunning)
{
ctx.fillStyle = GetColorFromIndex(ball.currentRebound+1);
ctx.beginPath();
ctx.arc(ball.x, ball.y, ball.width, 0, 2*Math.PI);
ctx.fill();
ctx.closePath();
var i = 0;
while(i < ball.currentRebound)
{
var nextIndex = (i+1) % elements.length;
ctx.strokeStyle = GetColorFromIndex(i);
ctx.beginPath();
ctx.moveTo(elements[i].x, elements[i].y);
ctx.lineTo(elements[nextIndex].x, elements[nextIndex].y);
ctx.stroke();
ctx.closePath();
i++;
}
ctx.strokeStyle = GetColorFromIndex(ball.currentRebound);
ctx.beginPath();
ctx.moveTo(elements[ball.currentRebound].x, elements[ball.currentRebound].y);
ctx.lineTo(ball.x, ball.y);
ctx.stroke();
ctx.closePath();
}
ctx.fillStyle = "#000";
ctx.strokeStyle = "#FFF";
ctx.fillRect(btnStartX, btnStartY, btnStartWidth, btnStartHeight);
ctx.strokeRect(btnStartX, btnStartY, btnStartWidth, btnStartHeight);
ctx.font = "12px sans-serif";
ctx.fillStyle = "#FFF";
ctx.textAlign = "center"
ctx.fillText("START", btnStartX + btnStartWidth/2, btnStartY + btnStartHeight/2);
//ctx.fillText(destRotatedx + " " + destRotatedy, 550, 350);*/
}

function DrawIntro()
{
  ctx.fillStyle = "#FFF";
  ctx.textAlign = "center";
  ctx.fillText("Click to start", width/2, height/2);
}

var StopIntro = function()
{
  intro = false;
}

var GameLoop = function()
{
  clear();
  TakeInput();
  switch(currentState)
  {
    case 0:
      DrawIntro();
      break;
    case 1:
      UpdateElements();
      DrawAll();
  }
  gLoop = setTimeout(GameLoop, 1000 / 50);
}
InitElts();

GameLoop();