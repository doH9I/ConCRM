import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const Materials: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Складской учет
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Модуль складского учета материалов находится в разработке
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Materials;