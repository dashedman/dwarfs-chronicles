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

if(window.innerWidth*9 > window.innerHeight*16){
	canvas.style.width = window.innerHeight * 16 / 9
	canvas.style.height = window.innerHeight
}else{
	canvas.style.width = window.innerWidth
	canvas.style.height = window.innerWidth * 9/16
}



///////////////////////////////////////////////////////////
//ACTIONS
PRESSED_KEYS.fill(false)

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
	if(window.innerWidth*9 > window.innerHeight*16){
		canvas.style.width = window.innerHeight * 16 / 9
		canvas.style.height = window.innerHeight
	}else{
		canvas.style.width = window.innerWidth
		canvas.style.height = window.innerWidth * 9/16
	}

})


////SCENE
function mapPick(){
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

  let mapAlives = mapStructure["alives"]
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
  hero.update(dt)
  for(let i=0;i<ALIVES.length;i++)ALIVES[i].update(dt)
  for(let i=0;i<LIFELESSES.length;i++)LIFELESSES[i].update(dt)
  for(let i=0;i<BACKGROUNDS.length;i++)BACKGROUNDS[i].update(dt)
}

function render(){
	let dx = (canvas.width - hero.width)*0.5 - hero.x
	let dy = (canvas.height - hero.height)*0.5 - hero.y

	ctx.clearRect(0,0,canvas.width,canvas.height)
  //background
	BACKGROUNDS[0].draw(dx,dy)
  for(let i=1;i<BACKGROUNDS.length;i++)BACKGROUNDS[i].draw(dx,dy)

  //other entity
  for(let i=0;i<LIFELESSES.length;i++)LIFELESSES[i].draw(dx,dy)
  for(let i=0;i<ALIVES.length;i++)ALIVES[i].draw(dx,dy)

	//hero
	hero.draw(dx,dy)

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

//START
mapPick()
