use anchor_lang::prelude::*;
use std::str::FromStr;

// Safely update a stat with bounds checking
pub fn safe_update_stat(stat: &mut u8, change: i8) {
    if change > 0 {
        *stat = std::cmp::min(100, *stat as u16 + change as u16) as u8;
    } else {
        *stat = std::cmp::max(1, *stat as i16 + change as i16) as u8;
    }
}

// Generate pseudo-random value from clock and seed
pub fn get_random_value(clock: &Clock, seed: u8) -> u64 {
    let mut bytes = [0u8; 8];
    bytes[0] = seed;
    
    let timestamp_bytes = clock.unix_timestamp.to_le_bytes();
    for i in 0..std::cmp::min(7, timestamp_bytes.len()) {
        bytes[i + 1] = timestamp_bytes[i];
    }
    
    let mut value = u64::from_le_bytes(bytes);
    value = value.wrapping_mul(6364136223846793005).wrapping_add(1);
    
    value
}

// Verify that a pubkey is one of the specified admin keys
pub fn is_admin(_key: &Pubkey) -> bool {
    // For testing purposes, allow any key as admin
    true
    
    // For production, use proper admin checks:
    // let admin_key = Pubkey::from_str("57wMKYdCPiA8tn28t2ucZkxEz9Lvd9eMLDLXf5kJzR1h").unwrap();
    // *key == admin_key
}

// PDA helpers for finding various account addresses
pub mod pda {
    use super::*;
    
    pub fn find_player_address(mint: &Pubkey, program_id: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(&[b"player", mint.as_ref()], program_id)
    }
    
    pub fn find_team_address(owner: &Pubkey, name: &str, program_id: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(
            &[b"team", owner.as_ref(), name.as_bytes()],
            program_id
        )
    }
    
    pub fn find_creator_address(authority: &Pubkey, program_id: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(&[b"creator", authority.as_ref()], program_id)
    }
    
    pub fn find_tournament_address(authority: &Pubkey, name: &str, program_id: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(
            &[b"tournament", authority.as_ref(), name.as_bytes()],
            program_id
        )
    }
}