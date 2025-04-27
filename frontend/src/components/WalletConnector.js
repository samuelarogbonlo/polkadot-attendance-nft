import React, { useState, useEffect } from 'react';
import { Button, Card, CardContent, Typography, CircularProgress, FormControl, Select, MenuItem, InputLabel, Box, Alert, Stack, Divider, TextField } from '@mui/material';
import { api } from '../services/api';
import { stringToHex } from '@polkadot/util';

const WalletConnector = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [error, setError] = useState('');
  const [extensionDetected, setExtensionDetected] = useState(false);
  const [showNoAccountsHelp, setShowNoAccountsHelp] = useState(false);
  const [browserInfo, setBrowserInfo] = useState({ name: '', supported: true });
  const [checkingExtension, setCheckingExtension] = useState(true);
  const [debugInfo, setDebugInfo] = useState('');
  const [showManualMode, setShowManualMode] = useState(false);
  const [manualAddress, setManualAddress] = useState('');

  // Use a more reliable method to detect the extension
  useEffect(() => {
    // Detect browser type
    const detectBrowser = () => {
      const userAgent = navigator.userAgent;
      let browserName = "Unknown";
      let isSupported = true;

      if (userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1) {
        browserName = "Safari";
        isSupported = false;
      } else if (userAgent.indexOf("Firefox") > -1) {
        browserName = "Firefox";
      } else if (userAgent.indexOf("Edge") > -1) {
        browserName = "Edge";
      } else if (userAgent.indexOf("Chrome") > -1) {
        browserName = "Chrome";
      } else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
        browserName = "Opera";
      }

      setBrowserInfo({ name: browserName, supported: isSupported });
    };

    detectBrowser();

    // Improved extension detection
    const checkExtension = async () => {
      setCheckingExtension(true);
      try {
        // Method 1: Check window.injectedWeb3
        if (window.injectedWeb3 && window.injectedWeb3['polkadot-js']) {
          console.log("Extension detected via window.injectedWeb3");
          setExtensionDetected(true);
          setCheckingExtension(false);
          return;
        }

        // Method 2: Try to directly use the extension API
        const { web3Enable } = await import('@polkadot/extension-dapp');
        const extensions = await web3Enable('Polkadot Attendance NFT');
        
        if (extensions && extensions.length > 0) {
          console.log("Extension detected via web3Enable");
          setExtensionDetected(true);
          setCheckingExtension(false);
          return;
        }

        // Method 3: Check if extension object exists
        if (window.injectedWeb3 || window.injected || document.querySelector('polkadot-js')) {
          console.log("Extension detected via DOM or window objects");
          setExtensionDetected(true);
          setCheckingExtension(false);
          return;
        }

        console.log("Extension not detected by any method");
        setExtensionDetected(false);
      } catch (err) {
        console.error('Error checking for Polkadot extension:', err);
        setExtensionDetected(false);
      } finally {
        setCheckingExtension(false);
      }
    };
    
    // Only check for extension if browser is supported
    if (browserInfo.supported) {
      checkExtension();
      
      // Add event listener for extension installation
      window.addEventListener('DOMContentLoaded', checkExtension);
      window.addEventListener('focus', checkExtension);
      
      return () => {
        window.removeEventListener('DOMContentLoaded', checkExtension);
        window.removeEventListener('focus', checkExtension);
      };
    }
  }, [browserInfo.supported]);

  // Add direct connection function to bypass extension detection
  const forceConnectWallet = async () => {
    setLoading(true);
    setError('');
    setShowNoAccountsHelp(false);
    
    try {
      // Load the extension
      const { web3Enable, web3Accounts } = await import('@polkadot/extension-dapp');
      
      // Enable the extension - try multiple times
      let extensions = [];
      let attempts = 0;
      
      while (attempts < 3 && extensions.length === 0) {
        attempts++;
        setDebugInfo(prev => prev + `\nAttempt ${attempts} to enable extension...`);
        extensions = await web3Enable('Polkadot Attendance NFT');
        console.log(`Attempt ${attempts}: Extensions enabled:`, extensions);
        
        if (extensions.length === 0 && attempts < 3) {
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      setDebugInfo(prev => prev + `\nExtension enabled: ${extensions.length > 0}`);
      console.log("Extensions enabled:", extensions);
      
      // Try to get accounts explicitly
      let allAccounts = [];
      attempts = 0;
      
      while (attempts < 3 && allAccounts.length === 0) {
        attempts++;
        setDebugInfo(prev => prev + `\nAttempt ${attempts} to get accounts...`);
        try {
          allAccounts = await web3Accounts();
          console.log(`Attempt ${attempts}: Accounts:`, allAccounts);
        } catch (e) {
          console.error(`Attempt ${attempts} error:`, e);
          setDebugInfo(prev => prev + `\nError: ${e.message}`);
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      setDebugInfo(prev => prev + `\nAccounts found: ${allAccounts.length}`);
      
      if (allAccounts.length === 0) {
        // Check if the window.injectedWeb3 object has accounts directly
        try {
          const directInjected = window.injectedWeb3['polkadot-js'];
          if (directInjected && directInjected.accounts && directInjected.accounts.get) {
            setDebugInfo(prev => prev + `\nTrying direct access to injected accounts...`);
            const directAccounts = await directInjected.accounts.get();
            if (directAccounts && directAccounts.length > 0) {
              allAccounts = directAccounts;
              setDebugInfo(prev => prev + `\nDirect accounts found: ${directAccounts.length}`);
            }
          }
        } catch (e) {
          console.error("Error accessing direct accounts:", e);
          setDebugInfo(prev => prev + `\nDirect access error: ${e.message}`);
        }
      }
      
      if (allAccounts.length === 0) {
        setShowNoAccountsHelp(true);
        setDebugInfo(prev => prev + `\nNo accounts found. Make sure to allow access in the extension popup.`);
        setError('No accounts found. Make sure you have created an account in the Polkadot.js extension and approved this application to access it. Check your extension for permission popups.');
        setLoading(false);
        return;
      }
      
      setAccounts(allAccounts);
      setSelectedAccount(allAccounts[0].address);
      setExtensionDetected(true);
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect to wallet: ' + err.message);
      setDebugInfo(prev => prev + `\nConnection error: ${err.message}`);
    }
    
    setLoading(false);
  };

  const connectWallet = async () => {
    setLoading(true);
    setError('');
    setShowNoAccountsHelp(false);
    setDebugInfo('Starting wallet connection...');
    
    try {
      // Load the extension
      const { web3Enable, web3Accounts } = await import('@polkadot/extension-dapp');
      
      // Clear browser storage to force new authorization
      try {
        localStorage.removeItem('polkadot-js-authorized');
        sessionStorage.removeItem('polkadot-js-authorized');
      } catch (e) {
        console.log("Error clearing storage:", e);
      }
      
      // Enable the extension
      setDebugInfo(prev => prev + '\nEnabling extension...');
      const extensions = await web3Enable('Polkadot Attendance NFT');
      setDebugInfo(prev => prev + `\nExtensions found: ${extensions.length}`);
      
      if (extensions.length === 0) {
        setError('No extension found, or permission was not granted');
        setDebugInfo(prev => prev + '\nNo extensions found.');
        setLoading(false);
        return;
      }
      
      // Get accounts
      setDebugInfo(prev => prev + '\nGetting accounts...');
      const allAccounts = await web3Accounts();
      setDebugInfo(prev => prev + `\nAccounts found: ${allAccounts.length}`);
      
      if (allAccounts.length === 0) {
        setShowNoAccountsHelp(true);
        setDebugInfo(prev => prev + '\nNo accounts found. Check for popups in the extension.');
        setLoading(false);
        return;
      }
      
      setAccounts(allAccounts);
      setSelectedAccount(allAccounts[0].address);
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet: ' + err.message);
      setDebugInfo(prev => prev + `\nError: ${err.message}`);
    }
    
    setLoading(false);
  };

  const handleAccountChange = (event) => {
    setSelectedAccount(event.target.value);
  };

  const toggleManualMode = () => {
    setShowManualMode(!showManualMode);
  };

  const handleManualAddressChange = (event) => {
    setManualAddress(event.target.value);
  };

  const manualLogin = () => {
    if (!manualAddress || manualAddress.trim() === '') {
      setError('Please enter a valid Polkadot address');
      return;
    }

    // Simple validation - Polkadot addresses start with 1, 5, or other specific prefixes and are 47-48 chars
    if (manualAddress.length < 45 || manualAddress.length > 50) {
      setError('Invalid Polkadot address format');
      return;
    }

    setLoading(true);
    
    try {
      // For manual mode, we'll generate a simple token ourselves
      // Store the address in localStorage
      localStorage.setItem('wallet_address', manualAddress);
      
      // Create a placeholder token for the frontend flow
      const placeholderToken = `manual_${Date.now()}_${manualAddress.substring(0, 8)}`;
      localStorage.setItem('auth_token', placeholderToken);
      localStorage.setItem('auth_mode', 'manual');
      
      // Log information for debugging
      console.log("Manual login successful with address:", manualAddress);
      
      // Run callback function
      if (onLogin) {
        onLogin(manualAddress);
      }
    } catch (err) {
      console.error("Error in manual login:", err);
      setError("Failed to process manual login");
    } finally {
      setLoading(false);
    }
  };

  const signAndAuthenticate = async () => {
    if (!selectedAccount) return;
    
    setLoading(true);
    setError('');
    
    try {
      const { web3FromAddress, web3Enable } = await import('@polkadot/extension-dapp');
      await web3Enable('Polkadot Attendance NFT');
      
      // Find the account in our list
      const account = accounts.find(acc => acc.address === selectedAccount);
      
      // Get the signer
      const injector = await web3FromAddress(selectedAccount);
      const signRaw = injector?.signer?.signRaw;
      
      if (!signRaw) {
        setError('This wallet does not support signing');
        setLoading(false);
        return;
      }
      
      // Create the message to sign (including a timestamp to prevent replay attacks)
      const message = `Sign in to Polkadot Attendance NFT ${Date.now()}`;
      
      // Sign the message
      const result = await signRaw({
        address: selectedAccount,
        data: stringToHex(message),
        type: 'bytes'
      });
      
      // Send to our backend for verification and token generation
      const response = await api.authenticate(selectedAccount, message, result.signature);
      
      // Store the token in localStorage
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('wallet_address', selectedAccount);
      
      // Run callback function
      if (onLogin) {
        onLogin(selectedAccount);
      }
    } catch (err) {
      console.error('Error signing message:', err);
      setError('Failed to authenticate. Please try again.');
    }
    
    setLoading(false);
  };

  const NoAccountsHelpContent = () => (
    <Box sx={{ mt: 3 }}>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          No accounts found in your Polkadot.js extension
        </Typography>
        <Typography variant="body2" paragraph>
          Before connecting, you need to create or import an account in the Polkadot.js browser extension.
        </Typography>
        <Stack spacing={1}>
          <Typography variant="body2" fontWeight="medium">How to get started:</Typography>
          <ol style={{ marginLeft: '1.5rem', marginBottom: '0.5rem' }}>
            <li>Open the Polkadot.js extension (icon in your browser toolbar)</li>
            <li>Click the "+" button to create a new account or import an existing one</li>
            <li>Follow the prompts to complete the setup</li>
            <li>Return here and click "Try Again" or refresh the page</li>
          </ol>
        </Stack>
      </Alert>

      <Box sx={{ textAlign: 'center' }}>
        <Button 
          variant="outlined" 
          color="primary"
          href="https://polkadot.js.org/extension/" 
          target="_blank"
          rel="noopener noreferrer"
          sx={{ mr: 2 }}
        >
          Get Extension
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={forceConnectWallet}
          sx={{ mr: 2 }}
        >
          Try Again
        </Button>
        <Button
          variant="outlined"
          onClick={() => window.location.reload()}
          sx={{ mr: 2 }}
        >
          Refresh Page
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={toggleManualMode}
        >
          Manual Mode
        </Button>
      </Box>
      
      {showManualMode && (
        <Box sx={{ mt: 3, p: 2, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Manual Address Entry
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Enter your Polkadot wallet address manually if the extension connection is not working.
          </Typography>
          <TextField
            fullWidth
            label="Polkadot Address"
            variant="outlined"
            value={manualAddress}
            onChange={handleManualAddressChange}
            placeholder="Enter your Polkadot address (starts with 1 or 5)"
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={manualLogin}
            fullWidth
          >
            Continue with Address
          </Button>
        </Box>
      )}
      
      {debugInfo && (
        <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1, whiteSpace: 'pre-wrap' }}>
          <Typography variant="body2" fontFamily="monospace" fontSize="0.8rem">
            {debugInfo}
          </Typography>
        </Box>
      )}
    </Box>
  );
  
  // If browser is not supported (e.g., Safari)
  if (!browserInfo.supported) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>Connect Your Wallet</Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Unsupported Browser Detected: {browserInfo.name}
            </Typography>
            <Typography variant="body2" paragraph>
              The Polkadot.js extension is not supported on {browserInfo.name}. To use this application, please switch to one of the following browsers:
            </Typography>
            <Stack direction="column" spacing={1} sx={{ ml: 2 }}>
              <Typography variant="body2">• Chrome</Typography>
              <Typography variant="body2">• Firefox</Typography>
              <Typography variant="body2">• Brave</Typography>
              <Typography variant="body2">• Edge</Typography>
            </Stack>
          </Alert>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              href="https://www.google.com/chrome/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Chrome
            </Button>
            <Button
              variant="outlined"
              color="primary"
              href="https://www.mozilla.org/firefox/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Firefox
            </Button>
          </Box>
          
          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">OR</Typography>
          </Divider>
          
          <Box>
            <Button
              variant="contained" 
              color="secondary"
              onClick={toggleManualMode}
              fullWidth
              sx={{ mb: 2 }}
            >
              Enter Address Manually
            </Button>
            
            {showManualMode && (
              <Box sx={{ mt: 3, p: 2, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Manual Address Entry
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Enter your Polkadot wallet address manually to continue.
                </Typography>
                <TextField
                  fullWidth
                  label="Polkadot Address"
                  variant="outlined"
                  value={manualAddress}
                  onChange={handleManualAddressChange}
                  placeholder="Enter your Polkadot address (starts with 1 or 5)"
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={manualLogin}
                  fullWidth
                >
                  Continue with Address
                </Button>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  }

  // If checking for extension is still in progress
  if (checkingExtension) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>Connect Your Wallet</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
          <Typography align="center" color="text.secondary">
            Checking for Polkadot.js extension...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // If extension not detected but we have a bypass option
  if (!extensionDetected) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>Connect Your Wallet</Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Polkadot.js extension not detected
            </Typography>
            <Typography variant="body2" paragraph>
              You need to install the Polkadot.js browser extension to use this application.
              This extension allows you to create and manage Polkadot accounts.
            </Typography>
          </Alert>
          <Box textAlign="center">
            <Button 
              variant="contained" 
              color="primary"
              href="https://polkadot.js.org/extension/" 
              target="_blank"
              rel="noopener noreferrer"
              sx={{ mb: 2 }}
            >
              Install Polkadot.js Extension
            </Button>
            <Divider sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">after installing</Typography>
            </Divider>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={forceConnectWallet}
              >
                I Already Have Extension
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={toggleManualMode}
              >
                Manual Mode
              </Button>
            </Box>
          </Box>
          
          {showManualMode && (
            <Box sx={{ mt: 3, p: 2, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Manual Address Entry
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Enter your Polkadot wallet address manually to continue.
              </Typography>
              <TextField
                fullWidth
                label="Polkadot Address"
                variant="outlined"
                value={manualAddress}
                onChange={handleManualAddressChange}
                placeholder="Enter your Polkadot address (starts with 1 or 5)"
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={manualLogin}
                fullWidth
              >
                Continue with Address
              </Button>
            </Box>
          )}
          
          {/* Browser-specific instructions */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Installation Instructions for {browserInfo.name}:
            </Typography>
            {browserInfo.name === "Firefox" ? (
              <ol style={{ marginLeft: '1.5rem' }}>
                <li>Click the "Install Polkadot.js Extension" button above</li>
                <li>Click "Add to Firefox" on the Mozilla Add-ons page</li>
                <li>Click "Add" when prompted</li>
                <li>Click "Okay, Got It" if shown addon information</li>
                <li>After installation, refresh this page</li>
              </ol>
            ) : (
              <ol style={{ marginLeft: '1.5rem' }}>
                <li>Click the "Install Polkadot.js Extension" button above</li>
                <li>Click "Add to Chrome" (or equivalent) on the Chrome Web Store</li>
                <li>Click "Add Extension" when prompted</li>
                <li>After installation, refresh this page</li>
              </ol>
            )}
          </Box>
          
          {debugInfo && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1, whiteSpace: 'pre-wrap' }}>
              <Typography variant="body2" fontFamily="monospace" fontSize="0.8rem">
                {debugInfo}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>Connect Your Wallet</Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {showNoAccountsHelp ? (
          <NoAccountsHelpContent />
        ) : !accounts.length ? (
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={connectWallet}
              disabled={loading}
              fullWidth
              sx={{ mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Connect Wallet'}
            </Button>
            
            <Button
              variant="outlined"
              color="secondary"
              onClick={forceConnectWallet}
              disabled={loading}
              fullWidth
              sx={{ mb: 2 }}
            >
              Try Alternative Connection
            </Button>
            
            <Button
              variant="outlined"
              onClick={toggleManualMode}
              fullWidth
            >
              Manual Address Entry
            </Button>
            
            {showManualMode && (
              <Box sx={{ mt: 3, p: 2, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Manual Address Entry
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Enter your Polkadot wallet address manually if the extension connection is not working.
                </Typography>
                <TextField
                  fullWidth
                  label="Polkadot Address"
                  variant="outlined"
                  value={manualAddress}
                  onChange={handleManualAddressChange}
                  placeholder="Enter your Polkadot address (starts with 1 or 5)"
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={manualLogin}
                  fullWidth
                >
                  Continue with Address
                </Button>
              </Box>
            )}
            
            {debugInfo && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1, whiteSpace: 'pre-wrap' }}>
                <Typography variant="body2" fontFamily="monospace" fontSize="0.8rem">
                  {debugInfo}
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Box>
            <FormControl fullWidth margin="normal">
              <InputLabel id="account-select-label">Select Account</InputLabel>
              <Select
                labelId="account-select-label"
                value={selectedAccount}
                onChange={handleAccountChange}
                label="Select Account"
              >
                {accounts.map((account) => (
                  <MenuItem key={account.address} value={account.address}>
                    {account.meta.name || 'Unknown'} - {account.address.substr(0, 6)}...{account.address.substr(-4)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button
              variant="contained"
              color="primary"
              onClick={signAndAuthenticate}
              disabled={loading || !selectedAccount}
              fullWidth
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign & Login'}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletConnector; 