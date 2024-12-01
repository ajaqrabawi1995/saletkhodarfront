import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

function PackageCreate() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [packageData, setPackageData] = useState({
    name: '',
    items: []
  });
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantityKg, setQuantityKg] = useState('');
  const [quantityPieces, setQuantityPieces] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleAddProduct = () => {
    if (!selectedProduct || (!quantityKg && !quantityPieces)) return;

    const product = products.find(p => p._id === selectedProduct);

    // Check if we have enough stock
    if (Number(quantityKg) > product.quantityKg) {
      setError(`Not enough kg in stock. Available: ${product.quantityKg}kg`);
      return;
    }
    if (Number(quantityPieces) > product.quantityPieces) {
      setError(`Not enough pieces in stock. Available: ${product.quantityPieces} pieces`);
      return;
    }

    const newItem = {
      product: {
        name: product.name,
        price: product.price,
        category: product.category,
        image: product.image,
        quantityKg: Number(quantityKg) || 0,
        quantityPieces: Number(quantityPieces) || 0
      }
    };

    setPackageData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    setError('');
    setSelectedProduct('');
    setQuantityKg('');
    setQuantityPieces('');
  };

  const handleRemoveProduct = (index) => {
    setPackageData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotalPrice = () => {
    return packageData.items.reduce((total, item) => {
      const kgPrice = item.product.price * item.product.quantityKg;
      const piecesPrice = item.product.price * (item.product.quantityPieces / 4);
      return total + kgPrice + piecesPrice;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const packageToSave = {
        name: packageData.name,
        items: packageData.items,
        totalPrice: calculateTotalPrice()
      };

      await axios.post('http://localhost:5000/api/packages', packageToSave);
      navigate('/packages');
    } catch (error) {
      console.error('Error creating package:', error);
      setError('Error creating package. Please try again.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Create New Package
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Package Name"
              value={packageData.name}
              onChange={(e) => setPackageData({ ...packageData, name: e.target.value })}
              required
            />

            <Box sx={{ mt: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Select Product</InputLabel>
                    <Select
                      value={selectedProduct}
                      onChange={(e) => {
                        setSelectedProduct(e.target.value);
                        setError('');
                      }}
                      label="Select Product"
                    >
                      {products.map((product) => (
                        <MenuItem key={product._id} value={product._id}>
                          {product.name} (Stock: {product.quantityKg}kg, {product.quantityPieces}pc)
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Quantity (Kg)"
                    value={quantityKg}
                    onChange={(e) => {
                      setQuantityKg(e.target.value);
                      setError('');
                    }}
                    InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Quantity (Pieces)"
                    value={quantityPieces}
                    onChange={(e) => {
                      setQuantityPieces(e.target.value);
                      setError('');
                    }}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleAddProduct}
                    disabled={!selectedProduct || (!quantityKg && !quantityPieces)}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Selected Products
            </Typography>
            <List>
              {packageData.items.map((item, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar src={`http://localhost:5000/${item.product.image}`} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.product.name}
                    secondary={
                      <>
                        {item.product.quantityKg > 0 && `${item.product.quantityKg} kg`}
                        {item.product.quantityKg > 0 && item.product.quantityPieces > 0 && ' | '}
                        {item.product.quantityPieces > 0 && `${item.product.quantityPieces} pieces`}
                        <br />
                        Price: ${((item.product.price * item.product.quantityKg) + 
                               (item.product.price * (item.product.quantityPieces / 4))).toFixed(2)}
                        <br />
                        (${item.product.price}/kg)
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleRemoveProduct(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Package Summary
            </Typography>
            <Typography variant="h5" color="primary">
              Total Price: ${calculateTotalPrice().toFixed(2)}
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={packageData.items.length === 0 || !packageData.name}
              >
                Create Package
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default PackageCreate;