'use client';

import { Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleNavigate = () => {
    router.push('/compliance-scan');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#1c1c1c',
        width: '100vw', 
        overflowX: 'hidden', 
        margin: 0,
        padding: 0,
      }}
    >
      <Box
        sx={{
          backgroundColor: '#333333',
          padding: 4,
          borderRadius: 2,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.5)',
          color: '#fff',
          maxWidth: '600px',
          width: '100%', 
        }}
      >
        <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ color: '#fff' }}>
          Welcome to the Supabase Compliance Checker
        </Typography>

        <Typography variant="body1" align="center" sx={{ marginBottom: 3, color: '#ccc' }}>
          Start by inputting your Service API Key to run the compliance scan.
        </Typography>

        <Box textAlign="center">
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleNavigate}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              paddingX: 4,
            }}
          >
            Go to Compliance Scan
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
