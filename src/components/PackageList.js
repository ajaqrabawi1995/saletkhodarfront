import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function PackageList() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/packages');
      setPackages(response.data);
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const handleDelete = async (packageId) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      try {
        await axios.delete(`http://localhost:5000/api/packages/${packageId}`);
        fetchPackages();
      } catch (error) {
        console.error('Error deleting package:', error);
      }
    }
  };

  const handleViewDetails = (pkg) => {
    setSelectedPackage(pkg);
    setOpenDialog(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          Packages
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate('/packages/new')}
        >
          Create New Package
        </Button>
      </Box>

      <Grid container spacing={3}>
        {packages.map((pkg) => (
          <Grid item xs={12} md={6} lg={4} key={pkg._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {pkg.name}
                  </Typography>
                  <Box>
                    <IconButton 
                      size="small" 
                      onClick={() => handleViewDetails(pkg)}
                      sx={{ mr: 1 }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDelete(pkg._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Typography color="textSecondary" gutterBottom>
                  Total Price: ${pkg.totalPrice.toFixed(2)}
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                  {pkg.items.map((item, index) => (
                    <Chip
                      key={index}
                      avatar={<Avatar src={`http://localhost:5000/${item.product.image}`} />}
                      label={`${item.product.name}`}
                      size="small"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Details Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedPackage && (
          <>
            <DialogTitle>
              {selectedPackage.name}
            </DialogTitle>
            <DialogContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Total Price: ${selectedPackage.totalPrice.toFixed(2)}
              </Typography>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Products:
              </Typography>
              <List>
                {selectedPackage.items.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemAvatar>
                      <Avatar src={`http://localhost:5000/${item.product.image}`} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.product.name}
                      secondary={
                        <>
                          Category: {item.product.category}
                          <br />
                          Price: ${item.product.price.toFixed(2)}
                          <br />
                          Stock: {item.product.quantityKg}kg | {item.product.quantityPieces} pieces
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {packages.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="textSecondary">
            No packages found. Create your first package!
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default PackageList; 