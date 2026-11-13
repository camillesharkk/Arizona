import assert from 'node:assert/strict';
import {testLoader} from './pack-test-utils.mjs';

let hookIndex=0;
const hooks=[],effects=[];
const jsx=(type,props)=>({type,props:props||{}});
const load=testLoader({
  react:{useState(initial){const slot=hookIndex++;if(!(slot in hooks))hooks[slot]=initial;return[hooks[slot],value=>{hooks[slot]=typeof value==='function'?value(hooks[slot]):value;}];},useEffect(fn){effects.push(fn);},useId:()=> 'test-password'},
  'react/jsx-runtime':{jsx,jsxs:jsx,Fragment:'fragment'},'next/link':{__esModule:true,default:'a'},
}, {window:{location:{search:''}}});
const {AuthForm}=load('components/AuthForm.tsx');
function nodes(node){if(Array.isArray(node))return node.flatMap(nodes);if(!node||!node.props)return[];return[node,...nodes(node.props.children)];}
for(const mode of ['login','register','forgot','reset']){
  hooks.length=0;effects.length=0;hookIndex=0;
  const initial=AuthForm({mode});
  assert.ok(!nodes(initial).some(node=>node.type==='form'),'No credential form before its submit handler is mounted');
  assert.ok(nodes(initial).some(node=>node.type==='noscript'),'Explain the JavaScript requirement');
  effects.splice(0).forEach(effect=>effect());hookIndex=0;
  const form=AuthForm({mode});
  assert.equal(form.type,'form');assert.equal(form.props.method,'post');assert.equal(form.props.action,`/api/auth/${mode}/`);
}
console.log('Login/register/forgot/reset wait for client initialization and use POST for native fallback');
