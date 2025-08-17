import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Business,
  Assignment,
  Lead,
  Task,
  Assessment,
  Person,
  Logout,
  Notifications,
  Settings,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { toggleSidebar } from '../../store/slices/uiSlice';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Users', icon: <People />, path: '/users' },
  { text: 'Companies', icon: <Business />, path: '/companies' },
  { text: 'Projects', icon: <Assignment />, path: '/projects' },
  { text: 'Leads', icon: <Lead />, path: '/leads' },
  { text: 'Tasks', icon: <Task />, path: '/tasks' },
  { text: 'Reports', icon: <Assessment />, path: '/reports' },
];

const Layout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    dispatch(toggleSidebar());
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      dispatch(toggleSidebar());
    }
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          CRM System
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.path === location.pathname)?.text || 'CRM System'}
          </Typography>

          <IconButton color="inherit">
            <Notifications />
          </IconButton>

          <IconButton color="inherit" onClick={handleMenuOpen}>
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.firstName?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
          >
            <MenuItem onClick={() => navigate('/profile')}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={() => navigate('/settings')}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={sidebarOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;