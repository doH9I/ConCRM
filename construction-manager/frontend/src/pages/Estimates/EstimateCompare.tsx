import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const EstimateCompare: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Сравнение смет
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Модуль сравнения смет находится в разработке
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EstimateCompare;