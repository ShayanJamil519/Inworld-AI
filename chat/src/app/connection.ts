import {
  HistoryItem,
  InworldClient,
  InworldConnectionService,
} from '@inworld/web-sdk';
import { config } from '../config';

interface InworldServiceProps {
  sceneName: string;
  playerName: string;
  onReady: () => void;
  onDisconnect: () => void;
  onHistoryChange: (history: HistoryItem[]) => void;
}

export class InworldService {
  connection: InworldConnectionService;

  constructor(props: InworldServiceProps) {
    const client = new InworldClient()
      .setConfiguration({
        capabilities: { emotions: true, turnBasedStt: true },
      })
      .setUser({ fullName: props.playerName })
      .setScene(props.sceneName)
      .setGenerateSessionToken(this.generateSessionToken)
      .setOnError((err) => console.log(err))
      .setOnHistoryChange(props.onHistoryChange)
      .setOnReady(props.onReady)
      .setOnDisconnect(props.onDisconnect);

    this.connection = client.build();
  }

  private async generateSessionToken() {
    const response = await fetch(config.GENERATE_TOKEN_URL);

    return response.json();
  }
}
