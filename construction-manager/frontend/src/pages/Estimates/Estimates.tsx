import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const Estimates: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Сметы
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Модуль управления сметами находится в разработке
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Estimates;