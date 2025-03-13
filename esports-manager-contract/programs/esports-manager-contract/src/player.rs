use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};
use crate::errors::ErrorCode;
use crate::utils::{get_random_value, safe_update_stat};

// Player Account Structure
#[account]
pub struct PlayerAccount {
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub name: String,
    pub position: String,
    pub created_at: i64,
    pub last_updated: i64,
    pub team: Option<Pubkey>,
    pub uri: String,
    
    // Basic stats (0-100 scale)
    pub mechanical: u8,
    pub game_knowledge: u8,
    pub team_communication: u8,
    pub adaptability: u8,
    pub consistency: u8,
    
    // Special abilities
    pub special_abilities: Vec<SpecialAbility>,
    
    // Game-specific data (e.g., champion proficiencies in MOBA)
    pub game_specific_data: Vec<u8>,
    
    // Performance metrics
    pub experience: u32,
    pub matches_played: u32,
    pub wins: u32,
    pub mvp_count: u32,
    pub form: u8,
    pub potential: u8,
    pub rarity: Rarity,
    
    // Creator information (for exclusive athletes)
    pub creator: Option<Pubkey>,
    pub is_exclusive: bool,
    
    // Match history (recent matches only, full history stored off-chain)
    pub performance_history: Vec<MatchPerformance>,
}

// Fixed size for account allocation
impl PlayerAccount {
    pub const LEN: usize = 
        8 + // discriminator
        32 + // owner pubkey
        32 + // mint pubkey
        36 + // name (max 32 chars)
        36 + // position (max 32 chars)
        8 + // created_at
        8 + // last_updated
        33 + // team (Option<Pubkey>)
        36 + // uri (max 32 chars)
        1 + // mechanical
        1 + // game_knowledge
        1 + // team_communication
        1 + // adaptability
        1 + // consistency
        64 + // special_abilities (variable size, estimate)
        64 + // game_specific_data (variable size, estimate)
        4 + // experience
        4 + // matches_played
        4 + // wins
        4 + // mvp_count
        1 + // form
        1 + // potential
        1 + // rarity
        1 + // is_exclusive
        33 + // creator (Option<Pubkey>)
        128; // performance_history (variable size, estimate)
}

// Special ability structure
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct SpecialAbility {
    pub name: String,
    pub value: u8,
}

// Match performance record
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct MatchPerformance {
    pub match_id: String,
    pub timestamp: i64,
    pub win: bool,
    pub mvp: bool,
    pub exp_gained: u32,
    pub stats: Vec<u8>, // Compact binary format for detailed stats
}

// Player stats for predefined values
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct PlayerStats {
    pub mechanical: u8,
    pub game_knowledge: u8,
    pub team_communication: u8,
    pub adaptability: u8,
    pub consistency: u8,
    pub potential: u8,
    pub form: u8,
}

// Rarity enum
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum Rarity {
    Common,
    Uncommon,
    Rare,
    Epic,
    Legendary,
}

// Training type enum
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum TrainingType {
    Mechanical,
    GameKnowledge,
    TeamCommunication,
    Adaptability,
    Consistency,
}

// Context for initializing a new player NFT
#[derive(Accounts)]
pub struct InitializePlayer<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub mint: Account<'info, anchor_spl::token::Mint>,
    
    #[account(
        init,
        payer = owner,
        space = PlayerAccount::LEN,
        seeds = [b"player", mint.key().as_ref()],
        bump
    )]
    pub player_account: Account<'info, PlayerAccount>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

// Context for updating player performance
#[derive(Accounts)]
pub struct UpdatePlayerPerformance<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"player", player_account.mint.as_ref()],
        bump,
        constraint = player_account.owner == owner.key() @ ErrorCode::UnauthorizedAccess
    )]
    pub player_account: Account<'info, PlayerAccount>,
}

// Context for training a player
#[derive(Accounts)]
pub struct TrainPlayer<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"player", player_account.mint.as_ref()],
        bump,
        constraint = player_account.owner == owner.key() @ ErrorCode::UnauthorizedAccess
    )]
    pub player_account: Account<'info, PlayerAccount>,
}

// Context for adding special ability
#[derive(Accounts)]
pub struct AddSpecialAbility<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"player", player_account.mint.as_ref()],
        bump,
        constraint = player_account.owner == owner.key() @ ErrorCode::UnauthorizedAccess
    )]
    pub player_account: Account<'info, PlayerAccount>,
    
    // Optional admin account for authorized abilities
    // pub admin: Option<Account<'info, AdminAccount>>,
}

// Initialize a new player NFT with starting attributes
pub fn initialize_player(
    ctx: Context<InitializePlayer>,
    name: String,
    position: String,
    game_specific_data: Vec<u8>,
    uri: String,
) -> Result<()> {
    let player_account = &mut ctx.accounts.player_account;
    let clock = Clock::get()?;
    
    player_account.owner = ctx.accounts.owner.key();
    player_account.mint = ctx.accounts.mint.key();
    player_account.name = name;
    player_account.position = position;
    player_account.created_at = clock.unix_timestamp;
    player_account.last_updated = clock.unix_timestamp;
    player_account.game_specific_data = game_specific_data;
    player_account.uri = uri;
    player_account.team = None;
    player_account.creator = None;
    player_account.is_exclusive = false;
    
    // Initialize base stats with randomized starting values
    player_account.mechanical = 50 + (get_random_value(&clock, 0) % 31) as u8; // 50-80 range
    player_account.game_knowledge = 50 + (get_random_value(&clock, 1) % 31) as u8;
    player_account.team_communication = 50 + (get_random_value(&clock, 2) % 31) as u8;
    player_account.adaptability = 50 + (get_random_value(&clock, 3) % 31) as u8;
    player_account.consistency = 50 + (get_random_value(&clock, 4) % 31) as u8;
    
    // Initialize special abilities (if any)
    player_account.special_abilities = Vec::new();
    
    // Initialize performance metrics
    player_account.experience = 0;
    player_account.matches_played = 0;
    player_account.wins = 0;
    player_account.mvp_count = 0;
    player_account.form = 70;
    player_account.potential = 50 + (get_random_value(&clock, 5) % 51) as u8; // 50-100 range
    
    // Initialize history
    player_account.performance_history = Vec::new();
    
    // Set rarity based on potential
    if player_account.potential >= 90 {
        player_account.rarity = Rarity::Legendary;
    } else if player_account.potential >= 80 {
        player_account.rarity = Rarity::Epic;
    } else if player_account.potential >= 70 {
        player_account.rarity = Rarity::Rare;
    } else if player_account.potential >= 60 {
        player_account.rarity = Rarity::Uncommon;
    } else {
        player_account.rarity = Rarity::Common;
    }
    
    Ok(())
}

// Update player stats after a match
pub fn update_player_performance(
    ctx: Context<UpdatePlayerPerformance>,
    match_id: String,
    win: bool,
    mvp: bool,
    exp_gained: u32,
    mechanical_change: i8,
    game_knowledge_change: i8,
    team_communication_change: i8,
    adaptability_change: i8,
    consistency_change: i8,
    form_change: i8,
    match_stats: Vec<u8>,
) -> Result<()> {
    let player_account = &mut ctx.accounts.player_account;
    let clock = Clock::get()?;
    
    // Update last updated timestamp
    player_account.last_updated = clock.unix_timestamp;
    
    // Update match statistics
    player_account.matches_played += 1;
    if win {
        player_account.wins += 1;
    }
    if mvp {
        player_account.mvp_count += 1;
    }
    
    // Update experience
    player_account.experience += exp_gained;
    
    // Apply stat changes (with limits)
    safe_update_stat(&mut player_account.mechanical, mechanical_change);
    safe_update_stat(&mut player_account.game_knowledge, game_knowledge_change);
    safe_update_stat(&mut player_account.team_communication, team_communication_change);
    safe_update_stat(&mut player_account.adaptability, adaptability_change);
    safe_update_stat(&mut player_account.consistency, consistency_change);
    
    // Update form (can go up and down more freely, but still limited to 0-100)
    player_account.form = std::cmp::min(
        100,
        std::cmp::max(
            0,
            player_account.form as i16 + form_change as i16
        ) as u8
    );
    
    // Add match to performance history
    add_match_to_history(player_account, match_id, win, mvp, match_stats, exp_gained, clock.unix_timestamp);
    
    // Check for leveling up/unlocking special abilities
    check_for_level_ups(player_account);
    
    Ok(())
}

// Train player (improve specific stat)
// In player.rs
pub fn train_player(
    ctx: Context<TrainPlayer>,
    training_type: TrainingType,
    intensity: u8,
) -> Result<()> {
    let player_account = &mut ctx.accounts.player_account;
    let clock = Clock::get()?;
    
    // Calculate training effectiveness (based on intensity, player form, and some randomness)
    // Use checked math to prevent overflow
    let effectiveness = u8::try_from(
        (intensity as u16).saturating_mul(player_account.form as u16) / 100
    ).unwrap_or(255);
    
    let random_factor = (get_random_value(&clock, 0) % 5) as i8 - 2; // -2 to +2 range
    
    // Calculate stat improvement (1-5 points typically)
    // Use saturating operations to prevent overflow
    let improvement = std::cmp::max(1, effectiveness.saturating_div(20).saturating_add(random_factor.max(0) as u8)) as i8;
    
    // Apply improvement to the specific stat
    match training_type {
        TrainingType::Mechanical => safe_update_stat(&mut player_account.mechanical, improvement),
        TrainingType::GameKnowledge => safe_update_stat(&mut player_account.game_knowledge, improvement),
        TrainingType::TeamCommunication => safe_update_stat(&mut player_account.team_communication, improvement),
        TrainingType::Adaptability => safe_update_stat(&mut player_account.adaptability, improvement),
        TrainingType::Consistency => safe_update_stat(&mut player_account.consistency, improvement),
    }
    
    // Training affects form (high intensity can reduce form)
    if intensity > 70 {
        player_account.form = std::cmp::max(1, player_account.form.saturating_sub((intensity - 70) / 10));
    }
    
    // Update last updated timestamp
    player_account.last_updated = clock.unix_timestamp;
    
    Ok(())
}

// Add special ability to player
pub fn add_special_ability(
    ctx: Context<AddSpecialAbility>,
    ability_name: String,
    ability_value: u8,
) -> Result<()> {
    let player_account = &mut ctx.accounts.player_account;
    
    // Check if already has this ability
    if player_account.special_abilities.iter().any(|a| a.name == ability_name) {
        return Err(ErrorCode::AbilityAlreadyExists.into());
    }
    
    // Add the new ability
    player_account.special_abilities.push(SpecialAbility {
        name: ability_name,
        value: ability_value,
    });
    
    Ok(())
}

// Add a match performance to player history (keeping only recent matches)
fn add_match_to_history(
    player: &mut PlayerAccount,
    match_id: String,
    win: bool,
    mvp: bool,
    match_stats: Vec<u8>,
    exp_gained: u32,
    timestamp: i64,
) {
    // Create new record
    let performance = MatchPerformance {
        match_id,
        timestamp,
        win,
        mvp,
        exp_gained,
        stats: match_stats,
    };
    
    // Add to history (keeping only the most recent 5 matches)
    player.performance_history.push(performance);
    
    if player.performance_history.len() > 5 {
        player.performance_history.remove(0);
    }
}

// Check for level ups or special ability unlocks based on experience and performance
fn check_for_level_ups(player: &mut PlayerAccount) {
    // Potential increases slightly based on performance
    if player.matches_played % 10 == 0 && player.wins > player.matches_played / 2 {
        player.potential = std::cmp::min(100, player.potential + 1);
    }
    
    // Unlock special abilities based on performance thresholds
    if player.mvp_count >= 5 && !player.special_abilities.iter().any(|a| a.name == "Clutch Factor") {
        player.special_abilities.push(SpecialAbility {
            name: String::from("Clutch Factor"),
            value: 50 + (player.mvp_count as u8 / 2),
        });
    }
    
    // Additional ability unlocks based on specialized performance
    if player.mechanical >= 90 && !player.special_abilities.iter().any(|a| a.name == "Perfect Execution") {
        player.special_abilities.push(SpecialAbility {
            name: String::from("Perfect Execution"),
            value: player.mechanical - 30,
        });
    }
    
    if player.team_communication >= 85 && player.matches_played >= 20 && 
       !player.special_abilities.iter().any(|a| a.name == "Shot Caller") {
        player.special_abilities.push(SpecialAbility {
            name: String::from("Shot Caller"),
            value: 70 + ((player.team_communication - 85) / 3),
        });
    }
}