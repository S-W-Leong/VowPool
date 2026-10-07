# Canonical encoding v1

Borsh integers are little endian; strings are u32 byte length then exact UTF-8. No implicit trimming/normalization after user confirmation. Public keys are 32 decoded bytes, arrays raw bytes, vectors u32 count. Option: u8 tag, then value when present. Modes single/multiple/group/github = 0/1/2/3. SHA-256 hashes the exact bytes.

Terms order: version u8=1, owner pubkey, goal string, criteria string, stake u64 base units, token decimals u8, mode u8, reviewer pubkey vector (ordered), goal i64, review i64, consequence Option<string>, GitHub Option<config>. Config inside terms: owner string, repo string, PR u32, branch string, policy version u16=1.

GitHub binding order: version u8=1, program/group/commitment pubkeys, owner string, repo string, PR u32, branch string, goal/review/hard i64, policy u16=1, workflow CID[32], name[10], owner[20]. Hard = review + 172800 seconds.

`tests/fixtures/canonical-v1.json` was independently encoded with Python struct/UTF-8, then checked against TypeScript and Rust Borsh. Monetary conversion always uses bigint; values beyond JS safe integer precision never pass through Number.

GitHub identity mismatches and malformed/future evidence are UNKNOWN. Valid evidence on the wrong branch is PENDING before deadline and FAIL strictly afterward. API status other than 200 is UNKNOWN. Repository owner/name comparison is case-insensitive; branch comparison is exact.
