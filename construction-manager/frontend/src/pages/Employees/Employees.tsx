import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Box, Tabs, Tab } from '@mui/material';
import EmployeesList from './EmployeesList';
import EmployeeDetail from './EmployeeDetail';
import CreateEmployee from './CreateEmployee';
import Timesheet from './Timesheet';
import SalaryReports from './SalaryReports';

const Employees: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getTabValue = () => {
    if (location.pathname.includes('/timesheet')) return 1;
    if (location.pathname.includes('/salary')) return 2;
    if (location.pathname.includes('/create')) return 3;
    if (location.pathname.includes('/detail')) return 4;
    return 0;
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    switch (newValue) {
      case 0:
        navigate('/employees');
        break;
      case 1:
        navigate('/employees/timesheet');
        break;
      case 2:
        navigate('/employees/salary');
        break;
      case 3:
        navigate('/employees/create');
        break;
    }
  };

  return (
    <Box>
      <Tabs value={getTabValue()} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Сотрудники" />
        <Tab label="Табель учета времени" />
        <Tab label="Зарплатные отчеты" />
        <Tab label="Добавить сотрудника" />
      </Tabs>

      <Routes>
        <Route index element={<EmployeesList />} />
        <Route path="timesheet" element={<Timesheet />} />
        <Route path="salary" element={<SalaryReports />} />
        <Route path="create" element={<CreateEmployee />} />
        <Route path="detail/:id" element={<EmployeeDetail />} />
      </Routes>
    </Box>
  );
};

export default Employees;