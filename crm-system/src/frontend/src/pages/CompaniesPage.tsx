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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Business,
  Phone,
  Email,
  Language,
  LocationOn,
} from '@mui/icons-material';

// Mock data - replace with real API calls
const mockCompanies = [
  {
    id: 1,
    name: 'ABC Construction',
    industry: 'Construction',
    size: 'Large',
    address: '123 Main St, City, State 12345',
    phone: '+1-555-0123',
    email: 'info@abcconstruction.com',
    website: 'https://abcconstruction.com',
    status: 'Active',
    projectsCount: 15,
    totalRevenue: 25000000,
    contactPerson: 'John Smith',
    contactEmail: 'john.smith@abcconstruction.com',
    contactPhone: '+1-555-0124',
  },
  {
    id: 2,
    name: 'XYZ Builders',
    industry: 'Construction',
    size: 'Medium',
    address: '456 Oak Ave, Town, State 67890',
    phone: '+1-555-0125',
    email: 'info@xyzbuilders.com',
    website: 'https://xyzbuilders.com',
    status: 'Active',
    projectsCount: 8,
    totalRevenue: 12000000,
    contactPerson: 'Jane Doe',
    contactEmail: 'jane.doe@xyzbuilders.com',
    contactPhone: '+1-555-0126',
  },
  {
    id: 3,
    name: 'City Developers',
    industry: 'Real Estate Development',
    size: 'Large',
    address: '789 Pine Rd, Village, State 11111',
    phone: '+1-555-0127',
    email: 'info@citydevelopers.com',
    website: 'https://citydevelopers.com',
    status: 'Active',
    projectsCount: 22,
    totalRevenue: 45000000,
    contactPerson: 'Mike Johnson',
    contactEmail: 'mike.johnson@citydevelopers.com',
    contactPhone: '+1-555-0128',
  },
];

const industryOptions = ['Construction', 'Real Estate Development', 'Architecture', 'Engineering', 'Interior Design', 'Other'];
const sizeOptions = ['Small', 'Medium', 'Large', 'Enterprise'];
const statusOptions = ['Active', 'Inactive', 'Prospect', 'Former Client'];

export const CompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState(mockCompanies);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);

  const handleAddCompany = () => {
    setEditingCompany({});
    setOpenDialog(true);
  };

  const handleEditCompany = (company: any) => {
    setEditingCompany(company);
    setOpenDialog(true);
  };

  const handleDeleteCompany = (id: number) => {
    setCompanies(companies.filter(company => company.id !== id));
  };

  const handleSaveCompany = () => {
    if (editingCompany.id) {
      // Update existing company
      setCompanies(companies.map(company => 
        company.id === editingCompany.id ? editingCompany : company
      ));
    } else {
      // Add new company
      const newCompany = {
        ...editingCompany,
        id: Math.max(...companies.map(c => c.id)) + 1,
        projectsCount: 0,
        totalRevenue: 0,
      };
      setCompanies([...companies, newCompany]);
    }
    setOpenDialog(false);
    setEditingCompany(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'error';
      case 'Prospect':
        return 'warning';
      case 'Former Client':
        return 'default';
      default:
        return 'default';
    }
  };

  const getSizeColor = (size: string) => {
    switch (size) {
      case 'Small':
        return 'success';
      case 'Medium':
        return 'warning';
      case 'Large':
        return 'error';
      case 'Enterprise':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Companies Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddCompany}
        >
          Add Company
        </Button>
      </Box>

      {/* Companies Grid */}
      <Grid container spacing={3}>
        {companies.map((company) => (
          <Grid item xs={12} md={6} lg={4} key={company.id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    {company.name.charAt(0)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div">
                      {company.name}
                    </Typography>
                    <Box display="flex" gap={1} mt={0.5}>
                      <Chip
                        label={company.status}
                        color={getStatusColor(company.status) as any}
                        size="small"
                      />
                      <Chip
                        label={company.size}
                        color={getSizeColor(company.size) as any}
                        size="small"
                      />
                    </Box>
                  </Box>
                </Box>

                <Typography variant="body2" color="textSecondary" mb={2}>
                  {company.industry}
                </Typography>

                <Box display="flex" alignItems="center" mb={1}>
                  <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" sx={{ flexGrow: 1 }}>
                    {company.address}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" mb={1}>
                  <Phone sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{company.phone}</Typography>
                </Box>

                <Box display="flex" alignItems="center" mb={1}>
                  <Email sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{company.email}</Typography>
                </Box>

                <Box display="flex" alignItems="center" mb={2}>
                  <Language sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{company.website}</Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="textSecondary">
                    Projects:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {company.projectsCount}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="textSecondary">
                    Revenue:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    ${(company.totalRevenue / 1000000).toFixed(1)}M
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="textSecondary">
                    Contact:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {company.contactPerson}
                  </Typography>
                </Box>
              </CardContent>

              <CardActions>
                <IconButton size="small" onClick={() => handleEditCompany(company)}>
                  <Edit />
                </IconButton>
                <IconButton size="small">
                  <Visibility />
                </IconButton>
                <IconButton 
                  size="small" 
                  color="error"
                  onClick={() => handleDeleteCompany(company.id)}
                >
                  <Delete />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Company Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCompany?.id ? 'Edit Company' : 'Add New Company'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" gap={2} mt={1}>
            <TextField
              label="Company Name"
              value={editingCompany?.name || ''}
              onChange={(e) => setEditingCompany({...editingCompany, name: e.target.value})}
              fullWidth
            />
            <TextField
              label="Industry"
              value={editingCompany?.industry || ''}
              onChange={(e) => setEditingCompany({...editingCompany, industry: e.target.value})}
              fullWidth
            />
          </Box>
          <Box display="flex" gap={2} mt={2}>
            <TextField
              label="Size"
              value={editingCompany?.size || ''}
              onChange={(e) => setEditingCompany({...editingCompany, size: e.target.value})}
              fullWidth
            />
            <TextField
              label="Status"
              value={editingCompany?.status || ''}
              onChange={(e) => setEditingCompany({...editingCompany, status: e.target.value})}
              fullWidth
            />
          </Box>
          <TextField
            label="Address"
            value={editingCompany?.address || ''}
            onChange={(e) => setEditingCompany({...editingCompany, address: e.target.value})}
            fullWidth
            sx={{ mt: 2 }}
          />
          <Box display="flex" gap={2} mt={2}>
            <TextField
              label="Phone"
              value={editingCompany?.phone || ''}
              onChange={(e) => setEditingCompany({...editingCompany, phone: e.target.value})}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={editingCompany?.email || ''}
              onChange={(e) => setEditingCompany({...editingCompany, email: e.target.value})}
              fullWidth
            />
          </Box>
          <TextField
            label="Website"
            value={editingCompany?.website || ''}
            onChange={(e) => setEditingCompany({...editingCompany, website: e.target.value})}
            fullWidth
            sx={{ mt: 2 }}
          />
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>Primary Contact</Typography>
          <Box display="flex" gap={2} mt={1}>
            <TextField
              label="Contact Person"
              value={editingCompany?.contactPerson || ''}
              onChange={(e) => setEditingCompany({...editingCompany, contactPerson: e.target.value})}
              fullWidth
            />
            <TextField
              label="Contact Email"
              type="email"
              value={editingCompany?.contactEmail || ''}
              onChange={(e) => setEditingCompany({...editingCompany, contactEmail: e.target.value})}
              fullWidth
            />
          </Box>
          <TextField
            label="Contact Phone"
            value={editingCompany?.contactPhone || ''}
            onChange={(e) => setEditingCompany({...editingCompany, contactPhone: e.target.value})}
            fullWidth
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveCompany} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};