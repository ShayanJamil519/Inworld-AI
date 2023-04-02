export type ConfigurationCharacter = {
  name?: string;
};

export type ConfigurationScene = {
  name?: string;
};

export type ConfigurationPlayer = {
  name?: string;
};

export type Configuration = {
  character?: ConfigurationCharacter;
  scene?: ConfigurationScene;
  player?: ConfigurationPlayer;
};
