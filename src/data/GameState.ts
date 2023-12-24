enum GameState {
  // === Pre-Game ===
  INTRO,
  START_MENU,
  ABOUT,
  // === Game ===
  // == Pre-March ==
  GAME_INTRO,
  REQUISITION_SUPPLIES,
  // == Marching ==
  MARCHING,
  MARCHING_REST,
  MARCHING_ENCOUNTER,
  // === Destinations ===
  DESTINATION_INTRO,
  DESTINATION_ENCOUNTER,
  DESTINATION_SCAVENGE,
  DESTINATION_DESTROY,
}

export default GameState;
