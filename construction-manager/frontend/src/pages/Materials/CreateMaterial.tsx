import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const CreateMaterial: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Добавить материал
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Форма создания материала находится в разработке
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateMaterial;