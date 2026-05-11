import React from 'react';
import {
  Box, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import { NotificationType } from '../api/types';
import { Log } from '../api/logger';

const TYPES: Array<NotificationType | ''> = ['', 'Event', 'Result', 'Placement'];
const LABELS: Record<string, string> = {
  '': 'All',
  Event: 'Event',
  Result: 'Result',
  Placement: 'Placement',
};

interface Props {
  value: NotificationType | '';
  onChange: (type: NotificationType | '') => void;
}

const FilterBar: React.FC<Props> = ({ value, onChange }) => {
  const handleChange = (_: React.MouseEvent<HTMLElement>, newType: NotificationType | '' | null) => {
    // MUI ToggleButtonGroup returns null when deselecting — treat as "All"
    const next = newType ?? '';
    Log('frontend', 'info', 'component', `Filter changed to "${next}"`);
    onChange(next);
  };

  return (
    <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
        Filter:
      </Typography>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={handleChange}
        size="small"
        color="primary"
        aria-label="notification type filter"
      >
        {TYPES.map((type) => (
          <ToggleButton key={type} value={type} id={`filter-${type || 'all'}`}>
            {LABELS[type]}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};

export default FilterBar;
