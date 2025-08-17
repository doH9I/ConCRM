import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Business,
  Assignment,
  MoreVert,
} from '@mui/icons-material';

// Mock data - replace with real API calls
const mockStats = {
  totalLeads: 156,
  activeProjects: 23,
  totalRevenue: 2450000,
  conversionRate: 68,
};

const mockRecentLeads = [
  { id: 1, name: 'John Doe', company: 'ABC Construction', status: 'New', value: 50000 },
  { id: 2, name: 'Jane Smith', company: 'XYZ Builders', status: 'Contacted', value: 75000 },
  { id: 3, name: 'Mike Johnson', company: 'City Developers', status: 'Qualified', value: 120000 },
];

const mockRecentProjects = [
  { id: 1, name: 'Office Complex A', status: 'In Progress', progress: 65 },
  { id: 2, name: 'Residential Tower B', status: 'Planning', progress: 25 },
  { id: 3, name: 'Shopping Center C', status: 'Completed', progress: 100 },
];

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="h6">
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: color,
            borderRadius: '50%',
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'new':
      return 'default';
    case 'contacted':
      return 'primary';
    case 'qualified':
      return 'warning';
    case 'in progress':
      return 'info';
    case 'planning':
      return 'secondary';
    case 'completed':
      return 'success';
    default:
      return 'default';
  }
};

export const DashboardPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Leads"
            value={mockStats.totalLeads}
            icon={<People sx={{ color: 'white' }} />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Projects"
            value={mockStats.activeProjects}
            icon={<Assignment sx={{ color: 'white' }} />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={`$${(mockStats.totalRevenue / 1000000).toFixed(1)}M`}
            icon={<TrendingUp sx={{ color: 'white' }} />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Conversion Rate"
            value={`${mockStats.conversionRate}%`}
            icon={<Business sx={{ color: 'white' }} />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        {/* Recent Leads */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6">Recent Leads</Typography>
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            </Box>
            {mockRecentLeads.map((lead) => (
              <Box
                key={lead.id}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                p={1}
                borderBottom="1px solid #f0f0f0"
                sx={{ '&:last-child': { borderBottom: 'none' } }}
              >
                <Box>
                  <Typography variant="subtitle2">{lead.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {lead.company}
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Chip
                    label={lead.status}
                    size="small"
                    color={getStatusColor(lead.status) as any}
                    sx={{ mb: 0.5 }}
                  />
                  <Typography variant="body2" color="textSecondary">
                    ${lead.value.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Recent Projects */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6">Recent Projects</Typography>
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            </Box>
            {mockRecentProjects.map((project) => (
              <Box
                key={project.id}
                p={1}
                borderBottom="1px solid #f0f0f0"
                sx={{ '&:last-child': { borderBottom: 'none' } }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="subtitle2">{project.name}</Typography>
                  <Chip
                    label={project.status}
                    size="small"
                    color={getStatusColor(project.status) as any}
                  />
                </Box>
                <Box display="flex" alignItems="center">
                  <Box sx={{ flexGrow: 1, mr: 1 }}>
                    <Box
                      sx={{
                        width: '100%',
                        height: 8,
                        backgroundColor: '#f0f0f0',
                        borderRadius: 4,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          width: `${project.progress}%`,
                          height: '100%',
                          backgroundColor: '#1976d2',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </Box>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {project.progress}%
                  </Typography>
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};