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
  // == Destinations ==
  DESTINATION_INTRO,
  DESTINATION,
  // == Encounters ==
  ENCOUNTER_INTRO,
  ENCOUNTER,
  // == Misc. ==
  MILITARY_INFO,
  OPTIONS,
  USE_MEDKITS,
  DAILY_HISTORY,
}

export default GameState;
