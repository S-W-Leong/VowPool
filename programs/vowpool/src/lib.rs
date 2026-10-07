#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;
pub mod state;
pub mod oracle;
declare_id!("A2JT4HUJYEd3BL5xPXRiaXjvoFSMetY8zvLEPmRAxXPf");
#[program]
pub mod vowpool {
 use super::*;
 pub fn initialize_group(ctx: Context<InitializeGroup>, args: GroupArgs) -> Result<()> {
  ctx.accounts.group.set_inner(Group { founder:ctx.accounts.founder.key(), bump:ctx.bumps.group, policy:args }); Ok(())
 }
 pub fn on_report(ctx: Context<OnReport>, metadata:Vec<u8>, _report:Vec<u8>) -> Result<()> { oracle::authenticate(&ctx.accounts.group,&ctx.accounts.state.to_account_info(),&ctx.accounts.forwarder_authority.to_account_info(),&metadata) }
}
#[derive(AnchorSerialize,AnchorDeserialize,Clone,InitSpace)]
pub struct GroupArgs {pub forwarder:Pubkey,pub forwarder_state:Pubkey,pub workflow_cid:[u8;32],pub workflow_name:[u8;10],pub workflow_owner:[u8;20]}
#[account]
#[derive(InitSpace)]
pub struct Group {pub founder:Pubkey,pub bump:u8,pub policy:GroupArgs}
#[derive(Accounts)]
pub struct InitializeGroup<'info> {
 #[account(mut)] pub founder:Signer<'info>,
 #[account(init,payer=founder,space=8+Group::INIT_SPACE,seeds=[b"group",founder.key().as_ref()],bump)] pub group:Account<'info,Group>,
 pub system_program:Program<'info,System>,
}
#[derive(Accounts)]
pub struct OnReport<'info> {
 /// CHECK: authenticated in handler.
 pub state:UncheckedAccount<'info>,
 /// Forwarder PDA signature is checked by Anchor; identity is checked in handler.
 pub forwarder_authority:Signer<'info>,
 #[account(seeds=[b"group",group.founder.as_ref()],bump=group.bump)] pub group:Account<'info,Group>,
}

#[error_code]
pub enum ErrorCode {
 #[msg("Invalid forwarder authority")] InvalidForwarderAuthority,
 #[msg("Wrong forwarder state or owner")] InvalidForwarderState,
 #[msg("Workflow metadata must be exactly 64 bytes")] InvalidMetadata,
 #[msg("Unauthorized workflow identity")] InvalidWorkflow,
}
