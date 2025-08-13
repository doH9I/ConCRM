import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const MaterialReservations: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Резервирования материалов
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Модуль резервирований материалов находится в разработке
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MaterialReservations;