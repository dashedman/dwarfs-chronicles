requestAnimationFrame = window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function(callback){ window.setTimeout(callback, 66) }

var frameID = -1
var lastTime = 0
var hero = undefined

var map = "forest"
var mapStructure = undefined

var canvas = document.getElementById("viewport")
var ctx = canvas.getContext('2d')

canvas.width = 960
canvas.height = 540
/*
if(window.innerWidth*9 > window.innerHeight*16){
	canvas.style.width = window.innerHeight * 16 / 9
	canvas.style.height = window.innerHeight
}else{
	canvas.style.width = window.innerWidth
	canvas.style.height = window.innerWidth * 9/16
}
*/


///////////////////////////////////////////////////////////
//ACTIONS
PRESSED_KEYS.fill(false)

document.addEventListener("DOMContentLoaded",mapPick,{once:true})
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

window.addEventListener("resize", function() {
	/*
	if(window.innerWidth*9 > window.innerHeight*16){
		canvas.style.width = window.innerHeight * 16 / 9
		canvas.style.height = window.innerHeight
	}else{
		canvas.style.width = window.innerWidth
		canvas.style.height = window.innerWidth * 9/16
	}
*/
})


////SCENE
function mapPick(){
	console.log("map: ", map, "path: "+MAP_PATH+map+".json")
	loadJsonResources(MAP_PATH + map + ".json")
	.then((jsonMap)=>{

		mapStructure = jsonMap
		console.log("map is loaded\n",mapStructure)
		loadData()

	})
	.catch(()=>{

		console.log("map not found")
		alert("map not found :c")

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


//GAME INIT START
function initial(){
  console.log("initial objects")
	ctx.fillStyle = "yellow"
	ctx.font = "12px caption";
	ctx.strokeStyle = "yellow"
	ctx.imageSmoothingEnabled = false

  let mapLayers = mapStructure["layers"]

	for(let i=1;i<10;i++){
		LAYERS[i] = new Array()

		let layerParallax = (i<3)?i-3:( (i>5)?i-5:0 )


		for(let obj of mapLayers[i]){
			if(obj.class_type == "sprite"){
	      LAYERS[i].push(new Sprite(obj.x, obj.y, obj.width, obj.height, obj.scale, obj.texture_name, TYPE_BOX, layerParallax))
	    }
		}
	}


	let heroData =  mapStructure["hero"]
	hero = new Hero(heroData.x, heroData.y, heroData.width, heroData.height, heroData.scale,  heroData.race, TYPE_BOX, 0, heroData.seat_height)

	LAYERS[0] = new Array()
	LAYERS[0].push(hero)
	for(let obj of mapLayers[0]){
		if(obj.class_type == "alive"){
      LAYERS[0].push(new Alive(obj.x, obj.y, obj.width, obj.height, obj.scale, obj.texture_name, TYPE_BOX))
    }
	}


	console.log(LAYERS)
	start()
}
////
function start(){
	console.log("start")
	lastTime = Date.now()
	frameID = requestAnimationFrame(frame);
}
//MAIN FUNCTIONS
function update(dt){

	for(let layer of LAYERS){
		for(let obj of layer){
			obj.update(dt)
		}
	}
}

function render(){
	let dx =  - hero.x-(hero.width)*0.5
	let dy =  - hero.y-(hero.height)*0.5

	ctx.clearRect(0,0,canvas.width,canvas.height)
	//foreground
	for(let i=9;i>=4;i--){
		for(let obj of LAYERS[i]) {
			obj.draw(dx,dy)
			if(DEBUG && i==4)obj.debugDraw(dx,dy)
		}
	}

	//alive
	for(let obj of LAYERS[0]) {
		obj.draw(dx,dy)
		if(DEBUG)obj.debugDraw(dx,dy)
	}

	//background
	for(let i=3;i>0;i--){
		for(let obj of LAYERS[i]) {
			obj.draw(dx,dy)
			if(DEBUG)obj.debugDraw(dx,dy)
		}
	}


	if(DEBUG){
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
