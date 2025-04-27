import React, { useState } from 'react';
import { api } from '../services/api';
import { 
  TextField, Button, Grid, Alert, AlertTitle,
  CircularProgress, Box, InputAdornment, Snackbar,
  Divider, Typography, Dialog, DialogActions, DialogContent,
  DialogTitle, Paper, Card, CardContent, CardActionArea,
  Tooltip, IconButton
} from '@mui/material';
import { 
  Event, LocationOn, Title, Add, CloudDownload, Close, 
  LinkOff, Link as LinkIcon, Check
} from '@mui/icons-material';

function EventForm({ onEventCreated }) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [lumaConnected, setLumaConnected] = useState(false);
  const [mockLumaEvents, setMockLumaEvents] = useState([]);
  const [connectingLuma, setConnectingLuma] = useState(false);
  const [importingEvent, setImportingEvent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    startDate: '',
    endDate: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Mock function to simulate Luma connection
  const handleConnectLuma = () => {
    setConnectingLuma(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setLumaConnected(true);
      setConnectingLuma(false);
      
      // Set mock events when connected
      setMockLumaEvents([
        {
          id: 'luma-123',
          name: 'Polkadot Meetup Berlin',
          date: '2025-05-15',
          location: 'Berlin, Germany'
        },
        {
          id: 'luma-456',
          name: 'Web3 Developer Conference',
          date: '2025-06-22',
          location: 'London, UK'
        },
        {
          id: 'luma-789',
          name: 'Blockchain Workshop',
          date: '2025-07-10',
          location: 'Paris, France'
        }
      ]);
    }, 1500);
  };

  // Mock function to simulate importing an event from Luma
  const handleImportEvent = (event) => {
    setImportingEvent(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setFormData({
        name: event.name,
        date: event.date,
        location: event.location,
        startDate: event.date,
        endDate: event.date,
      });
      
      setImportingEvent(false);
      setImportDialogOpen(false);
      
      // Show success message
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Convert the date to Unix timestamp
      const startTimestamp = new Date(formData.startDate).getTime() / 1000;
      const endTimestamp = new Date(formData.endDate).getTime() / 1000;
      
      const eventData = {
        ...formData,
        start_time: startTimestamp,
        end_time: endTimestamp,
      };
      
      const response = await api.createEvent(eventData);
      
      // Reset form and show success message
      setFormData({
        name: '',
        date: '',
        location: '',
        startDate: '',
        endDate: '',
      });
      onEventCreated(response);
      
    } catch (error) {
      console.error('Error creating event:', error);
      setError('Failed to create event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Import from Luma button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => setImportDialogOpen(true)}
          startIcon={<CloudDownload />}
          sx={{ 
            borderRadius: 2,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderColor: 'rgba(85, 43, 191, 0.5)',
            '&:hover': {
              borderColor: 'rgba(85, 43, 191, 0.8)',
              backgroundColor: 'rgba(85, 43, 191, 0.08)',
            },
          }}
        >
          Import from Luma
        </Button>
      </Box>

      <form onSubmit={handleSubmit}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}

        <Snackbar
          open={success}
          autoHideDuration={4000}
          onClose={() => setSuccess(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success" variant="filled">
            Event created successfully!
          </Alert>
        </Snackbar>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              id="name"
              label="Event Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
              placeholder="e.g. Polkadot Meetup Berlin"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Title fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              id="date"
              label="Event Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Event fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              id="location"
              label="Event Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
              fullWidth
              placeholder="e.g. Berlin, Germany"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Add />}
                sx={{ 
                  px: 4, 
                  py: 1, 
                  borderRadius: 2,
                  backdropFilter: submitting ? 'none' : 'blur(8px)',
                  WebkitBackdropFilter: submitting ? 'none' : 'blur(8px)',
                  backgroundColor: submitting ? 'rgba(0,0,0,0.12)' : 'rgba(230, 0, 122, 0.85)',
                  '&:hover': {
                    backgroundColor: 'rgba(230, 0, 122, 0.95)',
                  },
                  boxShadow: '0 4px 12px rgba(230, 0, 122, 0.3)',
                  border: '1px solid rgba(230, 0, 122, 0.1)',
                }}
              >
                {submitting ? 'Creating...' : 'Create Event'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      {/* Import from Luma Dialog */}
      <Dialog 
        open={importDialogOpen} 
        onClose={() => setImportDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Import Events from Luma</Typography>
            <IconButton onClick={() => setImportDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {!lumaConnected ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
              <LinkOff sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>Not Connected to Luma</Typography>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3, maxWidth: 450 }}>
                Connect your Luma account to import events. This will allow you to easily sync events 
                and automatically configure webhooks for NFT minting.
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                startIcon={connectingLuma ? <CircularProgress size={20} color="inherit" /> : <LinkIcon />}
                onClick={handleConnectLuma}
                disabled={connectingLuma}
              >
                {connectingLuma ? 'Connecting...' : 'Connect Luma Account'}
              </Button>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Check sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="body2" color="success.main">
                  Connected to Luma
                </Typography>
              </Box>
              
              <Typography variant="subtitle1" gutterBottom>
                Select an event to import:
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {mockLumaEvents.map((event) => (
                  <Grid item xs={12} md={6} key={event.id}>
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardActionArea 
                        onClick={() => handleImportEvent(event)}
                        disabled={importingEvent}
                      >
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {event.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Event sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {event.date}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationOn sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {event.location}
                            </Typography>
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default EventForm;