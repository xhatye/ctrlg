import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/study.js';
const request=async url=>{
  const output={};const res={setHeader(){},status(status){output.status=status;return this},json(data){output.data=data;return this}};
  await handler({method:'GET',url,headers:{}},res);return output;
};
test('all lessons require sign-in; only titles and volumes remain public',async()=>{
  for(const ue of ['UE9','UE1','DSCG7'])for(const tool of ['summary','qcm','cards','case'])assert.equal((await request(`/api/study?ue=${ue}&tool=${tool}`)).status,401);
  const metadata=await request('/api/study?ue=DSCG7&tool=catalog');assert.equal(metadata.status,200);assert.equal(metadata.data.chapters.length,8);assert.equal(metadata.data.sections,undefined);
});
test('study route rejects invalid chapter, size and tool before Firebase initialization',async()=>{
  for(const url of ['/api/study?ue=UE2&tool=summary&chapter=missing','/api/study?ue=UE2&tool=all','/api/study?ue=constructor&tool=qcm'])assert.equal((await request(url)).status,404);
  assert.equal((await request('/api/study?ue=UE2&tool=qcm&count=21')).status,400);
  assert.equal((await request('/api/study?ue=UE9&tool=cards&count=101')).status,400);
  assert.equal((await request('/api/study?ue=UE9&tool=case&chapter=cmp-periodique&variant=2650')).status,404);
  assert.equal((await request('/api/study?ue=UE9&tool=qcm&focus=bad')).status,400);
  assert.equal((await request('/api/study?ue=UE9&tool=case&variant=-1')).status,404);
});
