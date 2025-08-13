import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const Budgets: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Бюджеты проектов
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Модуль управления бюджетами находится в разработке
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Budgets;