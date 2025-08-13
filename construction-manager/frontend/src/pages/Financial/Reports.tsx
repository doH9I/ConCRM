import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const Reports: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Финансовые отчеты
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Модуль финансовых отчетов находится в разработке
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Reports;