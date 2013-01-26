// Variables
  //SystÃ¨me
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
      var g_varianceBetweenTwoPathPoints = 5;
      var g_heightPath = 400;
      var g_minMarginPath = 20;
      var g_score = 0;
      
      var g_xPathIncrement = 15; // Pixels entre chaque point définissant le chemin de la veine.

      var g_obstacleInterval = 500;
      var g_generalSpeed = -20;
      var g_triggerSound = 0;
      
      var g_ecartGlobulesRouges = 800;
      var g_ecartVeines = 200;
      //END
      
      //VARIABLES GAMEPLAY
      var score;
      var player;
      var obstacles;
      var bgPath;
      
      var veines;
      var globulesRouges;
      //INIT
      //states : 0 intro, 1 play
      var currentState = 0;
      var currentFrame = 0;
      var canDie;
      var virusAbsoluteX;
      var xWhenGameStarts;
      var boucleLength = 30;
      var currentBoucle;
      
      var ballRunning = false;
    //and two-dimensional graphic context of the
    //canvas, the only one supported by all
    //browsers for now
      
    c.width = width;
    c.height = height;
    //setting canvas size
var virusImg = new Image();
virusImg.src = "img/virus.svg";
var virusdeadImg = new Image();
virusdeadImg.src = "img/virushurt.svg";
var globuleImg = new Image();
globuleImg.src = "img/globule.svg";
var globulesRougeImg = new Image();
globulesRougeImg.src = "img/globulerouge.svg";
var veine1Img = new Image();
//veine1Img.src = "img/veine1.svg";
var veine2Img = new Image();
//veine2Img.src = "img/veine2.svg";


var hbSon = new Audio();
hbSon.src = "sound/hb.ogg";
hbSon.load();
hbSon.loop = false;


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
    if(this.isAlive)
      this.verticalVelocity += g_thrustForce;
  }
  
  this.Update = function()
  {
    if(this.isAlive)
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
}

function pointClass(options)
{
  this.x = options.x;
  this.y = options.y;
}

function globuleClass(options)
{
  this.x = options.x;
  this.y = options.y;
  this.width = 32;
}

function veineClass(options)
{
  this.x = options.x;
  this.y = options.y;
  this.width = options.width;
  this.height = options.height;
  this.type = options.type;
}

function AjoutGlobule(xGlobule){
  var middleY = GetPathY(xGlobule);
  var topY = middleY - g_heightPath/2 + 32;
  var bottomY = middleY + g_heightPath/2 - 32;
  var resultY = Math.random() * (bottomY - topY);
  $("#debug").val(resultY);
  resultY += topY;
  obstacles.push(new globuleClass({x:xGlobule, y:resultY}));
}

function AjoutGlobuleRouge(xGlobule)
{
  var destY = Math.random() * (g_heightPath - 64); 
  globulesRouges.push(new pointClass({x:xGlobule, y:destY}));  
}

var minVeineWidth = 48;
var minVeineHeight = 32;
var maxVeineWidth = 512;
var maxVeineHeight = 256;
function AjoutVeine(xVeine)
{
  var destWidth = Math.random() * (maxVeineWidth - minVeineWidth) + minVeineWidth;
  var destHeight = Math.random() * (maxVeineHeight - minVeineHeight) + minVeineHeight;
  var destY = Math.random() * (height-destHeight);
  var destType = Math.round(Math.random() * 2);
  veines.push(new veineClass({x: xVeine, y: destY, width: destWidth, height: destHeight, type: destType}));
}

var minPathY = g_heightPath /2 + g_minMarginPath;
var maxPathY = height - g_heightPath/2 - g_minMarginPath;
function pathClass()
{
  this.elements = new Array();
  this.currentAngle = 0; // radians
  
  this.GenerateNewPoint = function(nextX)
  {
    var lastX = this.elements[this.elements.length-1].x;
    var lastY = this.elements[this.elements.length-1].y;
    var distToNextX = (nextX-lastX);
    var nextY = (Math.sin(this.currentAngle) * distToNextX) + lastY;
    var randY = (Math.random() * 2 - 1) * g_varianceBetweenTwoPathPoints;
    nextY += randY;
    nextY = Math.max(minPathY, nextY);
    nextY = Math.min(maxPathY, nextY);
    this.elements.push(new pointClass({x: nextX, y : nextY}));
    var distance = DistFrom(lastX, lastY, nextX, nextY);
    var asin = Math.asin((nextY - lastY) / distance);
    this.currentAngle = asin;
  }
  
  this.Update = function()
  {
    for(var i=0; i< this.elements.length; i++)
    {
      this.elements[i].x += GetGeneralSpeed();
    }
    
    while(this.elements[0].x < -g_xPathIncrement)
    {
      this.elements.shift();
    }
    while(this.elements[this.elements.length-1].x < width * 1.5)
    {
      this.GenerateNewPoint(this.elements[this.elements.length-1].x + g_xPathIncrement);
    }
  }
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
  var percent = currentBoucle / boucleLength;
  percent *= 2 * Math.PI;
  var speed = Math.sin(percent);
  speed+=1;
  return speed * g_generalSpeed;
}

function InitElts()
{
  g_generalSpeed = -20;
  currentBoucle = 0;
  g_score = 0;
  currentFrame = 0;
  player = new virusClass({x:32, y:height/2});
  obstacles = new Array();
  bgPath = new pathClass();
  bgPath.elements.push(new pointClass({x: 0, y: height/2}));
  var xPath;
  var currentIndex = 0;
  for(xPath = g_xPathIncrement; xPath < width + g_xPathIncrement; xPath+= g_xPathIncrement)
  {
    bgPath.elements.push(new pointClass({x: xPath, y: height/2}));
  }
  xWhenGameStarts = xPath;
  bgPath.Update();
  obstacles = new Array();
  AjoutGlobule(width+g_obstacleInterval);
  canDie = false;
  virusAbsoluteX = 0;
  globulesRouges = new Array();
  globulesRouges.push(new pointClass({x: width, y: height/2}));
  
  veines = new Array();
  for(xPath = g_ecartVeines; xPath < width + g_ecartVeines ; xPath += g_ecartVeines)
  {
    AjoutVeine(xPath);
  }
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

function GetBottomPathY(targetX)
{
  return GetPathY(targetX) + g_heightPath/2;
}

function GetTopPathY(targetX)
{
  return GetPathY(targetX) - g_heightPath/2;
}

function GetPathY(targetX)
{
  var found = false;
  var i = 0;
  previousElt = bgPath.elements[i];
  i++;
  while(i<bgPath.elements.length)
  {
    if(bgPath.elements[i].x > targetX)
    {
      return GetYFromXOnLineFormedByTwoPoints(targetX, previousElt.x, previousElt.y, bgPath.elements[i].x, bgPath.elements[i].y);
    }
    previousElt = bgPath.elements[i];
    i++;
  }
  return -1;
}

// ATTENTION, originX < destX sinon ca foire
// Thalès <3
function GetYFromXOnLineFormedByTwoPoints(wantedX, originX, originY, destX, destY)
{
  var normedX = destX - originX;
  var normedY = destY - originY;
  var normedWantedX = wantedX - originX;
  
  var normedResultY = (normedWantedX / normedX) * normedY;
  return normedResultY + originY; 
}

function Fail(){
  player.isAlive = false;
  g_generalSpeed=0;
}

function UpdateElements()
{
  currentFrame++;
  if(currentFrame>30)
  {
    if(isMouseDown)
      player.Thrust();
    player.Update();
    
    virusAbsoluteX -= GetGeneralSpeed();
    if(!canDie && virusAbsoluteX >= xWhenGameStarts)
      canDie = true;
    bgPath.Update();
    
    currentBoucle++;
    if(currentBoucle > boucleLength)
      currentBoucle = 0;
    
    //maj son
    if(GetGeneralSpeed() < g_triggerSound)
    {
      hbSon.play();
    }
    
    //pour les 4 coins, on teste si les 2 coins du haut sont toujours sous la droite du haut,
    //et les 2 coins du bas sont toujours au dessus de la droite du bas
    var isCollide = false;
    var topLeftPathY = GetTopPathY(player.x);
    var topRightPathY = GetTopPathY(player.x + player.width);
    var bottomLeftPathY = GetBottomPathY(player.x);
    var bottomRightPathY = GetBottomPathY(player.x + player.width);
    if(player.y < topLeftPathY)
    {
      isCollide = true;
      player.y = topLeftPathY;
    }
    if(player.y < topRightPathY)
    {
      isCollide = true;
      player.y = topRightPathY;
    }
    if(player.y + player.height > bottomLeftPathY)
    {
      isCollide = true;
      player.y = bottomLeftPathY - player.height;
    }
    if(player.y + player.height > bottomRightPathY)
    {
      isCollide = true;
      player.y = bottomRightPathY - player.height;
    }
    
    if(isCollide)
    {
      player.verticalVelocity = 0;
      if(canDie)
        Fail();
    }
    
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
      obstacles[i].x+=GetGeneralSpeed();
    }
    if(width+obstacles[obstacles.length-1].width>obstacles[obstacles.length-1].x+g_obstacleInterval)
    {
      AjoutGlobule(obstacles[obstacles.length-1].x+g_obstacleInterval);
    }
    
    //Animation des globules rouges
    for(var i=0; i<globulesRouges.length; i++)
    {
      globulesRouges[i].x += GetGeneralSpeed() * 1.2;
    }
    if(globulesRouges[0].x < -128)
      globulesRouges.shift();
      
    if(globulesRouges[globulesRouges.length-1].x + g_ecartGlobulesRouges < width + 20)
      AjoutGlobuleRouge(globulesRouges[globulesRouges.length-1].x + g_ecartGlobulesRouges);
    
    //Animation des veines
    for(var i=0; i<veines.length; i++)
    {
      veines[i].x += GetGeneralSpeed() * 1.5;
    }
    while(veines[veines.length-1].x + g_ecartVeines < width)
      AjoutVeine(veines[veines.length-1].x + g_ecartVeines);
  
    while(veines[0].x + veines[0].width < 0)
      veines.shift();
    
    //Gestion des collision des Globules Blanc
    for(var i = 0; i<obstacles.length; i++)
    {
      var isCollide = false;
      isCollide |= DistFrom(player.x, player.y, obstacles[i].x, obstacles[i].y) < obstacles[i].width;
      isCollide |= DistFrom(player.x+player.width, player.y, obstacles[i].x, obstacles[i].y) < obstacles[i].width;
      isCollide |= DistFrom(player.x, player.y+player.height, obstacles[i].x, obstacles[i].y) < obstacles[i].width;
      isCollide |= DistFrom(player.x+player.width, player.y+player.height, obstacles[i].x, obstacles[i].y) < obstacles[i].width;
      
      if(isCollide)
        Fail();
        
      if(obstacles[i].x - obstacles[i].width > player.x + player.width)
        break;
    }
  
    g_score -= g_generalSpeed;
  }
}

function DrawAll()
{
ctx.fillStyle = "rgb(184, 72, 66)";
ctx.fillRect(0, 0, width, height);

  for(var i=0; i<veines.length;i++)
  {
    var drawingImg = veine2Img
    if(veines[i].type == 1)
      drawingImg = veine1Img;
    //ctx.drawImage(drawingImg, veines[i].x, veines[i].y, veines[i].width, veines[i].height);
  }

  for(var i=0; i<globulesRouges.length;i++)
  {
    ctx.drawImage(globulesRougeImg, globulesRouges[i].x, globulesRouges[i].y);    
  }
  ctx.strokeStyle = "#FFF";
  ctx.fillStyle = "rgb(167, 29, 22)";
  //ctx.fillStyle = "#400";
  ctx.beginPath();
  ctx.moveTo(bgPath.elements[0].x, bgPath.elements[0].y - g_heightPath/2);
  for(var i=1;i< bgPath.elements.length;i++)
  {
    ctx.lineTo(bgPath.elements[i].x, bgPath.elements[i].y - g_heightPath/2);
    //ctx.fillRect(bgPath.elements[i].x, bgPath.elements[i].y, 8, 8);
  }
  ctx.lineTo(width, 0);
  ctx.lineTo(0,0);
  ctx.closePath();
  ctx.fill();
  //ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(bgPath.elements[0].x, bgPath.elements[0].y + g_heightPath/2);
  for(var i=1;i< bgPath.elements.length;i++)
  {
    ctx.lineTo(bgPath.elements[i].x, bgPath.elements[i].y + g_heightPath/2);
    //ctx.fillRect(bgPath.elements[i].x, bgPath.elements[i].y, 8, 8);
  }
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  //ctx.stroke();
  ctx.fill();
  
  
  ctx.strokeStyle = "#666";
  ctx.fillStyle = "#AAA";
  ctx.beginPath();
  ctx.moveTo(bgPath.elements[0].x, bgPath.elements[0].y - g_heightPath/2);
  for(var i=1;i< bgPath.elements.length;i++)
  {
    ctx.lineTo(bgPath.elements[i].x, bgPath.elements[i].y - g_heightPath/2);
    //ctx.fillRect(bgPath.elements[i].x, bgPath.elements[i].y, 8, 8);
  }
  for(var i=bgPath.elements.length-1;i>=0;i--)
  {
    ctx.lineTo(bgPath.elements[i].x, bgPath.elements[i].y - g_heightPath/2-8);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  ctx.strokeStyle = "#666";
  ctx.fillStyle = "#AAA";
  ctx.beginPath();
  ctx.moveTo(bgPath.elements[0].x, bgPath.elements[0].y + g_heightPath/2);
  for(var i=1;i< bgPath.elements.length;i++)
  {
    ctx.lineTo(bgPath.elements[i].x, bgPath.elements[i].y + g_heightPath/2);
    //ctx.fillRect(bgPath.elements[i].x, bgPath.elements[i].y, 8, 8);
  }
  for(var i=bgPath.elements.length-1;i>=0;i--)
  {
    ctx.lineTo(bgPath.elements[i].x, bgPath.elements[i].y + g_heightPath/2+8);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  ctx.fillStyle = "rgba(255,255,255, 0.5)";
  //ctx.drawImage(globuleImg, obstacles[0].x, obstacles[0].y);
  for(var i = 0; i<obstacles.length; i++){
    ctx.drawImage(globuleImg, obstacles[i].x - obstacles[i].width, obstacles[i].y - obstacles[i].width);
    /*ctx.beginPath();
    ctx.arc(obstacles[i].x, obstacles[i].y, obstacles[i].width, 0, 2*Math.PI);
    ctx.fill();
    ctx.closePath();*/
  }
  
  if(player.isAlive)
    ctx.drawImage(virusImg, player.x-56, player.y-12);
  else ctx.drawImage(virusdeadImg, player.x-56, player.y-12);
  ctx.fillStyle = "rgba(0,128,0, 0.5)";
  
  
  if(!player.isAlive)
  {
    ctx.fillStyle = "rgba(0,0,0, 0.5)";
    ctx.fillRect(50, 50, width-100, height-100);




    ctx.fillStyle = "#FFF";
    ctx.font="50px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", width/2, height/4);

    ctx.fillStyle = "#FFF";
    ctx.font="20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Vous avez fait " + g_score + " points", width/2, height/2);

    ctx.fillStyle = "#FFF";
    ctx.font="30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Click to restart", width/2, 3*height/4);
  }
  
//  ctx.fillRect(player.x, player.y, player.width, player.height);

  //Score
  ctx.fillStyle = "#FFF";
  ctx.textAlign = "right";
  ctx.font="30px Arial";
  ctx.fillText("Score :" + g_score, width-50, 50);
  //ctx.fillText(g_score, width-50, 50);


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
  ctx.fillStyle = "rgba(0,0,0, 0.5)";
  ctx.fillRect(50, 50, width-100, height-100);

  ctx.fillStyle = "#FFF";
  ctx.font="50px Arial";
  ctx.textAlign = "center";
  ctx.fillText("HeartBreaker", width/2, height/4);

  ctx.fillStyle = "#FFF";
  ctx.font="30px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Click to start", width/2, height/2);

  ctx.drawImage(virusImg, 700, height/3);
  ctx.drawImage(virusImg, 850, height/5);
  ctx.drawImage(globuleImg, 56, 12);
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
  gLoop = setTimeout(GameLoop, 1000 / 30);
}
InitElts();

GameLoop();