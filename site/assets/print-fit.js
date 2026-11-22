(function(){
"use strict";
/* 36 x 24 in sheet, 1.25 in safe margin. The layout width is searched so the
   scaled poster fills the safe area as fully as possible: narrower layouts
   print bigger but run taller, so we take the width with the largest scale. */
var IN=96,M=1.25*IN,SAFE_W=36*IN-2*M,SAFE_H=24*IN-2*M,W_MIN=1500,W_MAX=3000,STEP=10;
function ready(){var i=document.querySelector(".figimg");return i&&i.complete&&i.naturalWidth>0;}
function scaleAt(p,w){
 p.style.width=w+"px";
 p.style.minHeight="0";
 return Math.min(SAFE_W/w,SAFE_H/p.offsetHeight);
}
function fit(){
 var p=document.getElementById("poster");
 p.style.transform="none";
 var best=W_MIN,bestS=0,w,s;
 for(w=W_MIN;w<=W_MAX;w+=STEP){s=scaleAt(p,w);if(s>bestS){bestS=s;best=w;}}
 s=scaleAt(p,best);
 var h=p.offsetHeight;
 /* width-limited: stretch the columns down so there is no khaki hole at the bottom */
 if(best*s<=SAFE_W+0.5&&h*s<SAFE_H-0.5){
  p.style.minHeight=(SAFE_H/s)+"px";
  h=p.offsetHeight;
  s=Math.min(SAFE_W/best,SAFE_H/h);
 }
 var x=M+(SAFE_W-best*s)/2,y=M+(SAFE_H-h*s)/2;
 p.style.left=x+"px";p.style.top=y+"px";p.style.transform="scale("+s+")";
 var de=document.documentElement.dataset;
 de.scale=s.toFixed(4);
 de.layoutWidth=String(best);
 de.fit="done";
 var bodyPx=parseFloat(getComputedStyle(document.body).fontSize)||18;
 de.bodyPt=(bodyPx*s*72/96).toFixed(2);
 if(/(?:^|[?&])print=1(?:&|$)/.test(location.search)){
  setTimeout(function(){window.print();},250);
 }
}
function wait(){if(ready()&&document.fonts&&document.fonts.status==="loaded")fit();else setTimeout(wait,50);}
window.posterFit=fit;wait();
})();
