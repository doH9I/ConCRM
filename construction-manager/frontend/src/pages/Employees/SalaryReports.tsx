import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const SalaryReports: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Зарплатные отчеты
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Модуль зарплатных отчетов находится в разработке
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SalaryReports;