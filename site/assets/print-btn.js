(function(){
"use strict";
var btn=document.getElementById("print-poster");
if(!btn)return;
btn.addEventListener("click",function(){
 if(btn.getAttribute("data-here")==="1"){window.print();return;}
 var href=btn.getAttribute("data-href")||"print.html?print=1";
 var w=window.open(href);
 if(!w)location.href=href;
});
})();
