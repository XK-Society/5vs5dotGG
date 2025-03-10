use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};
use crate::errors::ErrorCode;
use crate::player::{PlayerAccount, PlayerStats, Rarity, SpecialAbility};
use crate::utils::safe_update_stat;

// Creator Account Structure
#[account]
pub struct CreatorAccount {
    pub authority: Pubkey,
    pub name: String,
    pub verified: bool,
    pub creator_fee_basis_points: u16,
    pub collections_created: Vec<Pubkey>,
    pub total_athletes_created: u32,
    pub created_at: i64,
}

// Fixed size for account allocation
impl CreatorAccount {
    pub const LEN: usize = 
        8 + // discriminator
        32 + // authority pubkey
        36 + // name (max 32 chars)
        1 + // verified
        2 + // creator_fee_basis_points
        64 + // collections_created (variable size, estimate)
        4 + // total_athletes_created
        8; // created_at
}

// Context for registering a creator
#[derive(Accounts)]
pub struct RegisterCreator<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        init,
        payer = authority,
        space = CreatorAccount::LEN,
        seeds = [b"creator", authority.key().as_ref()],
        bump
    )]
    pub creator_account: Account<'info, CreatorAccount>,
    
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

// Context for creating an exclusive athlete
#[derive(Accounts)]
pub struct CreateExclusiveAthlete<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"creator", creator.key().as_ref()],
        bump,
        constraint = creator_account.authority == creator.key() @ ErrorCode::UnauthorizedAccess,
        constraint = creator_account.verified @ ErrorCode::CreatorNotVerified
    )]
    pub creator_account: Account<'info, CreatorAccount>,
    
    pub mint: Account<'info, anchor_spl::token::Mint>,
    
    #[account(
        init,
        payer = creator,
        space = PlayerAccount::LEN,
        seeds = [b"player", mint.key().as_ref()],
        bump
    )]
    pub player_account: Account<'info, PlayerAccount>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

// Register a new creator
pub fn register_creator(
    ctx: Context<RegisterCreator>,
    name: String,
    fee_basis_points: u16,
) -> Result<()> {
    // Validate fee basis points (0-1000 = 0-10%)
    if fee_basis_points > 1000 {
        return Err(ErrorCode::InvalidFeeBasisPoints.into());
    }
    
    let creator_account = &mut ctx.accounts.creator_account;
    let clock = Clock::get()?;
    
    creator_account.authority = ctx.accounts.authority.key();
    creator_account.name = name;
    creator_account.verified = false; // Starts unverified, admin would verify later
    creator_account.creator_fee_basis_points = fee_basis_points;
    creator_account.collections_created = Vec::new();
    creator_account.total_athletes_created = 0;
    creator_account.created_at = clock.unix_timestamp;
    
    Ok(())
}

// Create an exclusive athlete NFT
pub fn create_exclusive_athlete(
    ctx: Context<CreateExclusiveAthlete>,
    name: String,
    position: String,
    uri: String,
    predefined_stats: Option<PlayerStats>,
    collection_id: Option<Pubkey>,
    max_editions: Option<u64>,
) -> Result<()> {
    let creator_account = &mut ctx.accounts.creator_account;
    let player_account = &mut ctx.accounts.player_account;
    let clock = Clock::get()?;
    
    // Initialize basic player data
    player_account.owner = ctx.accounts.payer.key();
    player_account.mint = ctx.accounts.mint.key();
    player_account.name = name;
    player_account.position = position;
    player_account.created_at = clock.unix_timestamp;
    player_account.last_updated = clock.unix_timestamp;
    player_account.uri = uri;
    player_account.team = None;
    player_account.creator = Some(creator_account.key());
    player_account.is_exclusive = true;
    
    // Initialize stats - either from predefined values or with higher base values
    if let Some(stats) = predefined_stats {
        // Use predefined stats from the creator
        player_account.mechanical = stats.mechanical;
        player_account.game_knowledge = stats.game_knowledge;
        player_account.team_communication = stats.team_communication;
        player_account.adaptability = stats.adaptability;
        player_account.consistency = stats.consistency;
        player_account.form = stats.form;
        player_account.potential = stats.potential;
    } else {
        // Exclusive athletes have higher base stats (60-90 range instead of 50-80)
        player_account.mechanical = 60 + (get_random_value(&clock, 0) % 31) as u8;
        player_account.game_knowledge = 60 + (get_random_value(&clock, 1) % 31) as u8;
        player_account.team_communication = 60 + (get_random_value(&clock, 2) % 31) as u8;
        player_account.adaptability = 60 + (get_random_value(&clock, 3) % 31) as u8;
        player_account.consistency = 60 + (get_random_value(&clock, 4) % 31) as u8;
        player_account.form = 80; // Higher starting form
        player_account.potential = 70 + (get_random_value(&clock, 5) % 31) as u8; // 70-100 range
    }
    
    // Initialize game-specific data (empty for now)
    player_account.game_specific_data = Vec::new();
    
    // Initialize with a special creator ability
    player_account.special_abilities = vec![
        SpecialAbility {
            name: format!("{} Special", creator_account.name),
            value: 75 + (get_random_value(&clock, 6) % 26) as u8, // 75-100 range
        }
    ];
    
    // Initialize performance metrics
    player_account.experience = 0;
    player_account.matches_played = 0;
    player_account.wins = 0;
    player_account.mvp_count = 0;
    
    // Initialize history
    player_account.performance_history = Vec::new();
    
    // Set rarity based on potential (exclusive athletes are minimum Rare)
    if player_account.potential >= 90 {
        player_account.rarity = Rarity::Legendary;
    } else if player_account.potential >= 80 {
        player_account.rarity = Rarity::Epic;
    } else {
        player_account.rarity = Rarity::Rare;
    }
    
    // Update creator stats
    creator_account.total_athletes_created += 1;
    
    // If this is part of a collection, add to collections created if new
    if let Some(collection) = collection_id {
        if !creator_account.collections_created.contains(&collection) {
            creator_account.collections_created.push(collection);
        }
    }
    
    Ok(())
}

// Helper for random value generation
fn get_random_value(clock: &Clock, seed: u8) -> u64 {
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