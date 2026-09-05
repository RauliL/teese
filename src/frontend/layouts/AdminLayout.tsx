import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import PeopleIcon from "@mui/icons-material/People";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import React, { useMemo } from "react";
import { FormattedMessage } from "react-intl";
import { Link as RouterLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { messages } from "../i18n/messages.js";
import { useMessages } from "../i18n/useMessages.js";
import type { MessageKey } from "../i18n/messages.js";

const drawerWidth = 240;

type NavItem = {
  labelKey: MessageKey;
  to: string;
  icon: React.ReactNode;
};

function isNavItemSelected(pathname: string, to: string): boolean {
  if (to === "/admin") {
    return pathname === "/admin";
  }

  if (to === "/") {
    return false;
  }

  return pathname.startsWith(to);
}

export function AdminLayout() {
  const { user, logout } = useAuth();
  const { t } = useMessages();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = useMemo<NavItem[]>(
    () => [
      { labelKey: "nav.dashboard", to: "/admin", icon: <DashboardIcon /> },
      {
        labelKey: "nav.manageBoards",
        to: "/admin/boards",
        icon: <ViewKanbanIcon />,
      },
      { labelKey: "nav.users", to: "/admin/users", icon: <PeopleIcon /> },
      {
        labelKey: "nav.createUser",
        to: "/admin/users/new",
        icon: <PersonAddIcon />,
      },
      { labelKey: "nav.kanbanView", to: "/", icon: <ViewModuleIcon /> },
    ],
    [],
  );

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (muiTheme) => muiTheme.zIndex.drawer + 1 }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" noWrap component="div">
            {t("app.adminTitle")}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body2" sx={{ display: { xs: "none", sm: "block" } }}>
              <FormattedMessage
                {...messages["auth.signedInAs"]}
                values={{
                  username: <strong>{user?.username}</strong>,
                }}
              />
            </Typography>
            <Button
              color="inherit"
              component={RouterLink}
              to="/"
              startIcon={<ViewModuleIcon />}
            >
              {t("app.boards")}
            </Button>
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              {t("app.signOut")}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Divider />
        <List component="nav">
          {navItems.map((item) => (
            <ListItemButton
              key={item.to}
              component={RouterLink}
              to={item.to}
              selected={isNavItemSelected(location.pathname, item.to)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={t(item.labelKey)} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: "background.default",
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
