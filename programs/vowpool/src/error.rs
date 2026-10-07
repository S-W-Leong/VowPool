use anchor_lang::prelude::*;
#[error_code]
pub enum ErrorCode {
    #[msg("Invalid forwarder authority")]
    InvalidForwarderAuthority,
    #[msg("Wrong forwarder state or owner")]
    InvalidForwarderState,
    #[msg("Workflow metadata must be exactly 64 bytes")]
    InvalidMetadata,
    #[msg("Unauthorized workflow identity")]
    InvalidWorkflow,
    #[msg("Invalid immutable terms or group configuration")]
    InvalidConfiguration,
    #[msg("Only an eligible group member may perform this action")]
    Unauthorized,
    #[msg("Action is not allowed in the current lifecycle state")]
    InvalidState,
    #[msg("Required reviewer acknowledgments are missing")]
    MissingAcknowledgments,
    #[msg("This reviewer has already recorded this action")]
    DuplicateAction,
    #[msg("Action is outside the permitted deadline window")]
    Deadline,
    #[msg("Checked accounting overflow or insufficient balance")]
    Accounting,
    #[msg("Mode does not permit this operation")]
    WrongMode,
    #[msg("Invalid, stale or substituted oracle observation")]
    InvalidReport,
    #[msg("Refund already released")]
    RefundReleased,
}
