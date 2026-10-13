const size=c=>c.practiceSize || c.notions.length;
export const chapterQuestionCount=size;
export const chapterCaseCount=c=>c.caseCount || c.cases?.length || 1;
export function questionPool(chapters,focus='all'){
  if(!['all','knowledge','application'].includes(focus))throw Object.assign(new Error('Type de série invalide.'),{status:400});
  const selected=chapters.filter(c=>focus==='all'||(focus==='application')===Boolean(c.variantAt));
  const total=selected.reduce((sum,c)=>sum+size(c),0);
  const at=index=>{
    if(!Number.isInteger(index)||index<0||index>=total)throw new Error('Question index out of range');
    for(const c of selected){
      const length=size(c);
      if(index<length){
        const n=c.variantAt?c.variantAt(Math.floor(index/4)).notions[index%4]:c.notions[index];
        return {...n,chapterId:c.id,id:`${c.id}:${c.variantAt?'v'+Math.floor(index/4)+':'+index%4:'n'+index}`};
      }
      index-=length;
    }
  };
  return {total,at};
}
export function sampleQuestions(pool,count,random=Math.random){
  // Sparse partial Fisher-Yates: memory and generation depend on the requested
  // session size, never the size of the whole combinatorial bank.
  const swaps=new Map(),items=[],length=Math.min(count,pool.total);
  for(let i=0;i<length;i++){
    const j=i+Math.floor(Math.max(0,Math.min(.999999999,random()))*(pool.total-i));
    const selected=swaps.get(j) ?? j;
    swaps.set(j,swaps.get(i) ?? i);
    items.push(pool.at(selected));
  }
  return items;
}
