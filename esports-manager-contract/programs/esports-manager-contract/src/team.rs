use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use crate::errors::ErrorCode;
use crate::player::PlayerAccount;

// Team Account Structure
#[account]
pub struct TeamAccount {
    pub owner: Pubkey,
    pub name: String,
    pub collection_mint: Option<Pubkey>,  // Team as a Metaplex Collection (if implemented)
    pub logo_uri: String,
    pub created_at: i64,
    pub last_updated: i64,
    pub roster: Vec<RosterPosition>,      // List of players and their positions
    pub statistics: TeamStatistics,
    pub match_history: Vec<TeamMatchResult>,
}

// Fixed size for account allocation
impl TeamAccount {
    pub const LEN: usize = 
        8 + // discriminator
        32 + // owner pubkey
        36 + // name (max 32 chars)
        33 + // collection_mint (Option<Pubkey>)
        36 + // logo_uri (max 32 chars)
        8 + // created_at
        8 + // last_updated
        200 + // roster (variable size, estimate for 5 players)
        64 + // statistics
        200; // match_history (variable size, estimate)
}

// Player position in a team
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct RosterPosition {
    pub player_mint: Pubkey,
    pub position: String,
    pub added_at: i64,
}

// Team statistics
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct TeamStatistics {
    pub matches_played: u32,
    pub wins: u32,
    pub losses: u32,
    pub tournament_wins: u32,
    pub avg_mechanical: u8,
    pub avg_game_knowledge: u8,
    pub avg_team_communication: u8,
    pub synergy_score: u8,  // Calculated based on player compatibility
}

// Match result for team
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct TeamMatchResult {
    pub match_id: String,
    pub timestamp: i64,
    pub opponent: Pubkey,
    pub win: bool,
    pub score: [u8; 2],  // [team_score, opponent_score]
    pub tournament_id: Option<Pubkey>,
}

// Context for creating a team
#[derive(Accounts)]
#[instruction(name: String, logo_uri: String)] // Add this line to access instruction parameters
pub struct CreateTeam<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(
        init,
        payer = owner,
        space = TeamAccount::LEN,
        seeds = [b"team", owner.key().as_ref(), name.as_bytes()], // Now 'name' is accessible
        bump
    )]
    pub team_account: Account<'info, TeamAccount>,
    
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

// Context for adding a player to a team
#[derive(Accounts)]
pub struct AddPlayerToTeam<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"team", owner.key().as_ref(), team_account.name.as_bytes()],
        bump,
        constraint = team_account.owner == owner.key() @ ErrorCode::UnauthorizedAccess
    )]
    pub team_account: Account<'info, TeamAccount>,
    
    #[account(
        mut,
        seeds = [b"player", player_mint.key().as_ref()],
        bump,
        constraint = player_account.team.is_none() @ ErrorCode::PlayerAlreadyOnTeam
    )]
    pub player_account: Account<'info, PlayerAccount>,
    
    // To this:
#[account(
    constraint = player_account.mint == player_mint.key()
)]
pub player_mint: Account<'info, anchor_spl::token::Mint>,
}

// Context for removing a player from a team
#[derive(Accounts)]
pub struct RemovePlayerFromTeam<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"team", owner.key().as_ref(), team_account.name.as_bytes()],
        bump,
        constraint = team_account.owner == owner.key() @ ErrorCode::UnauthorizedAccess
    )]
    pub team_account: Account<'info, TeamAccount>,
    
    #[account(
        mut,
        seeds = [b"player", player_mint.key().as_ref()],
        bump,
        constraint = player_account.team == Some(team_account.key()) @ ErrorCode::PlayerNotOnTeam
    )]
    pub player_account: Account<'info, PlayerAccount>,
    
    /// The mint of the player NFT
    pub player_mint: Account<'info, Mint>,
}

// Modify the create_team function to process name
pub fn create_team(
    ctx: Context<CreateTeam>,
    name: String,
    logo_uri: String,
) -> Result<()> {
    let name_bytes = name.as_bytes();
    let team_account = &mut ctx.accounts.team_account;
    let clock = Clock::get()?;
    
    // Initialize team account
    team_account.owner = ctx.accounts.owner.key();
    team_account.name = name;
    team_account.logo_uri = logo_uri;
    team_account.collection_mint = None; // Would be set if using Metaplex Collection
    team_account.created_at = clock.unix_timestamp;
    team_account.last_updated = clock.unix_timestamp;
    team_account.roster = Vec::new();
    team_account.statistics = TeamStatistics::default();
    team_account.match_history = Vec::new();
    
    Ok(())
}

// Add a player to a team
pub fn add_player_to_team(
    ctx: Context<AddPlayerToTeam>,
    player_mint: Pubkey,
    position: String,
) -> Result<()> {
    let team_account = &mut ctx.accounts.team_account;
    let player_account = &mut ctx.accounts.player_account;
    let clock = Clock::get()?;
    
    // Check if team roster is full (max 5 players for this example)
    if team_account.roster.len() >= 5 {
        return Err(ErrorCode::TeamRosterFull.into());
    }
    
    // Check if this position is already filled
    if team_account.roster.iter().any(|p| p.position == position) {
        return Err(ErrorCode::PositionAlreadyFilled.into());
    }
    
    // Add player to team roster
    team_account.roster.push(RosterPosition {
        player_mint,
        position: position.clone(),
        added_at: clock.unix_timestamp,
    });
    
    // Update player's team reference
    player_account.team = Some(team_account.key());
    
    // Update team statistics based on new player addition
    update_team_statistics(team_account);
    
    // Update last updated timestamp
    team_account.last_updated = clock.unix_timestamp;
    
    Ok(())
}

// Remove a player from a team
pub fn remove_player_from_team(
    ctx: Context<RemovePlayerFromTeam>,
    player_mint: Pubkey,
) -> Result<()> {
    let team_account = &mut ctx.accounts.team_account;
    let player_account = &mut ctx.accounts.player_account;
    let clock = Clock::get()?;
    
    // Find player index in roster
    let player_index = team_account.roster
        .iter()
        .position(|p| p.player_mint == player_mint)
        .ok_or(ErrorCode::PlayerNotOnTeam)?;
    
    // Remove player from roster
    team_account.roster.remove(player_index);
    
    // Clear player's team reference
    player_account.team = None;
    
    // Update team statistics
    update_team_statistics(team_account);
    
    // Update last updated timestamp
    team_account.last_updated = clock.unix_timestamp;
    
    Ok(())
}

// Helper function to update team statistics based on current roster
fn update_team_statistics(team: &mut TeamAccount) {
    // In a real implementation, this would fetch all player accounts
    // and calculate aggregate statistics
    
    // For this example, we'll just set some placeholder values
    // In a real implementation, you would use a CPI to get player stats
    let roster_size = team.roster.len();
    if roster_size > 0 {
        team.statistics.avg_mechanical = 70;
        team.statistics.avg_game_knowledge = 65;
        team.statistics.avg_team_communication = 75;
        
        // Calculate synergy score based on time played together
        // Teams with players who have been together longer have better synergy
        let current_time = Clock::get().unwrap().unix_timestamp;
        let avg_time_together = team.roster.iter()
            .map(|p| current_time - p.added_at)
            .sum::<i64>() / roster_size as i64;
        
        // Convert to days and cap at 30 days for max synergy
        let days_together = (avg_time_together / 86400) as u8;
        let base_synergy = 60u8;
        let time_bonus = std::cmp::min(20, days_together / 2);
        
        team.statistics.synergy_score = base_synergy + time_bonus;
    } else {
        team.statistics.avg_mechanical = 0;
        team.statistics.avg_game_knowledge = 0;
        team.statistics.avg_team_communication = 0;
        team.statistics.synergy_score = 0;
    }
}

// Record a new match result for the team
pub fn record_team_match_result(
    team: &mut TeamAccount,
    match_id: String,
    opponent: Pubkey,
    win: bool,
    score: [u8; 2],
    tournament_id: Option<Pubkey>,
) -> Result<()> {
    let clock = Clock::get()?;
    
    // Update team statistics
    team.statistics.matches_played += 1;
    if win {
        team.statistics.wins += 1;
    } else {
        team.statistics.losses += 1;
    }
    
    // Add match to history (keeping only the most recent 10 matches)
    team.match_history.push(TeamMatchResult {
        match_id,
        timestamp: clock.unix_timestamp,
        opponent,
        win,
        score,
        tournament_id,
    });
    
    if team.match_history.len() > 10 {
        team.match_history.remove(0);
    }
    
    // Update last updated timestamp
    team.last_updated = clock.unix_timestamp;
    
    Ok(())
}

// Helper to check if a player is on a specific team
pub fn is_player_on_team(team: &TeamAccount, player_mint: &Pubkey) -> bool {
    team.roster.iter().any(|p| p.player_mint == *player_mint)
}