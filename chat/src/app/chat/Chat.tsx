import {
  CopyAll,
  Mic,
  Send,
  VolumeUp,
  VolumeOff
} from '@mui/icons-material';
import { Button, Grid, IconButton, InputAdornment, TextField } from '@mui/material';
import { Character, CHAT_HISTORY_TYPE, HistoryItem, InworldConnectionService  } from '@inworld/web-sdk';

import { History } from './History';
import { useCallback, useEffect, useState } from 'react';
import { Stack } from '@mui/system';
import { CopyConfirmedDialog } from './CopyConfirmedDialog';
import { RecordIcon } from './Chat.styled';
import { useLocation } from "react-router-dom";
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
    onStopAudio
  } = props;

  const [text, setText] = useState('');
  const [copyDestination, setCopyDestination] = useState('');
  const [copyConfirmOpen, setCopyConfirmOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isaudio, setIsAudio] = useState(true);
  const [hasPlayedWorkaroundSound, setHasPlayedWorkaroundSound] = useState(false);
  const search = useLocation().search;
  const email = new URLSearchParams(search).get("email");

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  }, []);

  async function fetchData() : Promise<Number> {
    var result=3;
    console.log(email)
    const {data} = await axios.get(
      `http://localhost:4000/payment/package/${email}`
    );
    if(data.package==0){
      const {data} = await axios.get(
        `http://localhost:4000/api/user/limit`)
        if (data.message=="nice"){
          console.log("Working Great")
          result = 1;
        }
    }
    if(data.package==1){
      const {data} = await axios.get(
        `http://localhost:4000/api/standarduser/limit`)
        if (data.message=="nice"){
          console.log("Working Great")
          result = 2;
        }
    }
    if(data.package==2){
      const {data} = await axios.get(
        `http://localhost:4000/api/premiumuser/limit`)
        if (data.message=="nice"){
          console.log("Working Great")
          result = 3;
        }
    }
    return result;

  }

  const formatTranscript = useCallback(
    (messages: HistoryItem[]) => {
      let transcript = '';
      let characterLastSpeaking = false; // Used to combine all Character text chunks

      messages.forEach((item) => {
        switch (item.type) {
          case CHAT_HISTORY_TYPE.ACTOR:
            const isCharacter = item.source.isCharacter;
            const givenName = isCharacter
              ? item.character?.getDisplayName()
              : playerName;

            transcript += characterLastSpeaking && isCharacter
              ? item.text
              : `\n${givenName}: ${item.text}`;
            characterLastSpeaking = isCharacter
            break;
        }
      });

      return transcript;
    },
    [playerName],
  );

  const getTranscript = useCallback(
    (
      messages: HistoryItem[],
      startId?: string,
      endId?: string,
    ) => {
      if (!messages.length) {
        return '';
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
      return formatTranscript(
        messages.slice(startIndex, endIndex + 1)
      );
    },
    [formatTranscript],
  );

  const handleCopyClick = useCallback(async () => {
    const history = getTranscript(chatHistory);

    if (navigator.clipboard) {
      navigator.clipboard.writeText(history).then(() => {
        setCopyDestination('clipboard');
      });
    } else {
      setCopyDestination('console');
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
      var result =await fetchData();
      if(result==1){
      console.log("succ");
      !hasPlayedWorkaroundSound && playWorkaroundSound();
      connection?.sendText(text);
      setText('');
      }
    }
  }

  const handleSend = useCallback(() => {
    if (text) {
      
      !hasPlayedWorkaroundSound && playWorkaroundSound();

      connection?.sendText(text);

      setText('');
      
    }
  }, [connection, hasPlayedWorkaroundSound, playWorkaroundSound, text]);

  const handleTextKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  }, [handleSend]);

  const handleSpeakClick = useCallback(async () => { 
    !hasPlayedWorkaroundSound && playWorkaroundSound();

    if (isRecording) {
      stopRecording();
      connection.sendAudioSessionEnd();
      setIsRecording(false);
      return;
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


    setIsAudio(!isaudio)
    return onStopAudio()
  
  }, [
    isaudio,
  ]);

  return (
    <>
      <Grid
        container
        sx={{ mb: 2, mt: 10 }}
      >
        <Grid
          item
          xs={12}
          sm={6}
          sx={{
            backgroundColor: 'white',
            padding: '0.5rem 1.5rem',
            borderRadius: '1rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <History
            history={chatHistory}
            character={character}
            playerName={playerName}
          />
          <Stack direction="row-reverse" sx={{ mb: '1' }}>
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
              onKeyPress={handleTextKeyPress}
              sx={{
                backgroundColor: (theme) => theme.palette.grey[100],
                borderRadius: '1rem',
                padding: '1rem',
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
              sx={{ height: '3rem', width: '3rem', backgroundColor: '#F1F5F9' }}
            >
              {isRecording ? <RecordIcon /> : <Mic />}
            </IconButton>
            <IconButton
              onClick={handleAudioClick}
              sx={{ height: '3rem', width: '3rem', backgroundColor: '#F1F5F9' }}
            >
              {isaudio ? <VolumeUp/> : <VolumeOff />}
              
            </IconButton>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={1}/>
        <Grid
          item
          xs={12}
          sm={5}
          sx={{
            backgroundColor: 'white',
            padding: '0.5rem 1.5rem',
            borderRadius: '1rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
          }}
          >
          <img
            alt={character.getDisplayName()}
            src={character.getAssets().rpmImageUriPortrait}
          />
        </Grid>
      </Grid>
      <Grid
        container
        mt={1}
        spacing={2}
        alignItems="center"
        justifyContent={'flex-start'}
      >
        <Grid item>
          <Button
            variant="outlined"
            onClick={onStopChatting}
          >
            Back to settings
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