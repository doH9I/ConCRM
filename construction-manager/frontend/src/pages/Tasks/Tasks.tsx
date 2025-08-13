import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Box, Tabs, Tab } from '@mui/material';
import TasksList from './TasksList';
import TaskDetail from './TaskDetail';
import CreateTask from './CreateTask';
import TaskBoard from './TaskBoard';

const Tasks: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getTabValue = () => {
    if (location.pathname.includes('/board')) return 1;
    if (location.pathname.includes('/create')) return 2;
    if (location.pathname.includes('/detail')) return 3;
    return 0;
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    switch (newValue) {
      case 0:
        navigate('/tasks');
        break;
      case 1:
        navigate('/tasks/board');
        break;
      case 2:
        navigate('/tasks/create');
        break;
    }
  };

  return (
    <Box>
      <Tabs value={getTabValue()} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Список задач" />
        <Tab label="Доска задач" />
        <Tab label="Создать задачу" />
      </Tabs>

      <Routes>
        <Route index element={<TasksList />} />
        <Route path="board" element={<TaskBoard />} />
        <Route path="create" element={<CreateTask />} />
        <Route path="detail/:id" element={<TaskDetail />} />
      </Routes>
    </Box>
  );
};

export default Tasks;