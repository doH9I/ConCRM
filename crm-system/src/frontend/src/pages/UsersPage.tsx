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
  Avatar,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  Visibility,
  Person,
  Email,
  Phone,
  Business,
} from '@mui/icons-material';

// Mock data - replace with real API calls
const mockUsers = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Manager',
    email: 'john.manager@company.com',
    phone: '+1-555-0123',
    role: 'manager',
    department: 'Sales',
    isActive: true,
    lastLogin: '2024-01-15 10:30:00',
    projectsCount: 8,
    leadsCount: 25,
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Admin',
    email: 'jane.admin@company.com',
    phone: '+1-555-0124',
    role: 'admin',
    department: 'Management',
    isActive: true,
    lastLogin: '2024-01-15 09:15:00',
    projectsCount: 12,
    leadsCount: 42,
  },
  {
    id: 3,
    firstName: 'Mike',
    lastName: 'Sales',
    email: 'mike.sales@company.com',
    phone: '+1-555-0125',
    role: 'user',
    department: 'Sales',
    isActive: true,
    lastLogin: '2024-01-14 16:45:00',
    projectsCount: 5,
    leadsCount: 18,
  },
  {
    id: 4,
    firstName: 'Sarah',
    lastName: 'Lead',
    email: 'sarah.lead@company.com',
    phone: '+1-555-0126',
    role: 'user',
    department: 'Sales',
    isActive: false,
    lastLogin: '2024-01-10 14:20:00',
    projectsCount: 3,
    leadsCount: 12,
  },
];

const roleOptions = ['admin', 'manager', 'user'];
const departmentOptions = ['Sales', 'Management', 'Engineering', 'Marketing', 'Finance', 'HR'];

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesDepartment = !departmentFilter || user.department === departmentFilter;
    
    return matchesSearch && matchesRole && matchesDepartment;
  });

  const handleAddUser = () => {
    setEditingUser({});
    setOpenDialog(true);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setOpenDialog(true);
  };

  const handleDeleteUser = (id: number) => {
    setUsers(users.filter(user => user.id !== id));
  };

  const handleToggleActive = (id: number) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, isActive: !user.isActive } : user
    ));
  };

  const handleSaveUser = () => {
    if (editingUser.id) {
      // Update existing user
      setUsers(users.map(user => 
        user.id === editingUser.id ? editingUser : user
      ));
    } else {
      // Add new user
      const newUser = {
        ...editingUser,
        id: Math.max(...users.map(u => u.id)) + 1,
        isActive: true,
        lastLogin: null,
        projectsCount: 0,
        leadsCount: 0,
      };
      setUsers([...users, newUser]);
    }
    setOpenDialog(false);
    setEditingUser(null);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'manager':
        return 'warning';
      case 'user':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case 'Sales':
        return 'success';
      case 'Management':
        return 'error';
      case 'Engineering':
        return 'info';
      case 'Marketing':
        return 'warning';
      case 'Finance':
        return 'secondary';
      case 'HR':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Users Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddUser}
        >
          Add User
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            placeholder="Search users..."
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
            <InputLabel>Role</InputLabel>
            <Select
              value={roleFilter}
              label="Role"
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="">All Roles</MenuItem>
              {roleOptions.map(role => (
                <MenuItem key={role} value={role}>{role}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={departmentFilter}
              label="Department"
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <MenuItem value="">All Departments</MenuItem>
              {departmentOptions.map(dept => (
                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Role & Department</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Activity</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {user.firstName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">
                        {user.firstName} {user.lastName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        ID: {user.id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Box display="flex" alignItems="center" mb={0.5}>
                      <Email sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">{user.email}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Phone sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">{user.phone}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Chip
                      label={user.role}
                      color={getRoleColor(user.role) as any}
                      size="small"
                      sx={{ mb: 0.5 }}
                    />
                    <Chip
                      label={user.department}
                      color={getDepartmentColor(user.department) as any}
                      size="small"
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={user.isActive}
                        onChange={() => handleToggleActive(user.id)}
                        color="primary"
                      />
                    }
                    label={user.isActive ? 'Active' : 'Inactive'}
                  />
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      Projects: {user.projectsCount}
                    </Typography>
                    <Typography variant="body2">
                      Leads: {user.leadsCount}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    {user.lastLogin ? user.lastLogin : 'Never'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleEditUser(user)}>
                    <Edit />
                  </IconButton>
                  <IconButton size="small">
                    <Visibility />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit User Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingUser?.id ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" gap={2} mt={1}>
            <TextField
              label="First Name"
              value={editingUser?.firstName || ''}
              onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})}
              fullWidth
            />
            <TextField
              label="Last Name"
              value={editingUser?.lastName || ''}
              onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})}
              fullWidth
            />
          </Box>
          <Box display="flex" gap={2} mt={2}>
            <TextField
              label="Email"
              type="email"
              value={editingUser?.email || ''}
              onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
              fullWidth
            />
            <TextField
              label="Phone"
              value={editingUser?.phone || ''}
              onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
              fullWidth
            />
          </Box>
          <Box display="flex" gap={2} mt={2}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={editingUser?.role || ''}
                label="Role"
                onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
              >
                {roleOptions.map(role => (
                  <MenuItem key={role} value={role}>{role}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={editingUser?.department || ''}
                label="Department"
                onChange={(e) => setEditingUser({...editingUser, department: e.target.value})}
              >
                {departmentOptions.map(dept => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          {!editingUser?.id && (
            <Box display="flex" gap={2} mt={2}>
              <TextField
                label="Password"
                type="password"
                value={editingUser?.password || ''}
                onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                fullWidth
              />
              <TextField
                label="Confirm Password"
                type="password"
                value={editingUser?.confirmPassword || ''}
                onChange={(e) => setEditingUser({...editingUser, confirmPassword: e.target.value})}
                fullWidth
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};