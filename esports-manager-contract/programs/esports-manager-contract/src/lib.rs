use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use std::str::FromStr;

// Import other modules
pub mod player;
pub mod team;
pub mod creator;
pub mod tournament;
pub mod errors;
pub mod utils;

// Use components from modules
use player::*;
use team::*;
use creator::*;
use tournament::*;
use errors::*;

declare_id!("2KBakNVa6xLxp6uQsgHhikrknw1pkjkS2f6ZGKtV5BzZ");

#[program]
pub mod esports_manager {
    use super::*;

    // Player Management Functions
    pub fn initialize_player(
        ctx: Context<InitializePlayer>,
        name: String,
        position: String,
        game_specific_data: Vec<u8>,
        uri: String,
    ) -> Result<()> {
        player::initialize_player(ctx, name, position, game_specific_data, uri)
    }

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
        player::update_player_performance(
            ctx,
            match_id,
            win,
            mvp,
            exp_gained,
            mechanical_change,
            game_knowledge_change,
            team_communication_change,
            adaptability_change,
            consistency_change,
            form_change,
            match_stats,
        )
    }

    pub fn train_player(
        ctx: Context<TrainPlayer>,
        training_type: TrainingType,
        intensity: u8,
    ) -> Result<()> {
        player::train_player(ctx, training_type, intensity)
    }

    pub fn add_special_ability(
        ctx: Context<AddSpecialAbility>,
        ability_name: String,
        ability_value: u8,
    ) -> Result<()> {
        player::add_special_ability(ctx, ability_name, ability_value)
    }

    // Team Management Functions
    pub fn create_team(
        ctx: Context<CreateTeam>,
        name: String, 
        logo_uri: String
    ) -> Result<()> {
        team::create_team(ctx, name, logo_uri)
    }

    pub fn add_player_to_team(
        ctx: Context<AddPlayerToTeam>,
        player_mint: Pubkey,
        position: String
    ) -> Result<()> {
        team::add_player_to_team(ctx, player_mint, position)
    }

    pub fn remove_player_from_team(
        ctx: Context<RemovePlayerFromTeam>,
        player_mint: Pubkey
    ) -> Result<()> {
        team::remove_player_from_team(ctx, player_mint)
    }

    pub fn register_creator(
        ctx: Context<RegisterCreator>,
        name: String,
        fee_basis_points: u16,
    ) -> Result<()> {
        creator::register_creator(ctx, name, fee_basis_points)
    }

    // In lib.rs, inside the #[program] pub mod esports_manager { ... } block:

    // Add this after register_creator
    pub fn verify_creator(ctx: Context<VerifyCreator>) -> Result<()> {
        creator::verify_creator(ctx)
    }

    pub fn create_exclusive_athlete(
        ctx: Context<CreateExclusiveAthlete>,
        name: String,
        position: String,
        uri: String,
        predefined_stats: Option<PlayerStats>,
        collection_id: Option<Pubkey>,
        max_editions: Option<u64>,
    ) -> Result<()> {
        creator::create_exclusive_athlete(
            ctx, 
            name, 
            position, 
            uri, 
            predefined_stats, 
            collection_id, 
            max_editions
        )
    }

    // Tournament System Functions
    pub fn create_tournament(
        ctx: Context<CreateTournament>,
        name: String,
        entry_fee: u64,
        start_time: i64,
        max_teams: u8
    ) -> Result<()> {
        tournament::create_tournament(ctx, name, entry_fee, start_time, max_teams)
    }

    pub fn register_team_for_tournament(
        ctx: Context<RegisterTeamForTournament>,
        tournament_id: Pubkey,
        team_id: Pubkey
    ) -> Result<()> {
        tournament::register_team(ctx, tournament_id, team_id)
    }

    pub fn record_match_result(
        ctx: Context<RecordMatchResult>,
        match_id: String,
        winner_id: Pubkey,
        loser_id: Pubkey,
        score: [u8; 2],
        match_data: Vec<u8>
    ) -> Result<()> {
        tournament::record_match_result(ctx, match_id, winner_id, loser_id, score, match_data)
    }
}