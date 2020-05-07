requestAnimationFrame = window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function(callback){ window.setTimeout(callback, 66) }


var canvas = document.getElementById("viewport")
var ctx = canvas.getContext('2d')

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


////SCENE

//LOAD DATA
TEXTURE_LIST["background"] = new Texture(DATA_PATH + "background_forest_1.png")
TEXTURE_LIST["ground"] = new Texture(DATA_PATH + "ground_forest_1.png")

TEXTURE_LIST["dwarf_stay"] = new AnimationTexture(DATA_PATH + "dwarf_stay.png",8)
TEXTURE_LIST["dwarf_fall"] = new AnimationTexture(DATA_PATH + "dwarf_stay.png",8)
TEXTURE_LIST["dwarf_run"] = new AnimationTexture(DATA_PATH + "dwarf_walk.png",6)
TEXTURE_LIST["dwarf_jump"] = new AnimationTexture(DATA_PATH + "dwarf_stay.png",8)

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

	//canvas.style.width = window.innerWidth
	//canvas.style.height = window.innerHeight
	let scale = 3
	lastTime = Date.now()
	hero = new Hero(100,100,scale,"dwarf")
	LIFELESSES.push(new Sprite(100,400,scale,"ground"))
	LIFELESSES.push(new Sprite(200,300,scale,"ground"))
	BACKGROUNDS.push(new Sprite(0,0,scale,"background"))


	requestAnimationFrame(frame);
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
	ctx.fillRect(0, 0, canvas.width, canvas.height);
  //background
	BACKGROUNDS[0].draw()
  for(let i=1;i<BACKGROUNDS.length;i++)BACKGROUNDS[i].draw()

  //other entity
  for(let i=0;i<LIFELESSES.length;i++)LIFELESSES[i].draw()
  for(let i=0;i<ALIVES.length;i++)ALIVES[i].draw()

	//hero
	hero.draw()

}


function frame(){
	let now = Date.now()
	let dt = (now - lastTime)/1000

	update(dt*TIME_BOOSTER)
	render()

	lastTime = now
	requestAnimationFrame(frame)
}
