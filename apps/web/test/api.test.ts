import {it,expect} from 'vitest';
import {body,rateLimit} from '../lib/server';
it('bounds the request stream before parsing JSON',async()=>{const request=new Request('http://localhost/api/configure',{method:'POST',body:JSON.stringify({goal:'x'.repeat(17000)})});await expect(body(request)).rejects.toThrow('Request too large');});
it('rate limits repeated requests per session',()=>{const key='test-session';for(let i=0;i<4;i++)rateLimit(key,4);expect(()=>rateLimit(key,4)).toThrow('Too many requests');});
