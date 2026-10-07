use anchor_lang::prelude::*;
use crate::{Group,ErrorCode};
pub fn authenticate(group:&Group,state:&AccountInfo,authority:&AccountInfo,metadata:&[u8])->Result<()> {
 require!(authority.is_signer,ErrorCode::InvalidForwarderAuthority);
 require_keys_eq!(state.key(),group.policy.forwarder_state,ErrorCode::InvalidForwarderState);
 require_keys_eq!(*state.owner,group.policy.forwarder,ErrorCode::InvalidForwarderState);
 let (expected,_)=Pubkey::find_program_address(&[b"forwarder",state.key.as_ref(),crate::ID.as_ref()],&group.policy.forwarder);
 require_keys_eq!(authority.key(),expected,ErrorCode::InvalidForwarderAuthority);
 require!(metadata.len()==64,ErrorCode::InvalidMetadata);
 require!(metadata[0..32]==group.policy.workflow_cid&&metadata[32..42]==group.policy.workflow_name&&metadata[42..62]==group.policy.workflow_owner,ErrorCode::InvalidWorkflow);
 Ok(())
}
