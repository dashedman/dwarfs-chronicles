requestAnimationFrame = window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function(callback){ window.setTimeout(callback, 66) }

var frameID = undefined
var lastTime = 0
var hero = undefined

var map = undefined
var mapStructure = undefined

//canvas
var canvas = document.getElementById("viewport")
var ctx = canvas.getContext('2d')
canvas.width = 960
canvas.height = 540


///////////////////////////////////////////////////////////
//editor
var camera = new Camera()
var setMode = "b"
var texture_in_use = undefined
var mouseDownX=0,mouseDownY=0,mouseUpX=0,mouseUpY=0,mouseX=0,mouseY=0,mouseIsDown=false
var ceilSize = 10
function getCeilMouse(x){
	return Math.round(x/ceilSize)*ceilSize
}

document.addEventListener("mousedown",(event)=>{
	mouseIsDown = true
	mouseDownX = getCeilMouse(event.clientX + camera.x - canvas.width*0.5 - canvas.offsetLeft)
	mouseDownY = getCeilMouse(event.clientY + camera.y - canvas.height*0.5 - canvas.offsetTop)
})
document.addEventListener("mousemove",(event)=>{
	mouseX = getCeilMouse(event.clientX + camera.x - canvas.width*0.5 - canvas.offsetLeft)
	mouseY = getCeilMouse(event.clientY + camera.y - canvas.height*0.5 - canvas.offsetTop)
})
document.addEventListener("mouseup",(event)=>{
	mouseIsDown = false
	mouseUpX=getCeilMouse(event.clientX + camera.x - canvas.width*0.5 - canvas.offsetLeft)
	mouseUpY=getCeilMouse(event.clientY + camera.y - canvas.height*0.5 - canvas.offsetTop)
})


///////////////////////////////////////////////////////////
//ACTIONS
PRESSED_KEYS.fill(false)
/*
document.addEventListener('keydown', function(event) {
	PRESSED_KEYS[event.keyCode] = true
	ONCE_PRESSED_KEYS.add(event.keyCode)
});
document.addEventListener('keyup', function(event) {
	PRESSED_KEYS[event.keyCode] = false
});*/
document.addEventListener('keydown', function(event) {
	PRESSED_KEYS[event.keyCode] = true
	ONCE_PRESSED_KEYS.add(event.keyCode)
});
document.addEventListener('keyup', function(event) {
	PRESSED_KEYS[event.keyCode] = false
});

window.addEventListener('blur', function() {
  PRESSED_KEYS.fill(false)
	if(frameID){
		cancelAnimationFrame(frameID);
		frameID = 0
	}
});
window.addEventListener('focus', function() {
	if(frameID>=0){
		lastTime = Date.now()
		frameID = requestAnimationFrame(frame)
	}
});



////SCENE
function mapPick(){
  console.log("map pick")
  getMapName()
  .then((mapName)=>{
    map = mapName
    console.log("map: ", map, "path: "+MAP_PATH+map+".json")
    loadJsonResources(MAP_PATH+map+".json")
    .then((jsonMap)=>{

      mapStructure = jsonMap
      console.log("map is loaded\n",mapStructure)
      loadData()

    })
    .catch(()=>{

      console.log("map not found")
      alert("map not found :c")

    })
  })
}

//LOAD DATA
function loadData(){
  console.log("loading textures")

  let mapTextureList = mapStructure["textures"]
  for(let keyTexture in mapTextureList){
		let texture = mapTextureList[keyTexture]
		TEXTURE_LIST.set(keyTexture,new Texture(DATA_PATH + texture.name, texture.frames, texture.frameSpeed))
  }

  //load waiting
  let promisses = []
  for(let key in TEXTURE_LIST){
  		let texture = TEXTURE_LIST.get(key)
  		promisses.push(new Promise((resolve,reject)=>{
  				texture.data.addEventListener("load", ()=>{
  					resolve()
  				},{once:true})
  		}))
  }

  Promise.all(promisses).then(initial).catch((e)=>{console.log(e)})
}

//EDITOR INIT START
function initial(){
  console.log("initial objects")
	ctx.fillStyle = "#000"
	ctx.strokeStyle = "yellow"
	ctx.imageSmoothingEnabled = false

	for(let [key,texture] of TEXTURE_LIST){
		texture_in_use = {key:key,texture:texture}
		break
	}


  let mapBackgrounds = mapStructure["backgrounds"]
  for(let obj of mapBackgrounds){
    if(obj.class_type == "sprite"){
      BACKGROUNDS.push(new Sprite(obj.x, obj.y, obj.width, obj.height, PIXEL_SCALE, obj.texture_name))
    }
  }

  let mapLifeless = mapStructure["lifelesses"]
  for(let obj of mapLifeless){
    if(obj.class_type == "sprite"){
      LIFELESSES.push(new Sprite(obj.x, obj.y, obj.width, obj.height, PIXEL_SCALE, obj.texture_name))
    }

  }

  let mapAlives = mapStructure["alive"]
  for(let obj of mapAlives){
    let obj = mapAlives[keyObj]
    if(obj.class_type == "alive"){
      ALIVES.push(new Alive(obj.x, obj.y, obj.width, obj.height, PIXEL_SCALE, obj.texture_name))
    }
  }

	let heroData =  mapStructure["hero"]
	hero = new Hero(heroData.x, heroData.y, heroData.width, heroData.height, PIXEL_SCALE,  heroData.race, 0, heroData.seat_height)

	console.log(TEXTURE_LIST)
	console.log(BACKGROUNDS)
	console.log(LIFELESSES)
	console.log(ALIVES)
	console.log(hero)

  console.log("start")
	lastTime = Date.now()
	frameID = requestAnimationFrame(frame);
}
////

//MAIN FUNCTIONS
function update(dt){
  //hero.update(dt)
  camera.update(dt)
  for(let i=0;i<ALIVES.length;i++)ALIVES[i].update(dt)
  for(let i=0;i<LIFELESSES.length;i++)LIFELESSES[i].update(dt)
  for(let i=0;i<BACKGROUNDS.length;i++)BACKGROUNDS[i].update(dt)

	//EDITOR
	//texture left

	if( ONCE_PRESSED_KEYS.has(KEY_Q) ){
		let oldkey = undefined
		for(let [key, texture] of TEXTURE_LIST){
			if(key == texture_in_use.key){
				if( oldkey )texture_in_use = {key:oldkey,texture:TEXTURE_LIST.get(oldkey)}
				break
			}

			oldkey = key
		}
	}
	if( ONCE_PRESSED_KEYS.has(KEY_E) ){
		let oldkey = null
		for(let [key, texture] of TEXTURE_LIST){
			if(oldkey == texture_in_use.key){
				texture_in_use = {key:key,texture:texture}
				break
			}

			oldkey = key
		}
	}
	if( ONCE_PRESSED_KEYS.has(KEY_B) ){
		setMode = "b"
	}
	if( ONCE_PRESSED_KEYS.has(KEY_N) ){
		setMode = "n"
	}
	if( ONCE_PRESSED_KEYS.has(KEY_M) ){
		setMode = "m"
	}
	if( ONCE_PRESSED_KEYS.has(KEY_SPACE) ){
		let tmpX = Math.min(mouseUpX,mouseDownX)
		let tmpY = Math.min(mouseUpY,mouseDownY)
		let tmpW = (Math.max(mouseUpX,mouseDownX)-tmpX)/PIXEL_SCALE
		let tmpH = (Math.max(mouseUpY,mouseDownY)-tmpY)/PIXEL_SCALE

		if(setMode == "b"){
			BACKGROUNDS.push(new Sprite(tmpX,tmpY,tmpW,tmpH,PIXEL_SCALE,texture_in_use.key))
		}
		if(setMode == "n"){
			LIFELESSES.push(new Sprite(tmpX,tmpY,tmpW,tmpH,PIXEL_SCALE,texture_in_use.key))
		}
		if(setMode == "m"){
			ALIVE.push(new Sprite(tmpX,tmpY,tmpW,tmpH,PIXEL_SCALE,texture_in_use.key))
		}
	}
	if( ONCE_PRESSED_KEYS.has(KEY_X) ){
		let deleted = false
		for(let i in ALIVES){
			let entity = ALIVES[i]
			if(deleted)break
			if(	entity.x<mouseX &&
					entity.x+entity.width > mouseX &&
					entity.y<mouseY &&
					entity.y+entity.height > mouseY ){
						deleted = true
						ALIVE.splice(i,1)
					}

		}
		for(let i in LIFELESSES){
			let entity = LIFELESSES[i]
			if(deleted)break
			if(	entity.x<mouseX &&
					entity.x+entity.width > mouseX &&
					entity.y<mouseY &&
					entity.y+entity.height > mouseY ){
						deleted = true
						LIFELESSES.splice(i,1)
					}

		}
		for(let i in BACKGROUNDS){
			let entity = BACKGROUNDS[i]
			if(deleted)break
			if(	entity.x<mouseX &&
					entity.x+entity.width > mouseX &&
					entity.y<mouseY &&
					entity.y+entity.height > mouseY ){
						deleted = true
						BACKGROUNDS.splice(i,1)
					}

		}
	}
}

function render(){
	let dx = canvas.width*0.5 - camera.x
	let dy = canvas.height*0.5 - camera.y

	ctx.clearRect(0,0,canvas.width,canvas.height)

  //background
  for(let i=0;i<BACKGROUNDS.length;i++)BACKGROUNDS[i].draw(dx,dy)

  //other entity
  for(let i=0;i<LIFELESSES.length;i++)LIFELESSES[i].draw(dx,dy)
  for(let i=0;i<ALIVES.length;i++)ALIVES[i].draw(dx,dy)

	hero.draw(dx,dy)

	//EDITOR

	//used texture
	ctx.drawImage(texture_in_use.texture.data,
								0,
								0,
								texture_in_use.texture.data.naturalWidth,
								texture_in_use.texture.data.naturalHeight,
								canvas.width - Math.min(100,texture_in_use.texture.data.naturalWidth),
								0,
								Math.min(100,texture_in_use.texture.data.naturalWidth),
								Math.min(100,texture_in_use.texture.data.naturalHeight))
	ctx.strokeText(texture_in_use.key,canvas.width - 100, 110)
	//mouse rect
	ctx.strokeStyle = "cyan"
	if(mouseIsDown){
		let tmpX = Math.min(mouseX,mouseDownX)
		let tmpY = Math.min(mouseY,mouseDownY)
		let tmpW = Math.max(mouseX,mouseDownX)-tmpX
		let tmpH = Math.max(mouseY,mouseDownY)-tmpY
		ctx.drawImage(texture_in_use.texture.data,
                  0,
                  0,
                  texture_in_use.texture.frameWidth,
                  texture_in_use.texture.frameHeight,
                  tmpX + tmpW*0.5 - texture_in_use.texture.frameWidth * PIXEL_SCALE * 0.5 +dx,
									tmpY + tmpH*0.5 - texture_in_use.texture.frameHeight * PIXEL_SCALE * 0.5 +dy,
                  texture_in_use.texture.frameWidth * PIXEL_SCALE,
                  texture_in_use.texture.frameHeight * PIXEL_SCALE)

		ctx.strokeRect(tmpX+dx,tmpY+dy,tmpW,tmpH)
	}
	else {
		let tmpX = Math.min(mouseUpX,mouseDownX)
		let tmpY = Math.min(mouseUpY,mouseDownY)
		let tmpW = Math.max(mouseUpX,mouseDownX)-tmpX
		let tmpH = Math.max(mouseUpY,mouseDownY)-tmpY
		ctx.strokeRect(tmpX+dx,tmpY+dy,tmpW,tmpH)
		ctx.strokeRect(mouseX+dx,mouseY+dy,1,1)
	}


		//grid
		if( PRESSED_KEYS[ KEY_C ]){
			ctx.strokeStyle = "gray"
			let tmpX = getCeilMouse(camera.x - canvas.width*0.5)
			let tmpY = getCeilMouse(camera.y - canvas.height*0.5)
			let tmpW = Math.floor(canvas.width / ceilSize)
			let tmpH = Math.floor(canvas.height / ceilSize)
			ctx.beginPath()
			for(let i = 0;i<=tmpW;i++){
				ctx.moveTo(tmpX+i*ceilSize+dx,tmpY+dy)
				ctx.lineTo(tmpX+i*ceilSize+dx,tmpY+tmpH*ceilSize+dy)
			}
			for(let i = 0;i<=tmpW;i++){
				ctx.moveTo(tmpX+dx,tmpY+i*ceilSize+dy)
				ctx.lineTo(tmpX+tmpW*ceilSize+dx,tmpY+i*ceilSize+dy)
			}
			ctx.stroke()
			ctx.closePath()
		}

	//legend
	ctx.strokeStyle = "red"
	ctx.strokeText("mod: "+ setMode,canvas.width*0.5,canvas.height*0.5 + 10)
	ctx.strokeStyle = "yellow"
  ctx.strokeText("map: "+map,20,50)
  ctx.strokeText("wasd:move | c:grid | q&e:change texture",20,60)
	ctx.strokeText("b:background mode | n:lifelesses mode | m:alive mode",20,70)
	ctx.strokeText("space:set entity | x:delete entity",20,80)



	if(DEBUG){
    camera.draw(dx,dy)
		ctx.strokeStyle = "blue"
		ctx.strokeText(canvas.style.width+" "+canvas.style.height,20,20)
		ctx.strokeText(canvas.width+" "+canvas.height,20,30)
		ctx.strokeText(frameID,20,40)
		ctx.strokeStyle = "yellow"
	}
}

function frame(){
	let now = Date.now()
	let dt = Math.min(100,now - lastTime)/1000

	if(dt>0.0001){
		update(dt*TIME_BOOSTER)
		render()


		ONCE_PRESSED_KEYS.clear()

		lastTime = now
	}
	if(frameID)frameID=requestAnimationFrame(frame)
}


//START
mapPick()
