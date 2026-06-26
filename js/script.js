const words = [

"Motion Graphics",

"Graphic Designer",

"Video Editor",

"Photographer"

];

let wordIndex=0;

let charIndex=0;

let deleting=false;

const typing=document.getElementById("typing");

function type(){

let current=words[wordIndex];

if(!deleting){

typing.textContent=current.substring(0,charIndex++);

if(charIndex>current.length){

deleting=true;

setTimeout(type,1200);

return;

}

}else{

typing.textContent=current.substring(0,charIndex--);

if(charIndex<0){

deleting=false;

wordIndex=(wordIndex+1)%words.length;

}

}

setTimeout(type,deleting?40:80);

}

type();


// Navbar scroll effect
window.addEventListener("scroll",()=>{

const nav=document.querySelector(".navbar");

nav.classList.toggle("scrolled",window.scrollY>50);

});
