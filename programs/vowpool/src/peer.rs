use crate::{state::*, ErrorCode};
use anchor_lang::prelude::*;
fn check(condition: bool) -> Result<()> {
    require!(condition, ErrorCode::InvalidConfiguration);
    Ok(())
}
pub fn validate_group(args: &GroupArgs, founder: Pubkey) -> Result<()> {
    check(
        !args.roster.is_empty()
            && args.roster.len() <= 8
            && args.roster.contains(&founder)
            && args.roster.contains(&args.treasurer)
            && args.treasury_recipient != Pubkey::default(),
    )?;
    for (i, m) in args.roster.iter().enumerate() {
        check(*m != Pubkey::default() && !args.roster[..i].contains(m))?;
    }
    check(
        args.policy.forwarder != Pubkey::default()
            && args.policy.forwarder_state != Pubkey::default(),
    )
}
pub fn create(
    group: &Group,
    group_key: Pubkey,
    owner: Pubkey,
    key: Pubkey,
    bump: u8,
    args: CreateArgs,
    now: i64,
) -> Result<Commitment> {
    require!(group.roster.contains(&owner), ErrorCode::Unauthorized);
    check(
        args.mode <= 3
            && args.goal_deadline > now
            && args.review_deadline > args.goal_deadline
            && args.terms_hash != [0; 32],
    )?;
    check(args.reviewers.len() <= 7)?;
    for (i, r) in args.reviewers.iter().enumerate() {
        check(*r != owner && group.roster.contains(r) && !args.reviewers[..i].contains(r))?;
    }
    check(match args.mode {
        0 => args.reviewers.len() == 1,
        1 => !args.reviewers.is_empty(),
        _ => args.reviewers.is_empty(),
    })?;
    check((args.mode == 3) == args.github.is_some())?;
    let hard = args
        .review_deadline
        .checked_add(172800)
        .ok_or(ErrorCode::Accounting)?;
    let mut config_hash = [0; 32];
    if let Some(c) = &args.github {
        check(
            c.policy_version == 1
                && c.pr > 0
                && !c.owner.is_empty()
                && c.owner.len() <= 39
                && !c.repo.is_empty()
                && c.repo.len() <= 100
                && !c.target_branch.is_empty()
                && c.target_branch.len() <= 100,
        )?;
        check(
            c.owner
                .bytes()
                .all(|b| b.is_ascii_alphanumeric() || b == b'-')
                && !c.owner.starts_with('-')
                && !c.owner.ends_with('-'),
        )?;
        check(
            c.repo != "."
                && c.repo != ".."
                && c.repo
                    .bytes()
                    .all(|b| b.is_ascii_alphanumeric() || b"_.-".contains(&b)),
        )?;
        check(
            !c.target_branch
                .bytes()
                .any(|b| b <= 32 || b == 127 || b"~^:?*[\\".contains(&b))
                && !c.target_branch.contains("..")
                && !c.target_branch.contains("@{")
                && !c.target_branch.ends_with(".lock")
                && !c.target_branch.starts_with('/')
                && !c.target_branch.ends_with('/'),
        )?;
        check(
            group.policy.workflow_cid != [0; 32]
                && group.policy.workflow_name != [0; 10]
                && group.policy.workflow_owner != [0; 20],
        )?;
        config_hash = solana_sha256_hasher::hash(&canonical_config(
            crate::ID,
            group_key,
            key,
            c,
            [args.goal_deadline, args.review_deadline, hard],
            group.policy.workflow_cid,
            group.policy.workflow_name,
            group.policy.workflow_owner,
        ))
        .to_bytes();
    }
    Ok(Commitment {
        group: group_key,
        owner,
        nonce: args.nonce,
        bump,
        terms_hash: args.terms_hash,
        amount: args.amount,
        goal_deadline: args.goal_deadline,
        review_deadline: args.review_deadline,
        hard_deadline: hard,
        activated_at: 0,
        mode: args.mode,
        reviewers: args.reviewers,
        acknowledgments: 0,
        approvals: 0,
        status: Lifecycle::Draft,
        refund_released: false,
        github: args.github,
        config_hash,
        policy: group.policy.clone(),
        observed_at: 0,
        merged_at: 0,
        branch_hash: [0; 32],
        report_id: [0; 2],
    })
}
pub fn reviewer_index(c: &Commitment, group: &Group, member: Pubkey) -> Result<usize> {
    require!(
        member != c.owner && group.roster.contains(&member),
        ErrorCode::Unauthorized
    );
    if c.mode == 2 {
        return group
            .roster
            .iter()
            .position(|r| *r == member)
            .ok_or(ErrorCode::Unauthorized.into());
    }
    require!(c.mode <= 1, ErrorCode::WrongMode);
    c.reviewers
        .iter()
        .position(|r| *r == member)
        .ok_or(ErrorCode::Unauthorized.into())
}
pub fn required_mask(c: &Commitment) -> u8 {
    ((1u16 << c.reviewers.len()) - 1) as u8
}
pub fn acknowledge(c: &mut Commitment, g: &Group, member: Pubkey) -> Result<()> {
    require!(c.status == Lifecycle::Draft, ErrorCode::InvalidState);
    require!(c.mode <= 1, ErrorCode::WrongMode);
    let bit = 1u8 << reviewer_index(c, g, member)?;
    require!(c.acknowledgments & bit == 0, ErrorCode::DuplicateAction);
    c.acknowledgments |= bit;
    Ok(())
}
pub fn approve(c: &mut Commitment, g: &mut Group, member: Pubkey, now: i64) -> Result<()> {
    require!(c.status == Lifecycle::Active, ErrorCode::InvalidState);
    require!(c.mode <= 2, ErrorCode::WrongMode);
    require!(now <= c.review_deadline, ErrorCode::Deadline);
    let bit = 1u8 << reviewer_index(c, g, member)?;
    require!(c.approvals & bit == 0, ErrorCode::DuplicateAction);
    c.approvals |= bit;
    if c.mode == 2 || c.approvals == required_mask(c) {
        crate::escrow::finish(c, g, Lifecycle::Succeeded)?;
    }
    Ok(())
}
pub fn expire(c: &mut Commitment, g: &mut Group, now: i64) -> Result<()> {
    require!(c.mode <= 2, ErrorCode::WrongMode);
    require!(c.status == Lifecycle::Active, ErrorCode::InvalidState);
    require!(now > c.review_deadline, ErrorCode::Deadline);
    crate::escrow::finish(c, g, Lifecycle::Failed)
}
pub fn unresolved(c: &mut Commitment, g: &mut Group, now: i64) -> Result<()> {
    require!(c.mode == 3, ErrorCode::WrongMode);
    require!(c.status == Lifecycle::Active, ErrorCode::InvalidState);
    require!(now > c.hard_deadline, ErrorCode::Deadline);
    crate::escrow::finish(c, g, Lifecycle::Unresolved)
}
