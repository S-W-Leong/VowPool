use anchor_lang::prelude::*;
#[derive(AnchorSerialize,AnchorDeserialize,Clone,InitSpace)]
pub struct GithubConfig {
 #[max_len(39)] pub owner:String,
 #[max_len(100)] pub repo:String,
 pub pr:u32,
 #[max_len(100)] pub target_branch:String,
 pub policy_version:u16,
}
pub fn canonical_config(program:Pubkey,group:Pubkey,commitment:Pubkey,config:&GithubConfig,deadlines:[i64;3],cid:[u8;32],name:[u8;10],owner:[u8;20])->Vec<u8>{
 let mut bytes=Vec::new();
 (1u8,program,group,commitment,&config.owner,&config.repo,config.pr,&config.target_branch,deadlines[0],deadlines[1],deadlines[2],config.policy_version,cid,name,owner).serialize(&mut bytes).expect("bounded serialization");
 bytes
}
#[cfg(test)]
mod tests {
 use super::*;
 #[test]
 fn canonical_fixture_matches_client_bytes_and_hash(){
  let f:serde_json::Value=serde_json::from_str(include_str!("../../../tests/fixtures/canonical-v1.json")).unwrap();
  let c=GithubConfig{owner:"alice".into(),repo:"project".into(),pr:1,target_branch:"main".into(),policy_version:1};
  let bytes=canonical_config(Pubkey::default(),Pubkey::default(),Pubkey::default(),&c,[1000,1100,173900],[1;32],[2;10],[3;20]);
  let hex=|b:&[u8]|b.iter().map(|x|format!("{x:02x}")).collect::<String>();
  assert_eq!(hex(&bytes),f["configHex"].as_str().unwrap());
  assert_eq!(hex(&solana_sha256_hasher::hash(&bytes).to_bytes()),f["configHash"].as_str().unwrap());
 }
 #[test]
 fn canonical_terms_fixture_matches_borsh(){
  let f:serde_json::Value=serde_json::from_str(include_str!("../../../tests/fixtures/canonical-v1.json")).unwrap();
  let mut b=vec![];
  (1u8,Pubkey::default(),"Ship login".to_string(),"PR merged".to_string(),1250000u64,6u8,3u8,Vec::<Pubkey>::new(),1000i64,1100i64,None::<String>,Some(GithubConfig{owner:"alice".into(),repo:"project".into(),pr:1,target_branch:"main".into(),policy_version:1})).serialize(&mut b).unwrap();
  assert_eq!(b.iter().map(|x|format!("{x:02x}")).collect::<String>(),f["termsHex"].as_str().unwrap());
 }
}
