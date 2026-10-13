import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/study.js';
const request=async url=>{
  const output={};const res={setHeader(){},status(status){output.status=status;return this},json(data){output.data=data;return this}};
  await handler({method:'GET',url,headers:{}},res);return output;
};
test('study route serves the real free chapter and public premium metadata without server credentials',async()=>{
  const course=await request('/api/study?ue=UE9&tool=summary&chapter=stocks');assert.equal(course.status,200);assert.equal(course.data.chapter,'stocks');assert.ok(course.data.example.contexte);
  const quiz=await request('/api/study?ue=UE9&tool=qcm&chapter=stocks&count=20');assert.equal(quiz.status,200);assert.equal(quiz.data.items.length,4);
  const metadata=await request('/api/study?ue=DSCG7&tool=catalog');assert.equal(metadata.status,200);assert.equal(metadata.data.chapters.length,3);assert.equal(metadata.data.sections,undefined);
});
test('study route rejects invalid chapter, size and tool before Firebase initialization',async()=>{
  for(const url of ['/api/study?ue=UE2&tool=summary&chapter=missing','/api/study?ue=UE2&tool=all','/api/study?ue=constructor&tool=qcm'])assert.equal((await request(url)).status,404);
  assert.equal((await request('/api/study?ue=UE2&tool=qcm&count=21')).status,400);
});
