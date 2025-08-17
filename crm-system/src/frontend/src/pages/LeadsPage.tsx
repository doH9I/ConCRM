import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  Visibility,
} from '@mui/icons-material';

// Mock data - replace with real API calls
const mockLeads = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
    company: 'ABC Construction',
    source: 'Website',
    status: 'New',
    value: 50000,
    assignedTo: 'Jane Manager',
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+1-555-0124',
    company: 'XYZ Builders',
    source: 'Referral',
    status: 'Contacted',
    value: 75000,
    assignedTo: 'Mike Sales',
    createdAt: '2024-01-14',
  },
  {
    id: 3,
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@example.com',
    phone: '+1-555-0125',
    company: 'City Developers',
    source: 'Cold Call',
    status: 'Qualified',
    value: 120000,
    assignedTo: 'Sarah Lead',
    createdAt: '2024-01-13',
  },
];

const statusOptions = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
const sourceOptions = ['Website', 'Referral', 'Cold Call', 'Trade Show', 'Social Media', 'Other'];

export const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState(mockLeads);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddLead = () => {
    setEditingLead({});
    setOpenDialog(true);
  };

  const handleEditLead = (lead: any) => {
    setEditingLead(lead);
    setOpenDialog(true);
  };

  const handleDeleteLead = (id: number) => {
    setLeads(leads.filter(lead => lead.id !== id));
  };

  const handleSaveLead = () => {
    if (editingLead.id) {
      // Update existing lead
      setLeads(leads.map(lead => 
        lead.id === editingLead.id ? editingLead : lead
      ));
    } else {
      // Add new lead
      const newLead = {
        ...editingLead,
        id: Math.max(...leads.map(l => l.id)) + 1,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setLeads([...leads, newLead]);
    }
    setOpenDialog(false);
    setEditingLead(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'default';
      case 'Contacted':
        return 'primary';
      case 'Qualified':
        return 'warning';
      case 'Proposal':
        return 'info';
      case 'Negotiation':
        return 'secondary';
      case 'Closed Won':
        return 'success';
      case 'Closed Lost':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Leads Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddLead}
        >
          Add Lead
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {statusOptions.map(status => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Leads Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLeads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>
                  <Typography variant="subtitle2">
                    {lead.firstName} {lead.lastName}
                  </Typography>
                </TableCell>
                <TableCell>{lead.company}</TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">{lead.email}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {lead.phone}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{lead.source}</TableCell>
                <TableCell>
                  <Chip
                    label={lead.status}
                    color={getStatusColor(lead.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>${lead.value.toLocaleString()}</TableCell>
                <TableCell>{lead.assignedTo}</TableCell>
                <TableCell>{lead.createdAt}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleEditLead(lead)}>
                    <Edit />
                  </IconButton>
                  <IconButton size="small">
                    <Visibility />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleDeleteLead(lead.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Lead Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingLead?.id ? 'Edit Lead' : 'Add New Lead'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" gap={2} mt={1}>
            <TextField
              label="First Name"
              value={editingLead?.firstName || ''}
              onChange={(e) => setEditingLead({...editingLead, firstName: e.target.value})}
              fullWidth
            />
            <TextField
              label="Last Name"
              value={editingLead?.lastName || ''}
              onChange={(e) => setEditingLead({...editingLead, lastName: e.target.value})}
              fullWidth
            />
          </Box>
          <Box display="flex" gap={2} mt={2}>
            <TextField
              label="Email"
              type="email"
              value={editingLead?.email || ''}
              onChange={(e) => setEditingLead({...editingLead, email: e.target.value})}
              fullWidth
            />
            <TextField
              label="Phone"
              value={editingLead?.phone || ''}
              onChange={(e) => setEditingLead({...editingLead, phone: e.target.value})}
              fullWidth
            />
          </Box>
          <Box display="flex" gap={2} mt={2}>
            <TextField
              label="Company"
              value={editingLead?.company || ''}
              onChange={(e) => setEditingLead({...editingLead, company: e.target.value})}
              fullWidth
            />
            <TextField
              label="Value"
              type="number"
              value={editingLead?.value || ''}
              onChange={(e) => setEditingLead({...editingLead, value: e.target.value})}
              fullWidth
            />
          </Box>
          <Box display="flex" gap={2} mt={2}>
            <FormControl fullWidth>
              <InputLabel>Source</InputLabel>
              <Select
                value={editingLead?.source || ''}
                label="Source"
                onChange={(e) => setEditingLead({...editingLead, source: e.target.value})}
              >
                {sourceOptions.map(source => (
                  <MenuItem key={source} value={source}>{source}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editingLead?.status || ''}
                label="Status"
                onChange={(e) => setEditingLead({...editingLead, status: e.target.value})}
              >
                {statusOptions.map(status => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveLead} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};