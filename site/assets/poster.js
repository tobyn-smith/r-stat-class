(function(){
"use strict";
var NS="http://www.w3.org/2000/svg";
var C={slate:"#BA0C2F",ink:"#111111",muted:"#4A4640",red:"#BA0C2F",teal:"#004D5F",grey:"#9EA2A2",light:"#D6D2C4",prop:"#928E86",rule:"#E2DFD6",seg:"#B5B8B8",gold:"#8A6D3B"};
function el(tag,attrs,parent){var e=document.createElementNS(NS,tag);for(var k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e;}
function txt(parent,x,y,s,attrs){var a=attrs||{};a.x=x;a.y=y;var t=el("text",a,parent);t.textContent=s;return t;}
function f1(x){return x.toFixed(1);}
function sgn(x){return (x>=0?"+":"\u2212")+Math.abs(x).toFixed(1);}
function neg(x){return (x<0?"\u2212":"")+Math.abs(x).toFixed(1);}
function pfmt(p){return p<0.001?"p < 0.001":"p = "+p.toFixed(2);}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function nfmt(n){return n.toLocaleString("en-GB");}
var tip=document.getElementById("tip");
var canHover=window.matchMedia&&window.matchMedia("(hover:hover)").matches;
function showTip(html,ev){if(!tip||!canHover||!ev||ev.clientX===undefined)return;tip.innerHTML=html;tip.hidden=false;
 var r=tip.getBoundingClientRect(),x=ev.clientX+14,y=ev.clientY+14;
 if(x+r.width>window.innerWidth-8)x=ev.clientX-r.width-14; if(x<8)x=8;
 if(y+r.height>window.innerHeight-8)y=ev.clientY-r.height-14;
 tip.style.left=x+"px";tip.style.top=y+"px";}
function hideTip(){if(tip)tip.hidden=true;}
function setPressed(btns,fn){btns.forEach(function(b){b.setAttribute("aria-pressed",fn(b)?"true":"false");});}
function width(id){var el=document.getElementById(id);var w=el?el.clientWidth:0;return Math.max(260,w);}

var D=null;
var _src=(document.currentScript&&document.currentScript.src)||"";
var _base=_src.replace(/poster\.js(?:\?.*)?$/,"");
fetch(_base+"data.json").then(function(r){return r.json();}).then(function(d){D=d;init();});

function init(){
 notes();
 renderAll();
 var lastW=window.innerWidth,t=null;
 window.addEventListener("resize",function(){clearTimeout(t);t=setTimeout(function(){if(window.innerWidth!==lastW){lastW=window.innerWidth;renderAll();}},120);});
}
function renderAll(){if(!D)return;
 if(document.getElementById("figC"))renderC();
 if(document.getElementById("figTF"))renderTF();
 if(document.getElementById("figSC"))renderSC();}

/* ---------- expandable notes ---------- */
function notes(){
 var flow=[
  "1,251 documents in AGORA v1.32.0.",
  "125 dropped because they come from other authorities, such as other national governments or US cities.",
  "1,126 left: Congress 735, federal agencies 57, states 334.",
  "420 Defunct dropped: Congress 371, federal agencies 4, states 45.",
  "706 left: Congress 364, federal agencies 53, states 289."];
 var fl=document.getElementById("flow");if(fl)flow.forEach(function(s){var li=document.createElement("li");li.textContent=s;fl.appendChild(li);});
 var by={};D.docs.forEach(function(d){if(d.i!=="A")return;var o=by[d.a]||(by[d.a]={n:0,e:0});o.n++;o.e+=d.e;});
 var ul=document.getElementById("agencies");
 if(ul)Object.keys(by).sort(function(a,b){return by[b].n-by[a].n||a.localeCompare(b);}).forEach(function(a){
  var li=document.createElement("li");var s1=document.createElement("span");s1.textContent=a;var s2=document.createElement("span");
  s2.textContent=by[a].e+" of "+by[a].n+" enacted";li.appendChild(s1);li.appendChild(s2);ul.appendChild(li);});
 var df=document.getElementById("defunct");if(df&&D.defunct_agency)D.defunct_agency.forEach(function(r){var li=document.createElement("li");
  var s1=document.createElement("span");s1.textContent=r.n+" ("+r.a+")";var s2=document.createElement("span");s2.textContent=r.p+" to "+r.d;
  li.appendChild(s1);li.appendChild(s2);df.appendChild(li);});
 var m=D.checks.main,se=(m.hi-m.lo)/(2*1.96);
 var lines=[
  "Federal agencies: "+m.agency_enacted+" of "+m.agency_n+" enacted = "+m.agency.toFixed(2)+"%",
  "Congress: "+m.congress_enacted+" of "+m.congress_n+" enacted = "+m.congress.toFixed(2)+"%",
  "Difference: "+m.agency.toFixed(2)+" \u2212 "+m.congress.toFixed(2)+" = "+m.diff.toFixed(2)+" points",
  "Standard error: "+se.toFixed(3)+" points",
  "95% CI: "+m.diff.toFixed(2)+" \u00b1 1.96 \u00d7 "+se.toFixed(3)+" = "+m.lo.toFixed(2)+" to "+m.hi.toFixed(2),
  "z = "+m.diff.toFixed(2)+" \u00f7 "+se.toFixed(3)+" = "+m.z.toFixed(2)+"; "+pfmt(m.p),
  "The lm() slope of enacted on a federal agency dummy, over the "+(m.agency_n+m.congress_n)+" agency and Congress rows, is the same difference written as a proportion: "+(m.diff/100).toFixed(3)+"."];
 var c=document.getElementById("calc");if(c){c.className="calc";
 lines.forEach(function(s){var p=document.createElement("p");p.className="eq";p.textContent=s;c.appendChild(p);});}
}

/* ---------- Figure 1: one square per document ---------- */
var hl="all",selC=-1;
[].slice.call(document.querySelectorAll("[data-hl]")).forEach(function(b,_,all){b.addEventListener("click",function(){hl=b.dataset.hl;
 setPressed([].slice.call(document.querySelectorAll("[data-hl]")),function(x){return x.dataset.hl===hl;});applyHl();});});
var ISS={C:"Congress",A:"Federal agency",S:"State"};
function applyHl(){[].forEach.call(document.querySelectorAll("#figC .sq"),function(s){s.classList.toggle("dim",hl!=="all"&&s.dataset.e!==hl);});}
function docText(d){return "<b>"+esc(d.n)+"</b><br>"+esc(d.a)+". "+(d.e?"Enacted":"Proposed")+(d.d?", "+esc(d.d):"")+".";}
function renderC(){
 var box=document.getElementById("figC");box.innerHTML="";var W=width("figC"),narrow=W<480;
 var printed=document.body.classList.contains("print"),per=narrow?21:printed?30:42,gap=narrow?1.5:2,cell=(W-2)/per,lab=narrow?40:printed?38:34,blockGap=narrow?14:printed?22:18,fs=narrow?15:printed?18:16;
 var groups=["C","A","S"].map(function(k){var ds=D.docs.filter(function(d){return d.i===k;});return {k:k,ds:ds};});
 var y=38,H=y;groups.forEach(function(g){g.y=y+lab;var rows=Math.ceil(g.ds.length/per);y=g.y+rows*cell+blockGap;});H=y;
 var svg=el("svg",{viewBox:"0 0 "+W+" "+H,width:W,height:H,role:"img","aria-label":"Figure 1: one square per AGORA document, by issuer and status"},box);
 el("rect",{x:1,y:6,width:16,height:16,fill:C.red},svg);txt(svg,24,20,"Enacted",{"font-size":fs,"font-weight":700,fill:C.red});
 el("rect",{x:104,y:6,width:16,height:16,fill:C.prop},svg);txt(svg,127,20,"Proposed",{"font-size":fs,fill:C.muted});
 var all=[];
 groups.forEach(function(g){var ne=g.ds.reduce(function(a,d){return a+d.e;},0);
  var label=ISS[g.k]+": "+ne+" of "+g.ds.length+" enacted ("+(100*ne/g.ds.length).toFixed(1)+"%)";
  txt(svg,1,g.y-12,label,{"font-size":fs+1,"font-weight":700});
  g.ds.forEach(function(d,j){var cx=1+(j%per)*cell,cy=g.y+Math.floor(j/per)*cell;
   var r=el("rect",{"class":"sq",x:cx,y:cy,width:cell-gap,height:cell-gap,fill:d.e?C.red:C.prop,"data-e":String(d.e)},svg);
   r._d=d;all.push(r);});
 });
 var read=document.getElementById("readC");
 function sel(r){all.forEach(function(s){s.classList.remove("on");});r.classList.add("on");read.innerHTML=docText(r._d);}
 svg.addEventListener("click",function(ev){if(ev.target._d)sel(ev.target);});
 svg.addEventListener("pointermove",function(ev){if(ev.target._d)showTip(docText(ev.target._d),ev);else hideTip();});
 svg.addEventListener("pointerleave",hideTip);
 applyHl();
 if(!read.innerHTML)read.innerHTML="";
}

/* ---------- text analysis: tf-idf ---------- */
var tfSel="Congress";
[].slice.call(document.querySelectorAll("[data-tf]")).forEach(function(b){b.addEventListener("click",function(){tfSel=b.dataset.tf;
 setPressed([].slice.call(document.querySelectorAll("[data-tf]")),function(x){return x.dataset.tf===tfSel;});document.getElementById("readTF").innerHTML="";renderTF();});});
function tfText(w,iss){return "<b>"+esc(w.w)+"</b>: used "+w.n+" times in "+esc(iss)+" summaries. tf-idf "+w.v.toFixed(4)+".";}
function renderTF(){
 var box=document.getElementById("figTF");box.innerHTML="";var W=width("figTF"),fs=W<600?15:16;
 var t=D.tfidf[tfSel],ws=t.words,lw=Math.min(140,W*0.32),x0=lw,x1=W-20,bh=30,top=30,H=top+ws.length*bh+44;
 var mx=Math.max.apply(null,ws.map(function(w){return w.v;}));var step=mx>0.004?0.002:0.001,axMax=Math.ceil(mx/step)*step;
 var sx=function(v){return x0+(x1-x0)*v/axMax;};
 var svg=el("svg",{viewBox:"0 0 "+W+" "+H,width:W,height:H,role:"img","aria-label":"Top ten words by tf-idf for "+tfSel},box);
 txt(svg,0,18,tfSel+" (n = "+t.n+")",{"font-size":fs+1,"font-weight":700});
 for(var v=0;v<=axMax+1e-9;v+=step){el("line",{x1:sx(v),x2:sx(v),y1:top,y2:top+ws.length*bh,stroke:C.rule},svg);
  txt(svg,sx(v),top+ws.length*bh+20,v===0?"0":v.toFixed(3),{"text-anchor":"middle","font-size":fs-1});}
 txt(svg,(x0+x1)/2,H-4,"tf-idf",{"text-anchor":"middle","font-size":fs});
 var read=document.getElementById("readTF");
 ws.forEach(function(w,i){var y=top+i*bh;var g=el("g",{"class":"bar",tabindex:0,role:"button","aria-label":w.w},svg);
  el("rect",{x:0,y:y,width:W,height:bh,fill:"transparent"},g);
  txt(g,x0-10,y+bh/2+5,w.w,{"text-anchor":"end","font-size":fs});
  el("rect",{"class":"b",x:x0,y:y+5,width:Math.max(1,sx(w.v)-x0),height:bh-10,fill:C.slate},g);
  function pick(){[].forEach.call(svg.querySelectorAll(".bar"),function(n){n.classList.remove("on");});g.classList.add("on");read.innerHTML=tfText(w,tfSel);}
  g.addEventListener("click",pick);g.addEventListener("keydown",function(ev){if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();pick();}});
  g.addEventListener("pointermove",function(ev){showTip(tfText(w,tfSel),ev);});g.addEventListener("pointerleave",hideTip);});
}

/* ---------- text analysis: word frequency scatter ---------- */
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
 var box=document.getElementById("figSC");box.innerHTML="";var W=width("figSC"),fs=W<600?14:15;var s=D.scatter[scSel];
 var dl=document.getElementById("wordlist");dl.innerHTML="";s.pts.map(function(p){return p[0];}).sort().forEach(function(w){var o=document.createElement("option");o.value=w;dl.appendChild(o);});
 var ml=58,mr=16,mt=34,mb=50,pw=W-ml-mr,ph=W<600?pw*1.05:Math.min(pw*0.8,460),H=mt+ph+mb;
 var lo=Math.log10(8e-5),hi=Math.log10(3e-2);
 var sx=function(v){return ml+pw*(Math.log10(v)-lo)/(hi-lo);},sy=function(v){return mt+ph-ph*(Math.log10(v)-lo)/(hi-lo);};
 var svg=el("svg",{viewBox:"0 0 "+W+" "+H,width:W,height:H,role:"img","aria-label":"Congress vs "+scSel+": r = "+s.r},box);
 txt(svg,0,18,"Congress vs "+scSel+": r = "+s.r,{"font-size":fs+2,"font-weight":700});
 [["10\u207b\u2074",1e-4],["10\u207b\u00b3",1e-3],["10\u207b\u00b2",1e-2]].forEach(function(t){
  el("line",{x1:sx(t[1]),x2:sx(t[1]),y1:mt,y2:mt+ph,stroke:C.rule},svg);el("line",{x1:ml,x2:ml+pw,y1:sy(t[1]),y2:sy(t[1]),stroke:C.rule},svg);
  txt(svg,sx(t[1]),mt+ph+20,t[0],{"text-anchor":"middle","font-size":fs});txt(svg,ml-8,sy(t[1])+5,t[0],{"text-anchor":"end","font-size":fs});});
 el("line",{x1:ml,x2:ml,y1:mt,y2:mt+ph,stroke:C.ink},svg);el("line",{x1:ml,x2:ml+pw,y1:mt+ph,y2:mt+ph,stroke:C.ink},svg);
 txt(svg,ml+pw/2,H-6,"share of Congress words",{"text-anchor":"middle","font-size":fs});
 var yl=txt(svg,0,0,"share of "+scSel+" words",{"text-anchor":"middle","font-size":fs,transform:"translate(14,"+(mt+ph/2)+") rotate(-90)"});
 var dlo=1.2e-4,dhi=1.9e-2;el("line",{x1:sx(dlo),y1:sy(dlo),x2:sx(dhi),y2:sy(dhi),stroke:C.gold,"stroke-width":1.2,"stroke-dasharray":"5 4"},svg);
 var P=s.pts.map(function(p){return [sx(p[1]),sy(p[2])];});
 var dots=s.pts.map(function(p,i){return el("circle",{"class":"dot",cx:P[i][0].toFixed(1),cy:P[i][1].toFixed(1),r:W<600?3:3.5,fill:C.teal,"fill-opacity":0.4},svg);});
 var idx={};s.pts.forEach(function(p,i){idx[p[0]]=i;});
 var placed=[],lh=fs+1;
 s.lab.map(function(w){return idx[w];}).filter(function(i){return i!==undefined;}).sort(function(a,b){return P[a][1]-P[b][1];}).forEach(function(i){
  var w=s.pts[i][0],x=P[i][0],anchor=x>ml+pw*0.75?"end":"start",tw=w.length*(fs-1)*0.52,lx=anchor==="end"?x-6-tw:x+6,y=P[i][1]-5;
  function hit(yy){return placed.some(function(b){return lx<b[0]+b[2]&&lx+tw>b[0]&&yy-lh<b[1]&&yy>b[1]-lh;});}
  var n=0;while(hit(y)&&n<12){y+=lh*0.9;n++;}
  placed.push([lx,y,tw]);
  if(Math.abs(y-(P[i][1]-5))>2)el("line",{x1:x,y1:P[i][1],x2:anchor==="end"?lx+tw:lx,y2:y-4,stroke:C.muted,"stroke-width":0.6},svg);
  txt(svg,anchor==="end"?x-6:x+6,y,w,{"font-size":fs-1,"text-anchor":anchor,stroke:"#fff","stroke-width":3,"stroke-linejoin":"round","paint-order":"stroke"});});
 var read=document.getElementById("readSC");
 function nearest(ev){var r=svg.getBoundingClientRect(),k=W/r.width,x=(ev.clientX-r.left)*k,y=(ev.clientY-r.top)*k,best=-1,bd=1e9;
  for(var i=0;i<P.length;i++){var dx=P[i][0]-x,dy=P[i][1]-y,dd=dx*dx+dy*dy;if(dd<bd){bd=dd;best=i;}}
  var lim=(ev.pointerType==="touch"?22:12)*k;return bd<=lim*lim?best:-1;}
 function pick(i){dots.forEach(function(d){d.classList.remove("on");});if(i<0)return;dots[i].classList.add("on");dots[i].parentNode.appendChild(dots[i]);read.innerHTML=scText(s,i);}
 svg.addEventListener("click",function(ev){var i=nearest(ev);if(i>=0){scPick=i;pick(i);}});
 svg.addEventListener("pointermove",function(ev){if(ev.pointerType==="touch")return;var i=nearest(ev);if(i>=0)showTip(scText(s,i),ev);else hideTip();});
 svg.addEventListener("pointerleave",hideTip);
 if(scPick!==null&&scPick<s.pts.length)pick(scPick);
}
})();
