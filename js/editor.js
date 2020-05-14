
//editor
var camera = new Camera()

var usedLayer = 4
var grabed = -1
var texture_in_use = undefined
var mouseDownX=0,mouseDownY=0,mouseUpX=0,mouseUpY=0,mouseX=0,mouseY=0,mouseIsDown=false

function start(){

	hero.update = Alive.prototype.update

	console.log("start")
	lastTime = Date.now()
	frameID = requestAnimationFrame(frame);

}
const ceilSize = 10



document.addEventListener("mousedown",(event)=>{
	mouseIsDown = true
  //
	mouseDownX = ceil(event.clientX + camera.x - canvas.offsetLeft,  ceilSize)
	mouseDownY = ceil(event.clientY + camera.y - canvas.offsetTop, ceilSize)

	if( PRESSED_KEYS[KEY_G] ){
			for(let i in LAYERS[usedLayer]){
				let entity = LAYERS[usedLayer][i]
				if(	entity.x <= mouseX &&
						entity.x+entity.width >= mouseX &&
						entity.y <= mouseY &&
						entity.y+entity.height >= mouseY ){
							grabed = i
							break
						}
			}

	}
})
document.addEventListener("mousemove",(event)=>{
	mouseX = ceil(event.clientX + camera.x - canvas.offsetLeft, ceilSize)
	mouseY = ceil(event.clientY + camera.y - canvas.offsetTop, ceilSize)

})
document.addEventListener("mouseup",(event)=>{
	mouseIsDown = false
	mouseUpX = ceil(event.clientX + camera.x - canvas.offsetLeft, ceilSize)
	mouseUpY = ceil(event.clientY + camera.y - canvas.offsetTop, ceilSize)
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



function editorUpdate(dt){
	let dx = -camera.x
	let dy = -camera.y
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
	if( ONCE_PRESSED_KEYS.has(KEY_ZERO) )	usedLayer = 0
	if( ONCE_PRESSED_KEYS.has(KEY_ONE) )	usedLayer = 1
	if( ONCE_PRESSED_KEYS.has(KEY_TWO) )	usedLayer = 2
	if( ONCE_PRESSED_KEYS.has(KEY_THREE) )usedLayer = 3
	if( ONCE_PRESSED_KEYS.has(KEY_FOUR) )	usedLayer = 4
	if( ONCE_PRESSED_KEYS.has(KEY_FIVE) )	usedLayer = 5
	if( ONCE_PRESSED_KEYS.has(KEY_SIX) )	usedLayer = 6
	if( ONCE_PRESSED_KEYS.has(KEY_SEVEN) )usedLayer = 7
	if( ONCE_PRESSED_KEYS.has(KEY_EIGHT) )usedLayer = 8
	if( ONCE_PRESSED_KEYS.has(KEY_NINE) )	usedLayer = 9

	//set entity
	if( ONCE_PRESSED_KEYS.has(KEY_SPACE) ){
		let tmpX = Math.min(mouseUpX,mouseDownX)
		let tmpY = Math.min(mouseUpY,mouseDownY)
		let tmpW = (Math.max(mouseUpX,mouseDownX)-tmpX)/PIXEL_SCALE
		let tmpH = (Math.max(mouseUpY,mouseDownY)-tmpY)/PIXEL_SCALE

		let parallax = (0<usedLayer && usedLayer<3)?usedLayer-3:((usedLayer>5)?usedLayer-5:0 )

		if(usedLayer > 0)LAYERS[usedLayer].push( new Sprite(tmpX-canvas.width*0.5,tmpY-canvas.height*0.5,tmpW,tmpH,PIXEL_SCALE,texture_in_use.key,TYPE_BOX,parallax) )

	}
	//delete entity
	if( ONCE_PRESSED_KEYS.has(KEY_X) ){

		for(let i in LAYERS[usedLayer]){
			let entity = LAYERS[usedLayer][i]
			if(	entity.x <= mouseX-canvas.width*0.5 &&
					entity.x+entity.width >= mouseX-canvas.width*0.5 &&
					entity.y <= mouseY-canvas.height*0.5 &&
					entity.y+entity.height >= mouseY-canvas.height*0.5 ){
						LAYERS[usedLayer].splice(i,1)
						break
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
		downloadJson(jm)
	}

}

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

			let tmp = LAYERS[usedLayer][grabed]
			ctx.strokeRect(tmp.x+mouseX-mouseDownX+ dx,tmp.y+mouseY-mouseDownY+dy,tmp.width,tmp.height)

  	}else{
  		ctx.strokeStyle = "cyan"

  		if(mouseIsDown){
  			let tmpX = Math.min(mouseX,mouseDownX)
  			let tmpY = Math.min(mouseY,mouseDownY)
  			let tmpW = Math.max(mouseX,mouseDownX)-tmpX
  			let tmpH = Math.max(mouseY,mouseDownY)-tmpY

				let p = parallax_f( (0<usedLayer && usedLayer<3)?usedLayer-3:((usedLayer>5)?usedLayer-5:0 ) )
				ctx.filter = 'opacity(0.5)'
				ctx.drawImage(texture_in_use.texture.data,
											0,
											0,
											texture_in_use.texture.frameWidth,
											texture_in_use.texture.frameHeight,
											(tmpX + tmpW*0.5 - texture_in_use.texture.frameWidth * PIXEL_SCALE * 0.5 + dx - canvas.width*0.5) * p + canvas.width*0.5,
											(tmpY + tmpH*0.5 - texture_in_use.texture.frameHeight * PIXEL_SCALE * 0.5 + dy - canvas.height*0.5) * p  + canvas.height*0.5,
											texture_in_use.texture.frameWidth * PIXEL_SCALE * p,
											texture_in_use.texture.frameHeight * PIXEL_SCALE * p)
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


		if( PRESSED_KEYS[ KEY_P ]){
  		ctx.fillStyle = "lime"
			ctx.font = "40px caption";
			for(let i=0;i<LAYERS.length; i++)
			for(let obj of LAYERS[i]){
				ctx.fillText(i, obj.x + canvas.width*0.5 + dx, obj.y + canvas.height*0.5 + dy + 32)
			}
			ctx.font = "12px caption";
  		ctx.fillStyle = "yellow"
  	}
  	//grid
  	if( PRESSED_KEYS[ KEY_C ]){
  		ctx.strokeStyle = "gray"
			let tmpX = ceil(camera.x - canvas.width*0.5, ceilSize)
  		let tmpY = ceil(camera.y - canvas.height*0.5, ceilSize)
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
		ctx.fillText("x:"+camera.x+" y:"+camera.y,canvas.width*0.5,canvas.height*0.5)
		ctx.fillText("used Layer: "+ usedLayer,canvas.width*0.5,canvas.height*0.5 + 10)

    ctx.fillText("map: "+map,20,50)
    ctx.fillText("wasd: move | c: grid | q&e: change texture",20,62)
  	ctx.fillText("0-9: change layer | p:show layer",20,74)
  	ctx.fillText("space: set entity | x: delete entity | g: grab entity",20,86)
  	ctx.fillText("r: save map to buffer | t: save map to file",20,98)
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

	for(let layer of LAYERS){
		for(let obj of layer){
			obj.update(dt)
		}
	}
  camera.update(dt)

	//EDITOR
	editorUpdate(dt)

}

function render(){
	let dx = -camera.x
	let dy = -camera.y

	ctx.clearRect(0,0,canvas.width,canvas.height)

	//foreground
//	ctx.filter = 'opacity(0.2)'
  for(let i=9;i>=4;i--){
		//if(usedLayer == i)ctx.filter = 'none'
		for(let obj of LAYERS[i]) {
			obj.draw(dx,dy)
			if(DEBUG && usedLayer == i)obj.debugDraw(dx,dy)
		}
	//	if(usedLayer == i)ctx.filter = 'opacity(0.2)'
	}

	//alive
//	if(usedLayer == 0)ctx.filter = 'none'
	for(let obj of LAYERS[0]) {
		obj.draw(dx,dy)
		if(DEBUG && usedLayer == 0)obj.debugDraw(dx,dy)
	}
	//if(usedLayer == 0)ctx.filter = 'opacity(0.2)'

	//background
	for(let i=3;i>0;i--){
	//	if(usedLayer == i)ctx.filter = 'none'
		for(let obj of LAYERS[i]) {
			obj.draw(dx,dy)
			if(DEBUG && usedLayer == i)obj.debugDraw(dx,dy)
		}
		//if(usedLayer == i)ctx.filter = 'opacity(0.2)'
	}
//	ctx.filter = 'none'


	editlog(dx, dy)

	if(DEBUG){
		ctx.strokeStyle = "blue"
		ctx.strokeText(canvas.style.width+" "+canvas.style.height,20,20)
		ctx.strokeText(canvas.width+" "+canvas.height,20,30)
		ctx.strokeText(frameID,20,40)
		ctx.strokeStyle = "yellow"
	}

}
