// Code generated — DO NOT EDIT.
import { addSolanaContractMock, type SolanaContractMock, type SolanaMock } from '@chainlink/cre-sdk/test'

import { VOWPOOL_PROGRAM_ID } from './Vowpool'

export type VowpoolMock = SolanaContractMock

/**
 * Registers a Vowpool program mock on a SolanaMock instance.
 * The Solana CRE capability is write-only, so the mock routes writeReport
 * calls targeting this program's ID; set the returned mock's writeReport
 * property to define the reply.
 */
export function newVowpoolMock(
  solanaMock: SolanaMock,
  programId: string | Uint8Array = VOWPOOL_PROGRAM_ID,
): VowpoolMock {
  return addSolanaContractMock(solanaMock, { programId })
}
