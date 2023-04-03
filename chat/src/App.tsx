import {
  Character,
  HistoryItem,
  InworldConnectionService,
} from "@inworld/web-sdk";
import { useCallback, useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import "./App.css";
import { Layout } from "./app/components/Layout";
import { Configuration } from "./app/types";
import { ConfigView } from "./app/configuration/ConfigView";
import { InworldService } from "./app/connection";
import { Chat } from "./app/chat/Chat";
import * as defaults from "./defaults";
import {
  get as getConfiguration,
  save as saveConfiguration,
} from "./app/helpers/configuration";

import { Route, Routes } from "react-router";
import Home from "./app/Home/Home";
import Payment from "./app/Payment/Payment";

// -------------------------------------------------

interface CurrentContext {
  characters: Character[];
  chatting: boolean;
  connection?: InworldConnectionService;
}

function App() {
  const formMethods = useForm<Configuration>();

  const [initialized, setInitialized] = useState(false);
  const [connection, setConnection] = useState<InworldConnectionService>();
  const [character, setCharacter] = useState<Character>();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [chatHistory, setChatHistory] = useState<HistoryItem[]>([]);
  const [chatting, setChatting] = useState(false);
  const [playerName, setPlayerName] = useState("");

  const stateRef = useRef<CurrentContext>();
  stateRef.current = {
    characters,
    chatting,
    connection,
  };

  const onHistoryChange = useCallback((history: HistoryItem[]) => {
    setChatHistory(history);
  }, []);

  const openConnection = useCallback(async () => {
    const form = formMethods.getValues();

    setChatting(true);
    setPlayerName(form.player?.name!);

    const service = new InworldService({
      onHistoryChange,
      sceneName: form.scene?.name!,
      playerName: form.player?.name!,
      onReady: async () => {
        console.log("Ready!");
      },
      onDisconnect: () => {
        console.log("Disconnect!");
      },
    });
    const characters = await service.connection.getCharacters();
    const character = characters.find(
      (c: Character) => c.getResourceName() === form.character?.name
    );

    if (character) {
      service.connection.setCurrentCharacter(character);
    }

    setConnection(service.connection);

    setCharacter(character);
    setCharacters(characters);
  }, [formMethods, onHistoryChange]);

  const stopChatting = useCallback(async () => {
    // Disable flags
    setChatting(false);

    // Stop audio playing and capturing
    connection?.player?.stop();
    connection?.player?.clear();
    connection?.recorder?.stop();

    // Clear collections
    setChatHistory([]);

    // Close connection and clear connection data
    connection?.close();
    setConnection(undefined);
    setCharacter(undefined);
    setCharacters([]);
  }, [connection]);

  const resetForm = useCallback(() => {
    formMethods.reset({
      ...defaults.configuration,
    });
    saveConfiguration(formMethods.getValues());
  }, [formMethods]);

  useEffect(() => {
    const configuration = getConfiguration();

    formMethods.reset({
      ...(configuration
        ? (JSON.parse(configuration) as Configuration)
        : defaults.configuration),
    });

    setInitialized(true);
  }, [formMethods]);

  const content = chatting ? (
    <>
      {character ? (
        <Chat
          character={character}
          chatHistory={chatHistory}
          connection={connection!}
          playerName={playerName}
          onStopChatting={stopChatting}
        />
      ) : (
        "Loading..."
      )}
    </>
  ) : (
    <ConfigView onStart={openConnection} onResetForm={resetForm} />
  );

  return (
    <FormProvider {...formMethods}>
      {/* <Layout>{ initialized ? content : ''}</Layout> */}
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/payment" element={<Payment />} />

          <Route path="/chat" element={initialized ? content : ""} />
        </Routes>
      </Layout>
    </FormProvider>
  );
}

export default App;
