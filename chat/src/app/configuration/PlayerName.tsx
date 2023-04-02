import { Box, TextField } from '@mui/material';
import { useFormContext } from 'react-hook-form';

import { Configuration } from '../types';
import { save as saveConfiguration } from '../helpers/configuration';
import { useCallback } from 'react';

export const PlayerName = () => {
  const { getValues, register } = useFormContext<Configuration>();

  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    saveConfiguration({
      ...getValues(),
      player: { name: event.target.value },
    });
  }, [getValues]);

  return (
    <Box sx={{ m: 2 }}>
      <TextField
        fullWidth
        id="player-name"
        size="small"
        label="Player Name"
        placeholder="Enter player name"
        InputLabelProps={{ shrink: true }}
        {
          ...register('player.name', { required: true })
        }
        onChange={onChange}
      />
    </Box>
  );
};
