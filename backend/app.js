const express = require('express');
const cors = require('cors');
const spotifyRoutes = require('./routes/spotify');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/spotify', spotifyRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});