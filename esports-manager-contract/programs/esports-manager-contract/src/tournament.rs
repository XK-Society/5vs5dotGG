use anchor_lang::prelude::*;
use crate::errors::ErrorCode;
use crate::team::TeamAccount;

// Tournament Account Structure
#[account]
pub struct TournamentAccount {
    pub authority: Pubkey,
    pub name: String,
    pub entry_fee: u64,
    pub prize_pool: u64,
    pub start_time: i64,
    pub end_time: Option<i64>,
    pub max_teams: u8,
    pub registered_teams: Vec<Pubkey>,
    pub matches: Vec<TournamentMatch>,
    pub status: TournamentStatus,
    pub created_at: i64,
}

// Fixed size for account allocation
impl TournamentAccount {
    pub const LEN: usize = 
        8 + // discriminator
        32 + // authority pubkey
        36 + // name (max 32 chars)
        8 + // entry_fee
        8 + // prize_pool
        8 + // start_time
        9 + // end_time (Option<i64>)
        1 + // max_teams
        64 + // registered_teams (variable size, estimate)
        200 + // matches (variable size, estimate)
        1 + // status
        8; // created_at
}

// Tournament match data
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct TournamentMatch {
    pub match_id: String,
    pub timestamp: i64,
    pub team_a: Pubkey,
    pub team_b: Pubkey,
    pub winner: Option<Pubkey>,
    pub score: [u8; 2],
    pub round: u8,
    pub completed: bool,
}

// Tournament status enum
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum TournamentStatus {
    Registration,
    InProgress,
    Completed,
    Canceled,
}

// Context for creating a tournament
#[derive(Accounts)]
#[instruction(name: String, entry_fee: u64, start_time: i64, max_teams: u8)]
pub struct CreateTournament<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        init,
        payer = authority,
        space = TournamentAccount::LEN,
        seeds = [b"tournament", authority.key().as_ref(), name.as_bytes()],
        bump
    )]
    pub tournament_account: Account<'info, TournamentAccount>,
    
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

// Context for registering a team for a tournament
#[derive(Accounts)]
pub struct RegisterTeamForTournament<'info> {
    #[account(mut)]
    pub team_owner: Signer<'info>,
    
    #[account(
        mut,
        constraint = team_account.owner == team_owner.key() @ ErrorCode::UnauthorizedAccess
    )]
    pub team_account: Account<'info, TeamAccount>,
    
    #[account(
        mut,
        constraint = tournament_account.status == TournamentStatus::Registration @ ErrorCode::TournamentAlreadyStarted,
        constraint = tournament_account.registered_teams.len() < tournament_account.max_teams as usize @ ErrorCode::TournamentFull,
        constraint = !tournament_account.registered_teams.contains(&team_account.key()) @ ErrorCode::TeamAlreadyRegistered
    )]
    pub tournament_account: Account<'info, TournamentAccount>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

// Context for recording a match result
#[derive(Accounts)]
pub struct RecordMatchResult<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        constraint = tournament_account.authority == authority.key() @ ErrorCode::UnauthorizedAccess,
        constraint = tournament_account.status == TournamentStatus::InProgress @ ErrorCode::TournamentAlreadyStarted
    )]
    pub tournament_account: Account<'info, TournamentAccount>,
    
    #[account(mut)]
    pub winner_team: Account<'info, TeamAccount>,
    
    #[account(mut)]
    pub loser_team: Account<'info, TeamAccount>,
}

// Create a new tournament
pub fn create_tournament(
    ctx: Context<CreateTournament>,
    name: String,
    entry_fee: u64,
    start_time: i64,
    max_teams: u8,
) -> Result<()> {
    let tournament_account = &mut ctx.accounts.tournament_account;
    let clock = Clock::get()?;
    
    // Validate tournament parameters
    if max_teams < 2 || max_teams > 64 {
        return Err(ErrorCode::InvalidTournamentParameters.into());
    }
    
    if start_time <= clock.unix_timestamp {
        return Err(ErrorCode::InvalidTournamentParameters.into());
    }
    
    // Initialize tournament account
    tournament_account.authority = ctx.accounts.authority.key();
    tournament_account.name = name;
    tournament_account.entry_fee = entry_fee;
    tournament_account.prize_pool = 0;
    tournament_account.start_time = start_time;
    tournament_account.end_time = None;
    tournament_account.max_teams = max_teams;
    tournament_account.registered_teams = Vec::new();
    tournament_account.matches = Vec::new();
    tournament_account.status = TournamentStatus::Registration;
    tournament_account.created_at = clock.unix_timestamp;
    
    Ok(())
}

// Register a team for a tournament
pub fn register_team(
    ctx: Context<RegisterTeamForTournament>,
    tournament_id: Pubkey,
    team_id: Pubkey,
) -> Result<()> {
    let tournament_account = &mut ctx.accounts.tournament_account;
    let team_account = &ctx.accounts.team_account;
    
    // Verify the provided IDs match the accounts
    require!(
        tournament_account.key() == tournament_id,
        ErrorCode::InvalidTournamentId
    );
    
    require!(
        team_account.key() == team_id,
        ErrorCode::InvalidTeamId
    );
    
    // Add team to tournament
    tournament_account.registered_teams.push(team_account.key());
    
    // Add entry fee to prize pool
    tournament_account.prize_pool += tournament_account.entry_fee;
    
    // If tournament is full, generate initial matches
    if tournament_account.registered_teams.len() >= tournament_account.max_teams as usize {
        generate_tournament_matches(tournament_account)?;
    }
    
    Ok(())
}

// Record a match result in the tournament
pub fn record_match_result(
    ctx: Context<RecordMatchResult>,
    match_id: String,
    winner_id: Pubkey,
    loser_id: Pubkey,
    score: [u8; 2],
    match_data: Vec<u8>,
) -> Result<()> {
    let tournament_account = &mut ctx.accounts.tournament_account;
    let winner_team = &ctx.accounts.winner_team;
    let loser_team = &ctx.accounts.loser_team;
    
    // Verify that the provided IDs match the accounts
    require!(
        winner_team.key() == winner_id,
        ErrorCode::InvalidTeamId
    );
    
    require!(
        loser_team.key() == loser_id,
        ErrorCode::InvalidTeamId
    );
    
    let clock = Clock::get()?;
    
    // Find the match in the tournament
    let match_index = tournament_account.matches
        .iter()
        .position(|m| 
            (m.team_a == winner_id && m.team_b == loser_id) || 
            (m.team_a == loser_id && m.team_b == winner_id)
        )
        .ok_or(ErrorCode::MatchNotFound)?;
    
    let tournament_match = &mut tournament_account.matches[match_index];
    
    // Ensure match hasn't already been recorded
    if tournament_match.completed {
        return Err(ErrorCode::MatchAlreadyRecorded.into());
    }
    
    // Update match result
    tournament_match.winner = Some(winner_id);
    tournament_match.score = score;
    tournament_match.timestamp = clock.unix_timestamp;
    tournament_match.completed = true;
    
    // Store match data in the blockchain for later reference
    // In a production system, you would likely have more efficient storage
    msg!("Match {} result recorded: {} vs {}", 
        match_id, 
        score[0], 
        score[1]
    );
    
    // Check if all matches in the current round are completed
    let current_round = tournament_match.round;
    let all_completed = tournament_account.matches
        .iter()
        .filter(|m| m.round == current_round)
        .all(|m| m.completed);
    
    // If all matches in the round are completed, generate next round matches
    if all_completed {
        generate_next_round_matches(tournament_account, current_round)?;
    }
    
    // Check if tournament is completed
    check_tournament_completion(tournament_account);
    
    Ok(())
}

// Helper function to generate initial tournament matches
fn generate_tournament_matches(tournament: &mut TournamentAccount) -> Result<()> {
    // Set tournament status to in progress
    tournament.status = TournamentStatus::InProgress;
    
    // Simple bracket generation (would be more sophisticated in real implementation)
    let teams = tournament.registered_teams.clone();
    
    for i in 0..(teams.len() / 2) {
        let team_a = teams[i];
        let team_b = teams[teams.len() - 1 - i];
        
        tournament.matches.push(TournamentMatch {
            match_id: format!("R1_M{}", i + 1),
            timestamp: 0, // Will be set when match is recorded
            team_a,
            team_b,
            winner: None,
            score: [0, 0],
            round: 1,
            completed: false,
        });
    }
    
    Ok(())
}

// Helper function to generate matches for the next round
fn generate_next_round_matches(tournament: &mut TournamentAccount, completed_round: u8) -> Result<()> {
    // Get winners from the completed round
    let winners: Vec<Pubkey> = tournament.matches
        .iter()
        .filter(|m| m.round == completed_round && m.completed)
        .map(|m| m.winner.unwrap())
        .collect();
    
    // If only one winner, tournament is completed
    if winners.len() == 1 {
        return Ok(());
    }
    
    // Generate next round matches
    for i in 0..(winners.len() / 2) {
        let team_a = winners[i];
        let team_b = winners[winners.len() - 1 - i];
        
        tournament.matches.push(TournamentMatch {
            match_id: format!("R{}_M{}", completed_round + 1, i + 1),
            timestamp: 0,
            team_a,
            team_b,
            winner: None,
            score: [0, 0],
            round: completed_round + 1,
            completed: false,
        });
    }
    
    Ok(())
}

// Helper function to check if tournament is completed
fn check_tournament_completion(tournament: &mut TournamentAccount) {
    // Find the highest round
    let max_round = tournament.matches
        .iter()
        .map(|m| m.round)
        .max()
        .unwrap_or(0);
    
    // Check if all matches in the highest round are completed
    let final_matches: Vec<&TournamentMatch> = tournament.matches
        .iter()
        .filter(|m| m.round == max_round)
        .collect();
    
    // If there's only one match in the highest round and it's completed, tournament is done
    if final_matches.len() == 1 && final_matches[0].completed {
        tournament.status = TournamentStatus::Completed;
        tournament.end_time = Some(Clock::get().unwrap().unix_timestamp);
        
        // In a real implementation, distribute prizes here
    }
}