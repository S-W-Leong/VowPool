// Code generated — DO NOT EDIT.
import {
  addCodecSizePrefix,
  getArrayCodec,
  getBooleanCodec,
  getEnumCodec,
  getI64Codec,
  getNullableCodec,
  getStructCodec,
  getU16Codec,
  getU32Codec,
  getU64Codec,
  getU8Codec,
  getUtf8Codec,
} from '@solana/codecs'
import { getAddressCodec, type Address } from '@solana/addresses'
import {
  adaptTrigger,
  anchorCPILogTriggerConfig,
  bytesToBase64,
  bytesToHex,
  calculateAccountsHash,
  encodeBorshVecU32,
  encodeForwarderReport,
  prepareSolanaReportRequest,
  type Runtime,
  type SolanaAccountMeta,
  SolanaClient,
  solanaAccountMetasToJson,
  solanaAddressToBytes,
  type SolanaComputeConfig,
  type SolanaDecodedLog,
  type SolanaFilterLogTriggerRequestJson,
  type SolanaLog,
  type SolanaLogTriggerOptions,
  type SolanaSubkeyConfigJson,
  type SolanaValueComparatorJson,
  type Trigger,
} from '@chainlink/cre-sdk'

export const VOWPOOL_PROGRAM_ID = 'A2JT4HUJYEd3BL5xPXRiaXjvoFSMetY8zvLEPmRAxXPf'

export const VOWPOOL_IDL = {"address":"A2JT4HUJYEd3BL5xPXRiaXjvoFSMetY8zvLEPmRAxXPf","metadata":{"name":"vowpool","version":"0.1.0","spec":"0.1.0"},"instructions":[{"name":"acknowledge","discriminator":[209,182,197,45,97,93,210,58],"accounts":[{"name":"member","signer":true},{"name":"group","writable":true,"pda":{"seeds":[{"kind":"const","value":[103,114,111,117,112]},{"kind":"account","path":"group.founder","account":"Group"}]},"relations":["commitment"]},{"name":"commitment","writable":true,"pda":{"seeds":[{"kind":"const","value":[99,111,109,109,105,116,109,101,110,116]},{"kind":"account","path":"group"},{"kind":"account","path":"commitment.owner","account":"Commitment"},{"kind":"account","path":"commitment.nonce","account":"Commitment"}]}}],"args":[]},{"name":"activate","discriminator":[194,203,35,100,151,55,170,82],"accounts":[{"name":"owner","writable":true,"signer":true,"relations":["commitment"]},{"name":"group","writable":true,"pda":{"seeds":[{"kind":"const","value":[103,114,111,117,112]},{"kind":"account","path":"group.founder","account":"Group"}]},"relations":["commitment"]},{"name":"commitment","writable":true,"pda":{"seeds":[{"kind":"const","value":[99,111,109,109,105,116,109,101,110,116]},{"kind":"account","path":"group"},{"kind":"account","path":"owner"},{"kind":"account","path":"commitment.nonce","account":"Commitment"}]}},{"name":"mint"},{"name":"vault","writable":true,"pda":{"seeds":[{"kind":"account","path":"group"},{"kind":"const","value":[6,221,246,225,215,101,161,147,217,203,225,70,206,235,121,172,28,180,133,237,95,91,55,145,58,140,245,133,126,255,0,169]},{"kind":"account","path":"mint"}],"program":{"kind":"const","value":[140,151,37,143,78,36,137,241,187,61,16,41,20,142,13,131,11,90,19,153,218,255,16,132,4,142,123,216,219,233,248,89]}}},{"name":"source","writable":true,"pda":{"seeds":[{"kind":"account","path":"owner"},{"kind":"const","value":[6,221,246,225,215,101,161,147,217,203,225,70,206,235,121,172,28,180,133,237,95,91,55,145,58,140,245,133,126,255,0,169]},{"kind":"account","path":"mint"}],"program":{"kind":"const","value":[140,151,37,143,78,36,137,241,187,61,16,41,20,142,13,131,11,90,19,153,218,255,16,132,4,142,123,216,219,233,248,89]}}},{"name":"token_program","address":"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"},{"name":"associated_token_program","address":"ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"},{"name":"system_program","address":"11111111111111111111111111111111"}],"args":[]},{"name":"approve","discriminator":[69,74,217,36,115,117,97,76],"accounts":[{"name":"member","signer":true},{"name":"group","writable":true,"pda":{"seeds":[{"kind":"const","value":[103,114,111,117,112]},{"kind":"account","path":"group.founder","account":"Group"}]},"relations":["commitment"]},{"name":"commitment","writable":true,"pda":{"seeds":[{"kind":"const","value":[99,111,109,109,105,116,109,101,110,116]},{"kind":"account","path":"group"},{"kind":"account","path":"commitment.owner","account":"Commitment"},{"kind":"account","path":"commitment.nonce","account":"Commitment"}]}}],"args":[]},{"name":"create_commitment","discriminator":[232,31,118,65,229,2,2,170],"accounts":[{"name":"owner","writable":true,"signer":true},{"name":"group","pda":{"seeds":[{"kind":"const","value":[103,114,111,117,112]},{"kind":"account","path":"group.founder","account":"Group"}]}},{"name":"commitment","writable":true,"pda":{"seeds":[{"kind":"const","value":[99,111,109,109,105,116,109,101,110,116]},{"kind":"account","path":"group"},{"kind":"account","path":"owner"},{"kind":"arg","path":"args.nonce"}]}},{"name":"system_program","address":"11111111111111111111111111111111"}],"args":[{"name":"args","type":{"defined":{"name":"CreateArgs"}}}]},{"name":"initialize_group","discriminator":[191,73,34,229,233,213,189,173],"accounts":[{"name":"founder","writable":true,"signer":true},{"name":"group","writable":true,"pda":{"seeds":[{"kind":"const","value":[103,114,111,117,112]},{"kind":"account","path":"founder"}]}},{"name":"mint"},{"name":"vault","writable":true,"pda":{"seeds":[{"kind":"account","path":"group"},{"kind":"const","value":[6,221,246,225,215,101,161,147,217,203,225,70,206,235,121,172,28,180,133,237,95,91,55,145,58,140,245,133,126,255,0,169]},{"kind":"account","path":"mint"}],"program":{"kind":"const","value":[140,151,37,143,78,36,137,241,187,61,16,41,20,142,13,131,11,90,19,153,218,255,16,132,4,142,123,216,219,233,248,89]}}},{"name":"token_program","address":"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"},{"name":"associated_token_program","address":"ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"},{"name":"system_program","address":"11111111111111111111111111111111"}],"args":[{"name":"args","type":{"defined":{"name":"GroupArgs"}}}]},{"name":"on_report","discriminator":[214,173,18,221,173,148,151,208],"accounts":[{"name":"state"},{"name":"forwarder_authority","signer":true},{"name":"group","writable":true,"pda":{"seeds":[{"kind":"const","value":[103,114,111,117,112]},{"kind":"account","path":"group.founder","account":"Group"}]},"relations":["commitment"]},{"name":"commitment","writable":true,"pda":{"seeds":[{"kind":"const","value":[99,111,109,109,105,116,109,101,110,116]},{"kind":"account","path":"group"},{"kind":"account","path":"commitment.owner","account":"Commitment"},{"kind":"account","path":"commitment.nonce","account":"Commitment"}]}}],"args":[{"name":"metadata","type":"bytes"},{"name":"report","type":"bytes"}]},{"name":"release_refund","discriminator":[153,82,115,136,184,24,167,149],"accounts":[{"name":"caller","writable":true,"signer":true},{"name":"owner"},{"name":"group","writable":true,"pda":{"seeds":[{"kind":"const","value":[103,114,111,117,112]},{"kind":"account","path":"group.founder","account":"Group"}]},"relations":["commitment"]},{"name":"commitment","writable":true,"pda":{"seeds":[{"kind":"const","value":[99,111,109,109,105,116,109,101,110,116]},{"kind":"account","path":"group"},{"kind":"account","path":"commitment.owner","account":"Commitment"},{"kind":"account","path":"commitment.nonce","account":"Commitment"}]}},{"name":"mint"},{"name":"vault","writable":true,"pda":{"seeds":[{"kind":"account","path":"group"},{"kind":"const","value":[6,221,246,225,215,101,161,147,217,203,225,70,206,235,121,172,28,180,133,237,95,91,55,145,58,140,245,133,126,255,0,169]},{"kind":"account","path":"mint"}],"program":{"kind":"const","value":[140,151,37,143,78,36,137,241,187,61,16,41,20,142,13,131,11,90,19,153,218,255,16,132,4,142,123,216,219,233,248,89]}}},{"name":"destination","writable":true,"pda":{"seeds":[{"kind":"account","path":"owner"},{"kind":"const","value":[6,221,246,225,215,101,161,147,217,203,225,70,206,235,121,172,28,180,133,237,95,91,55,145,58,140,245,133,126,255,0,169]},{"kind":"account","path":"mint"}],"program":{"kind":"const","value":[140,151,37,143,78,36,137,241,187,61,16,41,20,142,13,131,11,90,19,153,218,255,16,132,4,142,123,216,219,233,248,89]}}},{"name":"token_program","address":"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"},{"name":"associated_token_program","address":"ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"},{"name":"system_program","address":"11111111111111111111111111111111"}],"args":[]},{"name":"resolve_unverified","discriminator":[135,117,32,217,7,122,146,248],"accounts":[{"name":"group","writable":true,"pda":{"seeds":[{"kind":"const","value":[103,114,111,117,112]},{"kind":"account","path":"group.founder","account":"Group"}]},"relations":["commitment"]},{"name":"commitment","writable":true,"pda":{"seeds":[{"kind":"const","value":[99,111,109,109,105,116,109,101,110,116]},{"kind":"account","path":"group"},{"kind":"account","path":"commitment.owner","account":"Commitment"},{"kind":"account","path":"commitment.nonce","account":"Commitment"}]}}],"args":[]},{"name":"settle_expired","discriminator":[187,68,57,40,121,72,73,161],"accounts":[{"name":"group","writable":true,"pda":{"seeds":[{"kind":"const","value":[103,114,111,117,112]},{"kind":"account","path":"group.founder","account":"Group"}]},"relations":["commitment"]},{"name":"commitment","writable":true,"pda":{"seeds":[{"kind":"const","value":[99,111,109,109,105,116,109,101,110,116]},{"kind":"account","path":"group"},{"kind":"account","path":"commitment.owner","account":"Commitment"},{"kind":"account","path":"commitment.nonce","account":"Commitment"}]}}],"args":[]},{"name":"withdraw_pool","discriminator":[190,43,148,248,68,5,215,136],"accounts":[{"name":"treasurer","writable":true,"signer":true},{"name":"treasury_recipient"},{"name":"group","writable":true,"pda":{"seeds":[{"kind":"const","value":[103,114,111,117,112]},{"kind":"account","path":"group.founder","account":"Group"}]}},{"name":"mint"},{"name":"vault","writable":true,"pda":{"seeds":[{"kind":"account","path":"group"},{"kind":"const","value":[6,221,246,225,215,101,161,147,217,203,225,70,206,235,121,172,28,180,133,237,95,91,55,145,58,140,245,133,126,255,0,169]},{"kind":"account","path":"mint"}],"program":{"kind":"const","value":[140,151,37,143,78,36,137,241,187,61,16,41,20,142,13,131,11,90,19,153,218,255,16,132,4,142,123,216,219,233,248,89]}}},{"name":"destination","writable":true,"pda":{"seeds":[{"kind":"account","path":"treasury_recipient"},{"kind":"const","value":[6,221,246,225,215,101,161,147,217,203,225,70,206,235,121,172,28,180,133,237,95,91,55,145,58,140,245,133,126,255,0,169]},{"kind":"account","path":"mint"}],"program":{"kind":"const","value":[140,151,37,143,78,36,137,241,187,61,16,41,20,142,13,131,11,90,19,153,218,255,16,132,4,142,123,216,219,233,248,89]}}},{"name":"token_program","address":"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"},{"name":"associated_token_program","address":"ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"},{"name":"system_program","address":"11111111111111111111111111111111"}],"args":[{"name":"amount","type":"u64"}]}],"accounts":[{"name":"Commitment","discriminator":[61,112,129,128,24,147,77,87]},{"name":"Group","discriminator":[209,249,208,63,182,89,186,254]}],"events":[{"name":"ObservedReport","discriminator":[18,198,37,192,156,179,84,213]}],"errors":[{"code":6000,"name":"InvalidForwarderAuthority","msg":"Invalid forwarder authority"},{"code":6001,"name":"InvalidForwarderState","msg":"Wrong forwarder state or owner"},{"code":6002,"name":"InvalidMetadata","msg":"Workflow metadata must be exactly 64 bytes"},{"code":6003,"name":"InvalidWorkflow","msg":"Unauthorized workflow identity"},{"code":6004,"name":"InvalidConfiguration","msg":"Invalid immutable terms or group configuration"},{"code":6005,"name":"Unauthorized","msg":"Only an eligible group member may perform this action"},{"code":6006,"name":"InvalidState","msg":"Action is not allowed in the current lifecycle state"},{"code":6007,"name":"MissingAcknowledgments","msg":"Required reviewer acknowledgments are missing"},{"code":6008,"name":"DuplicateAction","msg":"This reviewer has already recorded this action"},{"code":6009,"name":"Deadline","msg":"Action is outside the permitted deadline window"},{"code":6010,"name":"Accounting","msg":"Checked accounting overflow or insufficient balance"},{"code":6011,"name":"WrongMode","msg":"Mode does not permit this operation"},{"code":6012,"name":"InvalidReport","msg":"Invalid, stale or substituted oracle observation"},{"code":6013,"name":"RefundReleased","msg":"Refund already released"}],"types":[{"name":"Commitment","type":{"kind":"struct","fields":[{"name":"group","type":"pubkey"},{"name":"owner","type":"pubkey"},{"name":"nonce","type":"u64"},{"name":"bump","type":"u8"},{"name":"terms_hash","type":{"array":["u8",32]}},{"name":"amount","type":"u64"},{"name":"goal_deadline","type":"i64"},{"name":"review_deadline","type":"i64"},{"name":"hard_deadline","type":"i64"},{"name":"activated_at","type":"i64"},{"name":"mode","type":"u8"},{"name":"reviewers","type":{"vec":"pubkey"}},{"name":"acknowledgments","type":"u8"},{"name":"approvals","type":"u8"},{"name":"status","type":{"defined":{"name":"Lifecycle"}}},{"name":"refund_released","type":"bool"},{"name":"github","type":{"option":{"defined":{"name":"GithubConfig"}}}},{"name":"config_hash","type":{"array":["u8",32]}},{"name":"policy","type":{"defined":{"name":"GroupPolicy"}}},{"name":"observed_at","type":"i64"},{"name":"merged_at","type":"i64"},{"name":"branch_hash","type":{"array":["u8",32]}},{"name":"report_id","type":{"array":["u8",2]}}]}},{"name":"CreateArgs","type":{"kind":"struct","fields":[{"name":"nonce","type":"u64"},{"name":"terms_hash","type":{"array":["u8",32]}},{"name":"amount","type":"u64"},{"name":"goal_deadline","type":"i64"},{"name":"review_deadline","type":"i64"},{"name":"mode","type":"u8"},{"name":"reviewers","type":{"vec":"pubkey"}},{"name":"github","type":{"option":{"defined":{"name":"GithubConfig"}}}}]}},{"name":"GithubConfig","type":{"kind":"struct","fields":[{"name":"owner","type":"string"},{"name":"repo","type":"string"},{"name":"pr","type":"u32"},{"name":"target_branch","type":"string"},{"name":"policy_version","type":"u16"}]}},{"name":"Group","type":{"kind":"struct","fields":[{"name":"founder","type":"pubkey"},{"name":"bump","type":"u8"},{"name":"roster","type":{"vec":"pubkey"}},{"name":"treasurer","type":"pubkey"},{"name":"treasury_recipient","type":"pubkey"},{"name":"mint","type":"pubkey"},{"name":"vault","type":"pubkey"},{"name":"active","type":"u64"},{"name":"refundable","type":"u64"},{"name":"pool","type":"u64"},{"name":"policy","type":{"defined":{"name":"GroupPolicy"}}}]}},{"name":"GroupArgs","type":{"kind":"struct","fields":[{"name":"roster","type":{"vec":"pubkey"}},{"name":"treasurer","type":"pubkey"},{"name":"treasury_recipient","type":"pubkey"},{"name":"policy","type":{"defined":{"name":"GroupPolicy"}}}]}},{"name":"GroupPolicy","type":{"kind":"struct","fields":[{"name":"forwarder","type":"pubkey"},{"name":"forwarder_state","type":"pubkey"},{"name":"workflow_cid","type":{"array":["u8",32]}},{"name":"workflow_name","type":{"array":["u8",10]}},{"name":"workflow_owner","type":{"array":["u8",20]}}]}},{"name":"Lifecycle","type":{"kind":"enum","variants":[{"name":"Draft"},{"name":"Active"},{"name":"Succeeded"},{"name":"Failed"},{"name":"Unresolved"}]}},{"name":"ObservedReport","type":{"kind":"struct","fields":[{"name":"report","type":{"defined":{"name":"OracleReport"}}}]}},{"name":"OracleReport","type":{"kind":"struct","fields":[{"name":"operation","type":"u8"},{"name":"commitment","type":"pubkey"},{"name":"config_hash","type":{"array":["u8",32]}},{"name":"policy_version","type":"u16"},{"name":"source","type":"u8"},{"name":"observed_at","type":"i64"},{"name":"merged","type":"bool"},{"name":"merged_at","type":"i64"},{"name":"branch_hash","type":{"array":["u8",32]}}]}}]} as const

// Base64 of the compact IDL JSON, passed to log triggers as contractIdlJson.
const VOWPOOL_IDL_BASE64 = 'eyJhZGRyZXNzIjoiQTJKVDRIVUpZRWQzQkw1eFBYUmlhWGp2b0ZTTWV0WTh6dkxFUG1SQXhYUGYiLCJtZXRhZGF0YSI6eyJuYW1lIjoidm93cG9vbCIsInZlcnNpb24iOiIwLjEuMCIsInNwZWMiOiIwLjEuMCJ9LCJpbnN0cnVjdGlvbnMiOlt7Im5hbWUiOiJhY2tub3dsZWRnZSIsImRpc2NyaW1pbmF0b3IiOlsyMDksMTgyLDE5Nyw0NSw5Nyw5MywyMTAsNThdLCJhY2NvdW50cyI6W3sibmFtZSI6Im1lbWJlciIsInNpZ25lciI6dHJ1ZX0seyJuYW1lIjoiZ3JvdXAiLCJ3cml0YWJsZSI6dHJ1ZSwicGRhIjp7InNlZWRzIjpbeyJraW5kIjoiY29uc3QiLCJ2YWx1ZSI6WzEwMywxMTQsMTExLDExNywxMTJdfSx7ImtpbmQiOiJhY2NvdW50IiwicGF0aCI6Imdyb3VwLmZvdW5kZXIiLCJhY2NvdW50IjoiR3JvdXAifV19LCJyZWxhdGlvbnMiOlsiY29tbWl0bWVudCJdfSx7Im5hbWUiOiJjb21taXRtZW50Iiwid3JpdGFibGUiOnRydWUsInBkYSI6eyJzZWVkcyI6W3sia2luZCI6ImNvbnN0IiwidmFsdWUiOls5OSwxMTEsMTA5LDEwOSwxMDUsMTE2LDEwOSwxMDEsMTEwLDExNl19LHsia2luZCI6ImFjY291bnQiLCJwYXRoIjoiZ3JvdXAifSx7ImtpbmQiOiJhY2NvdW50IiwicGF0aCI6ImNvbW1pdG1lbnQub3duZXIiLCJhY2NvdW50IjoiQ29tbWl0bWVudCJ9LHsia2luZCI6ImFjY291bnQiLCJwYXRoIjoiY29tbWl0bWVudC5ub25jZSIsImFjY291bnQiOiJDb21taXRtZW50In1dfX1dLCJhcmdzIjpbXX0seyJuYW1lIjoiYWN0aXZhdGUiLCJkaXNjcmltaW5hdG9yIjpbMTk0LDIwMywzNSwxMDAsMTUxLDU1LDE3MCw4Ml0sImFjY291bnRzIjpbeyJuYW1lIjoib3duZXIiLCJ3cml0YWJsZSI6dHJ1ZSwic2lnbmVyIjp0cnVlLCJyZWxhdGlvbnMiOlsiY29tbWl0bWVudCJdfSx7Im5hbWUiOiJncm91cCIsIndyaXRhYmxlIjp0cnVlLCJwZGEiOnsic2VlZHMiOlt7ImtpbmQiOiJjb25zdCIsInZhbHVlIjpbMTAzLDExNCwxMTEsMTE3LDExMl19LHsia2luZCI6ImFjY291bnQiLCJwYXRoIjoiZ3JvdXAuZm91bmRlciIsImFjY291bnQiOiJHcm91cCJ9XX0sInJlbGF0aW9ucyI6WyJjb21taXRtZW50Il19LHsibmFtZSI6ImNvbW1pdG1lbnQiLCJ3cml0YWJsZSI6dHJ1ZSwicGRhIjp7InNlZWRzIjpbeyJraW5kIjoiY29uc3QiLCJ2YWx1ZSI6Wzk5LDExMSwxMDksMTA5LDEwNSwxMTYsMTA5LDEwMSwxMTAsMTE2XX0seyJraW5kIjoiYWNjb3VudCIsInBhdGgiOiJncm91cCJ9LHsia2luZCI6ImFjY291bnQiLCJwYXRoIjoib3duZXIifSx7ImtpbmQiOiJhY2NvdW50IiwicGF0aCI6ImNvbW1pdG1lbnQubm9uY2UiLCJhY2NvdW50IjoiQ29tbWl0bWVudCJ9XX19LHsibmFtZSI6Im1pbnQifSx7Im5hbWUiOiJ2YXVsdCIsIndyaXRhYmxlIjp0cnVlLCJwZGEiOnsic2VlZHMiOlt7ImtpbmQiOiJhY2NvdW50IiwicGF0aCI6Imdyb3VwIn0seyJraW5kIjoiY29uc3QiLCJ2YWx1ZSI6WzYsMjIxLDI0NiwyMjUsMjE1LDEwMSwxNjEsMTQ3LDIxNywyMDMsMjI1LDcwLDIwNiwyMzUsMTIxLDE3MiwyOCwxODAsMTMzLDIzNyw5NSw5MSw1NSwxNDUsNTgsMTQwLDI0NSwxMzMsMTI2LDI1NSwwLDE2OV19LHsia2luZCI6ImFjY291bnQiLCJwYXRoIjoibWludCJ9XSwicHJvZ3JhbSI6eyJraW5kIjoiY29uc3QiLCJ2YWx1ZSI6WzE0MCwxNTEsMzcsMTQzLDc4LDM2LDEzNywyNDEsMTg3LDYxLDE2LDQxLDIwLDE0MiwxMywxMzEsMTEsOTAsMTksMTUzLDIxOCwyNTUsMTYsMTMyLDQsMTQyLDEyMywyMTYsMjE5LDIzMywyNDgsODldfX19LHsibmFtZSI6InNvdXJjZSIsIndyaXRhYmxlIjp0cnVlLCJwZGEiOnsic2VlZHMiOlt7ImtpbmQiOiJhY2NvdW50IiwicGF0aCI6Im93bmVyIn0seyJraW5kIjoiY29uc3QiLCJ2YWx1ZSI6WzYsMjIxLDI0NiwyMjUsMjE1LDEwMSwxNjEsMTQ3LDIxNywyMDMsMjI1LDcwLDIwNiwyMzUsMTIxLDE3MiwyOCwxODAsMTMzLDIzNyw5NSw5MSw1NSwxNDUsNTgsMTQwLDI0NSwxMzMsMTI2LDI1NSwwLDE2OV19LHsia2luZCI6ImFjY291bnQiLCJwYXRoIjoibWludCJ9XSwicHJvZ3JhbSI6eyJraW5kIjoiY29uc3QiLCJ2YWx1ZSI6WzE0MCwxNTEsMzcsMTQzLDc4LDM2LDEzNywyNDEsMTg3LDYxLDE2LDQxLDIwLDE0MiwxMywxMzEsMTEsOTAsMTksMTUzLDIxOCwyNTUsMTYsMTMyLDQsMTQyLDEyMywyMTYsMjE5LDIzMywyNDgsODldfX19LHsibmFtZSI6InRva2VuX3Byb2dyYW0iLCJhZGRyZXNzIjoiVG9rZW5rZWdRZmVaeWlOd0FKYk5iR0tQRlhDV3VCdmY5U3M2MjNWUTVEQSJ9LHsibmFtZSI6ImFzc29jaWF0ZWRfdG9rZW5fcHJvZ3JhbSIsImFkZHJlc3MiOiJBVG9rZW5HUHZiZEdWeHIxYjJodlpic2lxVzV4V0gyNWVmVE5zTEpBOGtuTCJ9LHsibmFtZSI6InN5c3RlbV9wcm9ncmFtIiwiYWRkcmVzcyI6IjExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExIn1dLCJhcmdzIjpbXX0seyJuYW1lIjoiYXBwcm92ZSIsImRpc2NyaW1pbmF0b3IiOls2OSw3NCwyMTcsMzYsMTE1LDExNyw5Nyw3Nl0sImFjY291bnRzIjpbeyJuYW1lIjoibWVtYmVyIiwic2lnbmVyIjp0cnVlfSx7Im5hbWUiOiJncm91cCIsIndyaXRhYmxlIjp0cnVlLCJwZGEiOnsic2VlZHMiOlt7ImtpbmQiOiJjb25zdCIsInZhbHVlIjpbMTAzLDExNCwxMTEsMTE3LDExMl19LHsia2luZCI6ImFjY291bnQiLCJwYXRoIjoiZ3JvdXAuZm91bmRlciIsImFjY291bnQiOiJHcm91cCJ9XX0sInJlbGF0aW9ucyI6WyJjb21taXRtZW50Il19LHsibmFtZSI6ImNvbW1pdG1lbnQiLCJ3cml0YWJsZSI6dHJ1ZSwicGRhIjp7InNlZWRzIjpbeyJraW5kIjoiY29uc3QiLCJ2YWx1ZSI6Wzk5LDExMSwxMDksMTA5LDEwNSwxMTYsMTA5LDEwMSwxMTAsMTE2XX0seyJraW5kIjoiYWNjb3VudCIsInBhdGgiOiJncm91cCJ9LHsia2luZCI6ImFjY291bnQiLCJwYXRoIjoiY29tbWl0bWVudC5vd25lciIsImFjY291bnQiOiJDb21taXRtZW50In0seyJraW5kIjoiYWNjb3VudCIsInBhdGgiOiJjb21taXRtZW50Lm5vbmNlIiwiYWNjb3VudCI6IkNvbW1pdG1lbnQifV19fV0sImFyZ3MiOltdfSx7Im5hbWUiOiJjcmVhdGVfY29tbWl0bWVudCIsImRpc2NyaW1pbmF0b3IiOlsyMzIsMzEsMTE4LDY1LDIyOSwyLDIsMTcwXSwiYWNjb3VudHMiOlt7Im5hbWUiOiJvd25lciIsIndyaXRhYmxlIjp0cnVlLCJzaWduZXIiOnRydWV9LHsibmFtZSI6Imdyb3VwIiwicGRhIjp7InNlZWRzIjpbeyJraW5kIjoiY29uc3QiLCJ2YWx1ZSI6WzEwMywxMTQsMTExLDExNywxMTJdfSx7ImtpbmQiOiJhY2NvdW50IiwicGF0aCI6Imdyb3VwLmZvdW5kZXIiLCJhY2NvdW50IjoiR3JvdXAifV19fSx7Im5hbWUiOiJjb21taXRtZW50Iiwid3JpdGFibGUiOnRydWUsInBkYSI6eyJzZWVkcyI6W3sia2luZCI6ImNvbnN0IiwidmFsdWUiOls5OSwxMTEsMTA5LDEwOSwxMDUsMTE2LDEwOSwxMDEsMTEwLDExNl19LHsia2luZCI6ImFjY291bnQiLCJwYXRoIjoiZ3JvdXAifSx7ImtpbmQiOiJhY2NvdW50IiwicGF0aCI6Im93bmVyIn0seyJraW5kIjoiYXJnIiwicGF0aCI6ImFyZ3Mubm9uY2UifV19fSx7Im5hbWUiOiJzeXN0ZW1fcHJvZ3JhbSIsImFkZHJlc3MiOiIxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMSJ9XSwiYXJncyI6W3sibmFtZSI6ImFyZ3MiLCJ0eXBlIjp7ImRlZmluZWQiOnsibmFtZSI6IkNyZWF0ZUFyZ3MifX19XX0seyJuYW1lIjoiaW5pdGlhbGl6ZV9ncm91cCIsImRpc2NyaW1pbmF0b3IiOlsxOTEsNzMsMzQsMjI5LDIzMywyMTMsMTg5LDE3M10sImFjY291bnRzIjpbeyJuYW1lIjoiZm91bmRlciIsIndyaXRhYmxlIjp0cnVlLCJzaWduZXIiOnRydWV9LHsibmFtZSI6Imdyb3VwIiwid3JpdGFibGUiOnRydWUsInBkYSI6eyJzZWVkcyI6W3sia2luZCI6ImNvbnN0IiwidmFsdWUiOlsxMDMsMTE0LDExMSwxMTcsMTEyXX0seyJraW5kIjoiYWNjb3VudCIsInBhdGgiOiJmb3VuZGVyIn1dfX0seyJuYW1lIjoibWludCJ9LHsibmFtZSI6InZhdWx0Iiwid3JpdGFibGUiOnRydWUsInBkYSI6eyJzZWVkcyI6W3sia2luZCI6ImFjY291bnQiLCJwYXRoIjoiZ3JvdXAifSx7ImtpbmQiOiJjb25zdCIsInZhbHVlIjpbNiwyMjEsMjQ2LDIyNSwyMTUsMTAxLDE2MSwxNDcsMjE3LDIwMywyMjUsNzAsMjA2LDIzNSwxMjEsMTcyLDI4LDE4MCwxMzMsMjM3LDk1LDkxLDU1LDE0NSw1OCwxNDAsMjQ1LDEzMywxMjYsMjU1LDAsMTY5XX0seyJraW5kIjoiYWNjb3VudCIsInBhdGgiOiJtaW50In1dLCJwcm9ncmFtIjp7ImtpbmQiOiJjb25zdCIsInZhbHVlIjpbMTQwLDE1MSwzNywxNDMsNzgsMzYsMTM3LDI0MSwxODcsNjEsMTYsNDEsMjAsMTQyLDEzLDEzMSwxMSw5MCwxOSwxNTMsMjE4LDI1NSwxNiwxMzIsNCwxNDIsMTIzLDIxNiwyMTksMjMzLDI0OCw4OV19fX0seyJuYW1lIjoidG9rZW5fcHJvZ3JhbSIsImFkZHJlc3MiOiJUb2tlbmtlZ1FmZVp5aU53QUpiTmJHS1BGWENXdUJ2ZjlTczYyM1ZRNURBIn0seyJuYW1lIjoiYXNzb2NpYXRlZF90b2tlbl9wcm9ncmFtIiwiYWRkcmVzcyI6IkFUb2tlbkdQdmJkR1Z4cjFiMmh2WmJzaXFXNXhXSDI1ZWZUTnNMSkE4a25MIn0seyJuYW1lIjoic3lzdGVtX3Byb2dyYW0iLCJhZGRyZXNzIjoiMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEifV0sImFyZ3MiOlt7Im5hbWUiOiJhcmdzIiwidHlwZSI6eyJkZWZpbmVkIjp7Im5hbWUiOiJHcm91cEFyZ3MifX19XX0seyJuYW1lIjoib25fcmVwb3J0IiwiZGlzY3JpbWluYXRvciI6WzIxNCwxNzMsMTgsMjIxLDE3MywxNDgsMTUxLDIwOF0sImFjY291bnRzIjpbeyJuYW1lIjoic3RhdGUifSx7Im5hbWUiOiJmb3J3YXJkZXJfYXV0aG9yaXR5Iiwic2lnbmVyIjp0cnVlfSx7Im5hbWUiOiJncm91cCIsIndyaXRhYmxlIjp0cnVlLCJwZGEiOnsic2VlZHMiOlt7ImtpbmQiOiJjb25zdCIsInZhbHVlIjpbMTAzLDExNCwxMTEsMTE3LDExMl19LHsia2luZCI6ImFjY291bnQiLCJwYXRoIjoiZ3JvdXAuZm91bmRlciIsImFjY291bnQiOiJHcm91cCJ9XX0sInJlbGF0aW9ucyI6WyJjb21taXRtZW50Il19LHsibmFtZSI6ImNvbW1pdG1lbnQiLCJ3cml0YWJsZSI6dHJ1ZSwicGRhIjp7InNlZWRzIjpbeyJraW5kIjoiY29uc3QiLCJ2YWx1ZSI6Wzk5LDExMSwxMDksMTA5LDEwNSwxMTYsMTA5LDEwMSwxMTAsMTE2XX0seyJraW5kIjoiYWNjb3VudCIsInBhdGgiOiJncm91cCJ9LHsia2luZCI6ImFjY291bnQiLCJwYXRoIjoiY29tbWl0bWVudC5vd25lciIsImFjY291bnQiOiJDb21taXRtZW50In0seyJraW5kIjoiYWNjb3VudCIsInBhdGgiOiJjb21taXRtZW50Lm5vbmNlIiwiYWNjb3VudCI6IkNvbW1pdG1lbnQifV19fV0sImFyZ3MiOlt7Im5hbWUiOiJtZXRhZGF0YSIsInR5cGUiOiJieXRlcyJ9LHsibmFtZSI6InJlcG9ydCIsInR5cGUiOiJieXRlcyJ9XX0seyJuYW1lIjoicmVsZWFzZV9yZWZ1bmQiLCJkaXNjcmltaW5hdG9yIjpbMTUzLDgyLDExNSwxMzYsMTg0LDI0LDE2NywxNDldLCJhY2NvdW50cyI6W3sibmFtZSI6ImNhbGxlciIsIndyaXRhYmxlIjp0cnVlLCJzaWduZXIiOnRydWV9LHsibmFtZSI6Im93bmVyIn0seyJuYW1lIjoiZ3JvdXAiLCJ3cml0YWJsZSI6dHJ1ZSwicGRhIjp7InNlZWRzIjpbeyJraW5kIjoiY29uc3QiLCJ2YWx1ZSI6WzEwMywxMTQsMTExLDExNywxMTJdfSx7ImtpbmQiOiJhY2NvdW50IiwicGF0aCI6Imdyb3VwLmZvdW5kZXIiLCJhY2NvdW50IjoiR3JvdXAifV19LCJyZWxhdGlvbnMiOlsiY29tbWl0bWVudCJdfSx7Im5hbWUiOiJjb21taXRtZW50Iiwid3JpdGFibGUiOnRydWUsInBkYSI6eyJzZWVkcyI6W3sia2luZCI6ImNvbnN0IiwidmFsdWUiOls5OSwxMTEsMTA5LDEwOSwxMDUsMTE2LDEwOSwxMDEsMTEwLDExNl19LHsia2luZCI6ImFjY291bnQiLCJwYXRoIjoiZ3JvdXAifSx7ImtpbmQiOiJhY2NvdW50IiwicGF0aCI6ImNvbW1pdG1lbnQub3duZXIiLCJhY2NvdW50IjoiQ29tbWl0bWVudCJ9LHsia2luZCI6ImFjY291bnQiLCJwYXRoIjoiY29tbWl0bWVudC5ub25jZSIsImFjY291bnQiOiJDb21taXRtZW50In1dfX0seyJuYW1lIjoibWludCJ9LHsibmFtZSI6InZhdWx0Iiwid3JpdGFibGUiOnRydWUsInBkYSI6eyJzZWVkcyI6W3sia2luZCI6ImFjY291bnQiLCJwYXRoIjoiZ3JvdXAifSx7ImtpbmQiOiJjb25zdCIsInZhbHVlIjpbNiwyMjEsMjQ2LDIyNSwyMTUsMTAxLDE2MSwxNDcsMjE3LDIwMywyMjUsNzAsMjA2LDIzNSwxMjEsMTcyLDI4LDE4MCwxMzMsMjM3LDk1LDkxLDU1LDE0NSw1OCwxNDAsMjQ1LDEzMywxMjYsMjU1LDAsMTY5XX0seyJraW5kIjoiYWNjb3VudCIsInBhdGgiOiJtaW50In1dLCJwcm9ncmFtIjp7ImtpbmQiOiJjb25zdCIsInZhbHVlIjpbMTQwLDE1MSwzNywxNDMsNzgsMzYsMTM3LDI0MSwxODcsNjEsMTYsNDEsMjAsMTQyLDEzLDEzMSwxMSw5MCwxOSwxNTMsMjE4LDI1NSwxNiwxMzIsNCwxNDIsMTIzLDIxNiwyMTksMjMzLDI0OCw4OV19fX0seyJuYW1lIjoiZGVzdGluYXRpb24iLCJ3cml0YWJsZSI6dHJ1ZSwicGRhIjp7InNlZWRzIjpbeyJraW5kIjoiYWNjb3VudCIsInBhdGgiOiJvd25lciJ9LHsia2luZCI6ImNvbnN0IiwidmFsdWUiOls2LDIyMSwyNDYsMjI1LDIxNSwxMDEsMTYxLDE0NywyMTcsMjAzLDIyNSw3MCwyMDYsMjM1LDEyMSwxNzIsMjgsMTgwLDEzMywyMzcsOTUsOTEsNTUsMTQ1LDU4LDE0MCwyNDUsMTMzLDEyNiwyNTUsMCwxNjldfSx7ImtpbmQiOiJhY2NvdW50IiwicGF0aCI6Im1pbnQifV0sInByb2dyYW0iOnsia2luZCI6ImNvbnN0IiwidmFsdWUiOlsxNDAsMTUxLDM3LDE0Myw3OCwzNiwxMzcsMjQxLDE4Nyw2MSwxNiw0MSwyMCwxNDIsMTMsMTMxLDExLDkwLDE5LDE1MywyMTgsMjU1LDE2LDEzMiw0LDE0MiwxMjMsMjE2LDIxOSwyMzMsMjQ4LDg5XX19fSx7Im5hbWUiOiJ0b2tlbl9wcm9ncmFtIiwiYWRkcmVzcyI6IlRva2Vua2VnUWZlWnlpTndBSmJOYkdLUEZYQ1d1QnZmOVNzNjIzVlE1REEifSx7Im5hbWUiOiJhc3NvY2lhdGVkX3Rva2VuX3Byb2dyYW0iLCJhZGRyZXNzIjoiQVRva2VuR1B2YmRHVnhyMWIyaHZaYnNpcVc1eFdIMjVlZlROc0xKQThrbkwifSx7Im5hbWUiOiJzeXN0ZW1fcHJvZ3JhbSIsImFkZHJlc3MiOiIxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMSJ9XSwiYXJncyI6W119LHsibmFtZSI6InJlc29sdmVfdW52ZXJpZmllZCIsImRpc2NyaW1pbmF0b3IiOlsxMzUsMTE3LDMyLDIxNyw3LDEyMiwxNDYsMjQ4XSwiYWNjb3VudHMiOlt7Im5hbWUiOiJncm91cCIsIndyaXRhYmxlIjp0cnVlLCJwZGEiOnsic2VlZHMiOlt7ImtpbmQiOiJjb25zdCIsInZhbHVlIjpbMTAzLDExNCwxMTEsMTE3LDExMl19LHsia2luZCI6ImFjY291bnQiLCJwYXRoIjoiZ3JvdXAuZm91bmRlciIsImFjY291bnQiOiJHcm91cCJ9XX0sInJlbGF0aW9ucyI6WyJjb21taXRtZW50Il19LHsibmFtZSI6ImNvbW1pdG1lbnQiLCJ3cml0YWJsZSI6dHJ1ZSwicGRhIjp7InNlZWRzIjpbeyJraW5kIjoiY29uc3QiLCJ2YWx1ZSI6Wzk5LDExMSwxMDksMTA5LDEwNSwxMTYsMTA5LDEwMSwxMTAsMTE2XX0seyJraW5kIjoiYWNjb3VudCIsInBhdGgiOiJncm91cCJ9LHsia2luZCI6ImFjY291bnQiLCJwYXRoIjoiY29tbWl0bWVudC5vd25lciIsImFjY291bnQiOiJDb21taXRtZW50In0seyJraW5kIjoiYWNjb3VudCIsInBhdGgiOiJjb21taXRtZW50Lm5vbmNlIiwiYWNjb3VudCI6IkNvbW1pdG1lbnQifV19fV0sImFyZ3MiOltdfSx7Im5hbWUiOiJzZXR0bGVfZXhwaXJlZCIsImRpc2NyaW1pbmF0b3IiOlsxODcsNjgsNTcsNDAsMTIxLDcyLDczLDE2MV0sImFjY291bnRzIjpbeyJuYW1lIjoiZ3JvdXAiLCJ3cml0YWJsZSI6dHJ1ZSwicGRhIjp7InNlZWRzIjpbeyJraW5kIjoiY29uc3QiLCJ2YWx1ZSI6WzEwMywxMTQsMTExLDExNywxMTJdfSx7ImtpbmQiOiJhY2NvdW50IiwicGF0aCI6Imdyb3VwLmZvdW5kZXIiLCJhY2NvdW50IjoiR3JvdXAifV19LCJyZWxhdGlvbnMiOlsiY29tbWl0bWVudCJdfSx7Im5hbWUiOiJjb21taXRtZW50Iiwid3JpdGFibGUiOnRydWUsInBkYSI6eyJzZWVkcyI6W3sia2luZCI6ImNvbnN0IiwidmFsdWUiOls5OSwxMTEsMTA5LDEwOSwxMDUsMTE2LDEwOSwxMDEsMTEwLDExNl19LHsia2luZCI6ImFjY291bnQiLCJwYXRoIjoiZ3JvdXAifSx7ImtpbmQiOiJhY2NvdW50IiwicGF0aCI6ImNvbW1pdG1lbnQub3duZXIiLCJhY2NvdW50IjoiQ29tbWl0bWVudCJ9LHsia2luZCI6ImFjY291bnQiLCJwYXRoIjoiY29tbWl0bWVudC5ub25jZSIsImFjY291bnQiOiJDb21taXRtZW50In1dfX1dLCJhcmdzIjpbXX0seyJuYW1lIjoid2l0aGRyYXdfcG9vbCIsImRpc2NyaW1pbmF0b3IiOlsxOTAsNDMsMTQ4LDI0OCw2OCw1LDIxNSwxMzZdLCJhY2NvdW50cyI6W3sibmFtZSI6InRyZWFzdXJlciIsIndyaXRhYmxlIjp0cnVlLCJzaWduZXIiOnRydWV9LHsibmFtZSI6InRyZWFzdXJ5X3JlY2lwaWVudCJ9LHsibmFtZSI6Imdyb3VwIiwid3JpdGFibGUiOnRydWUsInBkYSI6eyJzZWVkcyI6W3sia2luZCI6ImNvbnN0IiwidmFsdWUiOlsxMDMsMTE0LDExMSwxMTcsMTEyXX0seyJraW5kIjoiYWNjb3VudCIsInBhdGgiOiJncm91cC5mb3VuZGVyIiwiYWNjb3VudCI6Ikdyb3VwIn1dfX0seyJuYW1lIjoibWludCJ9LHsibmFtZSI6InZhdWx0Iiwid3JpdGFibGUiOnRydWUsInBkYSI6eyJzZWVkcyI6W3sia2luZCI6ImFjY291bnQiLCJwYXRoIjoiZ3JvdXAifSx7ImtpbmQiOiJjb25zdCIsInZhbHVlIjpbNiwyMjEsMjQ2LDIyNSwyMTUsMTAxLDE2MSwxNDcsMjE3LDIwMywyMjUsNzAsMjA2LDIzNSwxMjEsMTcyLDI4LDE4MCwxMzMsMjM3LDk1LDkxLDU1LDE0NSw1OCwxNDAsMjQ1LDEzMywxMjYsMjU1LDAsMTY5XX0seyJraW5kIjoiYWNjb3VudCIsInBhdGgiOiJtaW50In1dLCJwcm9ncmFtIjp7ImtpbmQiOiJjb25zdCIsInZhbHVlIjpbMTQwLDE1MSwzNywxNDMsNzgsMzYsMTM3LDI0MSwxODcsNjEsMTYsNDEsMjAsMTQyLDEzLDEzMSwxMSw5MCwxOSwxNTMsMjE4LDI1NSwxNiwxMzIsNCwxNDIsMTIzLDIxNiwyMTksMjMzLDI0OCw4OV19fX0seyJuYW1lIjoiZGVzdGluYXRpb24iLCJ3cml0YWJsZSI6dHJ1ZSwicGRhIjp7InNlZWRzIjpbeyJraW5kIjoiYWNjb3VudCIsInBhdGgiOiJ0cmVhc3VyeV9yZWNpcGllbnQifSx7ImtpbmQiOiJjb25zdCIsInZhbHVlIjpbNiwyMjEsMjQ2LDIyNSwyMTUsMTAxLDE2MSwxNDcsMjE3LDIwMywyMjUsNzAsMjA2LDIzNSwxMjEsMTcyLDI4LDE4MCwxMzMsMjM3LDk1LDkxLDU1LDE0NSw1OCwxNDAsMjQ1LDEzMywxMjYsMjU1LDAsMTY5XX0seyJraW5kIjoiYWNjb3VudCIsInBhdGgiOiJtaW50In1dLCJwcm9ncmFtIjp7ImtpbmQiOiJjb25zdCIsInZhbHVlIjpbMTQwLDE1MSwzNywxNDMsNzgsMzYsMTM3LDI0MSwxODcsNjEsMTYsNDEsMjAsMTQyLDEzLDEzMSwxMSw5MCwxOSwxNTMsMjE4LDI1NSwxNiwxMzIsNCwxNDIsMTIzLDIxNiwyMTksMjMzLDI0OCw4OV19fX0seyJuYW1lIjoidG9rZW5fcHJvZ3JhbSIsImFkZHJlc3MiOiJUb2tlbmtlZ1FmZVp5aU53QUpiTmJHS1BGWENXdUJ2ZjlTczYyM1ZRNURBIn0seyJuYW1lIjoiYXNzb2NpYXRlZF90b2tlbl9wcm9ncmFtIiwiYWRkcmVzcyI6IkFUb2tlbkdQdmJkR1Z4cjFiMmh2WmJzaXFXNXhXSDI1ZWZUTnNMSkE4a25MIn0seyJuYW1lIjoic3lzdGVtX3Byb2dyYW0iLCJhZGRyZXNzIjoiMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEifV0sImFyZ3MiOlt7Im5hbWUiOiJhbW91bnQiLCJ0eXBlIjoidTY0In1dfV0sImFjY291bnRzIjpbeyJuYW1lIjoiQ29tbWl0bWVudCIsImRpc2NyaW1pbmF0b3IiOls2MSwxMTIsMTI5LDEyOCwyNCwxNDcsNzcsODddfSx7Im5hbWUiOiJHcm91cCIsImRpc2NyaW1pbmF0b3IiOlsyMDksMjQ5LDIwOCw2MywxODIsODksMTg2LDI1NF19XSwiZXZlbnRzIjpbeyJuYW1lIjoiT2JzZXJ2ZWRSZXBvcnQiLCJkaXNjcmltaW5hdG9yIjpbMTgsMTk4LDM3LDE5MiwxNTYsMTc5LDg0LDIxM119XSwiZXJyb3JzIjpbeyJjb2RlIjo2MDAwLCJuYW1lIjoiSW52YWxpZEZvcndhcmRlckF1dGhvcml0eSIsIm1zZyI6IkludmFsaWQgZm9yd2FyZGVyIGF1dGhvcml0eSJ9LHsiY29kZSI6NjAwMSwibmFtZSI6IkludmFsaWRGb3J3YXJkZXJTdGF0ZSIsIm1zZyI6Ildyb25nIGZvcndhcmRlciBzdGF0ZSBvciBvd25lciJ9LHsiY29kZSI6NjAwMiwibmFtZSI6IkludmFsaWRNZXRhZGF0YSIsIm1zZyI6IldvcmtmbG93IG1ldGFkYXRhIG11c3QgYmUgZXhhY3RseSA2NCBieXRlcyJ9LHsiY29kZSI6NjAwMywibmFtZSI6IkludmFsaWRXb3JrZmxvdyIsIm1zZyI6IlVuYXV0aG9yaXplZCB3b3JrZmxvdyBpZGVudGl0eSJ9LHsiY29kZSI6NjAwNCwibmFtZSI6IkludmFsaWRDb25maWd1cmF0aW9uIiwibXNnIjoiSW52YWxpZCBpbW11dGFibGUgdGVybXMgb3IgZ3JvdXAgY29uZmlndXJhdGlvbiJ9LHsiY29kZSI6NjAwNSwibmFtZSI6IlVuYXV0aG9yaXplZCIsIm1zZyI6Ik9ubHkgYW4gZWxpZ2libGUgZ3JvdXAgbWVtYmVyIG1heSBwZXJmb3JtIHRoaXMgYWN0aW9uIn0seyJjb2RlIjo2MDA2LCJuYW1lIjoiSW52YWxpZFN0YXRlIiwibXNnIjoiQWN0aW9uIGlzIG5vdCBhbGxvd2VkIGluIHRoZSBjdXJyZW50IGxpZmVjeWNsZSBzdGF0ZSJ9LHsiY29kZSI6NjAwNywibmFtZSI6Ik1pc3NpbmdBY2tub3dsZWRnbWVudHMiLCJtc2ciOiJSZXF1aXJlZCByZXZpZXdlciBhY2tub3dsZWRnbWVudHMgYXJlIG1pc3NpbmcifSx7ImNvZGUiOjYwMDgsIm5hbWUiOiJEdXBsaWNhdGVBY3Rpb24iLCJtc2ciOiJUaGlzIHJldmlld2VyIGhhcyBhbHJlYWR5IHJlY29yZGVkIHRoaXMgYWN0aW9uIn0seyJjb2RlIjo2MDA5LCJuYW1lIjoiRGVhZGxpbmUiLCJtc2ciOiJBY3Rpb24gaXMgb3V0c2lkZSB0aGUgcGVybWl0dGVkIGRlYWRsaW5lIHdpbmRvdyJ9LHsiY29kZSI6NjAxMCwibmFtZSI6IkFjY291bnRpbmciLCJtc2ciOiJDaGVja2VkIGFjY291bnRpbmcgb3ZlcmZsb3cgb3IgaW5zdWZmaWNpZW50IGJhbGFuY2UifSx7ImNvZGUiOjYwMTEsIm5hbWUiOiJXcm9uZ01vZGUiLCJtc2ciOiJNb2RlIGRvZXMgbm90IHBlcm1pdCB0aGlzIG9wZXJhdGlvbiJ9LHsiY29kZSI6NjAxMiwibmFtZSI6IkludmFsaWRSZXBvcnQiLCJtc2ciOiJJbnZhbGlkLCBzdGFsZSBvciBzdWJzdGl0dXRlZCBvcmFjbGUgb2JzZXJ2YXRpb24ifSx7ImNvZGUiOjYwMTMsIm5hbWUiOiJSZWZ1bmRSZWxlYXNlZCIsIm1zZyI6IlJlZnVuZCBhbHJlYWR5IHJlbGVhc2VkIn1dLCJ0eXBlcyI6W3sibmFtZSI6IkNvbW1pdG1lbnQiLCJ0eXBlIjp7ImtpbmQiOiJzdHJ1Y3QiLCJmaWVsZHMiOlt7Im5hbWUiOiJncm91cCIsInR5cGUiOiJwdWJrZXkifSx7Im5hbWUiOiJvd25lciIsInR5cGUiOiJwdWJrZXkifSx7Im5hbWUiOiJub25jZSIsInR5cGUiOiJ1NjQifSx7Im5hbWUiOiJidW1wIiwidHlwZSI6InU4In0seyJuYW1lIjoidGVybXNfaGFzaCIsInR5cGUiOnsiYXJyYXkiOlsidTgiLDMyXX19LHsibmFtZSI6ImFtb3VudCIsInR5cGUiOiJ1NjQifSx7Im5hbWUiOiJnb2FsX2RlYWRsaW5lIiwidHlwZSI6Imk2NCJ9LHsibmFtZSI6InJldmlld19kZWFkbGluZSIsInR5cGUiOiJpNjQifSx7Im5hbWUiOiJoYXJkX2RlYWRsaW5lIiwidHlwZSI6Imk2NCJ9LHsibmFtZSI6ImFjdGl2YXRlZF9hdCIsInR5cGUiOiJpNjQifSx7Im5hbWUiOiJtb2RlIiwidHlwZSI6InU4In0seyJuYW1lIjoicmV2aWV3ZXJzIiwidHlwZSI6eyJ2ZWMiOiJwdWJrZXkifX0seyJuYW1lIjoiYWNrbm93bGVkZ21lbnRzIiwidHlwZSI6InU4In0seyJuYW1lIjoiYXBwcm92YWxzIiwidHlwZSI6InU4In0seyJuYW1lIjoic3RhdHVzIiwidHlwZSI6eyJkZWZpbmVkIjp7Im5hbWUiOiJMaWZlY3ljbGUifX19LHsibmFtZSI6InJlZnVuZF9yZWxlYXNlZCIsInR5cGUiOiJib29sIn0seyJuYW1lIjoiZ2l0aHViIiwidHlwZSI6eyJvcHRpb24iOnsiZGVmaW5lZCI6eyJuYW1lIjoiR2l0aHViQ29uZmlnIn19fX0seyJuYW1lIjoiY29uZmlnX2hhc2giLCJ0eXBlIjp7ImFycmF5IjpbInU4IiwzMl19fSx7Im5hbWUiOiJwb2xpY3kiLCJ0eXBlIjp7ImRlZmluZWQiOnsibmFtZSI6Ikdyb3VwUG9saWN5In19fSx7Im5hbWUiOiJvYnNlcnZlZF9hdCIsInR5cGUiOiJpNjQifSx7Im5hbWUiOiJtZXJnZWRfYXQiLCJ0eXBlIjoiaTY0In0seyJuYW1lIjoiYnJhbmNoX2hhc2giLCJ0eXBlIjp7ImFycmF5IjpbInU4IiwzMl19fSx7Im5hbWUiOiJyZXBvcnRfaWQiLCJ0eXBlIjp7ImFycmF5IjpbInU4IiwyXX19XX19LHsibmFtZSI6IkNyZWF0ZUFyZ3MiLCJ0eXBlIjp7ImtpbmQiOiJzdHJ1Y3QiLCJmaWVsZHMiOlt7Im5hbWUiOiJub25jZSIsInR5cGUiOiJ1NjQifSx7Im5hbWUiOiJ0ZXJtc19oYXNoIiwidHlwZSI6eyJhcnJheSI6WyJ1OCIsMzJdfX0seyJuYW1lIjoiYW1vdW50IiwidHlwZSI6InU2NCJ9LHsibmFtZSI6ImdvYWxfZGVhZGxpbmUiLCJ0eXBlIjoiaTY0In0seyJuYW1lIjoicmV2aWV3X2RlYWRsaW5lIiwidHlwZSI6Imk2NCJ9LHsibmFtZSI6Im1vZGUiLCJ0eXBlIjoidTgifSx7Im5hbWUiOiJyZXZpZXdlcnMiLCJ0eXBlIjp7InZlYyI6InB1YmtleSJ9fSx7Im5hbWUiOiJnaXRodWIiLCJ0eXBlIjp7Im9wdGlvbiI6eyJkZWZpbmVkIjp7Im5hbWUiOiJHaXRodWJDb25maWcifX19fV19fSx7Im5hbWUiOiJHaXRodWJDb25maWciLCJ0eXBlIjp7ImtpbmQiOiJzdHJ1Y3QiLCJmaWVsZHMiOlt7Im5hbWUiOiJvd25lciIsInR5cGUiOiJzdHJpbmcifSx7Im5hbWUiOiJyZXBvIiwidHlwZSI6InN0cmluZyJ9LHsibmFtZSI6InByIiwidHlwZSI6InUzMiJ9LHsibmFtZSI6InRhcmdldF9icmFuY2giLCJ0eXBlIjoic3RyaW5nIn0seyJuYW1lIjoicG9saWN5X3ZlcnNpb24iLCJ0eXBlIjoidTE2In1dfX0seyJuYW1lIjoiR3JvdXAiLCJ0eXBlIjp7ImtpbmQiOiJzdHJ1Y3QiLCJmaWVsZHMiOlt7Im5hbWUiOiJmb3VuZGVyIiwidHlwZSI6InB1YmtleSJ9LHsibmFtZSI6ImJ1bXAiLCJ0eXBlIjoidTgifSx7Im5hbWUiOiJyb3N0ZXIiLCJ0eXBlIjp7InZlYyI6InB1YmtleSJ9fSx7Im5hbWUiOiJ0cmVhc3VyZXIiLCJ0eXBlIjoicHVia2V5In0seyJuYW1lIjoidHJlYXN1cnlfcmVjaXBpZW50IiwidHlwZSI6InB1YmtleSJ9LHsibmFtZSI6Im1pbnQiLCJ0eXBlIjoicHVia2V5In0seyJuYW1lIjoidmF1bHQiLCJ0eXBlIjoicHVia2V5In0seyJuYW1lIjoiYWN0aXZlIiwidHlwZSI6InU2NCJ9LHsibmFtZSI6InJlZnVuZGFibGUiLCJ0eXBlIjoidTY0In0seyJuYW1lIjoicG9vbCIsInR5cGUiOiJ1NjQifSx7Im5hbWUiOiJwb2xpY3kiLCJ0eXBlIjp7ImRlZmluZWQiOnsibmFtZSI6Ikdyb3VwUG9saWN5In19fV19fSx7Im5hbWUiOiJHcm91cEFyZ3MiLCJ0eXBlIjp7ImtpbmQiOiJzdHJ1Y3QiLCJmaWVsZHMiOlt7Im5hbWUiOiJyb3N0ZXIiLCJ0eXBlIjp7InZlYyI6InB1YmtleSJ9fSx7Im5hbWUiOiJ0cmVhc3VyZXIiLCJ0eXBlIjoicHVia2V5In0seyJuYW1lIjoidHJlYXN1cnlfcmVjaXBpZW50IiwidHlwZSI6InB1YmtleSJ9LHsibmFtZSI6InBvbGljeSIsInR5cGUiOnsiZGVmaW5lZCI6eyJuYW1lIjoiR3JvdXBQb2xpY3kifX19XX19LHsibmFtZSI6Ikdyb3VwUG9saWN5IiwidHlwZSI6eyJraW5kIjoic3RydWN0IiwiZmllbGRzIjpbeyJuYW1lIjoiZm9yd2FyZGVyIiwidHlwZSI6InB1YmtleSJ9LHsibmFtZSI6ImZvcndhcmRlcl9zdGF0ZSIsInR5cGUiOiJwdWJrZXkifSx7Im5hbWUiOiJ3b3JrZmxvd19jaWQiLCJ0eXBlIjp7ImFycmF5IjpbInU4IiwzMl19fSx7Im5hbWUiOiJ3b3JrZmxvd19uYW1lIiwidHlwZSI6eyJhcnJheSI6WyJ1OCIsMTBdfX0seyJuYW1lIjoid29ya2Zsb3dfb3duZXIiLCJ0eXBlIjp7ImFycmF5IjpbInU4IiwyMF19fV19fSx7Im5hbWUiOiJMaWZlY3ljbGUiLCJ0eXBlIjp7ImtpbmQiOiJlbnVtIiwidmFyaWFudHMiOlt7Im5hbWUiOiJEcmFmdCJ9LHsibmFtZSI6IkFjdGl2ZSJ9LHsibmFtZSI6IlN1Y2NlZWRlZCJ9LHsibmFtZSI6IkZhaWxlZCJ9LHsibmFtZSI6IlVucmVzb2x2ZWQifV19fSx7Im5hbWUiOiJPYnNlcnZlZFJlcG9ydCIsInR5cGUiOnsia2luZCI6InN0cnVjdCIsImZpZWxkcyI6W3sibmFtZSI6InJlcG9ydCIsInR5cGUiOnsiZGVmaW5lZCI6eyJuYW1lIjoiT3JhY2xlUmVwb3J0In19fV19fSx7Im5hbWUiOiJPcmFjbGVSZXBvcnQiLCJ0eXBlIjp7ImtpbmQiOiJzdHJ1Y3QiLCJmaWVsZHMiOlt7Im5hbWUiOiJvcGVyYXRpb24iLCJ0eXBlIjoidTgifSx7Im5hbWUiOiJjb21taXRtZW50IiwidHlwZSI6InB1YmtleSJ9LHsibmFtZSI6ImNvbmZpZ19oYXNoIiwidHlwZSI6eyJhcnJheSI6WyJ1OCIsMzJdfX0seyJuYW1lIjoicG9saWN5X3ZlcnNpb24iLCJ0eXBlIjoidTE2In0seyJuYW1lIjoic291cmNlIiwidHlwZSI6InU4In0seyJuYW1lIjoib2JzZXJ2ZWRfYXQiLCJ0eXBlIjoiaTY0In0seyJuYW1lIjoibWVyZ2VkIiwidHlwZSI6ImJvb2wifSx7Im5hbWUiOiJtZXJnZWRfYXQiLCJ0eXBlIjoiaTY0In0seyJuYW1lIjoiYnJhbmNoX2hhc2giLCJ0eXBlIjp7ImFycmF5IjpbInU4IiwzMl19fV19fV19'

const DISCRIMINATOR_SIZE = 8

const expectDiscriminator = (label: string, expected: Uint8Array, data: Uint8Array): Uint8Array => {
  if (data.length < DISCRIMINATOR_SIZE) {
    throw new Error(`${label}: data too short for discriminator (${data.length} bytes)`)
  }
  for (let i = 0; i < DISCRIMINATOR_SIZE; i++) {
    if (data[i] !== expected[i]) {
      throw new Error(`${label}: discriminator mismatch`)
    }
  }
  return data.subarray(DISCRIMINATOR_SIZE)
}

export enum Lifecycle {
  Draft = 0,
  Active = 1,
  Succeeded = 2,
  Failed = 3,
  Unresolved = 4,
}

export const lifecycleCodec = getEnumCodec(Lifecycle)

export type GithubConfig = {
  owner: string
  repo: string
  pr: number
  targetBranch: string
  policyVersion: number
}

export const githubConfigCodec = getStructCodec([
  ['owner', addCodecSizePrefix(getUtf8Codec(), getU32Codec())],
  ['repo', addCodecSizePrefix(getUtf8Codec(), getU32Codec())],
  ['pr', getU32Codec()],
  ['targetBranch', addCodecSizePrefix(getUtf8Codec(), getU32Codec())],
  ['policyVersion', getU16Codec()],
])

export type GroupPolicy = {
  forwarder: Address
  forwarderState: Address
  workflowCid: number[]
  workflowName: number[]
  workflowOwner: number[]
}

export const groupPolicyCodec = getStructCodec([
  ['forwarder', getAddressCodec()],
  ['forwarderState', getAddressCodec()],
  ['workflowCid', getArrayCodec(getU8Codec(), { size: 32 })],
  ['workflowName', getArrayCodec(getU8Codec(), { size: 10 })],
  ['workflowOwner', getArrayCodec(getU8Codec(), { size: 20 })],
])

export type Commitment = {
  group: Address
  owner: Address
  nonce: bigint
  bump: number
  termsHash: number[]
  amount: bigint
  goalDeadline: bigint
  reviewDeadline: bigint
  hardDeadline: bigint
  activatedAt: bigint
  mode: number
  reviewers: Address[]
  acknowledgments: number
  approvals: number
  status: Lifecycle
  refundReleased: boolean
  github: GithubConfig | null
  configHash: number[]
  policy: GroupPolicy
  observedAt: bigint
  mergedAt: bigint
  branchHash: number[]
  reportId: number[]
}

export const commitmentCodec = getStructCodec([
  ['group', getAddressCodec()],
  ['owner', getAddressCodec()],
  ['nonce', getU64Codec()],
  ['bump', getU8Codec()],
  ['termsHash', getArrayCodec(getU8Codec(), { size: 32 })],
  ['amount', getU64Codec()],
  ['goalDeadline', getI64Codec()],
  ['reviewDeadline', getI64Codec()],
  ['hardDeadline', getI64Codec()],
  ['activatedAt', getI64Codec()],
  ['mode', getU8Codec()],
  ['reviewers', getArrayCodec(getAddressCodec(), { size: getU32Codec() })],
  ['acknowledgments', getU8Codec()],
  ['approvals', getU8Codec()],
  ['status', lifecycleCodec],
  ['refundReleased', getBooleanCodec()],
  ['github', getNullableCodec(githubConfigCodec)],
  ['configHash', getArrayCodec(getU8Codec(), { size: 32 })],
  ['policy', groupPolicyCodec],
  ['observedAt', getI64Codec()],
  ['mergedAt', getI64Codec()],
  ['branchHash', getArrayCodec(getU8Codec(), { size: 32 })],
  ['reportId', getArrayCodec(getU8Codec(), { size: 2 })],
])

export type CreateArgs = {
  nonce: bigint
  termsHash: number[]
  amount: bigint
  goalDeadline: bigint
  reviewDeadline: bigint
  mode: number
  reviewers: Address[]
  github: GithubConfig | null
}

export const createArgsCodec = getStructCodec([
  ['nonce', getU64Codec()],
  ['termsHash', getArrayCodec(getU8Codec(), { size: 32 })],
  ['amount', getU64Codec()],
  ['goalDeadline', getI64Codec()],
  ['reviewDeadline', getI64Codec()],
  ['mode', getU8Codec()],
  ['reviewers', getArrayCodec(getAddressCodec(), { size: getU32Codec() })],
  ['github', getNullableCodec(githubConfigCodec)],
])

export type Group = {
  founder: Address
  bump: number
  roster: Address[]
  treasurer: Address
  treasuryRecipient: Address
  mint: Address
  vault: Address
  active: bigint
  refundable: bigint
  pool: bigint
  policy: GroupPolicy
}

export const groupCodec = getStructCodec([
  ['founder', getAddressCodec()],
  ['bump', getU8Codec()],
  ['roster', getArrayCodec(getAddressCodec(), { size: getU32Codec() })],
  ['treasurer', getAddressCodec()],
  ['treasuryRecipient', getAddressCodec()],
  ['mint', getAddressCodec()],
  ['vault', getAddressCodec()],
  ['active', getU64Codec()],
  ['refundable', getU64Codec()],
  ['pool', getU64Codec()],
  ['policy', groupPolicyCodec],
])

export type GroupArgs = {
  roster: Address[]
  treasurer: Address
  treasuryRecipient: Address
  policy: GroupPolicy
}

export const groupArgsCodec = getStructCodec([
  ['roster', getArrayCodec(getAddressCodec(), { size: getU32Codec() })],
  ['treasurer', getAddressCodec()],
  ['treasuryRecipient', getAddressCodec()],
  ['policy', groupPolicyCodec],
])

export type OracleReport = {
  operation: number
  commitment: Address
  configHash: number[]
  policyVersion: number
  source: number
  observedAt: bigint
  merged: boolean
  mergedAt: bigint
  branchHash: number[]
}

export const oracleReportCodec = getStructCodec([
  ['operation', getU8Codec()],
  ['commitment', getAddressCodec()],
  ['configHash', getArrayCodec(getU8Codec(), { size: 32 })],
  ['policyVersion', getU16Codec()],
  ['source', getU8Codec()],
  ['observedAt', getI64Codec()],
  ['merged', getBooleanCodec()],
  ['mergedAt', getI64Codec()],
  ['branchHash', getArrayCodec(getU8Codec(), { size: 32 })],
])

export type ObservedReport = {
  report: OracleReport
}

export const observedReportCodec = getStructCodec([
  ['report', oracleReportCodec],
])

export const ACCOUNT_COMMITMENT_DISCRIMINATOR = new Uint8Array([61, 112, 129, 128, 24, 147, 77, 87])

/**
 * Decodes raw Commitment account data (with its 8-byte discriminator) into Commitment.
 * Pure helper — there is no read capability; obtain the account bytes elsewhere.
 */
export const decodeCommitmentAccount = (data: Uint8Array): Commitment =>
  commitmentCodec.decode(expectDiscriminator('account Commitment', ACCOUNT_COMMITMENT_DISCRIMINATOR, data)) as Commitment

export const ACCOUNT_GROUP_DISCRIMINATOR = new Uint8Array([209, 249, 208, 63, 182, 89, 186, 254])

/**
 * Decodes raw Group account data (with its 8-byte discriminator) into Group.
 * Pure helper — there is no read capability; obtain the account bytes elsewhere.
 */
export const decodeGroupAccount = (data: Uint8Array): Group =>
  groupCodec.decode(expectDiscriminator('account Group', ACCOUNT_GROUP_DISCRIMINATOR, data)) as Group

export const EVENT_OBSERVED_REPORT_DISCRIMINATOR = new Uint8Array([18, 198, 37, 192, 156, 179, 84, 213])

/**
 * Decodes raw ObservedReport event data (with its 8-byte discriminator) into ObservedReport.
 */
export const decodeObservedReportEvent = (data: Uint8Array): ObservedReport =>
  observedReportCodec.decode(expectDiscriminator('event ObservedReport', EVENT_OBSERVED_REPORT_DISCRIMINATOR, data)) as ObservedReport

export const parseAnyAccount = (data: Uint8Array): Commitment | Group => {
  const disc = data.subarray(0, DISCRIMINATOR_SIZE)
  const matches = (expected: Uint8Array) => expected.every((b, i) => disc[i] === b)
  if (matches(ACCOUNT_COMMITMENT_DISCRIMINATOR)) return decodeCommitmentAccount(data)
  if (matches(ACCOUNT_GROUP_DISCRIMINATOR)) return decodeGroupAccount(data)
  throw new Error(`unknown account discriminator: [${Array.from(disc).join(', ')}]`)
}

export const parseAnyEvent = (data: Uint8Array): ObservedReport => {
  const disc = data.subarray(0, DISCRIMINATOR_SIZE)
  const matches = (expected: Uint8Array) => expected.every((b, i) => disc[i] === b)
  if (matches(EVENT_OBSERVED_REPORT_DISCRIMINATOR)) return decodeObservedReportEvent(data)
  throw new Error(`unknown event discriminator: [${Array.from(disc).join(', ')}]`)
}

/**
 * Optional filter values for ObservedReport log triggers. Set fields in one row to
 * AND those predicates. Multiple rows are OR alternatives, but current trigger
 * configuration supports only a single row. Leave unset for wildcard. Only top-level
 * scalar fields with supported subkey encodings are auto-filterable — nested
 * structs, vecs, arrays, bool, u128, and i128 need a manual SubkeyConfig.
 */
export type ObservedReportFilters = Record<string, never>

export const encodeObservedReportSubkeys = (filters: ObservedReportFilters[]): SolanaSubkeyConfigJson[] => {
  if (filters.length > 1) {
    throw new Error('multiple filter rows are not supported for ObservedReport; provide a single filter row')
  }
  return []
}

export class Vowpool {
  readonly programId: Uint8Array

  // The program ID is baked into the IDL, so it defaults to the generated
  // const — unlike EVM bindings where the address is a runtime value.
  constructor(
    private readonly client: SolanaClient,
    programId: string | Uint8Array = VOWPOOL_PROGRAM_ID,
  ) {
    this.programId = typeof programId === 'string' ? solanaAddressToBytes(programId) : programId
  }

  /**
   * Publishes a pre-encoded Borsh payload through the CRE signer to this
   * program's on_report entrypoint via the keystone-forwarder.
   *
   * remainingAccounts must follow the keystone-forwarder account layout:
   *   - Index 0: forwarderState – the forwarder program's state account.
   *   - Index 1: forwarderAuthority – PDA derived from seeds
   *     ["forwarder", forwarderState, receiverProgram] under the forwarder program ID.
   *   - Index 2+: receiver-specific accounts required by the target program.
   *
   * The full account list is hashed (via calculateAccountsHash) into the report.
   * The on-chain forwarder strips indices 0 and 1 before CPI-ing into the
   * receiver, so they must be present and correctly ordered.
   */
  writeReport(
    runtime: Runtime<unknown>,
    payload: Uint8Array,
    remainingAccounts: SolanaAccountMeta[],
    computeConfig?: SolanaComputeConfig,
  ) {
    const report = runtime
      .report(
        prepareSolanaReportRequest(
          encodeForwarderReport({
            accountHash: calculateAccountsHash(remainingAccounts),
            payload,
          }),
        ),
      )
      .result()

    return this.client
      .writeReport(runtime, {
        remainingAccounts: solanaAccountMetasToJson(remainingAccounts),
        receiver: bytesToHex(this.programId),
        computeConfig,
        report,
      })
      .result()
  }

  /**
   * Publishes a Borsh Vec of pre-encoded element payloads (mirrors Go's
   * WriteReportFromBorshEncodedVec). Each element must already be fully
   * serialized for one Vec item on the wire.
   */
  writeReportFromBorshEncodedVec(
    runtime: Runtime<unknown>,
    elementPayloads: Uint8Array[],
    remainingAccounts: SolanaAccountMeta[],
    computeConfig?: SolanaComputeConfig,
  ) {
    return this.writeReport(runtime, encodeBorshVecU32(elementPayloads), remainingAccounts, computeConfig)
  }

  writeReportFromGithubConfig(
    runtime: Runtime<unknown>,
    input: GithubConfig,
    remainingAccounts: SolanaAccountMeta[],
    computeConfig?: SolanaComputeConfig,
  ) {
    return this.writeReport(runtime, new Uint8Array(githubConfigCodec.encode(input)), remainingAccounts, computeConfig)
  }

  writeReportFromGithubConfigs(
    runtime: Runtime<unknown>,
    inputs: GithubConfig[],
    remainingAccounts: SolanaAccountMeta[],
    computeConfig?: SolanaComputeConfig,
  ) {
    return this.writeReportFromBorshEncodedVec(
      runtime,
      inputs.map((input) => new Uint8Array(githubConfigCodec.encode(input))),
      remainingAccounts,
      computeConfig,
    )
  }

  writeReportFromGroupPolicy(
    runtime: Runtime<unknown>,
    input: GroupPolicy,
    remainingAccounts: SolanaAccountMeta[],
    computeConfig?: SolanaComputeConfig,
  ) {
    return this.writeReport(runtime, new Uint8Array(groupPolicyCodec.encode(input)), remainingAccounts, computeConfig)
  }

  writeReportFromGroupPolicys(
    runtime: Runtime<unknown>,
    inputs: GroupPolicy[],
    remainingAccounts: SolanaAccountMeta[],
    computeConfig?: SolanaComputeConfig,
  ) {
    return this.writeReportFromBorshEncodedVec(
      runtime,
      inputs.map((input) => new Uint8Array(groupPolicyCodec.encode(input))),
      remainingAccounts,
      computeConfig,
    )
  }

  writeReportFromCommitment(
    runtime: Runtime<unknown>,
    input: Commitment,
    remainingAccounts: SolanaAccountMeta[],
    computeConfig?: SolanaComputeConfig,
  ) {
    return this.writeReport(runtime, new Uint8Array(commitmentCodec.encode(input)), remainingAccounts, computeConfig)
  }

  writeReportFromCommitments(
    runtime: Runtime<unknown>,
    inputs: Commitment[],
    remainingAccounts: SolanaAccountMeta[],
    computeConfig?: SolanaComputeConfig,
  ) {
    return this.writeReportFromBorshEncodedVec(
      runtime,
      inputs.map((input) => new Uint8Array(commitmentCodec.encode(input))),
      remainingAccounts,
      computeConfig,
    )
  }

  writeReportFromCreateArgs(
    runtime: Runtime<unknown>,
    input: CreateArgs,
    remainingAccounts: SolanaAccountMeta[],
    computeConfig?: SolanaComputeConfig,
  ) {
    return this.writeReport(runtime, new Uint8Array(createArgsCodec.encode(input)), remainingAccounts, computeConfig)
  }

  writeReportFromCreateArgss(
    runtime: Runtime<unknown>,
    inputs: CreateArgs[],
    remainingAccounts: SolanaAccountMeta[],
    computeConfig?: SolanaComputeConfig,
  ) {
    return this.writeReportFromBorshEncodedVec(
      runtime,
      inputs.map((input) => new Uint8Array(createArgsCodec.encode(input))),
      remainingAccounts,
      computeConfig,
    )
  }

  writeReportFromGroup(
    runtime: Runtime<unknown>,
    input: Group,
    remainingAccounts: SolanaAccountMeta[],
    computeConfig?: SolanaComputeConfig,
  ) {
    return this.writeReport(runtime, new Uint8Array(groupCodec.encode(input)), remainingAccounts, computeConfig)
  }

  writeReportFromGroups(
    runtime: Runtime<unknown>,
    inputs: Group[],
    remainingAccounts: SolanaAccountMeta[],
    computeConfig?: SolanaComputeConfig,
  ) {
    return this.writeReportFromBorshEncodedVec(
      runtime,
      inputs.map((input) => new Uint8Array(groupCodec.encode(input))),
      remainingAccounts,
      computeConfig,
    )
  }

  writeReportFromGroupArgs(
    runtime: Runtime<unknown>,
    input: GroupArgs,
    remainingAccounts: SolanaAccountMeta[],
    computeConfig?: SolanaComputeConfig,
  ) {
    return this.writeReport(runtime, new Uint8Array(groupArgsCodec.encode(input)), remainingAccounts, computeConfig)
  }

  writeReportFromGroupArgss(
    runtime: Runtime<unknown>,
    inputs: GroupArgs[],
    remainingAccounts: SolanaAccountMeta[],
    computeConfig?: SolanaComputeConfig,
  ) {
    return this.writeReportFromBorshEncodedVec(
      runtime,
      inputs.map((input) => new Uint8Array(groupArgsCodec.encode(input))),
      remainingAccounts,
      computeConfig,
    )
  }

  writeReportFromOracleReport(
    runtime: Runtime<unknown>,
    input: OracleReport,
    remainingAccounts: SolanaAccountMeta[],
    computeConfig?: SolanaComputeConfig,
  ) {
    return this.writeReport(runtime, new Uint8Array(oracleReportCodec.encode(input)), remainingAccounts, computeConfig)
  }

  writeReportFromOracleReports(
    runtime: Runtime<unknown>,
    inputs: OracleReport[],
    remainingAccounts: SolanaAccountMeta[],
    computeConfig?: SolanaComputeConfig,
  ) {
    return this.writeReportFromBorshEncodedVec(
      runtime,
      inputs.map((input) => new Uint8Array(oracleReportCodec.encode(input))),
      remainingAccounts,
      computeConfig,
    )
  }

  writeReportFromObservedReport(
    runtime: Runtime<unknown>,
    input: ObservedReport,
    remainingAccounts: SolanaAccountMeta[],
    computeConfig?: SolanaComputeConfig,
  ) {
    return this.writeReport(runtime, new Uint8Array(observedReportCodec.encode(input)), remainingAccounts, computeConfig)
  }

  writeReportFromObservedReports(
    runtime: Runtime<unknown>,
    inputs: ObservedReport[],
    remainingAccounts: SolanaAccountMeta[],
    computeConfig?: SolanaComputeConfig,
  ) {
    return this.writeReportFromBorshEncodedVec(
      runtime,
      inputs.map((input) => new Uint8Array(observedReportCodec.encode(input))),
      remainingAccounts,
      computeConfig,
    )
  }

  /**
   * Registers a typed log trigger for ObservedReport events. The trigger
   * output is adapted to the decoded ObservedReport data alongside the raw log.
   * Pass opts.cpi for events emitted via Anchor's emit_cpi!.
   */
  logTriggerObservedReportLog(
    filterName: string,
    filters: ObservedReportFilters[] = [],
    opts?: SolanaLogTriggerOptions,
  ): Trigger<SolanaLog, SolanaDecodedLog<ObservedReport>> {
    const config: SolanaFilterLogTriggerRequestJson = {
      name: filterName,
      address: bytesToBase64(this.programId),
      eventName: 'ObservedReport',
      contractIdlJson: VOWPOOL_IDL_BASE64,
      subkeys: encodeObservedReportSubkeys(filters),
    }
    if (opts?.cpi) {
      config.cpiFilterConfig = anchorCPILogTriggerConfig(this.programId)
    }
    return adaptTrigger(this.client.logTrigger(config), (log) => ({
      log,
      data: decodeObservedReportEvent(log.data),
    }))
  }
}
