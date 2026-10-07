import {it,expect} from 'vitest';
import {encodeGithubConfig,hashGithubConfig,encodeTerms,hashTerms} from '../src/terms';
import {singaporeLocalToUtc} from '../src/time';
import fixture from '../../../tests/fixtures/canonical-v1.json';
const hex=(v:Uint8Array)=>Buffer.from(v).toString('hex');
it('matches independently encoded canonical Github fixture',()=>{
 expect(hex(encodeGithubConfig(fixture.identity,fixture.config,fixture.deadlines))).toBe(fixture.configHex);
 expect(hex(hashGithubConfig(fixture.identity,fixture.config,fixture.deadlines))).toBe(fixture.configHash);
});
it('matches independently encoded canonical terms fixture',()=>{
 expect(hex(encodeTerms(fixture.draft))).toBe(fixture.termsHex);expect(hex(hashTerms(fixture.draft))).toBe(fixture.termsHash);
});
it('converts Singapore midnight to previous UTC day',()=>expect(singaporeLocalToUtc('2026-10-08T00:00')).toBe(1791388800));
it('rejects impossible local date and missing time',()=>{expect(()=>singaporeLocalToUtc('2026-02-30T12:00')).toThrow();expect(()=>singaporeLocalToUtc('Friday')).toThrow();});
