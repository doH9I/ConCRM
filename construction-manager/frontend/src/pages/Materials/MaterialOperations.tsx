import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const MaterialOperations: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Операции с материалами
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Модуль операций с материалами (приход/расход) находится в разработке
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MaterialOperations;