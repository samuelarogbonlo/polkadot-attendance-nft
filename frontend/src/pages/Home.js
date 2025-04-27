import React from 'react';
import { Button, Typography, Box, Grid, Paper, Card, CardContent, List, ListItem, ListItemIcon, ListItemText, Divider, useTheme } from '@mui/material';
import { CheckCircle, QrCode, Wallet, Celebration, Lock } from '@mui/icons-material';
import { Link } from 'react-router-dom';

function Home() {
  const theme = useTheme();

  return (
    <div>
      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
          color: 'white',
          mb: 4,
          p: { xs: 3, sm: 4, md: 6 },
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.5)' : 'none',
          '&::before': theme.palette.mode === 'dark' ? {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.2)',
            zIndex: 0
          } : {}
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            Polkadot Attendance NFT System
          </Typography>
          <Typography variant="h6" paragraph sx={{ maxWidth: '800px', mb: 4 }}>
            Reward event attendance with blockchain-verified NFTs that provide proof of participation 
            and unlock exclusive benefits in the Polkadot ecosystem.
          </Typography>
          <Button
            component={Link}
            to="/admin"
            variant="contained"
            size="large"
            sx={{ 
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)', // For Safari
              backgroundColor: 'rgba(255,255,255,0.85)',
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.95)',
              },
              fontWeight: 'bold',
              px: 4,
              py: 1.5,
              borderRadius: 4,
              boxShadow: '0px 4px 20px rgba(0,0,0,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.2s ease-in-out',
            }}
          >
            Admin Dashboard
          </Button>
        </Box>
        
        {/* Background decorative elements */}
        <Box sx={{ 
          position: 'absolute', 
          right: -50, 
          bottom: -50,
          width: '300px', 
          height: '300px', 
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.1)',
          zIndex: 0
        }} />
        <Box sx={{ 
          position: 'absolute', 
          right: 100, 
          top: -50,
          width: '150px', 
          height: '150px', 
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.1)',
          zIndex: 0
        }} />
      </Paper>

      {/* How It Works */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3 }}>
          How It Works
        </Typography>
        <Divider sx={{ mb: 4 }} />
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <List>
              <WorkflowStep 
                icon={<Celebration />} 
                primary="1. Event Creation" 
                secondary="Organizers create events in both Luma and this platform"
              />
              <WorkflowStep 
                icon={<Wallet />} 
                primary="2. Registration" 
                secondary="Attendees register and provide their Polkadot wallet address"
              />
              <WorkflowStep 
                icon={<QrCode />} 
                primary="3. Check-In" 
                secondary="At the event, organizers scan attendee QR codes"
              />
              <WorkflowStep 
                icon={<CheckCircle />} 
                primary="4. NFT Minting" 
                secondary="Our system automatically mints and sends an NFT to the attendee's wallet"
              />
              <WorkflowStep 
                icon={<Lock />} 
                primary="5. Exclusive Benefits" 
                secondary="Attendees use these NFTs to prove participation and access exclusive benefits"
              />
            </List>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ 
              height: '100%', 
              borderRadius: 2,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(30, 30, 30, 0.95)' 
                : 'rgba(255, 255, 255, 0.8)',
              border: theme.palette.mode === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(229, 229, 229, 0.5)',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                : '0 8px 32px rgba(0, 0, 0, 0.08)'
            }}>
              <CardContent sx={{ 
                p: 4,
                ...(theme.palette.mode === 'dark' && {
                  color: '#ffffff'
                })
              }}>
                <Typography 
                  variant="h5" 
                  component="h3" 
                  gutterBottom 
                  sx={{ 
                    mb: 2,
                    color: theme.palette.mode === 'dark' 
                      ? theme.palette.primary.light 
                      : theme.palette.primary.main
                  }}
                >
                  Benefits of Attendance NFTs
                </Typography>
                <Divider sx={{ 
                  mb: 3,
                  borderColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(0, 0, 0, 0.1)'
                }} />
                <Box sx={{ mb: 2 }}>
                  <Typography 
                    variant="subtitle1" 
                    fontWeight="bold"
                    sx={{ 
                      color: theme.palette.mode === 'dark' 
                        ? theme.palette.primary.light 
                        : 'inherit'
                    }}
                  >
                    For Attendees:
                  </Typography>
                  <Typography 
                    variant="body1" 
                    paragraph
                    sx={{ 
                      color: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.9)' 
                        : 'inherit'
                    }}
                  >
                    ✓ Verifiable proof of participation<br />
                    ✓ Access to exclusive content and communities<br />
                    ✓ Digital collectibles with historical significance<br />
                    ✓ Potential future airdrops or reward eligibility
                  </Typography>
                </Box>
                <Box>
                  <Typography 
                    variant="subtitle1" 
                    fontWeight="bold"
                    sx={{ 
                      color: theme.palette.mode === 'dark' 
                        ? theme.palette.primary.light 
                        : 'inherit'
                    }}
                  >
                    For Organizers:
                  </Typography>
                  <Typography 
                    variant="body1"
                    sx={{ 
                      color: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.9)' 
                        : 'inherit'
                    }}
                  >
                    ✓ Increased attendee engagement<br />
                    ✓ Building a verifiable community<br />
                    ✓ Enhanced event value proposition<br />
                    ✓ Future engagement opportunities
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}

function WorkflowStep({ icon, primary, secondary }) {
  return (
    <ListItem sx={{ pb: 3 }}>
      <ListItemIcon sx={{ color: 'primary.main', fontSize: '2rem' }}>
        {icon}
      </ListItemIcon>
      <ListItemText 
        primary={<Typography variant="h6">{primary}</Typography>}
        secondary={<Typography variant="body1" color="text.secondary">{secondary}</Typography>}
      />
    </ListItem>
  );
}

export default Home;