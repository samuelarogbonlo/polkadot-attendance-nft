import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  TextField, 
  Snackbar, 
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
  useTheme
} from '@mui/material';
import { api } from '../services/api';

/**
 * MockCheckInSimulator component to trigger simulated Luma check-in events
 * This is used for demonstration purposes since a real Luma API integration
 * requires a paid subscription.
 */
const MockCheckInSimulator = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    eventId: 'luma123',
    attendeeId: 'attendee456',
    attendeeName: 'John Doe',
    walletAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSimulate = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Simulate successful check-in (no actual API call needed in mock mode)
      // This will just show the success message without actually calling the backend
      
      setTimeout(() => {
        setSuccess(true);
        setLoading(false);
        console.log('Simulated check-in successful (mock mode)');
      }, 1000);
      
      return;
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error('Error simulating check-in:', err);
    }
  };

  return (
    <Card 
      sx={{ 
        mt: 4, 
        border: `1px solid ${theme.palette.divider}`,
        background: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.05)' 
          : 'rgba(0, 0, 0, 0.02)',
        boxShadow: theme.shadows[2]
      }}
    >
      <CardContent>
        <Typography variant="h6" color="primary" gutterBottom>
          Demo: Simulate Luma Check-In
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          This simulates a webhook from Luma when an attendee checks in at an event. 
          In production, this would come from the actual Luma API integration.
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Event ID"
              name="eventId"
              value={formData.eventId}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              size="small"
              helperText="Luma event identifier"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Attendee ID"
              name="attendeeId"
              value={formData.attendeeId}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              size="small"
              helperText="Luma attendee identifier"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Attendee Name"
              name="attendeeName"
              value={formData.attendeeName}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              size="small"
              helperText="This would come from Luma in production"
              disabled
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Wallet Address"
              name="walletAddress"
              value={formData.walletAddress}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              size="small"
              helperText="This would be from a Luma custom field in production"
              disabled
            />
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSimulate}
            disabled={loading}
            sx={{ 
              minWidth: 200,
              background: 'linear-gradient(45deg, #E6007A 30%, #8B00BF 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #D0006A 30%, #7A00AF 90%)',
              }
            }}
          >
            {loading ? 'Simulating...' : 'Simulate Check-In'}
          </Button>
        </Box>
        
        <Snackbar 
          open={success} 
          autoHideDuration={6000} 
          onClose={() => setSuccess(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" onClose={() => setSuccess(false)}>
            Check-in simulated successfully! NFT minting process initiated.
          </Alert>
        </Snackbar>
        
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={() => setError('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
};

export default MockCheckInSimulator; 