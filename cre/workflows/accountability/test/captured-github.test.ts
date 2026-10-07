import {it,expect} from 'vitest';
import capture from '../../../../tests/fixtures/github-pr-1652.json';
import {evaluateGithub} from '../../../../packages/shared/src/github';
import {compactGithubObservation} from '../processing';
const config={owner:'smartcontractkit',repo:'chainlink-solana',pr:1652,targetBranch:'develop',policyVersion:1 as const};
const merged=Date.parse(capture.body.merged_at!)/1000;
it('evaluates a captured qualifying merge through the production compaction path',()=>{const observation=compactGithubObservation(200,JSON.stringify(capture.body));expect(evaluateGithub(config,observation,merged-1,merged,merged+1)).toBe('SUCCESS');});
it('rejects the same captured merge before activation or on a different branch',()=>{const observation=compactGithubObservation(200,JSON.stringify(capture.body));expect(evaluateGithub(config,observation,merged,merged+60,merged+61)).toBe('FAIL');expect(evaluateGithub({...config,targetBranch:'main'},observation,merged-1,merged,merged+1)).toBe('FAIL');});
it('keeps captured API errors unknown regardless of deadline',()=>{for(const status of [404,429,500])expect(evaluateGithub(config,compactGithubObservation(status,JSON.stringify(capture.body)),merged-1,merged,merged+1)).toBe('UNKNOWN');});
