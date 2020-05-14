//CLASSES
class Texture{
  constructor(path,n=1,fspeed=10){
    this.frameWidth = 1
    this.frameHeight = 1
    this.frames = n
    this.frameSpeed = fspeed

		this.data = new Image()
    this.data.addEventListener("load", ()=>{
			this.frameWidth = Math.floor(this.data.naturalWidth / this.frames)
      this.frameHeight = this.data.naturalHeight
		},{once:true})
    this.data.src = path
  }
}

class Camera{
  constructor(x=0,y=0){
    this.x = x
    this.y = y
  }
  update(dt){
  		if( PRESSED_KEYS[ KEY_A ] ) {
        this.x += -1000*dt
  		}
  		if( PRESSED_KEYS[ KEY_D ] ) {
        this.x += 1000*dt
  		}
      if( PRESSED_KEYS[ KEY_W ] ) {
        this.y += -1000*dt
      }
      if( PRESSED_KEYS[ KEY_S ] ) {
        this.y += 1000*dt
  		}
  }
}


class Entity{
  constructor(x=0,y=0,w=1,h=1,s=PIXEL_SCALE, type=0, parallax = 0){
    this.x = x
    this.y = y
    this.s = s
    this.width = w*s
    this.height = h*s
    this.parallax = parallax

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
  constructor(x=0,y=0,w=1,h=1,s=PIXEL_SCALE,source="", type=0, parallax = 0){
    super(x,y,w,h,s,type,parallax)
    this.texture = TEXTURE_LIST.get(source)
    this.frameStatus = 0
    this.source = source
  }
  draw(dx=0,dy=0){
    let p = parallax_f(this.parallax)
    ctx.drawImage(this.texture.data,
                  Math.floor(this.frameStatus/this.texture.frameSpeed)*this.texture.frameWidth,
                  0,
                  this.texture.frameWidth,
                  this.texture.frameHeight,
                  (this.x + this.width*0.5 - this.texture.frameWidth * this.s * 0.5 +dx)*p +(canvas.width )*0.5,
									(this.y + this.height*0.5 - this.texture.frameHeight * this.s * 0.5 +dy)*p  +(canvas.height )*0.5,
                  this.texture.frameWidth * this.s * p,
                  this.texture.frameHeight * this.s * p)
  }
  update(dt){
    this.frameStatus = (this.frameStatus+dt*100)%(this.texture.frames*this.texture.frameSpeed)
  }

  debugDraw(dx,dy){
    let p = parallax_f(this.parallax)

    ctx.beginPath()
    ctx.moveTo( (this.x + this.width*0.5 - this.texture.frameWidth * this.s * 0.5 + dx)*p +(canvas.width )*0.5,
                (this.y + this.height*0.5 - this.texture.frameHeight * this.s * 0.5 + dy)*p  +(canvas.height )*0.5)
    ctx.lineTo(this.x+dx +canvas.width *0.5,this.y+dy +canvas.height *0.5,)
    ctx.stroke()
    ctx.closePath()
    //texture box
    ctx.strokeRect( (this.x + this.width*0.5 - this.texture.frameWidth * this.s * 0.5 + dx)*p +(canvas.width )*0.5,
                    (this.y + this.height*0.5 - this.texture.frameHeight * this.s * 0.5 + dy)*p  +(canvas.height )*0.5,
                    this.texture.frameWidth*this.s* p,
                    this.texture.frameHeight*this.s* p)

    //physics box
    if(this.collideFlag){
      ctx.strokeStyle = "green"
      ctx.strokeRect( this.x+dx +canvas.width *0.5,
                      this.y+dy +canvas.height *0.5,
                      this.width,
                      this.height)
    }else{
      ctx.strokeStyle = "blue"
      ctx.strokeRect( this.x+dx +canvas.width *0.5,
                      this.y+dy +canvas.height *0.5,
                      this.width,
                      this.height)

    }
    //stats
    ctx.fillText("x:"+this.x + " y:"+this.y,this.x + canvas.width*0.5 + dx,this.y + canvas.height*0.5 + dy +10)
    ctx.fillText("w:"+this.width + " h:"+this.height,this.x + canvas.width*0.5 + dx,this.y + canvas.height*0.5 + dy +20)
    ctx.fillText("tw:"+this.texture.frameWidth + " th:"+this.texture.frameHeight,this.x + canvas.width*0.5 + dx,this.y + canvas.height*0.5 + dy +30)
    ctx.strokeStyle = "yellow"
  }
}

class Alive extends Sprite{
  constructor(x=0,y=0,w=1,h=1,s=PIXEL_SCALE,source="",type = 0,parallax = 0){
    super(x,y,w,h,s,source+"_stay",type,parallax)
    this.speedX = 0
    this.speedY = 0
		this.accelerationX = 200
    this.jumpPower = 0.6
    this.onFloor = 0
    this.direction = 1

    this.entityState = ANIMATION_STATE_STAY
    this.frameStatus = 0
    this.source = source

    this.animationList = new Array()
    this.animationList[ANIMATION_STATE_STAY] = TEXTURE_LIST.get(source+"_stay")
    this.animationList[ANIMATION_STATE_FALL] = TEXTURE_LIST.get(source+"_fall")
    this.animationList[ANIMATION_STATE_RUN] = TEXTURE_LIST.get(source+"_run")
    this.animationList[ANIMATION_STATE_JUMP_READY] = TEXTURE_LIST.get(source+"_jump_ready")
    this.animationList[ANIMATION_STATE_JUMP] = TEXTURE_LIST.get(source+"_jump")
    this.animationList[ANIMATION_STATE_JUMP_END] = TEXTURE_LIST.get(source+"_jump_end")


  }


  stateUpdate = function(newState){
    if(DEBUG)console.log(newState)

    this.frameStatus = 0
    this.entityState = newState
    this.texture = this.animationList[this.entityState]
  }


  draw(dx=0,dy=0){
      if(this.direction<0){
        ctx.translate((this.x+dx)*2+this.width+canvas.width , 0)
        ctx.scale(-1,1)
      }

      let p = parallax_f(this.parallax)
      ctx.drawImage(this.texture.data,
                    Math.floor(this.frameStatus/this.texture.frameSpeed)*this.texture.frameWidth,
                    0,
                    this.texture.frameWidth,
                    this.texture.frameHeight,
                    (this.x + this.width*0.5 - this.texture.frameWidth * this.s * 0.5 +dx)*p +(canvas.width )*0.5,
  									(this.y + this.height*0.5 - this.texture.frameHeight * this.s * 0.5 +dy)*p  +(canvas.height )*0.5,
                    this.texture.frameWidth * this.s * p,
                    this.texture.frameHeight * this.s * p)

      if(this.direction<0){
        ctx.translate((this.x+dx)*2+this.width+canvas.width, 0)
        ctx.scale(-1,1)
      }
    }

    update = function(dt){
        this.frameStatus = (this.frameStatus+dt*100)%(this.texture.frames*this.texture.frameSpeed)
    }
    debugDraw(dx,dy){
      let p = parallax_f(this.parallax)

      ctx.beginPath()
      ctx.moveTo( (this.x + this.width*0.5 - this.texture.frameWidth * this.s * 0.5 + dx)*p +(canvas.width )*0.5,
                  (this.y + this.height*0.5 - this.texture.frameHeight * this.s * 0.5 + dy)*p  +(canvas.height )*0.5)
      ctx.lineTo(this.x+dx +canvas.width *0.5,this.y+dy +canvas.height *0.5,)
      ctx.stroke()
      ctx.closePath()
      //texture box
      ctx.strokeRect( (this.x + this.width*0.5 - this.texture.frameWidth * this.s * 0.5 + dx)*p +(canvas.width )*0.5,
                      (this.y + this.height*0.5 - this.texture.frameHeight * this.s * 0.5 + dy)*p  +(canvas.height )*0.5,
                      this.texture.frameWidth*this.s* p,
                      this.texture.frameHeight*this.s* p)
      //physics box
      ctx.strokeStyle = "blue"
      ctx.strokeRect( this.x+dx + canvas.width*0.5,
                      this.y+dy + canvas.height*0.5,
                      this.width,
                      this.height)
      //stats
      ctx.strokeStyle = "yellow"
      ctx.fillText("x:"+this.x+" y:"+this.y,this.x + canvas.width*0.5 + dx,this.y + canvas.height*0.5 + dy -25)
      ctx.fillText("dx:"+this.speedX+" dy:"+this.speedY,this.x + canvas.width*0.5 + dx,this.y + canvas.height*0.5 + dy -15)
      ctx.fillText("state:"+this.entityState+" frame:"+this.frameStatus,this.x + canvas.width*0.5 + dx,this.y + canvas.height*0.5 + dy -5)
    }
}


class Humanity extends Alive{
  constructor(x=0,y=0,w=1,h=1,s=PIXEL_SCALE,source="",type=0,parallax=0, seat_height=1){
    super(x,y,w,h,s,source,type,parallax=0)

    this.seatFlag = false
    this.seat_height = seat_height * this.s
    this.stay_height = this.height

    this.animationList[ANIMATION_STATE_SITING] = TEXTURE_LIST.get(source+"_siting")
    this.animationList[ANIMATION_STATE_SEAT] = TEXTURE_LIST.get(source+"_seat")
    this.animationList[ANIMATION_STATE_CROUCH] = TEXTURE_LIST.get(source+"_crouch")
    this.animationList[ANIMATION_STATE_UPING] = TEXTURE_LIST.get(source+"_uping")

  }


  inTonel(){
    let tmpY = this.y + this.height - this.stay_height
    for(let shape of LAYERS[4]){
      if( shape.x < this.x+this.width &&
          shape.x+shape.width > this.x &&
          shape.y+shape.height >= tmpY &&
          shape.y+shape.height < this.y){

        return true
      }
    }
    return false
  }


  stateUpdate = function(newState){
    if(DEBUG)console.log(newState,this.onFloor,this.seatFlag)

    if(newState == ANIMATION_STATE_SEAT){
      this.y -= (this.seat_height - this.height)
      this.height = this.seat_height
    }else if(this.entityState == ANIMATION_STATE_SEAT && newState != ANIMATION_STATE_SEAT){
      this.y -= (this.stay_height - this.height)
      this.height = this.stay_height
    }

    this.frameStatus=0
    this.entityState = newState
    this.texture = this.animationList[this.entityState]
  }
}


class Hero extends Humanity{
	constructor(x=0,y=0,w=1,h=1,s=PIXEL_SCALE,source="",type=0, parallax=0, seat_height=1){
    super(x,y,w,h,s,source,type, parallax, seat_height)
  }


  stateUpdate = function(newState){
    if(DEBUG)console.log(newState,this.onFloor,this.seatFlag,this.seat_height)

    if(newState == ANIMATION_STATE_SEAT  || newState == ANIMATION_STATE_CROUCH){
      this.y -= (this.seat_height - this.height)
      this.height = this.seat_height
    }else{
      this.y -= (this.stay_height - this.height)
      this.height = this.stay_height
    }

    this.frameStatus=0
    this.entityState = newState
    this.texture = this.animationList[this.entityState]
  }


  update = function(dt){
    let newState = 0
    let runFlag = false
    let landingFlag = false

    //state check
    switch(this.entityState){

      case ANIMATION_STATE_JUMP_READY:
        if(this.frameStatus > (this.texture.frames-1) * this.texture.frameSpeed){
          newState = ANIMATION_STATE_JUMP
          this.speedY = -this.jumpPower * GRAVITY
        }
        else newState = ANIMATION_STATE_JUMP_READY
        break

      case ANIMATION_STATE_JUMP_END:
        if(this.frameStatus > (this.texture.frames-1) * this.texture.frameSpeed){
          this.onFloor = true
        }
        else newState = ANIMATION_STATE_JUMP_END
        break

      case ANIMATION_STATE_SITING:
        if(this.frameStatus > (this.texture.frames-1) * this.texture.frameSpeed){
          newState = ANIMATION_STATE_SEAT
          this.seatFlag = true
        }
        else newState = ANIMATION_STATE_SITING
        break

      case ANIMATION_STATE_UPING:
        if(this.frameStatus > (this.texture.frames-1) * this.texture.frameSpeed){
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
  		}else if(this.seatFlag && this.onFloor){
        if(!this.inTonel())newState = ANIMATION_STATE_UPING
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
		for( let shape of LAYERS[4] ){
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
        if(!this.inTonel())newState = ANIMATION_STATE_FALL
        else newState = ANIMATION_STATE_SEAT
        this.onFloor = false
        this.seatFlag = false
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
                              %(this.texture.frames*this.texture.frameSpeed)

	}
}
