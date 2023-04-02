import { Box, TextField } from '@mui/material';
import { useFormContext } from 'react-hook-form';

import { Configuration } from '../types';
import { save as saveConfiguration } from '../helpers/configuration';
import { useCallback } from 'react';

export const CharacterName = () => {
  const { getValues, register } = useFormContext<Configuration>();

  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    saveConfiguration({
      ...getValues(),
      character: { name: event.target.value },
    });
  }, [getValues]);

  return (
    <Box sx={{ m: 2 }}>
      <TextField
        fullWidth
        id="character-name"
        size="small"
        label="Character Name"
        placeholder="Enter character name"
        InputLabelProps={{ shrink: true }}
        {
          ...register('character.name', { required: true })
        }
        onChange={onChange}
      />
    </Box>
  );
};
