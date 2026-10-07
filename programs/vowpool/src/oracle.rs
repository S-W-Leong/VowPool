use crate::{ErrorCode, Group};
use anchor_lang::prelude::*;
pub fn authenticate(
    group: &Group,
    state: &AccountInfo,
    authority: &AccountInfo,
    metadata: &[u8],
) -> Result<()> {
    require!(authority.is_signer, ErrorCode::InvalidForwarderAuthority);
    require_keys_eq!(
        state.key(),
        group.policy.forwarder_state,
        ErrorCode::InvalidForwarderState
    );
    require_keys_eq!(
        *state.owner,
        group.policy.forwarder,
        ErrorCode::InvalidForwarderState
    );
    let (expected, _) = Pubkey::find_program_address(
        &[b"forwarder", state.key.as_ref(), crate::ID.as_ref()],
        &group.policy.forwarder,
    );
    require_keys_eq!(
        authority.key(),
        expected,
        ErrorCode::InvalidForwarderAuthority
    );
    require!(metadata.len() == 64, ErrorCode::InvalidMetadata);
    require!(
        metadata[0..32] == group.policy.workflow_cid
            && metadata[32..42] == group.policy.workflow_name
            && metadata[42..62] == group.policy.workflow_owner,
        ErrorCode::InvalidWorkflow
    );
    Ok(())
}

use crate::state::{Commitment, Lifecycle, OracleReport};
pub fn record(
    c: &mut Commitment,
    g: &mut Group,
    r: &OracleReport,
    metadata: &[u8],
    now: i64,
) -> Result<()> {
    require!(c.mode == 3, ErrorCode::WrongMode);
    require!(c.status == Lifecycle::Active, ErrorCode::InvalidState);
    require!(
        now <= c.hard_deadline
            && r.observed_at <= now
            && r.observed_at >= c.activated_at
            && r.observed_at >= c.observed_at,
        ErrorCode::InvalidReport
    );
    require!(
        r.config_hash == c.config_hash && r.policy_version == 1 && r.source == 1,
        ErrorCode::InvalidReport
    );
    require!(
        metadata[0..32] == c.policy.workflow_cid
            && metadata[32..42] == c.policy.workflow_name
            && metadata[42..62] == c.policy.workflow_owner,
        ErrorCode::InvalidWorkflow
    );
    require!(
        (r.merged && r.merged_at > 0 && r.merged_at <= r.observed_at)
            || (!r.merged && r.merged_at == 0),
        ErrorCode::InvalidReport
    );
    let config = c.github.as_ref().ok_or(ErrorCode::InvalidConfiguration)?;
    let branch = solana_sha256_hasher::hash(config.target_branch.as_bytes()).to_bytes();
    let qualifies = r.merged
        && r.merged_at > c.activated_at
        && r.merged_at <= c.goal_deadline
        && r.branch_hash == branch;
    if r.operation == 0 {
        require!(qualifies, ErrorCode::InvalidReport);
        crate::escrow::finish(c, g, Lifecycle::Succeeded)?;
    } else {
        require!(
            !qualifies && r.observed_at > c.goal_deadline,
            ErrorCode::InvalidReport
        );
        crate::escrow::finish(c, g, Lifecycle::Failed)?;
    }
    c.observed_at = r.observed_at;
    c.merged_at = r.merged_at;
    c.branch_hash = r.branch_hash;
    c.report_id.copy_from_slice(&metadata[62..64]);
    Ok(())
}
// Refund processing report supplies [vault, owner ATA, original token program].
// Missing ATA is retryable via the public release_refund instruction, which can create it.
pub fn release<'info>(
    c: &mut Commitment,
    g: &mut Account<'info, Group>,
    accounts: &[AccountInfo<'info>],
) -> Result<()> {
    use anchor_spl::token::{self, TokenAccount, Transfer};
    crate::escrow::refund_allowed(c)?;
    require!(accounts.len() == 3, ErrorCode::InvalidReport);
    let vault = &accounts[0];
    let destination = &accounts[1];
    let program = &accounts[2];
    require_keys_eq!(*program.key, token::ID, ErrorCode::InvalidReport);
    require!(program.executable, ErrorCode::InvalidReport);
    require_keys_eq!(*vault.owner, token::ID, ErrorCode::InvalidReport);
    require_keys_eq!(*destination.owner, token::ID, ErrorCode::InvalidReport);
    require_keys_eq!(*vault.key, g.vault, ErrorCode::InvalidReport);
    let v = TokenAccount::try_deserialize(&mut &vault.try_borrow_data()?[..])?;
    let d = TokenAccount::try_deserialize(&mut &destination.try_borrow_data()?[..])?;
    require_keys_eq!(v.owner, g.key(), ErrorCode::InvalidReport);
    require_keys_eq!(v.mint, g.mint, ErrorCode::InvalidReport);
    require_keys_eq!(d.owner, c.owner, ErrorCode::InvalidReport);
    require_keys_eq!(d.mint, g.mint, ErrorCode::InvalidReport);
    let owner_ata = anchor_spl::associated_token::get_associated_token_address(&c.owner, &g.mint);
    require_keys_eq!(*destination.key, owner_ata, ErrorCode::InvalidReport);
    require!(
        v.amount >= crate::escrow::liabilities(g)?,
        ErrorCode::Accounting
    );
    let seeds: &[&[u8]] = &[b"group", g.founder.as_ref(), &[g.bump]];
    if c.amount > 0 {
        token::transfer(
            CpiContext::new_with_signer(
                program.clone(),
                Transfer {
                    from: vault.clone(),
                    to: destination.clone(),
                    authority: g.to_account_info(),
                },
                &[seeds],
            ),
            c.amount,
        )?;
    }
    g.refundable = g
        .refundable
        .checked_sub(c.amount)
        .ok_or(ErrorCode::Accounting)?;
    c.refund_released = true;
    Ok(())
}
