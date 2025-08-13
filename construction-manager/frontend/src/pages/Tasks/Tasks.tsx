import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const Tasks: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Задачи
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Модуль управления задачами находится в разработке
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Tasks;