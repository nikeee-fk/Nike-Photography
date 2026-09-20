const revealImage=document.getElementById("modalImage");
if(revealImage){
  revealImage.addEventListener("load",()=>revealImage.classList.add("loaded"));
  const observer=new MutationObserver(()=>revealImage.classList.remove("loaded"));
  observer.observe(revealImage,{attributes:true,attributeFilter:["src"]});
}
