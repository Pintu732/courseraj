
function canvasToBlob(canvas,type,quality){
  return new Promise(resolve=>canvas.toBlob(resolve,type,quality));
}

async function readImage(file){
  return new Promise((resolve,reject)=>{
    const img=new Image();
    const url=URL.createObjectURL(file);
    img.onload=()=>{URL.revokeObjectURL(url);resolve(img);};
    img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("Could not read image."));};
    img.src=url;
  });
}

function blobToDataUrl(blob){
  return new Promise((resolve,reject)=>{
    const r=new FileReader();
    r.onload=()=>resolve(r.result);
    r.onerror=()=>reject(new Error("Could not encode image."));
    r.readAsDataURL(blob);
  });
}

export async function compressImage(file,{
  maxWidth=1200,
  maxHeight=800,
  targetBytes=180*1024,
  minQuality=.42
}={}){
  if(!file || !file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if(file.size > 15*1024*1024) throw new Error("Image is too large. Choose a file under 15 MB.");

  const img=await readImage(file);
  const scale=Math.min(1,maxWidth/img.naturalWidth,maxHeight/img.naturalHeight);
  const w=Math.max(1,Math.round(img.naturalWidth*scale));
  const h=Math.max(1,Math.round(img.naturalHeight*scale));

  const canvas=document.createElement("canvas");
  canvas.width=w; canvas.height=h;
  const ctx=canvas.getContext("2d",{alpha:false});
  ctx.fillStyle="#111";
  ctx.fillRect(0,0,w,h);
  ctx.drawImage(img,0,0,w,h);

  let quality=.82;
  let blob=await canvasToBlob(canvas,"image/webp",quality);
  while(blob && blob.size>targetBytes && quality>minQuality){
    quality-=.08;
    blob=await canvasToBlob(canvas,"image/webp",quality);
  }

  if(!blob) throw new Error("Image compression failed.");
  if(blob.size>targetBytes*1.45){
    throw new Error("Image could not be compressed enough. Try a simpler/smaller image.");
  }

  const dataUrl=await blobToDataUrl(blob);
  return {
    dataUrl,
    bytes:blob.size,
    width:w,
    height:h,
    type:"image/webp"
  };
}

export function prettyBytes(bytes=0){
  if(bytes<1024) return `${bytes} B`;
  if(bytes<1024*1024) return `${(bytes/1024).toFixed(0)} KB`;
  return `${(bytes/1024/1024).toFixed(2)} MB`;
}
