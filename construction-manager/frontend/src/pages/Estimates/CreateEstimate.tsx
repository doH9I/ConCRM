import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const CreateEstimate: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Создать смету
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Форма создания сметы находится в разработке
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateEstimate;