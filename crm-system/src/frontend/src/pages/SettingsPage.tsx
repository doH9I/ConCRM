import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Settings,
  Notifications,
  Security,
  Business,
  Email,
  Save,
  Refresh,
} from '@mui/icons-material';

// Mock settings data - replace with real API calls
const mockSettings = {
  company: {
    name: 'Construction CRM Company',
    address: '123 Business St, City, State 12345',
    phone: '+1-555-0123',
    email: 'info@company.com',
    website: 'https://company.com',
    timezone: 'America/New_York',
    currency: 'USD',
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    leadAlerts: true,
    projectUpdates: true,
    systemAlerts: true,
    dailyReports: false,
    weeklyReports: true,
  },
  security: {
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordExpiry: 90,
    failedLoginAttempts: 5,
    ipWhitelist: '',
    auditLogging: true,
  },
  integrations: {
    emailProvider: 'smtp',
    smsProvider: 'twilio',
    calendarSync: true,
    crmSync: false,
    accountingSync: false,
  },
};

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState(mockSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleSettingChange = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      // Save settings to backend
      // await api.saveSettings(settings);
      
      setHasChanges(false);
      setShowSuccess(true);
    } catch (error) {
      setShowError(true);
    }
  };

  const handleReset = () => {
    setSettings(mockSettings);
    setHasChanges(false);
  };

  const timezoneOptions = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
  ];

  const currencyOptions = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">System Settings</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleReset}
            disabled={!hasChanges}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={!hasChanges}
          >
            Save Changes
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Company Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Company Information"
              avatar={<Business />}
            />
            <CardContent>
              <TextField
                fullWidth
                label="Company Name"
                value={settings.company.name}
                onChange={(e) => handleSettingChange('company', 'name', e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Address"
                value={settings.company.address}
                onChange={(e) => handleSettingChange('company', 'address', e.target.value)}
                margin="normal"
                multiline
                rows={2}
              />
              <TextField
                fullWidth
                label="Phone"
                value={settings.company.phone}
                onChange={(e) => handleSettingChange('company', 'phone', e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={settings.company.email}
                onChange={(e) => handleSettingChange('company', 'email', e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Website"
                value={settings.company.website}
                onChange={(e) => handleSettingChange('company', 'website', e.target.value)}
                margin="normal"
              />
              <Box display="flex" gap={2} mt={2}>
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={settings.company.timezone}
                    label="Timezone"
                    onChange={(e) => handleSettingChange('company', 'timezone', e.target.value)}
                  >
                    {timezoneOptions.map(tz => (
                      <MenuItem key={tz} value={tz}>{tz}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={settings.company.currency}
                    label="Currency"
                    onChange={(e) => handleSettingChange('company', 'currency', e.target.value)}
                  >
                    {currencyOptions.map(curr => (
                      <MenuItem key={curr} value={curr}>{curr}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Notification Settings"
              avatar={<Notifications />}
            />
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                  />
                }
                label="Email Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.smsNotifications}
                    onChange={(e) => handleSettingChange('notifications', 'smsNotifications', e.target.checked)}
                  />
                }
                label="SMS Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.pushNotifications}
                    onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
                  />
                }
                label="Push Notifications"
              />
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Alert Types
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.leadAlerts}
                    onChange={(e) => handleSettingChange('notifications', 'leadAlerts', e.target.checked)}
                  />
                }
                label="Lead Alerts"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.projectUpdates}
                    onChange={(e) => handleSettingChange('notifications', 'projectUpdates', e.target.checked)}
                  />
                }
                label="Project Updates"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.systemAlerts}
                    onChange={(e) => handleSettingChange('notifications', 'systemAlerts', e.target.checked)}
                  />
                }
                label="System Alerts"
              />
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Reports
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.dailyReports}
                    onChange={(e) => handleSettingChange('notifications', 'dailyReports', e.target.checked)}
                  />
                }
                label="Daily Reports"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.weeklyReports}
                    onChange={(e) => handleSettingChange('notifications', 'weeklyReports', e.target.checked)}
                  />
                }
                label="Weekly Reports"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Security Settings"
              avatar={<Security />}
            />
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.security.twoFactorAuth}
                    onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                  />
                }
                label="Two-Factor Authentication"
              />
              <TextField
                fullWidth
                label="Session Timeout (minutes)"
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                margin="normal"
                inputProps={{ min: 5, max: 480 }}
              />
              <TextField
                fullWidth
                label="Password Expiry (days)"
                type="number"
                value={settings.security.passwordExpiry}
                onChange={(e) => handleSettingChange('security', 'passwordExpiry', parseInt(e.target.value))}
                margin="normal"
                inputProps={{ min: 30, max: 365 }}
              />
              <TextField
                fullWidth
                label="Failed Login Attempts"
                type="number"
                value={settings.security.failedLoginAttempts}
                onChange={(e) => handleSettingChange('security', 'failedLoginAttempts', parseInt(e.target.value))}
                margin="normal"
                inputProps={{ min: 3, max: 10 }}
              />
              <TextField
                fullWidth
                label="IP Whitelist (comma-separated)"
                value={settings.security.ipWhitelist}
                onChange={(e) => handleSettingChange('security', 'ipWhitelist', e.target.value)}
                margin="normal"
                placeholder="192.168.1.1, 10.0.0.1"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.security.auditLogging}
                    onChange={(e) => handleSettingChange('security', 'auditLogging', e.target.checked)}
                  />
                }
                label="Audit Logging"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Integrations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Integrations"
              avatar={<Email />}
            />
            <CardContent>
              <FormControl fullWidth margin="normal">
                <InputLabel>Email Provider</InputLabel>
                <Select
                  value={settings.integrations.emailProvider}
                  label="Email Provider"
                  onChange={(e) => handleSettingChange('integrations', 'emailProvider', e.target.value)}
                >
                  <MenuItem value="smtp">SMTP</MenuItem>
                  <MenuItem value="sendgrid">SendGrid</MenuItem>
                  <MenuItem value="mailgun">Mailgun</MenuItem>
                  <MenuItem value="aws-ses">AWS SES</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>SMS Provider</InputLabel>
                <Select
                  value={settings.integrations.smsProvider}
                  label="SMS Provider"
                  onChange={(e) => handleSettingChange('integrations', 'smsProvider', e.target.value)}
                >
                  <MenuItem value="twilio">Twilio</MenuItem>
                  <MenuItem value="aws-sns">AWS SNS</MenuItem>
                  <MenuItem value="nexmo">Nexmo</MenuItem>
                  <MenuItem value="none">None</MenuItem>
                </Select>
              </FormControl>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Sync Options
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.integrations.calendarSync}
                    onChange={(e) => handleSettingChange('integrations', 'calendarSync', e.target.checked)}
                  />
                }
                label="Calendar Sync"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.integrations.crmSync}
                    onChange={(e) => handleSettingChange('integrations', 'crmSync', e.target.checked)}
                  />
                }
                label="CRM Sync"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.integrations.accountingSync}
                    onChange={(e) => handleSettingChange('integrations', 'accountingSync', e.target.checked)}
                  />
                }
                label="Accounting Sync"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Success/Error Messages */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success">
          Settings saved successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
      >
        <Alert onClose={() => setShowError(false)} severity="error">
          Failed to save settings. Please try again.
        </Alert>
      </Snackbar>
    </Box>
  );
};