import {
  Character,
  HistoryItem,
  InworldConnectionService,
} from "@inworld/web-sdk";
import { useCallback, useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useFormContext } from 'react-hook-form';
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

import { Route, Routes } from "react-router-dom";
import Home from "./app/Home/Home";
import Payment from "./app/Payment/Payment";
import axios from "axios";
import CheckOutWithStripe from "./app/Payment/CheckOutWithStripe";
import UploadImage from "./app/UploadImage/UploadImage";
// -------------------------------------------------

interface CurrentContext {
  characters: Character[];
  chatting: boolean;
  connection?: InworldConnectionService;
}

function App() {
  const formMethods = useForm<Configuration>();

  const [publishKey, setPublishKey] = useState("");

  const [initialized, setInitialized] = useState(false);
  const [connection, setConnection] = useState<InworldConnectionService>();
  const [character, setCharacter] = useState<Character>();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [chatHistory, setChatHistory] = useState<HistoryItem[]>([]);
  const [chatting, setChatting] = useState(true);


  

  const stateRef = useRef<CurrentContext>();
  stateRef.current = {
    characters,
    chatting,
    connection,
  };

  /*const onHistoryChange = useCallback((history: HistoryItem[]) => {
    setChatHistory(history);
  }, []);*/

  
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
      
        <Chat
          onStopChatting={stopChatting}
        />
    </>
  ) : (
    <ConfigView  />
  );

  return (
    <FormProvider {...formMethods}>
      {/* <Layout>{ initialized ? content : ''}</Layout> */}

      <ToastContainer autoClose={3000} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/payment/:email" element={<Payment />} />
        <Route path="/upload/:email" element={<UploadImage />} />
        <Route
          path="/payment/checkout/:priceId/:email"
          element={<CheckOutWithStripe />}
        />

        <Route
          path="/chat/:email"
          element={<Layout>{initialized ? content : ""} </Layout>}
        />
      </Routes>
    </FormProvider>
  );
}

export default App;
