import { Box, Typography, Paper } from '@mui/material';

function Dashboard() {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>
          Hello, Admin
        </Typography>
      </Paper>
    </Box>
  );
}

export default Dashboard; 