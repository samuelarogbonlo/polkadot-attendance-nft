import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import WalletConnector from '../components/WalletConnector';
import { api } from '../services/api';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (walletAddress) => {
    // After successful login, redirect to admin dashboard
    navigate('/admin');
  };

  // If user is already logged in, redirect to admin
  React.useEffect(() => {
    if (api.isAuthenticated()) {
      navigate('/admin');
    }
  }, [navigate]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Polkadot Attendance NFT
          </Typography>
          
          <Typography variant="body1" align="center" sx={{ mb: 4 }}>
            Connect your Polkadot wallet to manage events and mint attendance NFTs
          </Typography>
          
          <WalletConnector onLogin={handleLogin} />
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 