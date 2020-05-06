requestAnimationFrame = window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function(callback){ window.setTimeout(callback, 66) }


var canvas = document.getElementById("viewport")
var ctx = canvas.getContext('2d')

//CONSTANTS
//paths
const DATA_PATH = "resources/"

//arrays
const PRESSED_KEYS = new Array(128)
const LIFELESSES = {}
const BACKGROUNDS = {}
const ALIVES = {}
const TEXTURE_LIST = {}

//animation states
const ANIMATION_STATE_STAY=0
const ANIMATION_STATE_FALL=1
const ANIMATION_STATE_RUN=2
const ANIMATION_STATE_JUMP=3

//block types
const TYPE_BOX = 0
const TYPE_CIRCLE = 1
const TYPE_TRIANGLE_LEFT_UP = 2
const TYPE_TRIANGLE_RIGHT_UP = 3
const TYPE_TRIANGLE_RIGHT_DOWN = 4
const TYPE_TRIANGLE_LEFT_DOWN = 5

//keycodes
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

window.addEventListener("resize", function() {
	canvas.style.width = window.innerWidth
	canvas.style.height = window.innerHeight
	/*hero.update(dt)
  for(let i=0;i<ALIVES.length;i++){
		ALIVES[i].update(dt)
	}
  for(let i=0;i<LIFELESSES.length;i++){
		LIFELESSES[i].update(dt)
	}
  for(let i=0;i<BACKGROUNDS.length;i++){
		BACKGROUNDS[i].update(dt)
	}*/
})


//CLASSES
class Texture{
  constructor(path){
		this.data = new Image()
		this.data.src = path
  }
}
class AnimationTexture extends Texture{
  constructor(path,n=1,fspeed=20){
		super(path)

    this.frames = n
    this.frameSpeed = fspeed

    this.data.onload = ()=>{
			console.log("huh")
    	this.frameWidth = Math.floor(this.data.width / n)
    }
  }
}



class Entity{
  constructor(x=0,y=0,w=1,h=1,type=0){
    this.x = x
    this.y = y
    this.width = w
    this.height = h

		this.type = type
  }
	collide(obj){
		switch(this.type){
			case TYPE_BOX:
				switch (obj.type) {
					case TYPE_BOX:
						//collision flag
						if(obj.x+obj.width < this.x ||
							obj.x > this.x+this.width ||
							obj.y+obj.height < this.y ||
							obj.y > this.y+this.height)return;

						//collision reaction
						if(obj.speedX>0){
							obj.x = this.x-obj.width
						}else if(obj.speedX<0){
							obj.x = this.x+this.width
						}

						if(obj.speedY<0){
							obj.y = this.y+this.height
							obj.speedY = 0
						}else if(obj.speedY>0){
							obj.speedY = 0
							obj.y = this.y - obj.height
							obj.onFloor = 1
						}
						break
				}
				break
		}
	}
}


class Sprite extends Entity{
  constructor(x=0,y=0,w=0,h=0,source_path="",type=0){
    super(x,y,w,h,type)
    this.texture = TEXTURE_LIST[source_path]
  }
  draw(){
    ctx.drawImage(this.texture.data,
									0,
									0,
									this.texture.data.width,
									this.texture.data.height,
									this.x,
									this.y,
									this.width,
									this.height)
  }
  update(dt){}
}
class ASprite extends Sprite{
  constructor(x=0,y=0,w=0,h=0,source_path="",type=0){
    super(x,y,w,h,source_path="",type)
    this.frameStatus = 0
  }
  draw(){
    ctx.drawImage(this.texture.data,
                  Math.floor(this.frameStatus/this.frameSpeed)*this.texture.frameWidth,
                  0,
                  this.texture.frameWidth,
                  this.texture.data.height,
									this.x,
									this.y,
									this.width,
									this.height)
  }
  update(dt){
    this.frameStatus = (this.frameStatus+dt)%(this.texture.frames*this.frameSpeed)
  }
}


class Alive extends Entity{
  constructor(x=0,y=0,w=0,h=0,source_path=""){
    super(x,y,w,h)
    this.speedX = 0
    this.speedY = 0
		this.accelerationX = 10
    this.direction = 1
		this.onFloor = 0

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
					console.log(
                        this.animation_stay.frameWidth*(this.direction*0.5-0.5),//+ Math.floor(this.frameStatus/this.frameSpeed)*this.animation_stay.frameWidth,
                        0,
                        (this.direction) * this.animation_stay.frameWidth,
                        (this.direction) * this.animation_stay.data.height,
												this.x,
												this.y,
												this.width,
												this.height)//*/
          ctx.drawImage(this.animation_stay.data,
                        this.animation_stay.frameWidth*(this.direction*0.5-0.5) + Math.floor(this.frameStatus/this.frameSpeed)*this.animation_stay.frameWidth,
                        0,
                        (this.direction) * this.animation_stay.frameWidth,
                        (this.direction) * this.animation_stay.data.height,
												this.x,
												this.y,
												this.width,
												this.height)
          break
        case ANIMATION_STATE_FALL:
          ctx.drawImage(this.animation_fall.data,
                        this.animation_fall.frameWidth*(this.direction*0.5-0.5) + Math.floor(this.frameStatus/this.frameSpeed)*this.animation_fall.frameWidth,
                        0,
                        (this.direction) * this.animation_fall.frameWidth,
                        (this.direction) * this.animation_fall.data.height,
												this.x,
	                      this.y,
	                      this.width,
	                      this.height)
          break
        case ANIMATION_STATE_RUN:
          ctx.drawImage(this.animation_run.data,
                        this.animation_run.frameWidth*(this.direction*0.5-0.5) + Math.floor(this.frameStatus/this.frameSpeed)*this.animation_run.frameWidth,
                        0,
                        (this.direction) * this.animation_run.frameWidth,
                        (this.direction) * this.animation_run.data.height,
                        this.x,
                        this.y,
                        this.width,
                        this.height)
          break
        case ANIMATION_STATE_JUMP:
          ctx.drawImage(this.animation_jump.data,
                        this.animation_jump.frameWidth*(this.direction*0.5-0.5) + Math.floor(this.frameStatus/this.frameSpeed)*this.animation_jump.frameWidth,
                        0,
                        (this.direction) * this.animation_jump.frameWidth,
                        (this.direction) * this.animation_jump.data.height,
												this.x,
												this.y,
												this.width,
												this.height)
          break
      }
    }

    update = function(dt){
			switch(this.entityState){
				case ANIMATION_STATE_STAY:
      		this.frameStatus = (this.frameStatus+dt)%(this.animation_stay.frames*this.frameSpeed)
					break
				case ANIMATION_STATE_FALL:
      		this.frameStatus = (this.frameStatus+dt)%(this.animation_fall.frames*this.frameSpeed)
					break
				case ANIMATION_STATE_RUN:
      		this.frameStatus = (this.frameStatus+dt)%(this.animation_run.frames*this.frameSpeed)
					break
				case ANIMATION_STATE_JUMP:
      		this.frameStatus = (this.frameStatus+dt)%(this.animation_jump.frames*this.frameSpeed)
					break
			}
    }
}


class Hero extends Alive{
  update = function(dt){
    var newFlag = false
		var runFlag = false
		var fallFlag = false

    //ХОДИТ
		if( PRESSED_KEYS[ KEY_LEFT ] || PRESSED_KEYS[ KEY_A ] ) {
			runFlag = true
			this.speedX = -10
			this.x += this.speedX * dt
      this.direction = 1
		}
		if( PRESSED_KEYS[ KEY_RIGHT ] || PRESSED_KEYS[ KEY_D ] ) {
			runFlag = true
			this.speedX = 10
      this.x += this.speedX * dt
      this.direction = -1
		}

      //Физика прыжжка
		if( PRESSED_KEYS[KEY_SPACE] && this.onFloor){
			this.speedY = 100
			this.onFloor -= 1
		}
		this.speedY = this.speedY - dt*9.8
		this.y += this.speedY * dt

		for(let i=0;i<LIFELESSES.length;i++){
			LIFELESSES.collide(this)
		}

		if(speedY>0){
			if(this.entityState != ANIMATION_STATE_FALL){
				newFlag = true
				this.entityState = ANIMATION_STATE_FALL
			}
		}
		else if(speedY<0){
			if(this.entityState != ANIMATION_STATE_JUMP){
				newFlag = true
				this.entityState = ANIMATION_STATE_JUMP
			}
		}else	if(runFlag){
			if(this.entityState != ANIMATION_STATE_RUN){
				newFlag = true
        this.entityState = ANIMATION_STATE_RUN
			}
		}
    if(newFlag) this.frameStatus=0;
    else this.frameStatus = (this.frameStatus+dt)%(this.texture.frames*this.frameSpeed)
	}
}


////SCENE

//LOAD DATA
TEXTURE_LIST["background"] = new Texture(DATA_PATH + "background_forest_1.png")
TEXTURE_LIST["ground"] = new Texture(DATA_PATH + "ground_forest_1.png")

TEXTURE_LIST["dwarf_stay"] = new AnimationTexture(DATA_PATH + "dwarf_stay.png",8)
TEXTURE_LIST["dwarf_fall"] = new AnimationTexture(DATA_PATH + "dwarf_stay.png",8)
TEXTURE_LIST["dwarf_run"] = new AnimationTexture(DATA_PATH + "dwarf_walk.png",6)
TEXTURE_LIST["dwarf_jump"] = new AnimationTexture(DATA_PATH + "dwarf_stay.png",8)

//load waiting
while(true){
		for(let x in TEXTURE_LIST)if(!TEXTURE_LIST[x].data.complete)continue
		break
}
console.log('load end')
//GAME INIT START
var lastTime;

var hero = new Alive(100,100,300,300,"dwarf")
LIFELESSES[0] = new Sprite(0,200,800,600,"ground")
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

  //background
  BACKGROUNDS[0].draw()
  for(let i=1;i<BACKGROUNDS.length;i++)BACKGROUNDS[i].draw()

  //hero
  hero.draw()

  //other entity
//  for(let i=0;i<LIFELESSES.length;i++)LIFELESSES[i].draw()
//  for(let i=0;i<ALIVES.length;i++)ALIVES[i].draw()

}




function frame(){
	let now = Date.now()
	let dt = (now - lastTime)/1000

	update(dt)
	render()

	lastTime = now
	requestAnimationFrame(frame)
}
