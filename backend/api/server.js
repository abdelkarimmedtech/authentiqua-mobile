const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const scanRoutes = require('./routes/scanRoutes');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/scan', scanRoutes);

app.listen(port, () => {
  console.log(`Authentiqa scan API listening on port ${port}`);
});

