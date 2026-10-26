import {AI_MODEL,reserveCost} from './ai-budget.mjs';

// One request only. The caller must reserve its full upper-bound cost FIRST.
// No automatic retries, tools, alternate models, redirect reposts or paid tiers.
export function requestTutor(data,{json=false,apiKey=process.env.GROQ_API_KEY,fetchImpl=fetch}={}){
  reserveCost(data);
  if(!apiKey)throw Object.assign(new Error('Le tuteur est indisponible. Vos cours restent accessibles.'),{status:503});
  return fetchImpl('https://api.groq.com/openai/v1/chat/completions',{
    method:'POST',redirect:'error',
    headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},
    body:JSON.stringify({model:AI_MODEL,service_tier:'on_demand',n:1,temperature:json ? 0.2 : 0.3,
      messages:data.messages,max_completion_tokens:data.max_tokens,reasoning_effort:'low',include_reasoning:false,
      ...(json?{response_format:{type:'json_object'}}:{})}),
    signal:AbortSignal.timeout(25000),
  });
}
