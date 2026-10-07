use crate::{state::*, ErrorCode};
use anchor_lang::prelude::*;
pub fn finish(c: &mut Commitment, g: &mut Group, status: Lifecycle) -> Result<()> {
    require!(c.status == Lifecycle::Active, ErrorCode::InvalidState);
    g.active = g
        .active
        .checked_sub(c.amount)
        .ok_or(ErrorCode::Accounting)?;
    if status == Lifecycle::Failed {
        g.pool = g.pool.checked_add(c.amount).ok_or(ErrorCode::Accounting)?;
    } else {
        require!(
            status == Lifecycle::Succeeded || status == Lifecycle::Unresolved,
            ErrorCode::InvalidState
        );
        g.refundable = g
            .refundable
            .checked_add(c.amount)
            .ok_or(ErrorCode::Accounting)?;
    }
    c.status = status;
    Ok(())
}
pub fn liabilities(g: &Group) -> Result<u64> {
    g.active
        .checked_add(g.refundable)
        .and_then(|v| v.checked_add(g.pool))
        .ok_or(ErrorCode::Accounting.into())
}
pub fn refund_allowed(c: &Commitment) -> Result<()> {
    require!(
        c.status == Lifecycle::Succeeded || c.status == Lifecycle::Unresolved,
        ErrorCode::InvalidState
    );
    require!(!c.refund_released, ErrorCode::RefundReleased);
    Ok(())
}
