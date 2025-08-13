import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const EstimateTemplates: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Шаблоны смет
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Модуль шаблонов смет находится в разработке
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EstimateTemplates;