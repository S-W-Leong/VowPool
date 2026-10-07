import {it,expect} from 'vitest';
import {validateAiDraft,requestAiDraft} from '../lib/ai';
const partial={draft:{goal:'Ship',criteria:'PR merged',owner:null,repo:null,pr:null,targetBranch:'main',goalDeadline:null,reviewDeadline:null},missingFields:['owner','repo','pr','goalDeadline','reviewDeadline'],explanation:'Add repository, PR and dates'};
it('preserves missing Github fields without invention',()=>{const v=validateAiDraft(partial,'github');expect(v.draft.pr).toBeNull();expect(v.missingFields).toContain('pr');});
it.each([{...partial,code:'return true'}, {...partial,draft:{...partial.draft,repo:'https://evil.test/repo'}}, {...partial,draft:{...partial.draft,pr:0}}, {...partial,draft:{...partial.draft,policy:'arbitrary'}}])('rejects malformed or executable AI configuration',v=>expect(()=>validateAiDraft(v,'github')).toThrow());
it('computes actual missing fields even if model omits them',()=>expect(validateAiDraft({...partial,missingFields:[]},'github').missingFields).toContain('pr'));
it('fails clearly when no provider key is configured',async()=>await expect(requestAiDraft({goal:'Ship',mode:'github',nowSingapore:'7 Oct 2026, 4:00 pm'},{key:undefined,model:'gpt-4o-mini'})).rejects.toThrow(/Manual/));
