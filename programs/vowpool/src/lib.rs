#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, Transfer},
};
pub mod error;
pub mod escrow;
pub mod oracle;
pub mod peer;
pub mod state;
pub use error::ErrorCode;
pub use state::*;
declare_id!("A2JT4HUJYEd3BL5xPXRiaXjvoFSMetY8zvLEPmRAxXPf");
#[program]
pub mod vowpool {
    use super::*;
    pub fn initialize_group(ctx: Context<InitializeGroup>, args: GroupArgs) -> Result<()> {
        peer::validate_group(&args, ctx.accounts.founder.key())?;
        require!(
            ctx.accounts.mint.decimals <= 18,
            ErrorCode::InvalidConfiguration
        );
        ctx.accounts.group.set_inner(Group {
            founder: ctx.accounts.founder.key(),
            bump: ctx.bumps.group,
            roster: args.roster,
            treasurer: args.treasurer,
            treasury_recipient: args.treasury_recipient,
            mint: ctx.accounts.mint.key(),
            vault: ctx.accounts.vault.key(),
            active: 0,
            refundable: 0,
            pool: 0,
            policy: args.policy,
        });
        Ok(())
    }
    pub fn create_commitment(ctx: Context<CreateCommitment>, args: CreateArgs) -> Result<()> {
        let commitment = peer::create(
            &ctx.accounts.group,
            ctx.accounts.group.key(),
            ctx.accounts.owner.key(),
            ctx.accounts.commitment.key(),
            ctx.bumps.commitment,
            args,
            Clock::get()?.unix_timestamp,
        )?;
        ctx.accounts.commitment.set_inner(commitment);
        Ok(())
    }
    pub fn acknowledge(ctx: Context<MemberAction>) -> Result<()> {
        peer::acknowledge(
            &mut ctx.accounts.commitment,
            &ctx.accounts.group,
            ctx.accounts.member.key(),
        )
    }
    pub fn activate(ctx: Context<Activate>) -> Result<()> {
        let c = &mut ctx.accounts.commitment;
        let g = &mut ctx.accounts.group;
        let now = Clock::get()?.unix_timestamp;
        require!(c.status == Lifecycle::Draft, ErrorCode::InvalidState);
        require!(now < c.goal_deadline, ErrorCode::Deadline);
        if c.mode <= 1 {
            require!(
                c.acknowledgments == peer::required_mask(c),
                ErrorCode::MissingAcknowledgments
            );
        }
        require!(
            ctx.accounts.vault.amount >= escrow::liabilities(g)?,
            ErrorCode::Accounting
        );
        if c.amount > 0 {
            token::transfer(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.source.to_account_info(),
                        to: ctx.accounts.vault.to_account_info(),
                        authority: ctx.accounts.owner.to_account_info(),
                    },
                ),
                c.amount,
            )?;
        }
        g.active = g
            .active
            .checked_add(c.amount)
            .ok_or(ErrorCode::Accounting)?;
        c.activated_at = now;
        c.status = Lifecycle::Active;
        Ok(())
    }
    pub fn approve(ctx: Context<MemberAction>) -> Result<()> {
        peer::approve(
            &mut ctx.accounts.commitment,
            &mut ctx.accounts.group,
            ctx.accounts.member.key(),
            Clock::get()?.unix_timestamp,
        )
    }
    pub fn settle_expired(ctx: Context<Settle>) -> Result<()> {
        peer::expire(
            &mut ctx.accounts.commitment,
            &mut ctx.accounts.group,
            Clock::get()?.unix_timestamp,
        )
    }
    pub fn resolve_unverified(ctx: Context<Settle>) -> Result<()> {
        peer::unresolved(
            &mut ctx.accounts.commitment,
            &mut ctx.accounts.group,
            Clock::get()?.unix_timestamp,
        )
    }
    pub fn release_refund(ctx: Context<ReleaseRefund>) -> Result<()> {
        escrow::refund_allowed(&ctx.accounts.commitment)?;
        let g = &mut ctx.accounts.group;
        let c = &mut ctx.accounts.commitment;
        require!(
            ctx.accounts.vault.amount >= escrow::liabilities(g)?,
            ErrorCode::Accounting
        );
        let seeds: &[&[u8]] = &[b"group", g.founder.as_ref(), &[g.bump]];
        if c.amount > 0 {
            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.vault.to_account_info(),
                        to: ctx.accounts.destination.to_account_info(),
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
    pub fn withdraw_pool(ctx: Context<WithdrawPool>, amount: u64) -> Result<()> {
        let g = &mut ctx.accounts.group;
        require!(amount > 0 && amount <= g.pool, ErrorCode::Accounting);
        require!(
            ctx.accounts.vault.amount >= escrow::liabilities(g)?,
            ErrorCode::Accounting
        );
        let seeds: &[&[u8]] = &[b"group", g.founder.as_ref(), &[g.bump]];
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.destination.to_account_info(),
                    authority: g.to_account_info(),
                },
                &[seeds],
            ),
            amount,
        )?;
        g.pool = g.pool.checked_sub(amount).ok_or(ErrorCode::Accounting)?;
        Ok(())
    }
    pub fn on_report<'info>(
        ctx: Context<'_, '_, '_, 'info, OnReport<'info>>,
        metadata: Vec<u8>,
        report: Vec<u8>,
    ) -> Result<()> {
        oracle::authenticate(
            &ctx.accounts.group,
            &ctx.accounts.state.to_account_info(),
            &ctx.accounts.forwarder_authority.to_account_info(),
            &metadata,
        )?;
        let r = OracleReport::try_from_slice(&report).map_err(|_| ErrorCode::InvalidReport)?;
        require_keys_eq!(
            r.commitment,
            ctx.accounts.commitment.key(),
            ErrorCode::InvalidReport
        );
        let now = Clock::get()?.unix_timestamp;
        match r.operation {
            0 | 1 => oracle::record(
                &mut ctx.accounts.commitment,
                &mut ctx.accounts.group,
                &r,
                &metadata,
                now,
            )?,
            2 => peer::expire(&mut ctx.accounts.commitment, &mut ctx.accounts.group, now)?,
            3 => oracle::release(
                &mut ctx.accounts.commitment,
                &mut ctx.accounts.group,
                ctx.remaining_accounts,
            )?,
            4 => peer::unresolved(&mut ctx.accounts.commitment, &mut ctx.accounts.group, now)?,
            _ => return err!(ErrorCode::InvalidReport),
        }
        emit!(ObservedReport { report: r });
        Ok(())
    }
}
#[derive(Accounts)]
pub struct InitializeGroup<'info> {
    #[account(mut)]
    pub founder: Signer<'info>,
    #[account(init,payer=founder,space=8+Group::INIT_SPACE,seeds=[b"group",founder.key().as_ref()],bump)]
    pub group: Box<Account<'info, Group>>,
    pub mint: Box<Account<'info, Mint>>,
    #[account(init,payer=founder,associated_token::mint=mint,associated_token::authority=group)]
    pub vault: Box<Account<'info, TokenAccount>>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
#[instruction(args:CreateArgs)]
pub struct CreateCommitment<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(seeds=[b"group",group.founder.as_ref()],bump=group.bump)]
    pub group: Box<Account<'info, Group>>,
    #[account(init,payer=owner,space=8+Commitment::INIT_SPACE,seeds=[b"commitment",group.key().as_ref(),owner.key().as_ref(),&args.nonce.to_le_bytes()],bump)]
    pub commitment: Box<Account<'info, Commitment>>,
    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct MemberAction<'info> {
    pub member: Signer<'info>,
    #[account(mut,seeds=[b"group",group.founder.as_ref()],bump=group.bump)]
    pub group: Box<Account<'info, Group>>,
    #[account(mut,has_one=group,seeds=[b"commitment",group.key().as_ref(),commitment.owner.as_ref(),&commitment.nonce.to_le_bytes()],bump=commitment.bump)]
    pub commitment: Box<Account<'info, Commitment>>,
}
#[derive(Accounts)]
pub struct Settle<'info> {
    #[account(mut,seeds=[b"group",group.founder.as_ref()],bump=group.bump)]
    pub group: Box<Account<'info, Group>>,
    #[account(mut,has_one=group,seeds=[b"commitment",group.key().as_ref(),commitment.owner.as_ref(),&commitment.nonce.to_le_bytes()],bump=commitment.bump)]
    pub commitment: Box<Account<'info, Commitment>>,
}
#[derive(Accounts)]
pub struct Activate<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut,seeds=[b"group",group.founder.as_ref()],bump=group.bump)]
    pub group: Box<Account<'info, Group>>,
    #[account(mut,has_one=group,has_one=owner,seeds=[b"commitment",group.key().as_ref(),owner.key().as_ref(),&commitment.nonce.to_le_bytes()],bump=commitment.bump)]
    pub commitment: Box<Account<'info, Commitment>>,
    #[account(address=group.mint)]
    pub mint: Box<Account<'info, Mint>>,
    #[account(mut,address=group.vault,associated_token::mint=mint,associated_token::authority=group)]
    pub vault: Box<Account<'info, TokenAccount>>,
    #[account(init_if_needed,payer=owner,associated_token::mint=mint,associated_token::authority=owner)]
    pub source: Box<Account<'info, TokenAccount>>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct ReleaseRefund<'info> {
    #[account(mut)]
    pub caller: Signer<'info>,
    /// CHECK: immutable commitment owner; ATA destination is constrained to this key.
    #[account(address=commitment.owner)]
    pub owner: UncheckedAccount<'info>,
    #[account(mut,seeds=[b"group",group.founder.as_ref()],bump=group.bump)]
    pub group: Box<Account<'info, Group>>,
    #[account(mut,has_one=group,seeds=[b"commitment",group.key().as_ref(),commitment.owner.as_ref(),&commitment.nonce.to_le_bytes()],bump=commitment.bump)]
    pub commitment: Box<Account<'info, Commitment>>,
    #[account(address=group.mint)]
    pub mint: Box<Account<'info, Mint>>,
    #[account(mut,address=group.vault,associated_token::mint=mint,associated_token::authority=group)]
    pub vault: Box<Account<'info, TokenAccount>>,
    #[account(init_if_needed,payer=caller,associated_token::mint=mint,associated_token::authority=owner)]
    pub destination: Box<Account<'info, TokenAccount>>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct WithdrawPool<'info> {
    #[account(mut,address=group.treasurer)]
    pub treasurer: Signer<'info>,
    /// CHECK: fixed treasury recipient; destination constrained to canonical ATA.
    #[account(address=group.treasury_recipient)]
    pub treasury_recipient: UncheckedAccount<'info>,
    #[account(mut,seeds=[b"group",group.founder.as_ref()],bump=group.bump)]
    pub group: Box<Account<'info, Group>>,
    #[account(address=group.mint)]
    pub mint: Box<Account<'info, Mint>>,
    #[account(mut,address=group.vault,associated_token::mint=mint,associated_token::authority=group)]
    pub vault: Box<Account<'info, TokenAccount>>,
    #[account(init_if_needed,payer=treasurer,associated_token::mint=mint,associated_token::authority=treasury_recipient)]
    pub destination: Box<Account<'info, TokenAccount>>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct OnReport<'info> {
    /// CHECK: exact configured forwarder state address and owner verified by authenticate.
    pub state: UncheckedAccount<'info>,
    pub forwarder_authority: Signer<'info>,
    #[account(mut,seeds=[b"group",group.founder.as_ref()],bump=group.bump)]
    pub group: Box<Account<'info, Group>>,
    #[account(mut,has_one=group,seeds=[b"commitment",group.key().as_ref(),commitment.owner.as_ref(),&commitment.nonce.to_le_bytes()],bump=commitment.bump)]
    pub commitment: Box<Account<'info, Commitment>>,
}
