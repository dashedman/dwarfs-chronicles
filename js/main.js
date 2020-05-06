requestAnimationFrame = window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function(callback){ window.setTimeout(callback, 66) }


var canvas = document.getElementById("viewport")
var ctx = canvas.getContext('2d')

//CONSTANTS
const DATA_PATH = "resources/"

const PRESSED_KEYS = new Array(128)
const LIFELESSES = {}
const BACKGROUNDS = {}
const ALIVES = {}
const TEXTURE_LIST = {}

const ANIMATION_STATE_STAY=0
const ANIMATION_STATE_FALL=1
const ANIMATION_STATE_RUN=2
const ANIMATION_STATE_JUMP=3

const KEY_SPACE = 32
const KEY_LEFT = 37
const KEY_UP = 38
const KEY_RIGHT = 39
const KEY_DOWN = 40
const KEY_A = 65
const KEY_B = 66
const KEY_C = 67
const KEY_D = 68
const KEY_E = 69
const KEY_F = 70
const KEY_G = 71
const KEY_H = 72
const KEY_I = 73
const KEY_J = 74
const KEY_K = 75
const KEY_L = 76
const KEY_M = 77
const KEY_N = 78
const KEY_O = 79
const KEY_P = 80
const KEY_Q = 81
const KEY_R = 82
const KEY_S = 83
const KEY_T = 84
const KEY_U = 85
const KEY_V = 86
const KEY_W = 87
const KEY_X = 88
const KEY_Y = 89
const KEY_Z = 90


//ACTIONS
PRESSED_KEYS.fill(false)
function setKey(event, status) {
  PRESSED_KEYS[event.keyCode] = status
}

document.addEventListener('keydown', function(e) {
	setKey(e, true);
});
document.addEventListener('keyup', function(e) {
	setKey(e, false);
});

window.addEventListener('blur', function() {
  PRESSED_KEYS.fill(false)
});


//CLASSES
class Texture{
  constructor(path){
    this.data = new Image()
    this.data.src = path
  }
}
class AnimationTexture extends Texture{
  constructor(path,n=1,fspeed=20){
    this.frames = n
    this.frameWidth = 0
    this.frameSpeed = fspeed

    super(path)

    this.data.onload = function(){
    	this.frameWidth = Math.floor(this.data.width / n)
    }
  }
}



class Entity{
  constructor(x=0,y=0,w=0,h=0){
    this.x = x
    this.y = y
    this.width = w
    this.height = h
  }
}


class Sprite extends Entity{
  constructor(x=0,y=0,w=0,h=0,source_path=""){
    super(x,y,w,h)
    this.texture = TEXTURE_LIST[source_path]
  }

  draw(){
    ctx.drawImage(this.texture.data, \
                  this.x, \
                  this.y, \
                  this.width, \
                  this.heigth, \
                  0, \
                  0, \
                  this.texture.data.width, \
                  this.texture.data.heigth)
  }
  update(dt){}
}
class ASprite extends Entity{
  constructor(x=0,y=0,w=0,h=0,source_path=""){
    super(x,y,w,h)
    this.frameStatus = 0

    this.atexture = TEXTURE_LIST[source_path]
  }
  draw(){
    ctx.drawImage(this.texture.data, \
                  this.x, \
                  this.y, \
                  this.width, \
                  this.heigth, \
                  Math.floor(this.frameStatus/this.frameSpeed)*this.texture.frameWidth, \
                  0, \
                  this.texture.frameWidth, \
                  this.texture.data.heigth)
  }
  update(dt){
    this.frameStatus = (this.frameStatus+dt)%(this.texture.frames*this.frameSpeed)
  }
}


class Alive extends Entity{
  constructor(x=0,y=0,w=0,h=0,source_path=""){
    super(x,y,w,h)
    this.speedX = 10
    this.speedY = 100
    this.direction = false

    this.entityState = 0
    this.frameStatus = 0

    this.animation_stay = TEXTURE_LIST[source_path+"_stay"]
    this.animation_run = TEXTURE_LIST[source_path+"_run"]
    this.animation_fall = TEXTURE_LIST[source_path+"_fall"]
    this.animation_jump = TEXTURE_LIST[source_path+"_jump"]
  }

  draw(){
      switch(this.entityState){
        case ANIMATION_STATE_STAY:
          ctx.drawImage(this.animation_stay.data, \
                        this.x, \
                        this.y, \
                        this.width, \
                        this.heigth, \
                        (this.frameWidth*this.direction-1) + Math.floor(this.frameStatus/this.frameSpeed)*this.animation_stay.frameWidth, \
                        0, \
                        (-1*this.direction) * this.animation_stay.frameWidth, \
                        (-1*this.direction) * this.animation_stay.data.heigth)
          break
        case ANIMATION_STATE_FALL:
          ctx.drawImage(this.animation_fall.data, \
                        this.x, \
                        this.y, \
                        this.width, \
                        this.heigth, \
                        (this.frameWidth*this.direction-1) + Math.floor(this.frameStatus/this.frameSpeed)*this.animation_fall.frameWidth, \
                        0, \
                        (-1*this.direction) * this.animation_fall.frameWidth, \
                        (-1*this.direction) * this.animation_fall.data.heigth)
          break
        case ANIMATION_STATE_RUN:
          ctx.drawImage(this.animation_run.data, \
                        this.x, \
                        this.y, \
                        this.width, \
                        this.heigth, \
                        (this.frameWidth*this.direction-1) + Math.floor(this.frameStatus/this.frameSpeed)*this.animation_run.frameWidth, \
                        0, \
                        (-1*this.direction) * this.animation_run.frameWidth, \
                        (-1*this.direction) * this.animation_run.data.heigth)
          break
        case ANIMATION_STATE_JUMP:
          ctx.drawImage(this.animation_jump.data, \
                        this.x, \
                        this.y, \
                        this.width, \
                        this.heigth, \
                        (this.frameWidth*this.direction-1) + Math.floor(this.frameStatus/this.frameSpeed)*this.animation_jump.frameWidth, \
                        0, \
                        (-1*this.direction) * this.animation_jump.frameWidth, \
                        (-1*this.direction) * this.animation_jump.data.heigth)
          break
      }
    }

    update = function(dt){
      this.frameStatus = (this.frameStatus+dt)%(this.texture.frames*this.frameSpeed)
    }
}


class Hero extends Alive{
  update = function(dt){
    let newFlag = false

    //ХОДИТ
		if( PRESSED_KEYS[ KEY_LEFT ] || PRESSED_KEYS[ KEY_A ] ) {
			this.x -= this.dx * dt
      this.direction = false

			if(this.entityState != ANIMATION_STATE_RUN){
				let newFlag = true
        this.entityState = ANIMATION_STATE_RUN
			}
		}

		if( PRESSED_KEYS[ KEY_RIGHT ] || PRESSED_KEYS[ KEY_D ] ) {
      this.x += this.dx * dt
      this.direction = true

      if(this.entityState != ANIMATION_STATE_RUN){
				let newFlag = true
        this.entityState = ANIMATION_STATE_RUN
			}
		}


  	if(Math.round(fallanim) > 2 && (jump || person.y >= 460)){             //Физика прыжжка
  		if(isDown('SPACE') || isDown('UP') || isDown('w')){
  			person.y -= person.dy * dt;
  			jump += speedparam.jump * dt;
  		}
  		if(jump > 10){
  			jump = 0;
  		}
  	}
  	if(!isDown('SPACE') && !isDown('UP') && !isDown('w')){
  		jump = 0;
  	}

  	pressedKeyscheck = false;
  	for(i in pressedKeys){
  		if(pressedKeys[i] == true){
  			pressedKeyscheck = true; //true -- в движении
  		}
  	}
  	if(!pressedKeyscheck){			//Стоит на месте
  		standanim += speedparam.stand * dt;
  	}
  	if(person.y < 460 && !jump){	//Падение
  		person.y += person.dy * dt;
  		fallanim = 0;
  	}
  	if(Math.round(fallanim) < 3){		//Приземление
  		fallanim += speedparam.fall * dt;
  	}

    if(newFlag) this.frameStatus=0;
    else this.frameStatus = (this.frameStatus+dt)%(this.texture.frames*this.frameSpeed)
  }
}


////SCENE

//LOAD DATA
TEXTURE_LIST["background"] = new Texture(DATA_PATH + "background.png")

TEXTURE_LIST["hero_stay"] = new AnimationTexture(DATA_PATH + "hero_stay.png")
TEXTURE_LIST["hero_fall"] = new AnimationTexture(DATA_PATH + "hero_fall.png")
TEXTURE_LIST["hero_run"] = new AnimationTexture(DATA_PATH + "hero_run.png")
TEXTURE_LIST["hero_jump"] = new AnimationTexture(DATA_PATH + "hero_jump.png")


//GAME INIT START
var gameTime = 0;
var lastTime;

var hero = new Alive(0,0,300,300,"hero")
BACKGROUNDS[0] = new Sprite(0,0,800,600,"background")


requestAnimationFrame(frame);
////

//MAIN FUNCTIONS
function update(dt){
  hero.update(dt)
  for(let i=0;i<ALIVES.length;i++)ALIVES[i].update(dt)
  for(let i=0;i<LIFELESSES.length;i++)LIFELESSES[i].update(dt)
  for(let i=0;i<BACKGROUNDS.length;i++)BACKGROUNDS[i].update(dt)
}



function render(){
	let width = window.innerWidth;
	let height = window.innerHeight;
	if(width/height > 800/600){
		//Подгоняем высоту
		$('canvas').css('height', height);
		$('canvas').css('width', height/600*800);
	}else{
		//Подгоняем ширину
		$('canvas').css('width', width);
		$('canvas').css('height', width/800*600);
	}

  //background
  BACKGROUNDS[0].draw()
  for(let i=1;i<BACKGROUNDS.length;i++)BACKGROUNDS[i].draw()

  //hero
  hero.draw()

  //other entity
  for(let i=0;i<LIFELESSES.length;i++)LIFELESSES[i].draw()
  for(let i=0;i<ALIVES.length;i++)ALIVES[i].draw()

}




function frame(){
	let now = Date.now()
	let dt = (now - lastTime)/1000

	update(dt)
	render()

	lastTime = now
	requestAnimationFrame(frame)
}
