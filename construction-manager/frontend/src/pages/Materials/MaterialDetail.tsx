import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const MaterialDetail: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Детали материала
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Детальная страница материала находится в разработке
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MaterialDetail;