import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const Defects: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Учет дефектов
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Модуль учета дефектов находится в разработке
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Defects;