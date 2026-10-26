import test from 'node:test';
import assert from 'node:assert/strict';
import {requestTutor} from '../lib/tutor-provider.mjs';
import {tutorInstructions,validateTutorReply} from '../lib/tutor-grounding.mjs';
const data={messages:[{role:'user',content:'Expliquez le bilan.'}],max_tokens:1600};
test('both tutoring formats use exactly one bounded on-demand GPT-OSS 120B call without tools',async()=>{
  for(const json of [false,true]){
    let calls=0;
    const response=await requestTutor(data,{json,apiKey:'test-only',fetchImpl:async(url,init)=>{
      calls++;assert.equal(url,'https://api.groq.com/openai/v1/chat/completions');
      const body=JSON.parse(init.body);
      assert.equal(body.model,'openai/gpt-oss-120b');assert.equal(body.service_tier,'on_demand');
      assert.equal(body.n,1);assert.equal(body.max_completion_tokens,1600);
      assert.equal(body.include_reasoning,false);assert.equal(body.tools,undefined);
      assert.equal(init.redirect,'error');assert.equal(init.signal.aborted,false);
      assert.deepEqual(body.messages,data.messages);
      assert.equal(!!body.response_format,json);
      return {ok:false,status:429};
    }});
    assert.equal(response.status,429);assert.equal(calls,1);
  }
});
test('unsupported monetary illustrations and invented legal references are withheld',()=>{
  const evidence='[1] UE9, Bilan. Le bilan est une situation à une date. [2] Le compte de résultat porte sur une période.';
  assert.equal(validateTutorReply('Le bilan décrit une situation à une date [1], le compte de résultat une activité sur une période [2].',evidence).includes('[1]'),true);
  assert.throws(()=>validateTutorReply('Actif de 100 k€, capital de 60 k€ et résultat de 20 k€.',evidence),{status:503});
  assert.throws(()=>validateTutorReply('Selon le PCG, UE9 § 2.',evidence),{status:503});
  assert.throws(()=>validateTutorReply('Selon l’article 121-1 du PCG.',evidence),{status:503});
  assert.equal(validateTutorReply('Selon l’article 121-1 du PCG.',evidence+' article 121-1'), 'Selon l’article 121-1 du PCG.');
  assert.match(tutorInstructions('UE9',''),/Aucun extrait pertinent/);
});
test('invalid request and missing credentials never make a provider call; network failures are never retried',async()=>{
  let calls=0;const options={apiKey:'test-only',fetchImpl:async()=>{calls++;throw new Error('network');}};
  assert.throws(()=>requestTutor({...data,max_tokens:100000},options),{status:400});
  assert.throws(()=>requestTutor(data,{...options,apiKey:''}),{status:503});
  assert.equal(calls,0);
  await assert.rejects(requestTutor(data,options),/network/);assert.equal(calls,1);
});
