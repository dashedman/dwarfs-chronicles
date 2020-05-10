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
  }
}



class Entity{
  constructor(x=0,y=0,s=1,type=0){
    this.x = x
    this.y = y
    this.s = s
    this.width = 1
    this.height = 1

		this.type = type

    if(DEBUG)this.collideFlag = false
  }

	collide(obj){
    //objects normal face vector
    let normalX = 0
    let normalY = 0

    //type of collision switch
		switch(this.type){
			case TYPE_BOX:
				switch (obj.type) {
					case TYPE_BOX:
						//collision flag
						if( obj.x+obj.width < this.x ||
  							obj.x > this.x+this.width ||
  							obj.y+obj.height < this.y ||
  							obj.y > this.y+this.height){
                  if(DEBUG)this.collideFlag = false
                  return [0,0]//no collision
                }


            if(DEBUG){
              this.collideFlag = true
            }

						//collision reaction
            let dcX = (this.x-obj.x)+(this.width-obj.width)*0.5
            let dcY = (this.y-obj.y)+(this.height-obj.height)*0.5

            if(dcY>0){

              if( dcX>0 ){
                if( cross(obj.speedX, obj.speedY,
                          this.x-obj.x-obj.width, this.y-obj.y-obj.height) <= 0 ){
                  //rigth collision for obj
                  normalX = 1
                  normalY = 0
                }else{
                  //bottom collision for obj
                  normalX = 0
                  normalY = 1
                }

  						}else{
                if( cross(obj.speedX, obj.speedY,
                          this.x+this.width-obj.x, this.y-obj.y-obj.height) >= 0 ){
                  //left collision for obj
                  normalX = -1
                  normalY = 0
                }else{
                  //bottom collision for obj
                  normalX = 0
                  normalY = 1
                }

  						}

						}else{
              //top collision for obj
              /*
              normalX = 0
              normalY = -1
              */
              if(dcX>0){
                if( cross(obj.speedX, obj.speedY,
                          this.x-obj.x-obj.width, this.y+this.height-obj.y) >= 0 ){
                  //rigth collision for obj
                  normalX = 1
                  normalY = 0
                }else{
                  //top collision for obj
                  normalX = 0
                  normalY = -1
                }

  						}else{
                if( cross(obj.speedX, obj.speedY,
                          this.x+this.width-obj.x, this.y+this.height-obj.y) <= 0 ){
                  //left collision for obj
                  normalX = -1
                  normalY = 0
                }else{
                  //top collision for obj
                  normalX = 0
                  normalY = -1
                }

  						}
						}
						break
				}
				break
		}//switch end

    return [normalX,normalY]
	}
}


class Sprite extends Entity{
  constructor(x=0,y=0,s=0,source_path="",type=0,texture_dominate = false){
    super(x,y,s,type)
    this.texture = TEXTURE_LIST[source_path]

    this.width = this.texture.data.naturalWidth * s
    this.height = this.texture.data.naturalHeight * s
  }
  draw(dx=0,dy=0){
    ctx.drawImage(this.texture.data,
									0,
									0,
									this.texture.data.width,
									this.texture.data.height,
									this.x+dx,
									this.y+dy,
									this.width,
									this.height)
    if(DEBUG){
      if(this.collideFlag){
        ctx.strokeStyle = "red"
        ctx.strokeRect( this.x-1+dx,
                        this.y-1+dy,
                        this.width+2,
                        this.height+2 )
        ctx.strokeStyle = "yellow"
      }
      ctx.strokeRect( this.x+dx,
                      this.y+dy,
                      this.width,
                      this.height)
      ctx.strokeText("x:"+this.x,this.x+dx,this.y+dy+10)
      ctx.strokeText("y:"+this.y,this.x+dx,this.y+dy+20)
    }
  }
  update(dt){}
}
class ASprite extends Sprite{
  constructor(x=0,y=0,s=0,source_path="",type=0,texture_dominate = false){
    super(x,y,s,source_path="",type,texture_dominate)
    this.frameStatus = 0
  }
  draw(dx=0,dy=0){
    ctx.drawImage(this.texture.data,
                  Math.floor(this.frameStatus/this.texture.frameSpeed)*this.texture.frameWidth,
                  0,
                  this.texture.frameWidth,
                  this.texture.data.height,
                  this.x+dx,
									this.y+dy,
									this.width,
									this.height)
    if(DEBUG){
      if(this.collideFlag){
        ctx.strokeStyle = "red"
        ctx.strokeRect( this.x+1+dx,
                        this.y+1+dy,
                        this.width-2,
                        this.height-2 )
        ctx.strokeStyle = "yellow"
      }
      ctx.strokeRect( this.x+dx,
                      this.y+dy,
                      this.width,
                      this.height)
      ctx.strokeText("x:"+this.x,this.x+dx,this.y+dy+10)
      ctx.strokeText("y:"+this.y,this.x+dx,this.y+dy+20)
    }
  }
  update(dt){
    this.frameStatus = (this.frameStatus+dt*100)%(this.texture.frames*this.texture.frameSpeed)
  }
}


class Alive extends Entity{
  constructor(x=0,y=0,s=0,source_path="",type = 0){
    super(x,y,s,type)
    this.speedX = 0
    this.speedY = 0
		this.accelerationX = 200
    this.jumpPower = 0.5
    this.onFloor = 0
    this.direction = 1
    this.seatFlag = false

    this.entityState = ANIMATION_STATE_STAY
    this.frameStatus = 0

    this.animationList = new Array(ANIMATION_STATE_COUNTER)
    this.animationList[ANIMATION_STATE_STAY] = TEXTURE_LIST[source_path+"_stay"]
    this.animationList[ANIMATION_STATE_FALL] = TEXTURE_LIST[source_path+"_fall"]
    this.animationList[ANIMATION_STATE_RUN] = TEXTURE_LIST[source_path+"_run"]
    this.animationList[ANIMATION_STATE_JUMP_READY] = TEXTURE_LIST[source_path+"_jump_ready"]
    this.animationList[ANIMATION_STATE_JUMP] = TEXTURE_LIST[source_path+"_jump"]
    this.animationList[ANIMATION_STATE_JUMP_END] = TEXTURE_LIST[source_path+"_jump_end"]
    this.animationList[ANIMATION_STATE_SITING] = TEXTURE_LIST[source_path+"_siting"]
    this.animationList[ANIMATION_STATE_SEAT] = TEXTURE_LIST[source_path+"_seat"]
    this.animationList[ANIMATION_STATE_CROUCH] = TEXTURE_LIST[source_path+"_crouch"]
    this.animationList[ANIMATION_STATE_UPING] = TEXTURE_LIST[source_path+"_uping"]

    this.curentAnimation = this.animationList[ANIMATION_STATE_STAY]

    this.width = this.curentAnimation.frameWidth * this.s
    this.height = this.curentAnimation.data.height * this.s
  }

  stateUpdate(newState){
    if(DEBUG)console.log(newState,this.onFloor,this.seatFlag)
    this.frameStatus=0
    this.entityState = newState
    this.curentAnimation = this.animationList[this.entityState]

    let newWidth = this.curentAnimation.frameWidth * this.s
    let newHeight = this.curentAnimation.data.height * this.s
    this.x -= (newWidth - this.width)*0.5
    this.y -= (newHeight - this.height)
    this.width = newWidth
    this.height = newHeight
  }

  draw(dx=0,dy=0){
      if(this.direction<0){
        ctx.translate((this.x+dx)*2+this.width, 0)
        ctx.scale(-1,1)
      }

      ctx.drawImage(this.curentAnimation.data,
                    Math.floor(this.frameStatus/this.curentAnimation.frameSpeed)*this.curentAnimation.frameWidth,
                    0,
                    this.curentAnimation.frameWidth,
                    this.curentAnimation.data.height,
                    this.x+dx,
  									this.y+dy,
										this.width,
										this.height)

      if(this.direction<0){
        ctx.translate((this.x+dx)*2+this.width, 0)
        ctx.scale(-1,1)
      }
      if(DEBUG){
        ctx.strokeRect( this.x+dx,
                        this.y+dy,
                        this.width,
                        this.height)
    		ctx.strokeText("x:"+this.x+" y:"+this.y,this.x+dx,this.y+dy-25)
    		ctx.strokeText("dx:"+this.speedX+" dy:"+this.speedY,this.x+dx,this.y+dy-15)
        ctx.strokeText("state:"+this.entityState+" frame:"+this.frameStatus,this.x+dx,this.y+dy-5)
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
	constructor(x=0,y=0,s=0,source_path="",type=0){
    super(x,y,s,source_path,type)
  }
  update = function(dt){
    let newState = 0
    let runFlag = false
    let landingFlag = false

    //state check
    switch(this.entityState){

      case ANIMATION_STATE_JUMP_READY:
        if(this.frameStatus > (this.curentAnimation.frames-1) * this.curentAnimation.frameSpeed){
          newState = ANIMATION_STATE_JUMP
          this.speedY = -this.jumpPower * GRAVITY
        }
        else newState = ANIMATION_STATE_JUMP_READY
        break

      case ANIMATION_STATE_JUMP_END:
        if(this.frameStatus > (this.curentAnimation.frames-1) * this.curentAnimation.frameSpeed){
          this.onFloor = true
        }
        else newState = ANIMATION_STATE_JUMP_END
        break

      case ANIMATION_STATE_SITING:
        if(this.frameStatus > (this.curentAnimation.frames-1) * this.curentAnimation.frameSpeed){
          newState = ANIMATION_STATE_SEAT
          this.seatFlag = true
        }
        else newState = ANIMATION_STATE_SITING
        break

      case ANIMATION_STATE_UPING:
        if(this.frameStatus > (this.curentAnimation.frames-1) * this.curentAnimation.frameSpeed){
          this.seatFlag = false
        }
        else newState = ANIMATION_STATE_UPING
        break

    }//switch end

    //event check
    if(newState == 0){

      //WALK
      this.speedX = 0
  		if( PRESSED_KEYS[ KEY_LEFT ] || PRESSED_KEYS[ KEY_A ] ) {
        runFlag = !runFlag
        this.direction = -1
  		}
  		if( PRESSED_KEYS[ KEY_RIGHT ] || PRESSED_KEYS[ KEY_D ] ) {
        runFlag = !runFlag
        this.direction = 1
  		}

      //SEAT
      if( (PRESSED_KEYS[ KEY_DOWN ] || PRESSED_KEYS[ KEY_S ]) && this.onFloor) {
        if(!this.seatFlag){
          newState = ANIMATION_STATE_SITING
        }
  		}else if(this.seatFlag){
        newState = ANIMATION_STATE_UPING

        let tmpY = this.animationList[ANIMATION_STATE_STAY].data.height * this.s
        for(let shape of LIFELESSES){
          if( shape.x < this.x+this.width &&
              shape.x+shape.width > this.x &&
              shape.y+shape.height >= tmpY &&
              shape.y+shape.height < this.y){

            newState = 0
            break
          }
        }
      }

      //JUMP
  		if( PRESSED_KEYS[KEY_SPACE] && this.onFloor && !this.seatFlag){
        newState = ANIMATION_STATE_JUMP_READY
        this.onFloor = false
  		}

    }

    //PHYSICS
    if(runFlag){
      this.speedX = this.accelerationX * (this.seatFlag ? 0.5 : 1) * this.direction
      this.x += this.speedX * dt
    }
		this.speedY = this.speedY + dt * GRAVITY
		this.y += this.speedY * dt

    let stopSpeedXFlag = false
    let stopSpeedYFlag = false
		for(let shape of LIFELESSES){
      //collides
			let [normalX,normalY] = shape.collide(this)
      if(normalX || normalY){

        if(normalY > 0){
          stopSpeedYFlag = true
          this.y = shape.y - this.height
          landingFlag = true
        }else if(normalY < 0){
          this.y = shape.y + shape.height
          stopSpeedYFlag = true
        }

        if(normalX > 0){
          this.x = shape.x - this.width
          stopSpeedXFlag = true
        }else if(normalX < 0){
          this.x = shape.x + shape.width
          stopSpeedXFlag = true
        }

      }
		}

    if(stopSpeedXFlag)this.speedX = 0
    if(stopSpeedYFlag)this.speedY = 0



    if(!newState){
      if(this.speedY > 0){
        newState = ANIMATION_STATE_FALL
        this.onFloor = false
      }else if(this.speedY < 0){
  			newState = ANIMATION_STATE_JUMP
  		}else	if(landingFlag && !this.onFloor){
        newState = ANIMATION_STATE_JUMP_END
      }else if(runFlag != 0){
        if(this.seatFlag) newState = ANIMATION_STATE_CROUCH
        else newState = ANIMATION_STATE_RUN
  		}else if(this.seatFlag){
        newState = ANIMATION_STATE_SEAT
      }
    }

    if(this.entityState != newState){
      this.stateUpdate(newState)
    }else this.frameStatus = (this.frameStatus+dt*100)
                              %(this.curentAnimation.frames*this.curentAnimation.frameSpeed)

	}
}
