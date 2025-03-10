use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized access to account")]
    UnauthorizedAccess,
    
    #[msg("Player already has this ability")]
    AbilityAlreadyExists,
    
    #[msg("Player is already on a team")]
    PlayerAlreadyOnTeam,
    
    #[msg("Player is not on this team")]
    PlayerNotOnTeam,
    
    #[msg("Team roster is full")]
    TeamRosterFull,
    
    #[msg("Position is already filled on this team")]
    PositionAlreadyFilled,
    
    #[msg("Tournament is already full")]
    TournamentFull,
    
    #[msg("Tournament has already started")]
    TournamentAlreadyStarted,
    
    #[msg("Team is already registered for this tournament")]
    TeamAlreadyRegistered,
    
    #[msg("Creator is not verified")]
    CreatorNotVerified,
    
    #[msg("Fee basis points must be between 0-1000 (0-10%)")]
    InvalidFeeBasisPoints,
    
    #[msg("Match has already been recorded")]
    MatchAlreadyRecorded,
    
    #[msg("Invalid tournament parameters")]
    InvalidTournamentParameters,
    
    #[msg("Match not found in tournament")]
    MatchNotFound,
    
    #[msg("Invalid team ID")]
    InvalidTeamId,
    
    #[msg("Invalid tournament ID")]
    InvalidTournamentId,
}