import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Box, Tabs, Tab } from '@mui/material';
import MaterialsList from './MaterialsList';
import MaterialDetail from './MaterialDetail';
import CreateMaterial from './CreateMaterial';
import MaterialOperations from './MaterialOperations';
import MaterialBalances from './MaterialBalances';
import MaterialReservations from './MaterialReservations';

const Materials: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getTabValue = () => {
    if (location.pathname.includes('/operations')) return 1;
    if (location.pathname.includes('/balances')) return 2;
    if (location.pathname.includes('/reservations')) return 3;
    if (location.pathname.includes('/create')) return 4;
    if (location.pathname.includes('/detail')) return 5;
    return 0;
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    switch (newValue) {
      case 0:
        navigate('/materials');
        break;
      case 1:
        navigate('/materials/operations');
        break;
      case 2:
        navigate('/materials/balances');
        break;
      case 3:
        navigate('/materials/reservations');
        break;
      case 4:
        navigate('/materials/create');
        break;
    }
  };

  return (
    <Box>
      <Tabs value={getTabValue()} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Материалы" />
        <Tab label="Операции" />
        <Tab label="Остатки" />
        <Tab label="Резервирования" />
        <Tab label="Добавить материал" />
      </Tabs>

      <Routes>
        <Route index element={<MaterialsList />} />
        <Route path="operations" element={<MaterialOperations />} />
        <Route path="balances" element={<MaterialBalances />} />
        <Route path="reservations" element={<MaterialReservations />} />
        <Route path="create" element={<CreateMaterial />} />
        <Route path="detail/:id" element={<MaterialDetail />} />
      </Routes>
    </Box>
  );
};

export default Materials;