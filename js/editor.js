
//editor
var camera = new Camera()
var setMode = "b"
var grabed = -1
var texture_in_use = undefined
var mouseDownX=0,mouseDownY=0,mouseUpX=0,mouseUpY=0,mouseX=0,mouseY=0,mouseIsDown=false
const ceilSize = 10



document.addEventListener("mousedown",(event)=>{
	mouseIsDown = true
  //
	mouseDownX = ceil(event.clientX + camera.x - canvas.width*0.5 - canvas.offsetLeft,  ceilSize)
	mouseDownY = ceil(event.clientY + camera.y - canvas.height*0.5 - canvas.offsetTop, ceilSize)

	if( PRESSED_KEYS[KEY_G] ){
			if(setMode == "m"){
				for(let i in ALIVES){
					let entity = ALIVES[i]
					if(	entity.x<mouseX &&
							entity.x+entity.width > mouseX &&
							entity.y<mouseY &&
							entity.y+entity.height > mouseY ){
								grabed = i
								break
							}
				}
			}
			if(setMode == "n"){
				for(let i in LIFELESSES){
					let entity = LIFELESSES[i]
					if(	entity.x<mouseX &&
							entity.x+entity.width > mouseX &&
							entity.y<mouseY &&
							entity.y+entity.height > mouseY ){
								grabed = i
							}

				}
			}
			if(setMode == "b"){
				for(let i in BACKGROUNDS){
					let entity = BACKGROUNDS[i]
					if(	entity.x<mouseX &&
							entity.x+entity.width > mouseX &&
							entity.y<mouseY &&
							entity.y+entity.height > mouseY ){
								grabed = i
							}
				}
			}
		}
})
document.addEventListener("mousemove",(event)=>{
	mouseX = ceil(event.clientX + camera.x - canvas.width*0.5 - canvas.offsetLeft, ceilSize)
	mouseY = ceil(event.clientY + camera.y - canvas.height*0.5 - canvas.offsetTop, ceilSize)

})
document.addEventListener("mouseup",(event)=>{
	mouseIsDown = false
	mouseUpX = ceil(event.clientX + camera.x - canvas.width*0.5 - canvas.offsetLeft, ceilSize)
	mouseUpY = ceil(event.clientY + camera.y - canvas.height*0.5 - canvas.offsetTop, ceilSize)
	if(grabed >= 0){
		if(setMode == "b"){
			BACKGROUNDS[grabed].x += mouseUpX-mouseDownX
			BACKGROUNDS[grabed].y += mouseUpY-mouseDownY
		}
		if(setMode == "n"){
			LIFELESSES[grabed].x += mouseUpX-mouseDownX
			LIFELESSES[grabed].y += mouseUpY-mouseDownY
		}
		if(setMode == "m"){
			ALIVE[grabed].x += mouseUpX-mouseDownX
			ALIVE[grabed].y += mouseUpY-mouseDownY
		}
		grabed=-1
	}

})

function editlog(dx, dy){

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
  	ctx.fillText(texture_in_use.key,canvas.width - 100, 110)

  	//mouse rect
  	if( grabed > -1){
  		ctx.strokeStyle = "magenta"
  		ctx.beginPath()
  		ctx.moveTo(mouseDownX + dx,mouseDownY+dy)
  		ctx.lineTo(mouseX+ dx,mouseY+dy)
  		ctx.stroke()
  		ctx.closePath()

  		if(setMode == "b"){
  			let tmp = BACKGROUNDS[grabed]
  			ctx.strokeRect(tmp.x+mouseX-mouseDownX+ dx,tmp.y+mouseY-mouseDownY+dy,tmp.width,tmp.height)
  		}
  		if(setMode == "n"){
  			let tmp = LIFELESSES[grabed]
  			ctx.strokeRect(tmp.x+mouseX-mouseDownX+ dx,tmp.y+mouseY-mouseDownY+dy,tmp.width,tmp.height)
  		}
  		if(setMode == "m"){
  			let tmp = ALIVE[grabed]
  			ctx.strokeRect(tmp.x+mouseX-mouseDownX+ dx,tmp.y+mouseY-mouseDownY+dy,tmp.width,tmp.height)
  		}

  	}else{
  		ctx.strokeStyle = "cyan"


  		if(mouseIsDown){
  			let tmpX = Math.min(mouseX,mouseDownX)
  			let tmpY = Math.min(mouseY,mouseDownY)
  			let tmpW = Math.max(mouseX,mouseDownX)-tmpX
  			let tmpH = Math.max(mouseY,mouseDownY)-tmpY
				ctx.filter = 'opacity(0.5)'
				ctx.drawImage(texture_in_use.texture.data,
											0,
											0,
											texture_in_use.texture.frameWidth,
											texture_in_use.texture.frameHeight,
											tmpX + tmpW*0.5 - texture_in_use.texture.frameWidth * PIXEL_SCALE * 0.5 +dx,
											tmpY + tmpH*0.5 - texture_in_use.texture.frameHeight * PIXEL_SCALE * 0.5 +dy,
											texture_in_use.texture.frameWidth * PIXEL_SCALE,
											texture_in_use.texture.frameHeight * PIXEL_SCALE)
				ctx.filter = 'none'
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
  		ctx.strokeStyle = "yellow"
  	}

  	//legend
  	ctx.fillStyle = "red"
  	ctx.fillText("mod: "+ setMode,canvas.width*0.5,canvas.height*0.5 + 10)
  	ctx.fillStyle = "yellow"
    ctx.fillText("map: "+map,20,50)
    ctx.fillText("wasd:move | c:grid | q&e:change texture",20,60)
  	ctx.fillText("b:background mode | n:lifelesses mode | m:alive mode",20,70)
  	ctx.fillText("space:set entity | x:delete entity | g:grab entity",20,80)
  	ctx.fillText("r:save map to buffer | t:save map to file",20,90)
}

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

  Promise.all(promisses).then(()=>{
    for(let [key,texture] of TEXTURE_LIST){
  		texture_in_use = { key:key, texture:texture }
  		break
  	}
    initial()
  }).catch((e)=>{console.log(e)})
}

function update(dt){

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
	//texture rigth
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
	//mod change
	if( ONCE_PRESSED_KEYS.has(KEY_B) ){
		setMode = "b"
	}
	if( ONCE_PRESSED_KEYS.has(KEY_N) ){
		setMode = "n"
	}
	if( ONCE_PRESSED_KEYS.has(KEY_M) ){
		setMode = "m"
	}
	//set entity
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
	//delete entity
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

  //alert map json
	if( ONCE_PRESSED_KEYS.has(KEY_R) ){
		let jm = mapToJson()
		alert("----------------------------\n"+jm+"\n----------------------------")
	}

  //download map json
	if( ONCE_PRESSED_KEYS.has(KEY_T) ){
		let jm = mapToJson()
		downloadText(jm)
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

	//hero
	hero.draw(dx,dy)

  editlog(dx, dy)

	if(DEBUG){
		ctx.strokeStyle = "blue"
		ctx.strokeText(canvas.style.width+" "+canvas.style.height,20,20)
		ctx.strokeText(canvas.width+" "+canvas.height,20,30)
		ctx.strokeText(frameID,20,40)
		ctx.strokeStyle = "yellow"
	}
}
