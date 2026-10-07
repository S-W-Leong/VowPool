//! LOCAL TEST DOUBLE ONLY. Deliberately unrestricted forwarding; never deploy to Devnet.
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    instruction::{AccountMeta, Instruction},
    program::invoke_signed,
    pubkey::Pubkey,
    system_instruction,
    sysvar::{rent::Rent, Sysvar},
};
entrypoint!(process);
fn process(id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    let mut iter = accounts.iter();
    if data[0] == 0 {
        let payer = next_account_info(&mut iter)?;
        let state = next_account_info(&mut iter)?;
        let system = next_account_info(&mut iter)?;
        let (key, bump) = Pubkey::find_program_address(&[b"state"], id);
        assert_eq!(key, *state.key);
        return invoke_signed(
            &system_instruction::create_account(
                payer.key,
                state.key,
                Rent::get()?.minimum_balance(0),
                0,
                id,
            ),
            &[payer.clone(), state.clone(), system.clone()],
            &[&[b"state", &[bump]]],
        );
    }
    let state = next_account_info(&mut iter)?;
    let authority = next_account_info(&mut iter)?;
    let receiver = next_account_info(&mut iter)?;
    let (_, bump) = Pubkey::find_program_address(
        &[b"forwarder", state.key.as_ref(), receiver.key.as_ref()],
        id,
    );
    let metas = accounts
        .iter()
        .enumerate()
        .filter(|(i, _)| *i != 2)
        .map(|(i, a)| AccountMeta {
            pubkey: *a.key,
            is_signer: i == 1,
            is_writable: a.is_writable,
        })
        .collect();
    let mut payload = vec![214, 173, 18, 221, 173, 148, 151, 208];
    payload.extend_from_slice(&data[1..]);
    invoke_signed(
        &Instruction {
            program_id: *receiver.key,
            accounts: metas,
            data: payload,
        },
        accounts,
        &[&[
            b"forwarder",
            state.key.as_ref(),
            receiver.key.as_ref(),
            &[bump],
        ]],
    )
}
