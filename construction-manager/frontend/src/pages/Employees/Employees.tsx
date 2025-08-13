import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const Employees: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Сотрудники
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Модуль управления сотрудниками и табель учета времени находится в разработке
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Employees;