import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Assignment,
  Business,
  CalendarToday,
  AttachMoney,
} from '@mui/icons-material';

// Mock data - replace with real API calls
const mockProjects = [
  {
    id: 1,
    name: 'Office Complex A',
    description: 'Modern 5-story office building with parking garage',
    company: 'ABC Construction',
    status: 'In Progress',
    progress: 65,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    budget: 2500000,
    actualCost: 1625000,
    manager: 'John Manager',
    priority: 'High',
  },
  {
    id: 2,
    name: 'Residential Tower B',
    description: 'Luxury 20-story residential building',
    company: 'XYZ Builders',
    status: 'Planning',
    progress: 25,
    startDate: '2024-03-01',
    endDate: '2025-06-30',
    budget: 1800000,
    actualCost: 450000,
    manager: 'Sarah Lead',
    priority: 'Medium',
  },
  {
    id: 3,
    name: 'Shopping Center C',
    description: 'Retail complex with 50 stores and restaurants',
    company: 'City Developers',
    status: 'Completed',
    progress: 100,
    startDate: '2023-06-01',
    endDate: '2024-01-31',
    budget: 3200000,
    actualCost: 3150000,
    manager: 'Mike Project',
    priority: 'Low',
  },
];

const statusOptions = ['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled'];
const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState(mockProjects);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

  const handleAddProject = () => {
    setEditingProject({});
    setOpenDialog(true);
  };

  const handleEditProject = (project: any) => {
    setEditingProject(project);
    setOpenDialog(true);
  };

  const handleDeleteProject = (id: number) => {
    setProjects(projects.filter(project => project.id !== id));
  };

  const handleSaveProject = () => {
    if (editingProject.id) {
      // Update existing project
      setProjects(projects.map(project => 
        project.id === editingProject.id ? editingProject : project
      ));
    } else {
      // Add new project
      const newProject = {
        ...editingProject,
        id: Math.max(...projects.map(p => p.id)) + 1,
        progress: 0,
        actualCost: 0,
      };
      setProjects([...projects, newProject]);
    }
    setOpenDialog(false);
    setEditingProject(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planning':
        return 'default';
      case 'In Progress':
        return 'primary';
      case 'On Hold':
        return 'warning';
      case 'Completed':
        return 'success';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low':
        return 'success';
      case 'Medium':
        return 'warning';
      case 'High':
        return 'error';
      case 'Critical':
        return 'error';
      default:
        return 'default';
    }
  };

  const calculateProgress = (actual: number, budget: number) => {
    return Math.min((actual / budget) * 100, 100);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Projects Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddProject}
        >
          Add Project
        </Button>
      </Box>

      {/* Projects Grid */}
      <Grid container spacing={3}>
        {projects.map((project) => (
          <Grid item xs={12} md={6} lg={4} key={project.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" component="div" sx={{ flexGrow: 1, mr: 1 }}>
                    {project.name}
                  </Typography>
                  <Box>
                    <Chip
                      label={project.status}
                      color={getStatusColor(project.status) as any}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <Chip
                      label={project.priority}
                      color={getPriorityColor(project.priority) as any}
                      size="small"
                    />
                  </Box>
                </Box>

                <Typography variant="body2" color="textSecondary" mb={2}>
                  {project.description}
                </Typography>

                <Box display="flex" alignItems="center" mb={1}>
                  <Business sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{project.company}</Typography>
                </Box>

                <Box display="flex" alignItems="center" mb={1}>
                  <Assignment sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{project.manager}</Typography>
                </Box>

                <Box display="flex" alignItems="center" mb={1}>
                  <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {project.startDate} - {project.endDate}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" mb={2}>
                  <AttachMoney sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    Budget: ${project.budget.toLocaleString()}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2">Progress</Typography>
                    <Typography variant="body2">{project.progress}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={project.progress} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                {project.status === 'In Progress' && (
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2">Budget Usage</Typography>
                      <Typography variant="body2">
                        {calculateProgress(project.actualCost, project.budget).toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={calculateProgress(project.actualCost, project.budget)}
                      color={calculateProgress(project.actualCost, project.budget) > 90 ? 'error' : 'primary'}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                )}
              </CardContent>

              <CardActions>
                <IconButton size="small" onClick={() => handleEditProject(project)}>
                  <Edit />
                </IconButton>
                <IconButton size="small">
                  <Visibility />
                </IconButton>
                <IconButton 
                  size="small" 
                  color="error"
                  onClick={() => handleDeleteProject(project.id)}
                >
                  <Delete />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Project Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProject?.id ? 'Edit Project' : 'Add New Project'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" gap={2} mt={1}>
            <TextField
              label="Project Name"
              value={editingProject?.name || ''}
              onChange={(e) => setEditingProject({...editingProject, name: e.target.value})}
              fullWidth
            />
            <TextField
              label="Company"
              value={editingProject?.company || ''}
              onChange={(e) => setEditingProject({...editingProject, company: e.target.value})}
              fullWidth
            />
          </Box>
          <TextField
            label="Description"
            multiline
            rows={3}
            value={editingProject?.description || ''}
            onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
            fullWidth
            sx={{ mt: 2 }}
          />
          <Box display="flex" gap={2} mt={2}>
            <TextField
              label="Start Date"
              type="date"
              value={editingProject?.startDate || ''}
              onChange={(e) => setEditingProject({...editingProject, startDate: e.target.value})}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              type="date"
              value={editingProject?.endDate || ''}
              onChange={(e) => setEditingProject({...editingProject, endDate: e.target.value})}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Box display="flex" gap={2} mt={2}>
            <TextField
              label="Budget"
              type="number"
              value={editingProject?.budget || ''}
              onChange={(e) => setEditingProject({...editingProject, budget: e.target.value})}
              fullWidth
            />
            <TextField
              label="Project Manager"
              value={editingProject?.manager || ''}
              onChange={(e) => setEditingProject({...editingProject, manager: e.target.value})}
              fullWidth
            />
          </Box>
          <Box display="flex" gap={2} mt={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editingProject?.status || ''}
                label="Status"
                onChange={(e) => setEditingProject({...editingProject, status: e.target.value})}
              >
                {statusOptions.map(status => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={editingProject?.priority || ''}
                label="Priority"
                onChange={(e) => setEditingProject({...editingProject, priority: e.target.value})}
              >
                {priorityOptions.map(priority => (
                  <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveProject} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};