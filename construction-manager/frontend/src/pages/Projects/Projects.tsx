import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Box, Tabs, Tab } from '@mui/material';
import ProjectsList from './ProjectsList';
import ProjectDetail from './ProjectDetail';
import CreateProject from './CreateProject';

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getTabValue = () => {
    if (location.pathname.includes('/create')) return 1;
    if (location.pathname.includes('/detail')) return 2;
    return 0;
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    switch (newValue) {
      case 0:
        navigate('/projects');
        break;
      case 1:
        navigate('/projects/create');
        break;
    }
  };

  return (
    <Box>
      <Tabs value={getTabValue()} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Все проекты" />
        <Tab label="Создать проект" />
      </Tabs>

      <Routes>
        <Route index element={<ProjectsList />} />
        <Route path="create" element={<CreateProject />} />
        <Route path="detail/:id" element={<ProjectDetail />} />
      </Routes>
    </Box>
  );
};

export default Projects;