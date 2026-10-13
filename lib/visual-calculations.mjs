// Fixed educational models. No evaluation of formulas or generated code.
const sequence=(from,to,count=9)=>Array.from({length:count},(_,i)=>from+(to-from)*i/(count-1));
const plot=(title,xLabel,yLabel,series,rows,reading)=>({title,xLabel,yLabel,series,rows,reading});
const curve=(name,values)=>({name,values});
export const VISUAL_MODELS={
  'diagnostic-fonctionnel':{key:'clients',min:0,max:100000,step:1000,title:'Créances clients et équilibre financier'},
  'van-deux-periodes':{key:'rate',min:0,max:30,step:1,title:'Taux d’actualisation et VAN'},
  'amortissement-prorata':{key:'months',min:1,max:12,step:1,title:'Mise en service et première dotation'},
  'composants-machines':{key:'lifeC',min:1,max:10,step:1,title:'Deux composants, deux rythmes'},
  'cout-variable-seuil':{key:'fixed',min:0,max:100000,step:1000,title:'Le point où le résultat devient positif'},
  'ecart-matiere':{key:'actualP',min:0,max:10,step:0.1,title:'Décomposer l’écart total'},
  'wilson-stocks':{key:'holding',min:0.5,max:8,step:0.1,title:'Trouver l’équilibre entre deux coûts'},
  'portefeuille-deux-actifs':{key:'weight',min:0,max:100,step:1,title:'Diversification et pondération'}
};
export function calculateVisual(model,original,changed) {
  const config=VISUAL_MODELS[model];
  if(!config)throw new Error('Modèle visuel inconnu.');
  const d={...original};
  if(changed!==undefined){if(!Number.isFinite(changed)||changed<config.min||changed>config.max)throw new Error('Valeur hors du domaine du modèle.');d[config.key]=changed;}
  if(Object.values(d).some(v=>!Number.isFinite(v)))throw new Error('Données non numériques.');
  let output;
  switch(model){
    case 'diagnostic-fonctionnel': {
      const fr=d.stable-d.fixed,bfr=d.stocks+d.clients-d.suppliers,tn=fr-bfr;
      const points=sequence(0,100000);
      output=plot('Financer le cycle d’exploitation','Créances clients (€)','Montant (€)',[
        curve('FRNG',points.map(x=>({x,y:fr}))),curve('BFRE',points.map(x=>({x,y:d.stocks+x-d.suppliers}))),curve('Trésorerie nette',points.map(x=>({x,y:fr-d.stocks-x+d.suppliers})))
      ],[{label:'FRNG',value:fr,unit:'€'},{label:'BFRE',value:bfr,unit:'€'},{label:'Trésorerie nette',value:tn,unit:'€'}], 'À ressources et emplois stables inchangés, une hausse des créances clients augmente ici le BFRE et réduit la trésorerie nette.');break;
    }
    case 'van-deux-periodes': {
      if(d.rate<0||d.initial<0)throw new Error('Hypothèses d’actualisation invalides.');
      const va1=d.f1/(1+d.rate/100),va2=d.f2/(1+d.rate/100)**2;
      output=plot('L’effet du taux sur la valeur actuelle nette','Taux annuel (%)','VAN (€)',[curve('VAN',sequence(0,30,13).map(x=>({x,y:d.f1/(1+x/100)+d.f2/(1+x/100)**2-d.initial})))],[{label:'Flux t1 actualisé',value:va1,unit:'€'},{label:'Flux t2 actualisé',value:va2,unit:'€'},{label:'VAN',value:va1+va2-d.initial,unit:'€'}], 'Les flux sont ceux du dossier : un encaissement futur est ramené à t0. La VAN tient compte de l’investissement initial.');break;
    }
    case 'amortissement-prorata': {
      if(d.life<=0||d.cost<d.residual||d.months<1||d.months>12)throw new Error('Plan d’amortissement invalide.');
      const yearly=(d.cost-d.residual)/d.life,first=yearly*d.months/12;
      output=plot('Le prorata de la première année','Mois d’utilisation','Montant (€)',[curve('Première dotation',sequence(1,12,12).map(x=>({x,y:yearly*x/12}))),curve('VNC en fin de première année',sequence(1,12,12).map(x=>({x,y:d.cost-yearly*x/12})))],[{label:'Annuité pleine',value:yearly,unit:'€'},{label:'Première dotation',value:first,unit:'€'},{label:'VNC',value:d.cost-first,unit:'€'}], 'Le prorata mensuel est imposé par cet exercice. La durée et la valeur résiduelle restent fixes.');break;
    }
    case 'composants-machines': {
      if(d.lifeS<=0||d.lifeC<=0)throw new Error('Durée invalide.');
      const years=sequence(0,Math.max(d.lifeS,d.lifeC),Math.max(d.lifeS,d.lifeC)+1);
      const structure=x=>Math.max(0,d.structure*(1-x/d.lifeS)),component=x=>Math.max(0,d.component*(1-x/d.lifeC));
      output=plot('Valeur nette des composants au fil du temps','Années révolues','VNC (€)',[curve('Structure',years.map(x=>({x,y:structure(x)}))),curve('Composant',years.map(x=>({x,y:component(x)}))),curve('Actif total',years.map(x=>({x,y:structure(x)+component(x)})))],[{label:'Annuité structure',value:d.structure/d.lifeS,unit:'€'},{label:'Annuité composant',value:d.component/d.lifeC,unit:'€'},{label:'Dotation de la première année',value:d.structure/d.lifeS+d.component/d.lifeC,unit:'€'},{label:'VNC après un an',value:structure(1)+component(1),unit:'€'}], 'Chaque composant cesse d’être amorti à la fin de sa propre durée. Aucun remplacement, aucune dépréciation ni valeur résiduelle ne sont simulés.');break;
    }
    case 'cout-variable-seuil': {
      if(d.sales<=0||d.variable<0||d.variable>=d.sales)throw new Error('Le modèle exige une marge sur coûts variables positive.');
      const rate=(d.sales-d.variable)/d.sales,threshold=d.fixed/rate,points=sequence(0,Math.max(d.sales*1.5,threshold*1.25,1),13);
      output=plot('Chiffre d’affaires et couverture des coûts','Chiffre d’affaires HT (€)','Montant (€)',[curve('Chiffre d’affaires',points.map(x=>({x,y:x}))),curve('Coûts totaux',points.map(x=>({x,y:d.fixed+(1-rate)*x})))],[{label:'Taux de MSCV',value:rate*100,unit:'%'},{label:'Seuil en chiffre d’affaires',value:threshold,unit:'€'},{label:'Résultat au CA du dossier',value:d.sales-d.variable-d.fixed,unit:'€'}], 'L’intersection correspond au seuil. Le taux de charges variables reste constant ; cette exploration suppose que le modèle linéaire reste applicable dans tout le domaine affiché.');break;
    }
    case 'ecart-matiere': {
      const price=d.actualQ*(d.actualP-d.standardP),quantity=(d.actualQ-d.standardQ)*d.standardP;
      output=plot('Influence du prix réel sur les écarts','Prix réel (€/kg)','Écart (€)',[curve('Écart sur prix',sequence(0,10,11).map(x=>({x,y:d.actualQ*(x-d.standardP)}))),curve('Écart sur quantité',sequence(0,10,11).map(x=>({x,y:quantity}))),curve('Écart total',sequence(0,10,11).map(x=>({x,y:d.actualQ*(x-d.standardP)+quantity})))],[{label:'Écart sur prix',value:price,unit:'€'},{label:'Écart sur quantité',value:quantity,unit:'€'},{label:'Écart total',value:price+quantity,unit:'€'}], 'Convention : réel moins standard. Un écart positif est défavorable dans ce modèle de coût ; un écart négatif est favorable. La quantité standard est autorisée pour la production réelle.');break;
    }
    case 'wilson-stocks': {
      if(d.holding<=0||d.order<=0||d.demand<=0)throw new Error('Le modèle de Wilson exige des données strictement positives.');
      const q=Math.sqrt(2*d.demand*d.order/d.holding),points=sequence(q*.25,q*2,15),order=x=>d.demand/x*d.order,holding=x=>x/2*d.holding;
      output=plot('Coûts annuels selon la taille de la commande','Quantité par commande (unités)','Coût annuel (€)',[curve('Commande',points.map(x=>({x,y:order(x)}))),curve('Possession',points.map(x=>({x,y:holding(x)}))),curve('Total pertinent',points.map(x=>({x,y:order(x)+holding(x)})))],[{label:'Quantité économique Q*',value:q,unit:'unités'},{label:'Coût annuel de commande à Q*',value:order(q),unit:'€'},{label:'Coût annuel de possession à Q*',value:holding(q),unit:'€'}], 'À Q*, les deux coûts annuels sont égaux. Le graphique exclut le coût d’achat, les ruptures et un éventuel stock de sécurité. Son domaine s’adapte à la nouvelle quantité optimale.');break;
    }
    case 'portefeuille-deux-actifs': {
      if(d.weight<0||d.weight>100||Math.abs(d.rho)>1||d.sa<0||d.sb<0)throw new Error('Hypothèses de portefeuille invalides.');
      const variance=x=>{const w=x/100;return w*w*d.sa*d.sa+(1-w)**2*d.sb*d.sb+2*w*(1-w)*d.rho*d.sa*d.sb;};
      const expected=x=>x/100*d.ra+(1-x/100)*d.rb;
      output=plot('Pondération, rendement espéré et volatilité','Poids de A (%)','Taux (%)',[curve('Rendement espéré',sequence(0,100,11).map(x=>({x,y:expected(x)}))),curve('Volatilité',sequence(0,100,11).map(x=>({x,y:Math.sqrt(Math.max(0,variance(x)))})))],[{label:'Poids de B',value:100-d.weight,unit:'%'},{label:'Rendement espéré',value:expected(d.weight),unit:'%'},{label:'Variance',value:variance(d.weight),unit:'points²'},{label:'Volatilité',value:Math.sqrt(Math.max(0,variance(d.weight))),unit:'%'}], 'La volatilité mesure la dispersion anticipée. Un rendement espéré n’est pas garanti. La variance en points carrés figure dans le tableau, avec son unité distincte.');break;
    }
  }
  const focus={
    'diagnostic-fonctionnel':()=>({x:d.clients,ys:output.rows.map(r=>r.value)}),
    'van-deux-periodes':()=>({x:d.rate,ys:[output.rows[2].value]}),
    'amortissement-prorata':()=>({x:d.months,ys:[output.rows[1].value,output.rows[2].value]}),
    'composants-machines':()=>({x:1,ys:[Math.max(0,d.structure-d.structure/d.lifeS),Math.max(0,d.component-d.component/d.lifeC),output.rows[3].value]}),
    'cout-variable-seuil':()=>({x:output.rows[1].value,ys:[output.rows[1].value,output.rows[1].value]}),
    'ecart-matiere':()=>({x:d.actualP,ys:output.rows.map(r=>r.value)}),
    'wilson-stocks':()=>({x:output.rows[0].value,ys:[output.rows[1].value,output.rows[2].value,output.rows[1].value+output.rows[2].value]}),
    'portefeuille-deux-actifs':()=>({x:d.weight,ys:[output.rows[1].value,output.rows[3].value]})
  }[model]();
  // Include the exact selected point so curved relations are never interpolated as a result.
  output.focus=focus;
  output.series=output.series.map((s,i)=>({...s,values:[...s.values.filter(p=>Math.abs(p.x-focus.x)>1e-10),{x:focus.x,y:focus.ys[i]}].sort((a,b)=>a.x-b.x)}));
  return output;
}
