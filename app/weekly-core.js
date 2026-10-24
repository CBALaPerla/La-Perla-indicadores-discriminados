export const derivedDependencies={returns:['returnsRescue','returnsIPPA'],admissions:['apm','seizures','confiscations','deadAdmissions'],sterilizations:['sterilizationsInternal','sterilizationsOutpatient'],consultations:['scheduled','extra'],integral:['rescues','sterilizationsOutpatient','feral']};
const numberOrNull=v=>typeof v==='number'&&Number.isFinite(v)?v:null;
function strictSum(values){return values.every(v=>numberOrNull(v)!==null)?values.reduce((s,v)=>s+v,0):null;}
export function deriveWeek(values,schema){
  const totals={},species={};
  for(const field of schema.fields){const v=numberOrNull(values[field.key]);if(field.splitIndex===null)totals[field.metric]=v;else{species[field.metric]??=[null,null];species[field.metric][field.splitIndex]=v;}}
  for(const [metric,split] of Object.entries(species))totals[metric]=strictSum(split);
  for(const [metric,dependencies] of Object.entries(derivedDependencies))totals[metric]=strictSum(dependencies.map(id=>totals[id]??null));
  species.sterilizations=[0,1].map(j=>strictSum([species.sterilizationsInternal?.[j]??null,species.sterilizationsOutpatient?.[j]??null]));
  return {totals,species};
}
export function baseWeeks(data,schema){
  const metrics=Object.fromEntries(data.metrics.map(m=>[m.id,m])),result=[];
  for(let month=0;month<12;month++){
    const weeks=metrics.calls.weekly[month];
    weeks.forEach((week,index)=>{const values={};for(const field of schema.fields){const w=metrics[field.metric]?.weekly[month]?.[index];values[field.key]=numberOrNull(field.splitIndex===null?w?.value:w?.species?.[field.splitIndex]);}
      result.push({year:data.year,month:month+1,week:index+1,weekLabel:week.label,values,revision:0,monthClosed:data.monthStatus?.[month]==='complete',source:'excel'});
    });
  }
  return result;
}
export function combineWeeks(base,stored){const records=new Map(base.map(r=>[`${r.month}-${r.week}`,r]));for(const r of stored)records.set(`${r.month}-${r.week}`,{...r,source:'form'});return [...records.values()].sort((a,b)=>a.month-b.month||a.week-b.week);}
export function rebuildData(base,stored,schema){
  const data=JSON.parse(JSON.stringify(base)),weeks=combineWeeks(baseWeeks(base,schema),stored),changed=new Set(stored.map(r=>r.month));
  data.monthStatus=base.monthStatus?[...base.monthStatus]:Array.from({length:12},(_,i)=>i<base.cutoff?'complete':'empty');data.updatedMonths=[...changed];
  for(const month of changed){const records=weeks.filter(r=>r.month===month),computed=records.map(r=>({...r,...deriveWeek(r.values,schema)}));
    const latest=stored.filter(r=>r.month===month).sort((a,b)=>a.updatedAt.localeCompare(b.updatedAt)).at(-1);
    const coreFields=schema.fields.filter(f=>!['iaa','iaaDogs','beneficiaries','sensitization','peopleReached'].includes(f.metric));
    const complete=latest.monthClosed&&records.every(r=>coreFields.every(f=>typeof r.values[f.key]==='number'));
    data.monthStatus[month-1]=complete?'complete':'partial';
    for(const metric of data.metrics){const vals=computed.map(r=>r.totals[metric.id]??null),known=vals.filter(v=>v!==null);
      if(metric.aggregation==='last'){const last=computed.filter(r=>r.totals[metric.id]!==null&&r.totals[metric.id]!==undefined).at(-1);metric.values[month-1]=last?.totals[metric.id]??null;if(metric.species)metric.species[month-1]=last?.species[metric.id]??null;}
      else{metric.values[month-1]=known.length?known.reduce((s,v)=>s+v,0):null;if(metric.species)metric.species[month-1]=[0,1].map(j=>{const sp=computed.map(r=>r.species[metric.id]?.[j]??null).filter(v=>v!==null);return sp.length?sp.reduce((s,v)=>s+v,0):null;});}
      metric.weekly[month-1]=computed.map(r=>({week:r.week,label:r.weekLabel,value:r.totals[metric.id]??null,species:r.species[metric.id]??null}));
      metric.references[month-1]=`${data.months[month-1]} · registro semanal`;
    }
  }
  data.cutoff=Math.max(base.cutoff||0,...[...changed]);return data;
}
export function populationMeans(records,schema){const d=records.map(r=>deriveWeek(r.values,schema));const average=id=>{const n=d.map(r=>r.totals[id]).filter(v=>v!==null);return n.length?n.reduce((s,v)=>s+v,0)/n.length:null};return{housed:average('housed'),ready:average('ready')};}
