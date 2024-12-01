import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import axios from 'axios';

function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantityKg: '',
    quantityPieces: '',
  });
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/products/${id}`);
          const product = response.data;
          setFormData({
            name: product.name,
            category: product.category,
            price: product.price,
            quantityKg: product.quantityKg,
            quantityPieces: product.quantityPieces,
          });
          setPreviewUrl(`http://localhost:5000/${product.image}`);
        } catch (error) {
          console.error('Error fetching product:', error);
        }
      };
      fetchProduct();
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        setError('File size should be less than 5MB');
        return;
      }
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      if (image) {
        formDataToSend.append('image', image);
      }

      if (id) {
        await axios.put(`http://localhost:5000/api/products/${id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.post('http://localhost:5000/api/products', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      navigate('/products');
    } catch (error) {
      console.error('Error saving product:', error);
      setError('Error saving product. Please try again.');
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        {id ? 'Edit Product' : 'Add New Product'}
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          margin="normal"
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <FormControl fullWidth margin="normal" required>
          <InputLabel>Category</InputLabel>
          <Select
            name="category"
            value={formData.category}
            onChange={handleChange}
            label="Category"
          >
            <MenuItem value="fruit">Fruit</MenuItem>
            <MenuItem value="vegetable">Vegetable</MenuItem>
          </Select>
        </FormControl>
        
        <TextField
          fullWidth
          margin="normal"
          label="Price"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          required
        />

        <TextField
          fullWidth
          margin="normal"
          label="Quantity (Kg)"
          name="quantityKg"
          type="number"
          value={formData.quantityKg}
          onChange={handleChange}
          required
        />

        <TextField
          fullWidth
          margin="normal"
          label="Quantity (Pieces)"
          name="quantityPieces"
          type="number"
          value={formData.quantityPieces}
          onChange={handleChange}
          required
        />

        <Box sx={{ mt: 2, mb: 2 }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="image-upload"
            type="file"
            onChange={handleImageChange}
          />
          <label htmlFor="image-upload">
            <Button variant="contained" component="span">
              Upload Image
            </Button>
          </label>
          {error && <FormHelperText error>{error}</FormHelperText>}
        </Box>

        {previewUrl && (
          <Box sx={{ mt: 2, mb: 2 }}>
            <img 
              src={previewUrl} 
              alt="Preview" 
              style={{ maxWidth: '100%', maxHeight: '200px' }} 
            />
          </Box>
        )}

        <Box sx={{ mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mr: 2 }}
          >
            {id ? 'Update' : 'Create'} Product
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/products')}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default ProductForm; 