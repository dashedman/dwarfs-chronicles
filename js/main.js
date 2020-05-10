requestAnimationFrame = window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function(callback){ window.setTimeout(callback, 66) }
frameID = undefined

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
	if(frameID)cancelAnimationFrame(frameID);
});
window.addEventListener('focus', function() {
	if(frameID){
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

//LOAD DATA
TEXTURE_LIST["background"] = new Texture(DATA_PATH + "background_forest_1.png")
TEXTURE_LIST["ground"] = new Texture(DATA_PATH + "ground_forest_1.png")

TEXTURE_LIST["dwarf_stay"] = new AnimationTexture(DATA_PATH + "dwarf_stay.png", 8)
TEXTURE_LIST["dwarf_run"] = new AnimationTexture(DATA_PATH + "dwarf_walk.png", 6)
TEXTURE_LIST["dwarf_fall"] = new AnimationTexture(DATA_PATH + "dwarf_fall.png", 1)

TEXTURE_LIST["dwarf_jump_ready"] = new AnimationTexture(DATA_PATH + "dwarf_jump_ready.png", 2)
TEXTURE_LIST["dwarf_jump"] = new AnimationTexture(DATA_PATH + "dwarf_jump.png", 2, 20)
TEXTURE_LIST["dwarf_jump_end"] = new AnimationTexture(DATA_PATH + "dwarf_stand_up.png", 2)

TEXTURE_LIST["dwarf_siting"] = new AnimationTexture(DATA_PATH + "dwarf_siting.png", 3)
TEXTURE_LIST["dwarf_seat"] = new AnimationTexture(DATA_PATH + "dwarf_seat.png", 1)
TEXTURE_LIST["dwarf_crouch"] = new AnimationTexture(DATA_PATH + "dwarf_crouch.png", 5)
TEXTURE_LIST["dwarf_uping"] = new AnimationTexture(DATA_PATH + "dwarf_uping.png", 3)

//load waiting
let texture = TEXTURE_LIST["dwarf_stay"]


let promisses = []
for(let x in TEXTURE_LIST){
	let texture = TEXTURE_LIST[x]
	promisses.push(new Promise((resolve,reject)=>{
		texture.data.addEventListener("load", ()=>{
			if(texture.frameWidth)texture.frameWidth = Math.floor(texture.data.naturalWidth / texture.frames)
			resolve()
		},{once:true})

	}))
}
Promise.all(promisses).then(initial).catch((e)=>{console.log(e)})




//GAME INIT START
function initial(){
	console.log('load end')
	ctx.fillStyle = "#000"
	ctx.strokeStyle = "yellow"
	ctx.imageSmoothingEnabled = false

	window.hero = new Hero(100, 100, PIXEL_SCALE, "dwarf")

	LIFELESSES.push(new Sprite(200, 297, PIXEL_SCALE, "ground"))
	LIFELESSES.push(new Sprite(100, 400, PIXEL_SCALE, "ground"))
	LIFELESSES.push(new Sprite(100, 600, PIXEL_SCALE, "ground"))
	LIFELESSES.push(new Sprite(300, 200, PIXEL_SCALE, "ground"))

	BACKGROUNDS.push(new Sprite(0, 0, PIXEL_SCALE ,"background"))

	window.lastTime = Date.now()
	window.frameID = requestAnimationFrame(frame);
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
	//if(frameID%5 == 0){
	let dt = Math.min(100,now - lastTime)/1000

	update(dt*TIME_BOOSTER)
	render()

	ONCE_PRESSED_KEYS.clear()
//}
	lastTime = now
	frameID=requestAnimationFrame(frame)
}
