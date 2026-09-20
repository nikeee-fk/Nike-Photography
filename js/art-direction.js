const revealImage=document.getElementById("modalImage");
if(revealImage){revealImage.addEventListener("load",()=>revealImage.classList.add("loaded"));new MutationObserver(()=>revealImage.classList.remove("loaded")).observe(revealImage,{attributes:true,attributeFilter:["src"]})}
const earth=document.getElementById("earth");
const tooltip=document.getElementById("earthTooltip");
if(earth&&tooltip){
  const regions=[
    {name:"Canada",x:[0,.32],y:[0,.34]},{name:"United States",x:[.23,.43],y:[.3,.53]},
    {name:"Mexico",x:[.31,.45],y:[.5,.68]},{name:"Brazil",x:[.47,.66],y:[.55,.9]},
    {name:"United Kingdom",x:[.43,.49],y:[.25,.38]},{name:"France",x:[.47,.54],y:[.36,.5]},
    {name:"Egypt",x:[.58,.68],y:[.45,.62]},{name:"South Africa",x:[.58,.73],y:[.7,.98]},
    {name:"India",x:[.7,.82],y:[.48,.72]},{name:"China",x:[.73,.94],y:[.27,.55]},
    {name:"Japan",x:[.91,1],y:[.37,.62]},{name:"Australia",x:[.72,.96],y:[.72,1]}
  ];
  earth.addEventListener("mousemove",(event)=>{
    const rect=earth.getBoundingClientRect();const x=(event.clientX-rect.left)/rect.width;const y=(event.clientY-rect.top)/rect.height;
    if(Math.hypot(x-.5,y-.5)>.5){tooltip.textContent="Earth";return}
    const hit=regions.find(region=>x>=region.x[0]&&x<=region.x[1]&&y>=region.y[0]&&y<=region.y[1]);
    tooltip.textContent=hit?hit.name:"Earth";
    tooltip.style.left=`${Math.max(18,Math.min(82,x*100))}%`;tooltip.style.top=`${Math.max(8,y*100-9)}%`;
  });
  earth.addEventListener("mouseleave",()=>{tooltip.textContent="Move across Earth";tooltip.style.left="50%";tooltip.style.top="-34px"});
}
