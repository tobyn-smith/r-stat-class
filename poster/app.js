(function(){
"use strict";
var NS="http://www.w3.org/2000/svg";
var C={slate:"#3B5571",ink:"#1B1B1B",muted:"#3F3A36",on:"#3B5571",off:"#C9C0B0",rule:"#D8D0C2",gold:"#8A6D3B"};
function el(tag,attrs,parent){var e=document.createElementNS(NS,tag);for(var k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e;}
function txt(parent,x,y,s,attrs){var a=attrs||{};a.x=x;a.y=y;var t=el("text",a,parent);t.textContent=s;return t;}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
var tip=document.getElementById("tip");
var canHover=window.matchMedia&&window.matchMedia("(hover:hover)").matches;
function showTip(html,ev){if(!canHover||!ev||ev.clientX===undefined)return;tip.innerHTML=html;tip.hidden=false;
 var r=tip.getBoundingClientRect(),x=ev.clientX+14,y=ev.clientY+14;
 if(x+r.width>window.innerWidth-8)x=ev.clientX-r.width-14; if(x<8)x=8;
 if(y+r.height>window.innerHeight-8)y=ev.clientY-r.height-14;
 tip.style.left=x+"px";tip.style.top=y+"px";}
function hideTip(){tip.hidden=true;}
function setPressed(btns,fn){btns.forEach(function(b){b.setAttribute("aria-pressed",fn(b)?"true":"false");});}
function width(id){var w=document.getElementById(id).clientWidth;return Math.max(240,w);}

var D=null;
fetch("assets/data.json").then(function(r){return r.json();}).then(function(d){D=d;renderAll();});
function renderAll(){if(!D)return;renderC();renderTF();renderSC();}
window.addEventListener("resize",function(){
 if(window.matchMedia("(min-width:700px)").matches)return;
 renderAll();
});

var hl="all";
[].slice.call(document.querySelectorAll("[data-hl]")).forEach(function(b){b.addEventListener("click",function(){hl=b.dataset.hl;
 setPressed([].slice.call(document.querySelectorAll("[data-hl]")),function(x){return x.dataset.hl===hl;});applyHl();});});
var ISS={C:"Congress",A:"Federal agency",S:"State"};
function applyHl(){[].forEach.call(document.querySelectorAll("#figC .sq"),function(s){s.classList.toggle("dim",hl!=="all"&&s.dataset.e!==hl);});}
function docText(d){return "<b>"+esc(d.n)+"</b><br>"+esc(d.a)+". "+(d.e?"Enacted":"Proposed")+(d.d?", "+esc(d.d):"")+".";}
function renderC(){
 var box=document.getElementById("figC");if(!box||!D)return;box.innerHTML="";
 var W=width("figC"),per=12,gap=1.6,cell=(W-2)/per,lab=36,blockGap=12,fs=15;
 var groups=["C","A","S"].map(function(k){return {k:k,ds:D.docs.filter(function(d){return d.i===k;})};});
 var y=34,H;groups.forEach(function(g){g.y=y+lab;y=g.y+Math.ceil(g.ds.length/per)*cell+blockGap;});H=y;
 var svg=el("svg",{viewBox:"0 0 "+W+" "+H,width:W,height:H,role:"img","aria-label":"One square per AGORA document"},box);
 el("rect",{x:1,y:6,width:14,height:14,fill:C.on},svg);txt(svg,20,18,"Enacted",{"font-size":fs,"font-weight":700,fill:C.on});
 el("rect",{x:108,y:6,width:14,height:14,fill:C.off},svg);txt(svg,128,18,"Proposed",{"font-size":fs,fill:C.muted});
 var all=[];
 groups.forEach(function(g){var ne=g.ds.reduce(function(a,d){return a+d.e;},0);
  txt(svg,1,g.y-10,ISS[g.k]+": "+ne+" of "+g.ds.length+" enacted ("+(100*ne/g.ds.length).toFixed(1)+"%)",{"font-size":fs,"font-weight":700});
  g.ds.forEach(function(d,j){var r=el("rect",{"class":"sq",x:1+(j%per)*cell,y:g.y+Math.floor(j/per)*cell,width:cell-gap,height:cell-gap,fill:d.e?C.on:C.off,"data-e":String(d.e)},svg);
   r._d=d;all.push(r);});
 });
 var read=document.getElementById("readC");
 function sel(r){all.forEach(function(s){s.classList.remove("on");});r.classList.add("on");read.innerHTML=docText(r._d);}
 svg.addEventListener("click",function(ev){if(ev.target._d)sel(ev.target);});
 svg.addEventListener("pointermove",function(ev){if(ev.target._d)showTip(docText(ev.target._d),ev);else hideTip();});
 svg.addEventListener("pointerleave",hideTip);
 applyHl();
}

var tfSel="Congress";
[].slice.call(document.querySelectorAll("[data-tf]")).forEach(function(b){b.addEventListener("click",function(){tfSel=b.dataset.tf;
 setPressed([].slice.call(document.querySelectorAll("[data-tf]")),function(x){return x.dataset.tf===tfSel;});document.getElementById("readTF").innerHTML="";renderTF();});});
function tfText(w,iss){return "<b>"+esc(w.w)+"</b>: used "+w.n+" times in "+esc(iss)+" summaries. tf-idf "+w.v.toFixed(4)+".";}
function renderTF(){
 var box=document.getElementById("figTF");if(!box||!D)return;box.innerHTML="";
 var W=width("figTF"),fs=15,t=D.tfidf[tfSel],ws=t.words,lw=Math.min(128,W*0.38),x0=lw,x1=W-12,bh=28,top=28,H=top+ws.length*bh+40;
 var mx=Math.max.apply(null,ws.map(function(w){return w.v;}));var step=mx>0.004?0.002:0.001,axMax=Math.ceil(mx/step)*step;
 var sx=function(v){return x0+(x1-x0)*v/axMax;};
 var svg=el("svg",{viewBox:"0 0 "+W+" "+H,width:W,height:H,role:"img","aria-label":"Top words by tf-idf"},box);
 txt(svg,0,16,tfSel+" (n = "+t.n+")",{"font-size":fs+1,"font-weight":700});
 for(var v=0;v<=axMax+1e-9;v+=step){el("line",{x1:sx(v),x2:sx(v),y1:top,y2:top+ws.length*bh,stroke:C.rule},svg);
  txt(svg,sx(v),top+ws.length*bh+18,v===0?"0":v.toFixed(3),{"text-anchor":"middle","font-size":fs-1});}
 txt(svg,(x0+x1)/2,H-2,"tf-idf",{"text-anchor":"middle","font-size":fs});
 var read=document.getElementById("readTF");
 ws.forEach(function(w,i){var y=top+i*bh;var g=el("g",{"class":"bar",tabindex:0,role:"button","aria-label":w.w},svg);
  el("rect",{x:0,y:y,width:W,height:bh,fill:"transparent"},g);
  txt(g,x0-8,y+bh/2+5,w.w,{"text-anchor":"end","font-size":fs});
  el("rect",{"class":"b",x:x0,y:y+5,width:Math.max(1,sx(w.v)-x0),height:bh-10,fill:C.slate},g);
  function pick(){[].forEach.call(svg.querySelectorAll(".bar"),function(n){n.classList.remove("on");});g.classList.add("on");read.innerHTML=tfText(w,tfSel);}
  g.addEventListener("click",pick);g.addEventListener("keydown",function(ev){if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();pick();}});
  g.addEventListener("pointermove",function(ev){showTip(tfText(w,tfSel),ev);});g.addEventListener("pointerleave",hideTip);});
}

var scSel="Federal agency",scPick=null;
[].slice.call(document.querySelectorAll("[data-sc]")).forEach(function(b){b.addEventListener("click",function(){scSel=b.dataset.sc;scPick=null;
 setPressed([].slice.call(document.querySelectorAll("[data-sc]")),function(x){return x.dataset.sc===scSel;});
 document.getElementById("findword").value="";document.getElementById("readSC").innerHTML="";renderSC();});});
var find=document.getElementById("findword");
find.addEventListener("input",function(){var w=find.value.trim().toLowerCase();var s=D.scatter[scSel];
 var i=-1;for(var k=0;k<s.pts.length;k++)if(s.pts[k][0]===w){i=k;break;}
 if(i>=0){scPick=i;renderSC();}else if(w){document.getElementById("readSC").innerHTML="<b>"+esc(w)+"</b>: not used by both issuers.";}});
function pct(x){return (100*x).toFixed(x<0.001?3:2)+"%";}
function scText(s,i){var p=s.pts[i];return "<b>"+esc(p[0])+"</b>: "+pct(p[1])+" of Congress words ("+s.cx[i]+" times). "+pct(p[2])+" of "+esc(scSel)+" words ("+s.cy[i]+" times).";}
function renderSC(){
 var box=document.getElementById("figSC");if(!box||!D)return;box.innerHTML="";
 var W=width("figSC"),fs=14,s=D.scatter[scSel];
 var dl=document.getElementById("wordlist");dl.innerHTML="";s.pts.map(function(p){return p[0];}).sort().forEach(function(w){var o=document.createElement("option");o.value=w;dl.appendChild(o);});
 var ml=48,mr=10,mt=32,mb=46,pw=W-ml-mr,ph=Math.min(pw,320),H=mt+ph+mb;
 var lo=Math.log10(8e-5),hi=Math.log10(3e-2);
 var sx=function(v){return ml+pw*(Math.log10(v)-lo)/(hi-lo);},sy=function(v){return mt+ph-ph*(Math.log10(v)-lo)/(hi-lo);};
 var svg=el("svg",{viewBox:"0 0 "+W+" "+H,width:W,height:H,role:"img","aria-label":"Congress vs "+scSel},box);
 txt(svg,0,16,"Congress vs "+scSel+": r = "+s.r,{"font-size":fs+1,"font-weight":700});
 [["10^-4",1e-4],["10^-3",1e-3],["10^-2",1e-2]].forEach(function(t){
  el("line",{x1:sx(t[1]),x2:sx(t[1]),y1:mt,y2:mt+ph,stroke:C.rule},svg);el("line",{x1:ml,x2:ml+pw,y1:sy(t[1]),y2:sy(t[1]),stroke:C.rule},svg);
  txt(svg,sx(t[1]),mt+ph+18,t[0],{"text-anchor":"middle","font-size":fs-1});txt(svg,ml-6,sy(t[1])+4,t[0],{"text-anchor":"end","font-size":fs-1});});
 el("line",{x1:ml,x2:ml,y1:mt,y2:mt+ph,stroke:C.ink},svg);el("line",{x1:ml,x2:ml+pw,y1:mt+ph,y2:mt+ph,stroke:C.ink},svg);
 txt(svg,ml+pw/2,H-6,"share of Congress words",{"text-anchor":"middle","font-size":fs-1});
 txt(svg,0,0,"share of "+scSel+" words",{"text-anchor":"middle","font-size":fs-1,transform:"translate(12,"+(mt+ph/2)+") rotate(-90)"});
 var dlo=1.2e-4,dhi=1.9e-2;el("line",{x1:sx(dlo),y1:sy(dlo),x2:sx(dhi),y2:sy(dhi),stroke:C.gold,"stroke-width":1.2,"stroke-dasharray":"5 4"},svg);
 var P=s.pts.map(function(p){return [sx(p[1]),sy(p[2])];});
 var dots=s.pts.map(function(p,i){return el("circle",{"class":"dot",cx:P[i][0].toFixed(1),cy:P[i][1].toFixed(1),r:3,fill:C.slate,"fill-opacity":0.4},svg);});
 var idx={};s.pts.forEach(function(p,i){idx[p[0]]=i;});
 var placed=[],lh=fs;
 s.lab.map(function(w){return idx[w];}).filter(function(i){return i!==undefined;}).sort(function(a,b){return P[a][1]-P[b][1];}).forEach(function(i){
  var w=s.pts[i][0],x=P[i][0],anchor=x>ml+pw*0.72?"end":"start",tw=w.length*(fs-1)*0.52,lx=anchor==="end"?x-6-tw:x+6,y=P[i][1]-4;
  function hit(yy){return placed.some(function(b){return lx<b[0]+b[2]&&lx+tw>b[0]&&yy-lh<b[1]&&yy>b[1]-lh;});}
  var n=0;while(hit(y)&&n<12){y+=lh*0.9;n++;}
  placed.push([lx,y,tw]);
  txt(svg,anchor==="end"?x-6:x+6,y,w,{"font-size":fs-1,"text-anchor":anchor});});
 var read=document.getElementById("readSC");
 function nearest(ev){var r=svg.getBoundingClientRect(),k=W/r.width,x=(ev.clientX-r.left)*k,y=(ev.clientY-r.top)*k,best=-1,bd=1e9;
  for(var i=0;i<P.length;i++){var dx=P[i][0]-x,dy=P[i][1]-y,dd=dx*dx+dy*dy;if(dd<bd){bd=dd;best=i;}}
  var lim=22*k;return bd<=lim*lim?best:-1;}
 function pick(i){dots.forEach(function(d){d.classList.remove("on");});if(i<0)return;dots[i].classList.add("on");dots[i].parentNode.appendChild(dots[i]);read.innerHTML=scText(s,i);}
 svg.addEventListener("click",function(ev){var i=nearest(ev);if(i>=0){scPick=i;pick(i);}});
 svg.addEventListener("pointermove",function(ev){if(ev.pointerType==="touch")return;var i=nearest(ev);if(i>=0)showTip(scText(s,i),ev);else hideTip();});
 svg.addEventListener("pointerleave",hideTip);
 if(scPick!==null&&scPick<s.pts.length)pick(scPick);
}
})();
