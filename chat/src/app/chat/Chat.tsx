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
import { InworldService } from "../connection";

import { History } from "./History";
import { useCallback, useEffect, useState } from "react";
import { Stack } from "@mui/system";
import { CopyConfirmedDialog } from "./CopyConfirmedDialog";
import { RecordIcon } from "./Chat.styled";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios, { AxiosPromise } from "axios";

interface ChatProps {
  onStopChatting: () => void;
}

interface fetchData {
  (): Promise<Number>;
}
// export function Chat() {
export function Chat(props: ChatProps) {
  const { onStopChatting } = props;

  const [text, setText] = useState("");
  const [copyDestination, setCopyDestination] = useState("");
  const [copyConfirmOpen, setCopyConfirmOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isaudio, setIsAudio] = useState(true);
  const [playerName, setPlayerName] = useState("");
  const [chatting, setChatting] = useState(false);
  const [connection, setConnection] = useState<InworldConnectionService>();
  const [chatHistory, setChatHistory] = useState<HistoryItem[]>([]);
  const [characterNamee, setcharacterName] = useState("");
  const [sceneNamee, setsceneName] = useState("");
  const [hasPlayedWorkaroundSound, setHasPlayedWorkaroundSound] =
    useState(false);
  const [character, setCharacter] = useState<Character>();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [audio, setAudio] = useState(true);
  //const search = useLocation().search;
  //const email = new URLSearchParams(search).get("email");
  const { email } = useParams();
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

  function uploadPage() {
    navigate(`/upload`);
  }
  const stopAudio = useCallback(async () => {}, [connection, audio]);

  async function fetchData(): Promise<Number> {
    var result = 10;
    console.log(email);
    const { data } = await axios.get(
      `https://dull-red-ant-hem.cyclic.app/payment/package/${email}`
    );
    if (data.package == 0) {
      try {
        const { data } = await axios.get(
          `https://dull-red-ant-hem.cyclic.app/api/user/limit`
        );
        if (data.message == "nice") {
          console.log("Working Great h");
          result = 1;
        }
      } catch (error) {
        console.log("I am catch error", error);
      }
    }
    if (data.package == 1) {
      const { data } = await axios.get(
        `https://dull-red-ant-hem.cyclic.app/api/standarduser/limit`
      );
      if (data.message == "nice") {
        console.log("Working Great");
        result = 2;
      }
    }
    if (data.package == 2) {
      const { data } = await axios.get(
        `https://dull-red-ant-hem.cyclic.app/api/premiumuser/limit`
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
    connection?.recorder.stop();
    setIsRecording(false);
    connection?.sendAudioSessionEnd();
  }, [connection]);

  const startRecording = useCallback(async () => {
    try {
      connection?.sendAudioSessionStart();
      await connection?.recorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error(e);
    }
  }, [connection]);

  const playWorkaroundSound = useCallback(() => {
    // Workaround for browsers with restrictive auto-play policies
    connection?.player.playWorkaroundSound();
    setHasPlayedWorkaroundSound(true);
  }, [connection, setHasPlayedWorkaroundSound]);

  async function asyncHandleSendData() {
    if (text) {
      var result = await fetchData();
      console.log("res" + result);
      if (result == 10) {
        toast.error(
          "You have completed your api limits .Please upgrade to a Higher Package"
        );
        navigate(`/payment/${email}`);
      }
      if (result == 1 || result == 2 || result == 3) {
        console.log("succ");
        !hasPlayedWorkaroundSound && playWorkaroundSound();
        connection?.sendText(text);
        setText("");
      }
    }
  }

  const handleSpeakClick = useCallback(async () => {
    !hasPlayedWorkaroundSound && playWorkaroundSound();
    if (isRecording) {
      stopRecording();
      connection?.sendAudioSessionEnd();
      setIsRecording(false);
      return;
    }
    var result = await fetchData();
    if (result == 1 || result == 2 || result == 3) {
      return startRecording();
    }
    if (result == 10) {
      toast.error(
        "You have completed you api limits .Please upgrade to a Higher Package"
      );
    }
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
    setAudio(!audio);
    console.log("this was called");
    connection?.player?.mute(audio);
  }, [isaudio, connection, audio]);

  const [fadeImages, setFadeImages] = useState([]);

  const onHistoryChange = useCallback((history: HistoryItem[]) => {
    setChatHistory(history);
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await axios.get(`https://dull-red-ant-hem.cyclic.app/payment/names`);

        setcharacterName(data?.characterName);
        setsceneName(data?.sceneName);
        setChatting(true);
        console.log("first check made" + data.sceneName);
        console.log("sceneNamee" + sceneNamee);
        console.log("charNamee" + characterNamee);
        localStorage.setItem("email", email!);
      } catch (error) {
        console.error(error);
      }
    };
    fetchPost();
    const fetchData = async () => {
      console.log("Second check Made");
      setChatting(true);
      setPlayerName("Participant");

      const service = new InworldService({
        onHistoryChange,
        sceneName: sceneNamee,
        playerName: "Participant",
        onReady: async () => {
          console.log("Ready!");
        },
        onDisconnect: () => {
          console.log("Disconnect!");
        },
      });
      const characters = await service.connection.getCharacters();
      const character = characters.find(
        (c: Character) => c.getResourceName() === characterNamee
      );

      if (character) {
        service.connection.setCurrentCharacter(character);
      }

      setConnection(service.connection);
      setCharacter(character);
      setCharacters(characters);
      const { data } = await axios.get(`https://dull-red-ant-hem.cyclic.app/api/img/all`);
      const images = data.images[0].images.map((image: any) => ({
        url: image.url,
      }));
      setFadeImages(images);
    };
    fetchData();
  }, [characterNamee, sceneNamee]);
  return (
    <>
      <Grid container sx={{ mb: 2, mt: 10 }}>
        <Grid
          item
          xs={12}
          sm={6}
          sx={{
            backgroundColor: "white",
            padding: {
              lg: "0.5rem 1.5rem",
              sm: "0.5rem 0rem",
            },

            borderRadius: "1rem",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <History
            history={chatHistory}
            character={character!}
            playerName={playerName}
          />
          <Stack direction="row-reverse" sx={{ mb: "1" }}>
            <IconButton onClick={handleCopyClick}>
              <CopyAll fontSize="small" />
            </IconButton>
          </Stack>
          <Stack
            direction={"row"}
            alignItems="center"
            gap={1}
            padding={"0 0.5rem"}
          >
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
            padding: " 1.5rem",
            borderRadius: "1rem",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Carousel>
            {fadeImages &&
              fadeImages.map((item: any, i) => (
                <div
                  style={{
                    width: "100%",
                    height: "420px",
                  }}
                >
                  <img
                    style={{
                      objectFit: "fill",
                      width: "100%",
                      height: "100%",
                      borderRadius: "5px",
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
        {/* <Grid item>
          <Button variant="outlined" onClick={onStopChatting}>
            Back to settings
          </Button>
        </Grid> */}
        <Grid item>
          <Button
            sx={{
              backgroundColor: "#3b5998",
              fontSize: {
                lg: "20px",
                sm: "16px",
              },
              color: "white",
              padding: "6px 45px",
              "&:hover": {
                backgroundColor: "#4a6aaf",
              },
            }}
            onClick={paymentPage}
          >
            Donation
          </Button>
        </Grid>
{email=="mrazacule@gmail.com"||email=="elatetechsolutions@gmail.com" ?(
        <Grid item>
          <Button
            sx={{
              backgroundColor: "#3b5998",
              fontSize: {
                lg: "20px",
                sm: "16px",
              },
              color: "white",
              padding: "6px 45px",
              "&:hover": {
                backgroundColor: "#4a6aaf",
              },
            }}
            onClick={uploadPage}
          >
            Upload
          </Button>
        </Grid>):(
          ""
        )}
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
