//CLASSES
class Texture{
  constructor(path){
		this.data = new Image()
		this.data.src = path
  }
}
class AnimationTexture extends Texture{
  constructor(path,n=1,fspeed=10){
		super(path)

    this.frames = n
    this.frameSpeed = fspeed
		this.frameWidth = 1

    this.data.onload = ()=>{
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
            let koeficientX = Math.abs(this.x+this.width*0.5 - (obj.x+obj.width*0.5))/(obj.width*this.width)
            let koeficientY = Math.abs(this.y+this.height*0.5 - (obj.y+obj.height*0.5))/(obj.height*this.height)
            if(koeficientX<koeficientY){
                if(obj.speedY>0){
    							obj.y = this.y+this.height
    							obj.speedY = 0
    						}else if(obj.speedY<0){
    							obj.speedY = 0
    							obj.y = this.y - obj.height
    							obj.onFloor = 1
    						}
            }else{
  						if(obj.speedX>0){
  							obj.x = this.x-obj.width
  						}else if(obj.speedX<0){
  							obj.x = this.x+this.width
  						}
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
    if(DEBUG){
      ctx.strokeRect( this.x,
                this.y,
                this.width,
                this.height)
      ctx.strokeText("x:"+this.x,this.x,this.y+10)
      ctx.strokeText("y:"+this.y,this.x,this.y+20)
    }
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
                  Math.floor(this.frameStatus/this.texture.frameSpeed)*this.texture.frameWidth,
                  0,
                  this.texture.frameWidth,
                  this.texture.data.height,
									this.x,
									this.y,
									this.width,
									this.height)
    if(DEBUG){
      ctx.strokeRect( this.x,
                this.y,
                this.width,
                this.height )
      ctx.strokeText("x:"+this.x,this.x,this.y+10)
      ctx.strokeText("y:"+this.y,this.x,this.y+20)
    }
  }
  update(dt){
    this.frameStatus = (this.frameStatus+dt*100)%(this.texture.frames*this.texture.frameSpeed)
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
      if(this.direction<0){
        ctx.translate(this.x*2+this.width, 0)
        ctx.scale(-1,1)
      }
      switch(this.entityState){
        case ANIMATION_STATE_STAY:
          ctx.drawImage(this.animation_stay.data,
                        Math.floor(this.frameStatus/this.animation_stay.frameSpeed)*this.animation_stay.frameWidth,
                        0,
                        this.animation_stay.frameWidth,
                        this.animation_stay.data.height,
												this.x,
												this.y,
												this.width,
												this.height)
          break
        case ANIMATION_STATE_FALL:
          ctx.drawImage(this.animation_fall.data,
                        Math.floor(this.frameStatus/this.animation_fall.frameSpeed)*this.animation_fall.frameWidth,
                        0,
                        this.animation_fall.frameWidth,
                        this.animation_fall.data.height,
												this.x,
	                      this.y,
	                      this.width,
	                      this.height)
          break
        case ANIMATION_STATE_RUN:
          ctx.drawImage(this.animation_run.data,
                        Math.floor(this.frameStatus/this.animation_run.frameSpeed)*this.animation_run.frameWidth,
                        0,
                        this.animation_run.frameWidth,
                        this.animation_run.data.height,
                        this.x,
                        this.y,
                        this.width,
                        this.height)
          break
        case ANIMATION_STATE_JUMP:
          ctx.drawImage(this.animation_jump.data,
                        Math.floor(this.frameStatus/this.animation_jump.frameSpeed)*this.animation_jump.frameWidth,
                        0,
                        this.animation_jump.frameWidth,
                        this.animation_jump.data.height,
												this.x,
												this.y,
												this.width,
												this.height)
          break
      }
      if(this.direction<0){
        ctx.scale(-1,1)
        ctx.translate(-this.x*2-this.width, 0)
      }
      if(DEBUG){
        ctx.strokeRect( this.x,
                  this.y,
                  this.width,
                  this.height)
    		ctx.strokeText("x:"+this.x,this.x,this.y+10)
    		ctx.strokeText("y:"+this.y,this.x,this.y+20)
        ctx.strokeText("state:"+this.entityState+" frame"+this.frameStatus,this.x,this.y+30)
      }
    }

    update = function(dt){
			switch(this.entityState){
					case ANIMATION_STATE_STAY:
	      		this.frameStatus = (this.frameStatus+dt*100)%(this.animation_stay.frames*this.animation_stay.frameSpeed)
						break
					case ANIMATION_STATE_FALL:
	      		this.frameStatus = (this.frameStatus+dt*100)%(this.animation_fall.frames*this.animation_fall.frameSpeed)
						break
					case ANIMATION_STATE_RUN:
	      		this.frameStatus = (this.frameStatus+dt*100)%(this.animation_run.frames*this.animation_run.frameSpeed)
						break
					case ANIMATION_STATE_JUMP:
	      		this.frameStatus = (this.frameStatus+dt*100)%(this.animation_jump.frames*this.animation_jump.frameSpeed)
						break
	    }
    }
}


class Hero extends Alive{
	constructor(x=0,y=0,w=0,h=0,source_path=""){
    super(x,y,w,h,source_path)
  }
  update = function(dt){
    var newFlag = false
		var runFlag = false
		var fallFlag = false

    //ХОДИТ
		if( PRESSED_KEYS[ KEY_LEFT ] || PRESSED_KEYS[ KEY_A ] ) {
			runFlag = true
			this.speedX = -100
			this.x += this.speedX * dt
      this.direction = -1
		}
		if( PRESSED_KEYS[ KEY_RIGHT ] || PRESSED_KEYS[ KEY_D ] ) {
			runFlag = true
			this.speedX = 100
      this.x += this.speedX * dt
      this.direction = 1
		}

      //Физика прыжжка
		if( PRESSED_KEYS[KEY_SPACE] && this.onFloor){
			this.speedY = 100
			//this.onFloor -= 1
		}
		this.speedY = this.speedY - dt * 50
		this.y -= this.speedY * dt * 2

		for(let i=0;i<LIFELESSES.length;i++){
			LIFELESSES[i].collide(this)
		}

		if(this.speedY>0){
			if(this.entityState != ANIMATION_STATE_FALL){
				newFlag = true
				this.entityState = ANIMATION_STATE_FALL
			}
		}
		else if(this.speedY<0){
			if(this.entityState != ANIMATION_STATE_JUMP){
				newFlag = true
				this.entityState = ANIMATION_STATE_JUMP
			}
		}else	if(runFlag){
			if(this.entityState != ANIMATION_STATE_RUN){
				newFlag = true
        this.entityState = ANIMATION_STATE_RUN
			}
		}else{
			if(this.entityState != ANIMATION_STATE_STAY){
				newFlag = true
        this.entityState = ANIMATION_STATE_STAY
			}
		}
    if(newFlag) this.frameStatus=0;
    else switch(this.entityState){
				case ANIMATION_STATE_STAY:
      		this.frameStatus = (this.frameStatus+dt*100)%(this.animation_stay.frames*this.animation_stay.frameSpeed)
					break
				case ANIMATION_STATE_FALL:
      		this.frameStatus = (this.frameStatus+dt*100)%(this.animation_fall.frames*this.animation_fall.frameSpeed)
					break
				case ANIMATION_STATE_RUN:
      		this.frameStatus = (this.frameStatus+dt*100)%(this.animation_run.frames*this.animation_run.frameSpeed)
					break
				case ANIMATION_STATE_JUMP:
      		this.frameStatus = (this.frameStatus+dt*100)%(this.animation_jump.frames*this.animation_jump.frameSpeed)
					break
    }
	}
}
