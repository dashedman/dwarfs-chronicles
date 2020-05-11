function dot(x1,y1,x2,y2){
  return x1*x2 + y1*y2
}

function cross(x1,y1,x2,y2){
  return x1*y2 - x2*y1
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
