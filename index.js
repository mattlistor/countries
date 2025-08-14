const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

app.use(cors());

app.get('/coordinates', (req, res) => {
    const country = req.query.country || 'norway';
    if (!country) {
        return res.status(400).json({ error: 'Country query parameter is required.' });
    }
    
    const encodedCountry = encodeURIComponent(country);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedCountry}&key=${process.env.REACT_APP_MAPS_API_KEY_BACKEND}`;

    axios.get(url)
        .then(response => {
            if (response.data.status === 'OK') {
                // Return the first result's location data
                res.json(response.data.results[0].geometry.location);
            } else {
                res.status(404).json({ error: 'Country not found or API error' });
            }
        })
        .catch(error => {
            console.error('Error fetching coordinates:', error);
            res.status(500).json({ error: 'Failed to fetch data from Google Maps API' });
        });
});

app.listen(process.env.REACT_APP_SERVER_PORT, () => console.log('Server running on port ' + process.env.REACT_APP_SERVER_PORT));