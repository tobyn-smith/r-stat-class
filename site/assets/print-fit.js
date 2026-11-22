(function(){
"use strict";
var IN=96,M=1.25*IN,SAFE_W=24*IN-2*M,SAFE_H=36*IN-2*M;
function ready(){return document.querySelector("#figC svg");}
function fit(){
 var p=document.getElementById("poster");
 p.style.transform="none";
 p.style.minHeight="0";
 var w=p.offsetWidth,h=p.offsetHeight,s=Math.min(SAFE_W/w,SAFE_H/h);
 if(w*s<=SAFE_W+0.5&&h*s<SAFE_H-0.5){
  p.style.minHeight=(SAFE_H/s)+"px";
  h=p.offsetHeight;
  s=Math.min(SAFE_W/w,SAFE_H/h);
 }
 var x=M+(SAFE_W-w*s)/2,y=M+(SAFE_H-h*s)/2;
 p.style.left=x+"px";p.style.top=y+"px";p.style.transform="scale("+s+")";
 document.documentElement.dataset.scale=s.toFixed(4);
 document.documentElement.dataset.fit="done";
 var bodyPx=parseFloat(getComputedStyle(document.body).fontSize)||18;
 document.documentElement.dataset.bodyPt=(bodyPx*s*72/96).toFixed(2);
 if(/(?:^|[?&])print=1(?:&|$)/.test(location.search)){
  setTimeout(function(){window.print();},250);
 }
}
function wait(){if(ready()&&document.fonts&&document.fonts.status==="loaded")fit();else setTimeout(wait,50);}
window.posterFit=fit;wait();
})();
