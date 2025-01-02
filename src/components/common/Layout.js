// src/components/common/Layout.js

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../redux/reducers/authReducer';
import logo from '../../assets/logo.png';

import {
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Box,
  IconButton,
  Tooltip,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Build as BuildIcon,
  Logout as LogoutIcon,
  Home as HomeIcon,
  Menu as MenuIcon,
  AccountCircle as AccountCircleIcon,
  Notifications as NotificationsIcon,
  EventNote as EventNoteIcon,      // Icon for Admin Preventive Maintenance
  Assignment as AssignmentIcon,    // Icon for User Preventive Maintenance
  History as HistoryIcon,          // Icon for Audit Logs
  Inventory2 as Inventory2Icon,    // Icon for Board Inventory
  ListAlt as ListAltIcon,          // Icon for BOM Management
  Settings as SettingsIcon,        // Added import for SettingsIcon
} from '@mui/icons-material';

const drawerWidth = 240;       // Width when expanded
const collapsedWidth = 60;     // Width when collapsed
const appBarHeight = 64;       // Typical AppBar height

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Mobile (temporary) drawer open/close
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Desktop (persistent) drawer open/close
  const [drawerOpen, setDrawerOpen] = React.useState(true);

  const role = useSelector((state) => state.auth.role);

  const handleMobileDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDesktopDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Menu items with roles
  const menuItems = [
    { text: 'Landing', icon: <HomeIcon />, path: '/landing' },
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['ADMIN'] },
    { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory', roles: ['USER', 'ADMIN'] },
    { text: 'Maintenance', icon: <BuildIcon />, path: '/maintenance', roles: ['USER', 'ADMIN'] },
    {
      text: 'Preventive Maintenance (Admin)',
      icon: <EventNoteIcon />,
      path: '/preventive-maintenance/admin',
      roles: ['ADMIN'],
    },
    {
      text: 'Preventive Maintenance (User)',
      icon: <AssignmentIcon />,
      path: '/preventive-maintenance/user',
      roles: ['USER', 'ADMIN'],
    },
    {
      text: 'Audit Logs',
      icon: <HistoryIcon />,
      path: '/audit-logs',
      roles: ['ADMIN'],
    },
    {
      text: 'Board Inventory',
      icon: <Inventory2Icon />,
      path: '/boards',
      roles: ['ADMIN'],
    },
    {
      text: 'BOM Management',
      icon: <ListAltIcon />,
      path: '/bom-management',
      roles: ['ADMIN'],
    },
  ];

  // Filter items by role
  const filteredMenuItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  // Drawer content without the initial Toolbar
  const drawer = (
    <>
      <Divider />
      <List>
        {filteredMenuItems.map((item) => (
          <ListItem
            key={item.text}
            button
            onClick={() => {
              navigate(item.path);
              if (isMobile) handleMobileDrawerToggle();
            }}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'rgba(25, 118, 210, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.3)',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
              },
              transition: 'background-color 0.3s ease',
              justifyContent: drawerOpen ? 'initial' : 'center',
              px: drawerOpen ? 2.5 : 1,
            }}
          >
            <ListItemIcon
              sx={{
                color: '#1976d2',
                minWidth: 0,
                mr: drawerOpen ? 2 : 'auto',
                justifyContent: 'center',
              }}
            >
              {item.icon}
            </ListItemIcon>
            {drawerOpen && (
              <ListItemText
                primary={item.text}
                sx={{ color: '#1976d2', fontWeight: 'medium' }}
              />
            )}
          </ListItem>
        ))}

        {/* Logout Button */}
        <ListItem
          button
          onClick={() => {
            handleLogout();
            if (isMobile) handleMobileDrawerToggle();
          }}
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(255, 23, 68, 0.1)',
            },
            transition: 'background-color 0.3s ease',
            justifyContent: drawerOpen ? 'initial' : 'center',
            px: drawerOpen ? 2.5 : 1,
            mt: 2,
          }}
        >
          <Tooltip title="Logout">
            <ListItemIcon
              sx={{
                color: '#ff1744',
                minWidth: 0,
                mr: drawerOpen ? 2 : 'auto',
                justifyContent: 'center',
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
          </Tooltip>
          {drawerOpen && (
            <ListItemText
              primary="Logout"
              sx={{ color: '#ff1744', fontWeight: 'medium' }}
            />
          )}
        </ListItem>
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Full-width AppBar at the top */}
      <AppBar
        position="fixed"
        sx={{
          width: '100%',
          height: appBarHeight,
          backgroundColor: '#1976d2',
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Single toggle for both mobile & desktop */}
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            edge="start"
            onClick={isMobile ? handleMobileDrawerToggle : handleDesktopDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => navigate('/landing')}
          >
            <img
              src={logo}
              alt="Company Logo"
              style={{
                height: 100, // Adjusted height to fit within AppBar
                width: 'auto',
                marginRight: '8px',
              }}
            />
          </Box>

          {/* Right-side icons */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Notifications">
              <IconButton color="inherit">
                <NotificationsIcon />
              </IconButton>
            </Tooltip>

            {/* Added Settings IconButton before AccountCircleIcon */}
            <Tooltip title="Settings">
              <IconButton color="inherit" onClick={() => navigate('/settings')}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="User Profile">
              <IconButton color="inherit" onClick={() => navigate('/profile')}>
                <AccountCircleIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer positioned directly below AppBar */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true} // Mobile uses open/close, desktop is always "open" but can be "collapsed"
        onClose={isMobile ? handleMobileDrawerToggle : undefined}
        sx={{
          [`& .MuiDrawer-paper`]: {
            top: `${appBarHeight}px`, // Position Drawer below AppBar
            boxSizing: 'border-box',
            width: isMobile
              ? drawerWidth
              : drawerOpen
              ? drawerWidth
              : collapsedWidth,
            backgroundColor: '#f5f5f5',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.standard,
            }),
            overflowX: 'hidden',
            height: `calc(100% - ${appBarHeight}px)`, // Ensure Drawer height fits the viewport
          },
          display: { xs: 'block', sm: 'block' }, // Always block but uses different variants
        }}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: `${appBarHeight + 24}px`,  // Added extra 24px padding to move content down more
          ml: {
            sm: drawerOpen ? `${drawerWidth}px` : `${collapsedWidth}px`, // Adjusted margin based on drawer state
          },
          pl: 4,    // Added left padding
          pr: 4,    // Increased right padding
          pb: 3,
          bgcolor: '#ffffff',
          minHeight: '100vh',
          maxWidth: '2200px',  // Limit maximum width
          margin: '0 auto',    // Center the content
          transition: theme.transitions.create(['margin', 'padding'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
