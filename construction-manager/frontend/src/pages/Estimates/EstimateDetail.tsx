import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const EstimateDetail: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Детали сметы
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Детальная страница сметы находится в разработке
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EstimateDetail;