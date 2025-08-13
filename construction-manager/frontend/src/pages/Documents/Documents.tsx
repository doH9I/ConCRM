import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const Documents: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Документы
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Модуль управления документами находится в разработке
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Documents;