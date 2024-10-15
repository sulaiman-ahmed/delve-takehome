'use client';

import { Box, Typography, Button, TextField, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ComplianceResults = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const logComplianceResults = async (logData: any) => {
    try {
      const response = await fetch('/api/log-compliance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
      });

      const data = await response.json();
      if (!data.success) {
        console.error('Failed to log compliance results:', data.error);
      }
    } catch (err) {
      console.error('Error logging compliance results:', err);
    }
  };

  const runComplianceCheck = async () => {
    if (!apiKey) {
      setError('API key is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/run-compliance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: apiKey,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data);

        await logComplianceResults({
          user_email: 'customer@example.com', 
          mfa_status: data.userMfaStatus,
          rls_status: data.tableRlsStatus,
          pitr_status: data.pitrStatus,
          created_at: new Date().toISOString(),
        });
      } else {
        setError(data.error || 'Compliance check failed');
      }
    } catch (err) {
      console.error('Error running compliance check:', err);
      setError('Compliance check failed');
    } finally {
      setLoading(false);
    }
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
        padding: 4,
        width: '100vw',
        overflowX: 'hidden',
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
        <Typography variant="h4" align="center" gutterBottom sx={{ color: '#fff' }}>
          Compliance Check
        </Typography>

        <Typography variant="body1" align="center" sx={{ marginBottom: 3, color: '#ccc' }}>
          Enter your Supabase Service API Key to run the compliance check.
        </Typography>

        <TextField
          label="Service API Key"
          variant="filled"
          fullWidth
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          sx={{
            marginBottom: 3,
            backgroundColor: '#2c2c2c',
            borderRadius: '4px',
            '& .MuiFilledInput-root': {
              backgroundColor: '#2c2c2c',
            },
            '& .MuiInputLabel-root': {
              color: '#ccc',
            },
            '& .MuiFilledInput-underline:before': {
              borderBottomColor: '#555',
            },
            '& .MuiFilledInput-underline:hover:before': {
              borderBottomColor: '#fff',
            },
            '& .MuiFilledInput-underline:after': {
              borderBottomColor: '#007bff',
            },
          }}
        />

        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" sx={{ marginBottom: 2 }}>
            <CircularProgress color="primary" />
          </Box>
        )}

        {error && <Typography sx={{ color: 'red', textAlign: 'center' }}>Error: {error}</Typography>}

        {results && !loading && !error && (
          <Box sx={{ marginTop: 3 }}>
            <Typography variant="h6" sx={{ color: '#fff', marginBottom: 1 }}>
              MFA Status
            </Typography>
            <ul>
              {results.userMfaStatus.map((user: any) => (
                <li key={user.email} style={{ color: '#ccc' }}>
                  {user.email}: {user.mfaEnabled ? 'MFA Enabled' : 'MFA Not Enabled'}
                </li>
              ))}
            </ul>

            <Typography variant="h6" sx={{ color: '#fff', marginTop: 3, marginBottom: 1 }}>
              RLS Status
            </Typography>
            {results.tableRlsStatus && results.tableRlsStatus.length > 0 ? (
              <ul>
                {results.tableRlsStatus.map((table: any) => (
                  <li key={table.table}>
                    <strong style={{ color: '#fff' }}>{table.table}</strong>:
                    {table.rlsEnabled ? (
                      <>
                        <span style={{ color: 'green' }}> RLS Enabled</span>
                        {table.policiesExist ? (
                          <span style={{ color: '#ccc' }}> with Policies</span>
                        ) : (
                          <span style={{ color: 'orange' }}> but No Policies Defined</span>
                        )}
                      </>
                    ) : (
                      <span style={{ color: 'red' }}> RLS Disabled</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <Typography sx={{ color: '#ccc' }}>No RLS data available</Typography>
            )}

            <Typography variant="h6" sx={{ color: '#fff', marginTop: 3, marginBottom: 1 }}>
              PITR Status
            </Typography>
            <Typography sx={{ color: '#ccc' }}>
              {results.pitrStatus.enabled
                ? `PITR Enabled (Retention Days: ${results.pitrStatus.maxRetentionDays})`
                : 'PITR Not Enabled'}
            </Typography>
          </Box>
        )}

        <Box sx={{ marginTop: 3, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={runComplianceCheck}
            disabled={loading || !apiKey}
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              paddingX: 4,
              backgroundColor: apiKey ? '#007bff' : '#666',
              cursor: apiKey ? 'pointer' : 'not-allowed',
            }}
          >
            {loading ? 'Scanning...' : 'Run Compliance Check'}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => router.push('/compliance-logs')}
            sx={{ textTransform: 'none' }}
          >
            View Compliance Logs
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => router.push('/')}
            sx={{ textTransform: 'none' }}
          >
            Go Home
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ComplianceResults;
