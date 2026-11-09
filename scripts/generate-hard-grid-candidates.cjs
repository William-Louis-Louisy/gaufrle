"use strict";

/**
 * Deterministic constraint-satisfaction generator for 4 horizontal and
 * 4 vertical seven-letter words on the 7x7 hard grid.
 * The four letters at even offsets (0,2,4,6) form each intersection key.
 * Every chosen word must have a substantive dictionary definition; at least
 * three words per proposed grid appeared in the existing medium catalog.
 * This produces REVIEW CANDIDATES only and never edits HardGridList.json.
 */
const fs = require("node:fs");
const path = require("node:path");

function generateHardGridCandidates(dictionary,existing,medium,{count=65,seed=20261109,attempts=1400}={}){
  if(!Number.isInteger(count)||count<1||count>200)throw new Error("count must be an integer between 1 and 200");
  if(!Number.isInteger(seed))throw new Error("seed must be an integer");
  const mediumWords=new Set(medium.flatMap(g=>g.words).filter(w=>typeof w==="string"&&w.length===7));
  const historicalWords=new Set(existing.flatMap(g=>g.words));
  const historicalSignatures=new Set(existing.map(g=>[...g.words].sort().join("|")));
  const lexicon=new Map();
  const keyOf=w=>w[0]+w[2]+w[4]+w[6];
  for(const entry of dictionary){
    if(typeof entry.word!=="string"||!/^[a-z]{7}$/.test(entry.word)||
       !Array.isArray(entry.definition)||
       !entry.definition.some(def=>typeof def==="string"&&def.trim().length>=25))continue;
    const key=keyOf(entry.word);
    if(!lexicon.has(key))lexicon.set(key,[]);
    lexicon.get(key).push(entry.word);
  }
  const keys=[...lexicon.keys()];
  if(keys.length<100)throw new Error("The seven-letter dictionary is too small");
  const preferredKeys=keys.filter(k=>lexicon.get(k).some(w=>mediumWords.has(w)));
  const nextCharacters=new Map();
  for(const key of keys)for(let i=0;i<4;i++){
    const prefix=key.slice(0,i);
    if(!nextCharacters.has(prefix))nextCharacters.set(prefix,new Set());
    nextCharacters.get(prefix).add(key[i]);
  }
  let state=seed>>>0;
  const random=()=>{let t=state+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};
  const pick=array=>array[Math.floor(random()*array.length)];
  const matchingRows=prefixes=>keys.filter(key=>[...key].every((letter,col)=>nextCharacters.get(prefixes[col])?.has(letter)));
  const pickRow=options=>{
    const preferred=options.filter(key=>lexicon.get(key).some(w=>mediumWords.has(w)));
    return preferred.length>0&&random()<0.8?pick(preferred):pick(options);
  };
  const pool=[];
  const seenSignatures=new Set(historicalSignatures);
  for(let attempt=0;attempt<attempts;attempt++){
    const row0=random()<0.75?pick(preferredKeys):pick(keys);
    const first=matchingRows([...row0]);if(!first.length)continue;
    const row1=pickRow(first);
    const second=matchingRows([0,1,2,3].map(i=>row0[i]+row1[i]));if(!second.length)continue;
    const row2=pickRow(second);
    const third=matchingRows([0,1,2,3].map(i=>row0[i]+row1[i]+row2[i]));if(!third.length)continue;
    const row3=pickRow(third);
    const rowKeys=[row0,row1,row2,row3];
    const colKeys=[0,1,2,3].map(i=>rowKeys.map(row=>row[i]).join(""));
    const used=new Set(),words=[];
    let valid=true;
    for(const key of [...rowKeys,...colKeys]){
      const options=lexicon.get(key).filter(word=>!used.has(word));
      if(!options.length){valid=false;break;}
      const preferred=options.filter(word=>mediumWords.has(word));
      const historical=options.filter(word=>historicalWords.has(word));
      const selected=preferred.length&&random()<0.85?pick(preferred):
        historical.length&&random()<0.5?pick(historical):pick(options);
      used.add(selected);words.push(selected);
    }
    if(!valid)continue;
    const mediumCount=words.filter(w=>mediumWords.has(w)).length;
    const historicalCount=words.filter(w=>historicalWords.has(w)).length;
    if(mediumCount<3||historicalCount>2)continue;
    const signature=[...words].sort().join("|");
    if(seenSignatures.has(signature))continue;
    seenSignatures.add(signature);
    pool.push({words,signature,mediumCount,historicalCount,score:mediumCount*10+historicalCount*2});
  }
  pool.sort((a,b)=>b.score-a.score||a.signature.localeCompare(b.signature));
  const chosen=[],usage=new Map();
  for(const item of pool){
    if(item.words.some(w=>(usage.get(w)||0)>=2))continue;
    if(chosen.some(x=>x.words.filter(w=>item.words.includes(w)).length>3))continue;
    chosen.push(item);
    for(const w of item.words)usage.set(w,(usage.get(w)||0)+1);
    if(chosen.length===count)break;
  }
  if(chosen.length!==count)throw new Error("Only "+chosen.length+" candidates after diversity checks; increase attempts or widen lexical criteria");
  return chosen.map((candidate,index)=>({
    id:"hard-candidate-"+String(index+1).padStart(3,"0"),
    words:candidate.words,
    reviewStatus:"pending"
  }));
}

function generateFromRepository(root=path.resolve(__dirname,".."),options={}) {
  const load=(name)=>JSON.parse(fs.readFileSync(path.join(root,"src","jsons",name),"utf8"));
  return generateHardGridCandidates(
    load("DefSevenLetters.json"),load("HardGridList.json"),load("MediumGridList.json"),options
  );
}

if (require.main === module) {
  const result = generateFromRepository();
  const output = path.resolve(__dirname,"../data/hard-grid-candidates.json");
  fs.mkdirSync(path.dirname(output),{recursive:true});
  fs.writeFileSync(output,JSON.stringify(result,null,2)+String.fromCharCode(10),"utf8");
  process.stdout.write("Generated "+result.length+" unreviewed hard-grid candidates in "+output+String.fromCharCode(10));
}

module.exports={generateHardGridCandidates,generateFromRepository};
