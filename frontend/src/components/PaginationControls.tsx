import React from 'react';
import { Box, Pagination } from '@mui/material';
import { PaginatedNotifications } from '../api/types';

interface Props {
  meta: PaginatedNotifications['meta'];
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<Props> = ({ meta, onPageChange }) => {
  if (meta.totalPages <= 1) return null;

  return (
    <Box display="flex" justifyContent="center" mt={3}>
      <Pagination
        count={meta.totalPages}
        page={meta.page}
        onChange={(_, page) => onPageChange(page)}
        color="primary"
        shape="rounded"
        showFirstButton
        showLastButton
      />
    </Box>
  );
};

export default PaginationControls;
