import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  People,
  Business,
  Assignment,
  Lead,
  Task,
  TrendingUp,
  TrendingDown,
  Warning,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../services/api';

const Dashboard: React.FC = () => {
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getDashboardData,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography color="error">Error loading dashboard data</Typography>
      </Box>
    );
  }

  const stats = dashboardData || {
    userStats: { total: 0, active: 0, admin: 0 },
    companyStats: { total: 0, active: 0 },
    projectStats: { total: 0, active: 0, completed: 0, onHold: 0 },
    leadStats: { total: 0, new: 0, qualified: 0, won: 0, conversionRate: 0 },
    taskStats: { total: 0, pending: 0, inProgress: 0, completed: 0, completionRate: 0 },
    recentProjects: [],
    recentLeads: [],
    overdueTasks: [],
  };

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ color, mr: 2 }}>{icon}</Box>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
        </Box>
        <Typography variant="h6" component="div" gutterBottom>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const ProgressCard: React.FC<{
    title: string;
    progress: number;
    total: number;
    completed: number;
    color: string;
  }> = ({ title, progress, total, completed, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="h4" component="div" sx={{ color, mr: 1 }}>
            {completed}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            / {total}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 8, borderRadius: 4, backgroundColor: 'grey.200' }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {progress.toFixed(1)}% Complete
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats.userStats.total}
            icon={<People />}
            color="primary.main"
            subtitle={`${stats.userStats.active} active`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Companies"
            value={stats.companyStats.total}
            icon={<Business />}
            color="success.main"
            subtitle={`${stats.companyStats.active} active`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Projects"
            value={stats.projectStats.total}
            icon={<Assignment />}
            color="info.main"
            subtitle={`${stats.projectStats.active} in progress`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Leads"
            value={stats.leadStats.total}
            icon={<Lead />}
            color="warning.main"
            subtitle={`${stats.leadStats.conversionRate}% conversion`}
          />
        </Grid>
      </Grid>

      {/* Progress Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <ProgressCard
            title="Project Progress"
            progress={stats.projectStats.total > 0 ? (stats.projectStats.completed / stats.projectStats.total) * 100 : 0}
            total={stats.projectStats.total}
            completed={stats.projectStats.completed}
            color="info.main"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <ProgressCard
            title="Task Completion"
            progress={stats.taskStats.completionRate}
            total={stats.taskStats.total}
            completed={stats.taskStats.completed}
            color="success.main"
          />
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Projects
            </Typography>
            <List dense>
              {stats.recentProjects.slice(0, 5).map((project: any) => (
                <ListItem key={project.id}>
                  <ListItemIcon>
                    <Assignment color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={project.name}
                    secondary={`${project.progress}% complete`}
                  />
                  <Chip
                    label={project.status}
                    size="small"
                    color={project.status === 'In Progress' ? 'primary' : 'default'}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Leads
            </Typography>
            <List dense>
              {stats.recentLeads.slice(0, 5).map((lead: any) => (
                <ListItem key={lead.id}>
                  <ListItemIcon>
                    <Lead color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${lead.firstName} ${lead.lastName}`}
                    secondary={lead.company || 'No company'}
                  />
                  <Chip
                    label={lead.status}
                    size="small"
                    color={lead.status === 'New' ? 'warning' : 'default'}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Overdue Tasks
            </Typography>
            <List dense>
              {stats.overdueTasks.slice(0, 5).map((task: any) => (
                <ListItem key={task.id}>
                  <ListItemIcon>
                    <Warning color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary={task.title}
                    secondary={`Due: ${new Date(task.dueDate).toLocaleDateString()}`}
                  />
                  <Chip
                    label="Overdue"
                    size="small"
                    color="error"
                  />
                </ListItem>
              ))}
              {stats.overdueTasks.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No overdue tasks"
                    secondary="Great job staying on schedule!"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;