import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, Chip, NoSsr, Button, Dialog, 
  DialogTitle, DialogContent, DialogActions, IconButton, useTheme
} from '@mui/material';
import { 
  Event, Room, Webhook, Close, MoreVert, QrCode, Edit, Delete
} from '@mui/icons-material';
import WebhookSetup from './WebhookSetup';

function EventList({ events }) {
  const theme = useTheme();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [webhookDialogOpen, setWebhookDialogOpen] = useState(false);

  const handleOpenWebhookDialog = (event) => {
    setSelectedEvent(event);
    setWebhookDialogOpen(true);
  };

  const handleCloseWebhookDialog = () => {
    setWebhookDialogOpen(false);
  };

  if (!events || events.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="body1" color="text.secondary">
          No events found. Create your first event!
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }} aria-label="events table">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => {
              // Calculate if event is upcoming, active, or past
              const eventDate = new Date(event.date);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              let status = 'upcoming';
              let chipColor = 'primary';
              
              if (eventDate.getTime() === today.getTime()) {
                status = 'active';
                chipColor = 'success';
              } else if (eventDate < today) {
                status = 'past';
                chipColor = 'default';
              }
              
              return (
                <TableRow
                  key={event.id}
                  sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
                >
                  <TableCell component="th" scope="row">
                    {event.id}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {event.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Event fontSize="small" sx={{ mr: 1, color: 'primary.main', opacity: 0.7 }} />
                      <NoSsr>
                        {new Date(event.date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </NoSsr>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Room fontSize="small" sx={{ mr: 1, color: 'primary.main', opacity: 0.7 }} />
                      {event.location}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={status.charAt(0).toUpperCase() + status.slice(1)} 
                      color={chipColor}
                      size="small"
                      variant={status === 'active' ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 'medium' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        color="secondary"
                        startIcon={<Webhook />}
                        onClick={() => handleOpenWebhookDialog(event)}
                        sx={{ borderRadius: '8px' }}
                      >
                        Configure
                      </Button>
                      <IconButton size="small" sx={{ color: theme.palette.grey[600] }}>
                        <Edit fontSize="small" />
                      </IconButton>
                      {status !== 'past' && (
                        <IconButton size="small" sx={{ color: theme.palette.grey[600] }}>
                          <QrCode fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Webhook Setup Dialog */}
      <Dialog
        open={webhookDialogOpen}
        onClose={handleCloseWebhookDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Connect Event to Luma
            </Typography>
            <IconButton edge="end" color="inherit" onClick={handleCloseWebhookDialog} aria-label="close">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedEvent && (
            <Box>
              <Box sx={{ mb: 3, px: 1 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                  {selectedEvent.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Event fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {new Date(selectedEvent.date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Room fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {selectedEvent.location}
                  </Typography>
                </Box>
              </Box>
              
              <WebhookSetup 
                eventId={selectedEvent.id} 
                eventName={selectedEvent.name} 
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseWebhookDialog}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default EventList;