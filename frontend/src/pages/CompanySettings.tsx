import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Business,
  Settings,
  Security,
  Notifications,
  Palette,
  Language,
  Storage,
  CloudSync,
  Email,
  Phone,
  LocationOn,
  Save,
  Restore,
  Upload,
  Download,
  Edit,
  Delete,
  Add,
  ExpandMore,
  Warning,
  CheckCircle,
  Info,
  VpnKey,
  Schedule,
  Group,
  Assessment,
  MonetizationOn
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

// Settings interfaces
interface CompanyInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  logo?: string;
  industry: string;
  employeeCount: string;
  description: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  workflowAlerts: boolean;
  approvalReminders: boolean;
  systemUpdates: boolean;
  securityAlerts: boolean;
  reportSchedules: boolean;
}

interface SecuritySettings {
  passwordMinLength: number;
  passwordComplexity: boolean;
  twoFactorAuth: boolean;
  sessionTimeout: number;
  ipWhitelist: string[];
  auditLogging: boolean;
  dataEncryption: boolean;
  backupFrequency: string;
}

interface SystemSettings {
  timezone: string;
  dateFormat: string;
  currency: string;
  language: string;
  theme: 'light' | 'dark' | 'auto';
  autoSave: boolean;
  maxFileSize: number;
  workflowTimeout: number;
}

interface BillingInfo {
  plan: 'basic' | 'professional' | 'enterprise';
  billingCycle: 'monthly' | 'yearly';
  nextBilling: Date;
  paymentMethod: string;
  billingAddress: string;
  invoiceEmail: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const CompanySettings: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Settings states
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: 'BizFlow360 Corporation',
    address: '123 Business Avenue',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States',
    phone: '+1-555-0123',
    email: 'contact@bizflow360.com',
    website: 'https://www.bizflow360.com',
    industry: 'Technology',
    employeeCount: '100-500',
    description: 'Leading provider of business process automation solutions'
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    workflowAlerts: true,
    approvalReminders: true,
    systemUpdates: true,
    securityAlerts: true,
    reportSchedules: false
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    passwordMinLength: 8,
    passwordComplexity: true,
    twoFactorAuth: true,
    sessionTimeout: 30,
    ipWhitelist: [],
    auditLogging: true,
    dataEncryption: true,
    backupFrequency: 'daily'
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    language: 'en',
    theme: 'light',
    autoSave: true,
    maxFileSize: 10,
    workflowTimeout: 60
  });

  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    plan: 'professional',
    billingCycle: 'monthly',
    nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    paymentMethod: '**** **** **** 1234',
    billingAddress: '123 Business Avenue, New York, NY 10001',
    invoiceEmail: 'billing@bizflow360.com'
  });

  const handleSaveSettings = async (settingsType: string) => {
    setLoading(true);
    try {
      // Simulate API call
      console.log(`Saving ${settingsType} settings`);
      
      setTimeout(() => {
        setSnackbar({ 
          open: true, 
          message: `${settingsType} settings saved successfully`, 
          severity: 'success' 
        });
        setUnsavedChanges(false);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSnackbar({ 
        open: true, 
        message: 'Error saving settings', 
        severity: 'error' 
      });
      setLoading(false);
    }
  };

  const handleExportSettings = () => {
    const settings = {
      companyInfo,
      notificationSettings,
      securitySettings,
      systemSettings
    };
    
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'company-settings.json';
    link.click();
    
    setSnackbar({ 
      open: true, 
      message: 'Settings exported successfully', 
      severity: 'success' 
    });
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string);
        if (settings.companyInfo) setCompanyInfo(settings.companyInfo);
        if (settings.notificationSettings) setNotificationSettings(settings.notificationSettings);
        if (settings.securitySettings) setSecuritySettings(settings.securitySettings);
        if (settings.systemSettings) setSystemSettings(settings.systemSettings);
        
        setSnackbar({ 
          open: true, 
          message: 'Settings imported successfully', 
          severity: 'success' 
        });
      } catch (error) {
        setSnackbar({ 
          open: true, 
          message: 'Error importing settings file', 
          severity: 'error' 
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Company Settings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Configure your organization's settings, preferences, and policies
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <input
              accept=".json"
              style={{ display: 'none' }}
              id="import-settings-file"
              type="file"
              onChange={handleImportSettings}
            />
            <label htmlFor="import-settings-file">
              <Button variant="outlined" component="span" startIcon={<Upload />}>
                Import
              </Button>
            </label>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleExportSettings}
            >
              Export
            </Button>
          </Box>
        </Box>

        {unsavedChanges && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            You have unsaved changes. Don't forget to save your settings.
          </Alert>
        )}
      </Box>

      {/* Settings Tabs */}
      <Paper>
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Company Info" icon={<Business />} />
          <Tab label="Security" icon={<Security />} />
          <Tab label="Notifications" icon={<Notifications />} />
          <Tab label="System" icon={<Settings />} />
          <Tab label="Billing" icon={<MonetizationOn />} />
          <Tab label="Integrations" icon={<CloudSync />} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Company Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={companyInfo.name}
                  onChange={(e) => {
                    setCompanyInfo({ ...companyInfo, name: e.target.value });
                    setUnsavedChanges(true);
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Industry</InputLabel>
                  <Select
                    value={companyInfo.industry}
                    onChange={(e) => {
                      setCompanyInfo({ ...companyInfo, industry: e.target.value });
                      setUnsavedChanges(true);
                    }}
                    label="Industry"
                  >
                    <MenuItem value="Technology">Technology</MenuItem>
                    <MenuItem value="Finance">Finance</MenuItem>
                    <MenuItem value="Healthcare">Healthcare</MenuItem>
                    <MenuItem value="Manufacturing">Manufacturing</MenuItem>
                    <MenuItem value="Retail">Retail</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={companyInfo.address}
                  onChange={(e) => {
                    setCompanyInfo({ ...companyInfo, address: e.target.value });
                    setUnsavedChanges(true);
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="City"
                  value={companyInfo.city}
                  onChange={(e) => {
                    setCompanyInfo({ ...companyInfo, city: e.target.value });
                    setUnsavedChanges(true);
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="State"
                  value={companyInfo.state}
                  onChange={(e) => {
                    setCompanyInfo({ ...companyInfo, state: e.target.value });
                    setUnsavedChanges(true);
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="ZIP Code"
                  value={companyInfo.zipCode}
                  onChange={(e) => {
                    setCompanyInfo({ ...companyInfo, zipCode: e.target.value });
                    setUnsavedChanges(true);
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={companyInfo.phone}
                  onChange={(e) => {
                    setCompanyInfo({ ...companyInfo, phone: e.target.value });
                    setUnsavedChanges(true);
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={companyInfo.email}
                  onChange={(e) => {
                    setCompanyInfo({ ...companyInfo, email: e.target.value });
                    setUnsavedChanges(true);
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Website"
                  value={companyInfo.website}
                  onChange={(e) => {
                    setCompanyInfo({ ...companyInfo, website: e.target.value });
                    setUnsavedChanges(true);
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Employee Count</InputLabel>
                  <Select
                    value={companyInfo.employeeCount}
                    onChange={(e) => {
                      setCompanyInfo({ ...companyInfo, employeeCount: e.target.value });
                      setUnsavedChanges(true);
                    }}
                    label="Employee Count"
                  >
                    <MenuItem value="1-10">1-10</MenuItem>
                    <MenuItem value="11-50">11-50</MenuItem>
                    <MenuItem value="51-100">51-100</MenuItem>
                    <MenuItem value="100-500">100-500</MenuItem>
                    <MenuItem value="500+">500+</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company Description"
                  multiline
                  rows={3}
                  value={companyInfo.description}
                  onChange={(e) => {
                    setCompanyInfo({ ...companyInfo, description: e.target.value });
                    setUnsavedChanges(true);
                  }}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={() => handleSaveSettings('Company Information')}
                disabled={loading}
              >
                Save Changes
              </Button>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Security Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle1">Password Policy</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography gutterBottom>
                          Minimum Password Length: {securitySettings.passwordMinLength}
                        </Typography>
                        <Slider
                          value={securitySettings.passwordMinLength}
                          onChange={(_, value) => {
                            setSecuritySettings({ ...securitySettings, passwordMinLength: value as number });
                            setUnsavedChanges(true);
                          }}
                          min={6}
                          max={20}
                          marks
                          valueLabelDisplay="auto"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={securitySettings.passwordComplexity}
                              onChange={(e) => {
                                setSecuritySettings({ ...securitySettings, passwordComplexity: e.target.checked });
                                setUnsavedChanges(true);
                              }}
                            />
                          }
                          label="Require Complex Passwords"
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              <Grid item xs={12}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle1">Authentication</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={securitySettings.twoFactorAuth}
                              onChange={(e) => {
                                setSecuritySettings({ ...securitySettings, twoFactorAuth: e.target.checked });
                                setUnsavedChanges(true);
                              }}
                            />
                          }
                          label="Enable Two-Factor Authentication"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Session Timeout (minutes)</InputLabel>
                          <Select
                            value={securitySettings.sessionTimeout}
                            onChange={(e) => {
                              setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value as number });
                              setUnsavedChanges(true);
                            }}
                            label="Session Timeout (minutes)"
                          >
                            <MenuItem value={15}>15 minutes</MenuItem>
                            <MenuItem value={30}>30 minutes</MenuItem>
                            <MenuItem value={60}>1 hour</MenuItem>
                            <MenuItem value={120}>2 hours</MenuItem>
                            <MenuItem value={480}>8 hours</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              <Grid item xs={12}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle1">Data Protection</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={securitySettings.auditLogging}
                              onChange={(e) => {
                                setSecuritySettings({ ...securitySettings, auditLogging: e.target.checked });
                                setUnsavedChanges(true);
                              }}
                            />
                          }
                          label="Enable Audit Logging"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={securitySettings.dataEncryption}
                              onChange={(e) => {
                                setSecuritySettings({ ...securitySettings, dataEncryption: e.target.checked });
                                setUnsavedChanges(true);
                              }}
                            />
                          }
                          label="Enable Data Encryption"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Backup Frequency</InputLabel>
                          <Select
                            value={securitySettings.backupFrequency}
                            onChange={(e) => {
                              setSecuritySettings({ ...securitySettings, backupFrequency: e.target.value });
                              setUnsavedChanges(true);
                            }}
                            label="Backup Frequency"
                          >
                            <MenuItem value="hourly">Hourly</MenuItem>
                            <MenuItem value="daily">Daily</MenuItem>
                            <MenuItem value="weekly">Weekly</MenuItem>
                            <MenuItem value="monthly">Monthly</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={() => handleSaveSettings('Security')}
                disabled={loading}
              >
                Save Security Settings
              </Button>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notification Preferences
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Communication Channels
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText primary="Email Notifications" />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.emailNotifications}
                          onChange={(e) => {
                            setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked });
                            setUnsavedChanges(true);
                          }}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="SMS Notifications" />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.smsNotifications}
                          onChange={(e) => {
                            setNotificationSettings({ ...notificationSettings, smsNotifications: e.target.checked });
                            setUnsavedChanges(true);
                          }}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Push Notifications" />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.pushNotifications}
                          onChange={(e) => {
                            setNotificationSettings({ ...notificationSettings, pushNotifications: e.target.checked });
                            setUnsavedChanges(true);
                          }}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Notification Types
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText primary="Workflow Alerts" />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.workflowAlerts}
                          onChange={(e) => {
                            setNotificationSettings({ ...notificationSettings, workflowAlerts: e.target.checked });
                            setUnsavedChanges(true);
                          }}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Approval Reminders" />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.approvalReminders}
                          onChange={(e) => {
                            setNotificationSettings({ ...notificationSettings, approvalReminders: e.target.checked });
                            setUnsavedChanges(true);
                          }}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="System Updates" />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.systemUpdates}
                          onChange={(e) => {
                            setNotificationSettings({ ...notificationSettings, systemUpdates: e.target.checked });
                            setUnsavedChanges(true);
                          }}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Security Alerts" />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.securityAlerts}
                          onChange={(e) => {
                            setNotificationSettings({ ...notificationSettings, securityAlerts: e.target.checked });
                            setUnsavedChanges(true);
                          }}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Report Schedules" />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.reportSchedules}
                          onChange={(e) => {
                            setNotificationSettings({ ...notificationSettings, reportSchedules: e.target.checked });
                            setUnsavedChanges(true);
                          }}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={() => handleSaveSettings('Notification')}
                disabled={loading}
              >
                Save Notification Settings
              </Button>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Preferences
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={systemSettings.timezone}
                    onChange={(e) => {
                      setSystemSettings({ ...systemSettings, timezone: e.target.value });
                      setUnsavedChanges(true);
                    }}
                    label="Timezone"
                  >
                    <MenuItem value="America/New_York">Eastern Time (UTC-5)</MenuItem>
                    <MenuItem value="America/Chicago">Central Time (UTC-6)</MenuItem>
                    <MenuItem value="America/Denver">Mountain Time (UTC-7)</MenuItem>
                    <MenuItem value="America/Los_Angeles">Pacific Time (UTC-8)</MenuItem>
                    <MenuItem value="Europe/London">GMT (UTC+0)</MenuItem>
                    <MenuItem value="Europe/Paris">CET (UTC+1)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Date Format</InputLabel>
                  <Select
                    value={systemSettings.dateFormat}
                    onChange={(e) => {
                      setSystemSettings({ ...systemSettings, dateFormat: e.target.value });
                      setUnsavedChanges(true);
                    }}
                    label="Date Format"
                  >
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                    <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={systemSettings.currency}
                    onChange={(e) => {
                      setSystemSettings({ ...systemSettings, currency: e.target.value });
                      setUnsavedChanges(true);
                    }}
                    label="Currency"
                  >
                    <MenuItem value="USD">USD - US Dollar</MenuItem>
                    <MenuItem value="EUR">EUR - Euro</MenuItem>
                    <MenuItem value="GBP">GBP - British Pound</MenuItem>
                    <MenuItem value="JPY">JPY - Japanese Yen</MenuItem>
                    <MenuItem value="CAD">CAD - Canadian Dollar</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={systemSettings.language}
                    onChange={(e) => {
                      setSystemSettings({ ...systemSettings, language: e.target.value });
                      setUnsavedChanges(true);
                    }}
                    label="Language"
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                    <MenuItem value="de">German</MenuItem>
                    <MenuItem value="it">Italian</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>
                  Max File Size (MB): {systemSettings.maxFileSize}
                </Typography>
                <Slider
                  value={systemSettings.maxFileSize}
                  onChange={(_, value) => {
                    setSystemSettings({ ...systemSettings, maxFileSize: value as number });
                    setUnsavedChanges(true);
                  }}
                  min={1}
                  max={100}
                  marks
                  valueLabelDisplay="auto"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>
                  Workflow Timeout (minutes): {systemSettings.workflowTimeout}
                </Typography>
                <Slider
                  value={systemSettings.workflowTimeout}
                  onChange={(_, value) => {
                    setSystemSettings({ ...systemSettings, workflowTimeout: value as number });
                    setUnsavedChanges(true);
                  }}
                  min={15}
                  max={480}
                  step={15}
                  marks
                  valueLabelDisplay="auto"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.autoSave}
                      onChange={(e) => {
                        setSystemSettings({ ...systemSettings, autoSave: e.target.checked });
                        setUnsavedChanges(true);
                      }}
                    />
                  }
                  label="Enable Auto-Save"
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={() => handleSaveSettings('System')}
                disabled={loading}
              >
                Save System Settings
              </Button>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Billing & Subscription
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        Current Plan
                      </Typography>
                      <Chip 
                        label={billingInfo.plan.toUpperCase()} 
                        color="primary"
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Next billing date: {billingInfo.nextBilling.toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Payment method: {billingInfo.paymentMethod}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Billing cycle: {billingInfo.billingCycle}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Button variant="outlined" sx={{ mr: 1 }}>
                        Change Plan
                      </Button>
                      <Button variant="outlined">
                        Update Payment Method
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Usage Statistics
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText primary="Active Users" secondary="42 / 100" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Workflows" secondary="156 / 500" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Storage" secondary="8.5 GB / 50 GB" />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Third-party Integrations
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <Email />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          Email Integration
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Connect your email service
                        </Typography>
                      </Box>
                    </Box>
                    <Button variant="outlined" fullWidth>
                      Configure
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                        <CloudSync />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          Cloud Storage
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Sync with cloud storage
                        </Typography>
                      </Box>
                    </Box>
                    <Button variant="outlined" fullWidth>
                      Configure
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                        <Assessment />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          Analytics Platform
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Advanced analytics integration
                        </Typography>
                      </Box>
                    </Box>
                    <Button variant="contained" fullWidth>
                      Connected
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                        <VpnKey />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          SSO Provider
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Single sign-on integration
                        </Typography>
                      </Box>
                    </Box>
                    <Button variant="outlined" fullWidth>
                      Configure
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CompanySettings;
