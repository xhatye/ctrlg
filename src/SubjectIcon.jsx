const ids=new Set(["UE1","UE2","UE3","UE4","UE5","UE6","UE7","UE8","UE9","UE10","UE11","UE12","UE13","DSCG1","DSCG2","DSCG3","DSCG4","DSCG5","DSCG6","DSCG7"]);
export default function SubjectIcon({id,size=60,className=''}){return <img className={'subject-icon '+className} src={'/subjects/'+(ids.has(id)?id:'UE9')+'.svg'} alt="" width={size} height={size} loading="lazy" decoding="async"/>;}
