import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const Reports: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Отчеты
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Модуль отчетности находится в разработке
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Reports;