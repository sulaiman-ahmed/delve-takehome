'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Box, Typography, CircularProgress, Paper, Button } from '@mui/material';
import { useRouter } from 'next/navigation';

const ComplianceLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); 

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('compliance_logs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching logs:', error);
          setError('Error fetching logs');
        } else if (data && data.length > 0) {
          setLogs(data);
        } else {
          setError('No compliance logs found');
        }
      } catch (err) {
        console.error('Error fetching logs:', err);
        setError('Error fetching logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#1c1c1c',
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#1c1c1c',
        }}
      >
        <Typography sx={{ color: 'red' }}>Error: {error}</Typography>
      </Box>
    );
  }

  if (logs.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#1c1c1c',
        }}
      >
        <Typography sx={{ color: '#ccc' }}>No compliance logs found.</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: 4,
        backgroundColor: '#1c1c1c',
        color: '#fff',
      }}
    >
      {/* Buttons for Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '800px', mb: 3 }}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => router.push('/')}
          sx={{ textTransform: 'none' }}
        >
          Go Home
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => router.push('/compliance-scan')}
          sx={{ textTransform: 'none' }}
        >
          Go to Compliance Scan
        </Button>
      </Box>

      <Typography variant="h4" sx={{ marginBottom: 3, color: '#fff' }}>
        Compliance Logs
      </Typography>

      <Box sx={{ width: '100%', maxWidth: '800px' }}>
        {logs.map((log) => (
          <Paper
            key={log.id}
            sx={{
              backgroundColor: '#333333',
              padding: 3,
              borderRadius: 2,
              marginBottom: 2,
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.5)',
            }}
          >
            <Typography variant="h6" sx={{ color: '#fff' }}>
              User Email: {log.user_email}
            </Typography>
            <Typography variant="body2" sx={{ color: '#ccc', marginBottom: 1 }}>
              Created At: {new Date(log.created_at).toLocaleString()}
            </Typography>

            <Typography variant="h6" sx={{ color: '#fff' }}>
              MFA Status
            </Typography>
            <ul>
              {log.mfa_status.map((user: any) => (
                <li key={user.email} style={{ color: '#ccc' }}>
                  {user.email}: {user.mfaEnabled ? 'MFA Enabled' : 'MFA Not Enabled'}
                </li>
              ))}
            </ul>

            <Typography variant="h6" sx={{ color: '#fff', marginTop: 2 }}>
              RLS Status
            </Typography>
            <ul>
              {log.rls_status.map((table: any) => (
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

            <Typography variant="h6" sx={{ color: '#fff', marginTop: 2 }}>
              PITR Status
            </Typography>
            <Typography variant="body2" sx={{ color: '#ccc' }}>
              {log.pitr_status.enabled
                ? `PITR Enabled (Retention Days: ${log.pitr_status.maxRetentionDays})`
                : 'PITR Not Enabled'}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default ComplianceLogs;
