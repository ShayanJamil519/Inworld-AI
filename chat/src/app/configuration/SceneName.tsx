import { Box, TextField } from '@mui/material';
import { useFormContext } from 'react-hook-form';

import { Configuration } from '../types';
import { save as saveConfiguration } from '../helpers/configuration';
import { useCallback } from 'react';

export const SceneName = () => {
  const { getValues, register } = useFormContext<Configuration>();

  const onChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    saveConfiguration({
      ...getValues(),
      scene: { name: event.target.value },
    });
  }, [getValues]);

  return (
    <Box sx={{ m: 2 }}>
      <TextField
        fullWidth
        id="scene-name"
        size="small"
        label="Scene Name"
        placeholder="Enter scene name"
        InputLabelProps={{ shrink: true }}
        {
          ...register('scene.name', { required: true })
        }
        onChange={onChange}
      />
    </Box>
  );
};
