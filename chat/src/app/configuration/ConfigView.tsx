import { Box, Button, Card, CardContent, Grid, Typography } from '@mui/material';
import { CharacterName } from './CharacterName';
import { PlayerName } from './PlayerName';
import { SceneName } from './SceneName';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Configuration } from '../types';
import { save as saveConfiguration } from '../helpers/configuration';
import axios from "axios";

interface ConfigViewProps {

}
export interface  Data{
  characterName: string;
  sceneName: string;
}
export const ConfigView = (props: ConfigViewProps) => {
  const [characterNamee, setcharacterName] = useState('');
  const [sceneNamee, setsceneName] = useState('');
  const { getValues, register } = useFormContext<Configuration>();
  useEffect(() => {
    const fetchPost = async() => {
      try {
        const {data} = await axios.get(
          `http://localhost:4000/payment/names`
        );
        
        setcharacterName(data?.characterName)
        setsceneName(data.sceneName)
        saveConfiguration({
          ...getValues(),
          character: { name: characterNamee },
          scene: { name: sceneNamee },
        });
      } catch (error) {
          console.error(error);
      }
  };
  fetchPost();
   
  }, [characterNamee, sceneNamee]);
  const data1: Data = {
    characterName: characterNamee,
    sceneName:sceneNamee ,
};
  return (
    <>
      <Box component="form" >
        <Typography variant="h3" component="h1" sx= {{ m: 1 }}>
          Chat with Inworld character
        </Typography>
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <CharacterName data={data1}/>
                </Grid>
                  <Grid item xs={12} sm={6}>
                <SceneName data={data1} />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <PlayerName />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
      <Grid
        container
        mt={1}
        spacing={2}
        alignItems="center"
        justifyContent={'flex-end'}
      >
        <Grid item>
          
          <Button
            variant="contained"

          >
            Start
          </Button>
        </Grid>
      </Grid>
    </>
  );
};
