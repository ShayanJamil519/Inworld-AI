import { CopyAll, Mic, Send, VolumeUp, VolumeOff } from "@mui/icons-material";
import Carousel from "react-material-ui-carousel";
import {
  Button,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Container,
  Box,
} from "@mui/material";
import {
  Character,
  CHAT_HISTORY_TYPE,
  HistoryItem,
  InworldConnectionService,
} from "@inworld/web-sdk";

import { History } from "./History";
import { useCallback, useEffect, useState } from "react";
import { Stack } from "@mui/system";
import { CopyConfirmedDialog } from "./CopyConfirmedDialog";
import { RecordIcon } from "./Chat.styled";
import { useLocation, useNavigate } from "react-router-dom";
import axios, { AxiosPromise } from "axios";

interface ChatProps {
  character: Character;
  chatHistory: HistoryItem[];
  connection: InworldConnectionService;
  playerName: string;
  onStopChatting: () => void;
  onStopAudio: () => void;
}

interface fetchData {
  (): Promise<Number>;
}
export function Chat(props: ChatProps) {
  const {
    character,
    chatHistory,
    connection,
    playerName,
    onStopChatting,
    onStopAudio,
  } = props;

  const [text, setText] = useState("");
  const [copyDestination, setCopyDestination] = useState("");
  const [copyConfirmOpen, setCopyConfirmOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isaudio, setIsAudio] = useState(true);
  const [images, setImages] = useState([]);
  const [hasPlayedWorkaroundSound, setHasPlayedWorkaroundSound] =
    useState(false);
  const search = useLocation().search;
  const email = new URLSearchParams(search).get("email");
  const navigate = useNavigate();

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setText(e.target.value);
    },
    []
  );

  function paymentPage() {
    navigate(`/payment/${email}`);
  }

  async function fetchData(): Promise<Number> {
    var result = 10;
    console.log(email);
    const { data } = await axios.get(
      `http://localhost:4000/payment/package/${email}`
    );
    if (data.package == 0) {
      const { data } = await axios.get(`http://localhost:4000/api/user/limit`);
      if (data.message == "nice") {
        console.log("Working Great h");
        result = 1;
      }
    }
    if (data.package == 1) {
      const { data } = await axios.get(
        `http://localhost:4000/api/standarduser/limit`
      );
      if (data.message == "nice") {
        console.log("Working Great");
        result = 2;
      }
    }
    if (data.package == 2) {
      const { data } = await axios.get(
        `http://localhost:4000/api/premiumuser/limit`
      );
      if (data.message == "nice") {
        console.log("Working Great");
        result = 3;
      }
    }
    return result;
  }

  const formatTranscript = useCallback(
    (messages: HistoryItem[]) => {
      let transcript = "";
      let characterLastSpeaking = false; // Used to combine all Character text chunks

      messages.forEach((item) => {
        switch (item.type) {
          case CHAT_HISTORY_TYPE.ACTOR:
            const isCharacter = item.source.isCharacter;
            const givenName = isCharacter
              ? item.character?.getDisplayName()
              : playerName;

            transcript +=
              characterLastSpeaking && isCharacter
                ? item.text
                : `\n${givenName}: ${item.text}`;
            characterLastSpeaking = isCharacter;
            break;
        }
      });

      return transcript;
    },
    [playerName]
  );

  const getTranscript = useCallback(
    (messages: HistoryItem[], startId?: string, endId?: string) => {
      if (!messages.length) {
        return "";
      }

      // get full array by default
      let startIndex: number = 0;
      let endIndex: number = messages.length - 1;

      if (startId || endId) {
        // find start/end indexes of the slice if ids are specified
        messages.forEach((item, index) => {
          if (item.id === startId) {
            startIndex = index;
          }

          if (item.id === endId) {
            endIndex = index;
          }
        });
      }

      if (endIndex < startIndex) {
        const tmp = startIndex;
        startIndex = endIndex;
        endIndex = tmp;
      }

      // generate eventual transcript
      return formatTranscript(messages.slice(startIndex, endIndex + 1));
    },
    [formatTranscript]
  );

  const handleCopyClick = useCallback(async () => {
    const history = getTranscript(chatHistory);

    if (navigator.clipboard) {
      navigator.clipboard.writeText(history).then(() => {
        setCopyDestination("clipboard");
      });
    } else {
      setCopyDestination("console");
    }

    setCopyConfirmOpen(true);
  }, [getTranscript, chatHistory]);

  const stopRecording = useCallback(() => {
    connection.recorder.stop();
    setIsRecording(false);
    connection.sendAudioSessionEnd();
  }, [connection]);

  const startRecording = useCallback(async () => {
    try {
      connection.sendAudioSessionStart();
      await connection.recorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error(e);
    }
  }, [connection]);

  const playWorkaroundSound = useCallback(() => {
    // Workaround for browsers with restrictive auto-play policies
    connection.player.playWorkaroundSound();
    setHasPlayedWorkaroundSound(true);
  }, [connection, setHasPlayedWorkaroundSound]);

  async function asyncHandleSendData() {
    if (text) {
      var result = await fetchData();
      if (result == 1 || result == 2 || result == 3) {
        console.log("succ");
        !hasPlayedWorkaroundSound && playWorkaroundSound();
        connection?.sendText(text);
        setText("");
      }
    }
  }

  const handleSpeakClick = useCallback(async () => {
    var result = await fetchData();
    if (result == 1 || result == 2 || result == 3) {
      !hasPlayedWorkaroundSound && playWorkaroundSound();
      if (isRecording) {
        stopRecording();
        connection.sendAudioSessionEnd();
        setIsRecording(false);
        return;
      }
    }

    return startRecording();
  }, [
    connection,
    hasPlayedWorkaroundSound,
    isRecording,
    playWorkaroundSound,
    startRecording,
    stopRecording,
  ]);

  const handleAudioClick = useCallback(async () => {
    setIsAudio(!isaudio);
    return onStopAudio();
  }, [isaudio]);

  // const fadeImages = [
  //   {
  //     url: "https://images.unsplash.com/photo-1509721434272-b79147e0e708?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80",
  //   },
  //   {
  //     url: "https://images.unsplash.com/photo-1506710507565-203b9f24669b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1536&q=80",
  //   },
  //   {
  //     url: "https://images.unsplash.com/photo-1536987333706-fc9adfb10d91?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80",
  //   },
  // ];

  const [fadeImages, setFadeImages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await axios.get(`http://localhost:4000/api/img/all`);
      const images = data.images[0].images.map((image: any) => ({
        url: image.url,
      }));
      setFadeImages(images);
    };
    fetchData();
  }, []);
  return (
    <>
      <Grid container sx={{ mb: 2, mt: 10 }}>
        <Grid
          item
          xs={12}
          sm={6}
          sx={{
            backgroundColor: "white",
            padding: "0.5rem 1.5rem",

            borderRadius: "1rem",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <History
            history={chatHistory}
            character={character}
            playerName={playerName}
          />
          <Stack direction="row-reverse" sx={{ mb: "1" }}>
            <IconButton onClick={handleCopyClick}>
              <CopyAll fontSize="small" />
            </IconButton>
          </Stack>
          <Stack direction="row" alignItems="center" gap={1}>
            <TextField
              variant="standard"
              fullWidth
              value={text}
              onChange={handleTextChange}
              sx={{
                backgroundColor: (theme) => theme.palette.grey[100],
                borderRadius: "1rem",
                padding: "1rem",
                // width: "auto",
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={asyncHandleSendData}>
                      <Send />
                    </IconButton>
                  </InputAdornment>
                ),
                disableUnderline: true,
              }}
            />
            <IconButton
              onClick={handleSpeakClick}
              sx={{
                height: "3rem",
                width: "3rem",
                backgroundColor: "#F1F5F9",
              }}
            >
              {isRecording ? <RecordIcon /> : <Mic />}
            </IconButton>
            <IconButton
              onClick={handleAudioClick}
              sx={{
                height: "3rem",
                width: "3rem",
                backgroundColor: "#F1F5F9",
              }}
            >
              {isaudio ? <VolumeUp /> : <VolumeOff />}
            </IconButton>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={1} />
        <Grid
          item
          xs={12}
          sm={5}
          sx={{
            backgroundColor: "white",
            padding: "0.5rem 1.5rem",
            borderRadius: "1rem",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <img
            alt={character.getDisplayName()}
            src={character.getAssets().rpmImageUriPortrait}
          />

          <Carousel>
            {/* {fadeImages &&
              fadeImages.map((item, i) => (
                <img
                  // className="CarouselImage"
                  style={{ width: "500px", height: "500px" }}
                  key={i}
                  src={item.url}
                  alt={`${i} Slide`}
                />
              ))} */}
            {fadeImages &&
              fadeImages.map((item: any, i) => (
                <div
                  style={{
                    width: "500px",
                    height: "500px",
                    backgroundColor: "yellow",
                  }}
                >
                  <img
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "100%",
                    }}
                    key={i}
                    src={item.url}
                    alt={`${i} Slide`}
                  />
                </div>
              ))}
          </Carousel>
        </Grid>
      </Grid>
      <Grid
        container
        mt={1}
        spacing={2}
        alignItems="center"
        justifyContent={"flex-start"}
      >
        <Grid item>
          <Button variant="outlined" onClick={onStopChatting}>
            Back to settings
          </Button>
        </Grid>
        <Grid item>
          <Button variant="outlined" onClick={paymentPage}>
            Donation
          </Button>
        </Grid>
      </Grid>
      <CopyConfirmedDialog
        copyConfirmOpen={copyConfirmOpen}
        copyDestination={copyDestination}
        setCopyConfirmOpen={setCopyConfirmOpen}
      />
    </>
  );
}

// marginRight: "230px",
