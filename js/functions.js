function dot(x1,y1,x2,y2){
  return x1*x2 + y1*y2
}

function cross(x1,y1,x2,y2){
  return x1*y2 - x2*y1
}

function ceil(x,y){
	return Math.round(x/y)*y
}

function parallax_f(p){
  return Math.pow(2,-p)//(PARALLAX_COEFFICIENT-p)/PARALLAX_COEFFICIENT
}

function getMapName(){
  return new Promise(function(resolve,reject){
    const popup = document.querySelector("#popup");
  	const mainForm = document.querySelector("#main-form");
    let name
  	mainForm.addEventListener("submit", (e)=>{
  		name = document.querySelector("#name").value;
  		popup.style.display = "none";
  		console.log(name);
      resolve(name)
  		e.preventDefault();
  	})
  })
}

function mapToJson(){

  function getClassType(x){
    if(x instanceof Sprite)return "sprite"
    if(x instanceof Alive)return "alive"
  }

  //textures
  let jm = {"textures":{},"layers":[],hero:{}}
  for(let [name,texture] of TEXTURE_LIST){
    jm.textures[name] = { "name":texture.data.src.substring(texture.data.src.lastIndexOf("/")+1),
                          "frames":texture.frames,
                          "frameSpeed":texture.frameSpeed }
  }

  //alives
  jm.layers.push(new Array())
  for(let i=1; i<LAYERS[0].length; i++){
    let entity = LAYERS[0][i]
    let class_type = getClassType(entity)
    jm.layers[i].push( {  "x":entity.x,
                            "y":entity.y,
                            "width":entity.width/entity.s,
                            "height":entity.height/entity.s,
                            "scale":entity.s,
                            "texture_name":entity.source,
                            "class_type":class_type} )
  }

  //sprites
  for(let i=1;i<10;i++ ){
    jm.layers.push(new Array())
    for(let entity of LAYERS[i]){
      let class_type = getClassType(entity)
      jm.layers[i].push( {  "x":entity.x,
                              "y":entity.y,
                              "width":entity.width/entity.s,
                              "height":entity.height/entity.s,
                              "scale":entity.s,
                              "texture_name":entity.source,
                              "class_type":class_type} )
    }
  }

  //hero
  jm.hero = {
    "x":hero.x,
    "y":hero.y,
    "width":hero.width/hero.s,
    "height":hero.height/hero.s,
    "scale":hero.s,
    "seat_height":hero.seat_height/hero.s,
    "race":hero.source
  }
  return JSON.stringify(jm)
}

function downloadJson(text){
  let element = document.createElement('a')
  element.setAttribute('href', 'data:text/text;charset=utf-8,' + encodeURI(text))
  element.setAttribute('download', "newmap.json")
  element.click()
  element.remove()
}

function loadJsonResources(url){
    return new Promise(function(resolve, reject){
        const request = new XMLHttpRequest()

        request.open('GET', url)
        request.onload = function(){
            if (request.status >=200 && request.status < 300){
              resolve(request.response)
            }else{
              reject("Error: HTTP-status - " + request.status + " on resource " + url)
            }
        }
        request.responseType = 'json'
        request.send()
    })
}

function loadTextResources(url){
    return new Promise(function(resolve, reject){
        const request = new XMLHttpRequest()
        request.open('GET', url, true)
        request.onload = function(){
            if (request.status >=200 && request.status < 300){
              resolve(request.responseText)
            }else{
              reject("Error: HTTP-status - " + request.status + " on resource " + url)
            }
        }
        request.send()
    })
}
