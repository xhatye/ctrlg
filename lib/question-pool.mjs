export const quizIndices=c=>c.quizIndices || (c.quiz || c.notions).map((_,i)=>i);
export const quizIsAvailable=(c,index)=>quizIndices(c).includes(index);
const theory=c=>quizIndices(c).length;
const size=c=>theory(c)+(c.practiceSize || 0);
export const chapterQuestionCount=size;
export const chapterCaseCount=c=>c.caseCount?c.caseCount+(c.extraCases?.length || 0):c.cases?.length || 1;
export const curatedQuestionCount=theory;
export const chapterCardCount=c=>(c.cards || c.notions).length;
export function questionPool(chapters,focus='all'){
  if(!['all','knowledge','application'].includes(focus))throw Object.assign(new Error('Type de série invalide.'),{status:400});
  const selected=focus==='application'?chapters.filter(c=>c.variantAt):chapters;
  const count=c=>focus==='knowledge'?theory(c):focus==='application'?(c.practiceSize || 0):size(c);
  const total=selected.reduce((sum,c)=>sum+count(c),0);
  const at=index=>{
    if(!Number.isInteger(index)||index<0||index>=total)throw new Error('Question index out of range');
    for(const c of selected){
      const length=count(c);
      if(index<length){
        const offset=focus==='application'?0:theory(c),application=Boolean(c.variantAt)&&focus!=='knowledge'&&index>=offset;
        const itemIndex=application?index-offset:quizIndices(c)[index];
        const n=application?c.variantAt(Math.floor(itemIndex/4)).notions[itemIndex%4]:(c.quiz || c.notions)[itemIndex];
        return {...n,chapterId:c.id,id:`${c.id}:${application?'v'+Math.floor(itemIndex/4)+':'+itemIndex%4:'n'+itemIndex}`};
      }
      index-=length;
    }
  };
  return {total,at};
}
export function cardPool(chapters){
 const total=chapters.reduce((sum,c)=>sum+chapterCardCount(c),0);
 return {total,at:index=>{if(!Number.isInteger(index)||index<0||index>=total)throw new Error('Card index out of range');for(const c of chapters){const length=chapterCardCount(c);if(index<length){const card=(c.cards || c.notions.map(n=>({q:'À retrouver : '+n.title,a:n.body,tag:c.title})))[index];return {...card,chapterId:c.id,id:c.id+':card'+index};}index-=length;}throw new Error('Card index out of range');}};
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
