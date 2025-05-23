const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { NodeIO } = require('@gltf-transform/core');
const { draco } = require('@gltf-transform/functions');

const app = express();
const port = process.env.PORT || 10000;

// Serve the frontend
app.use(express.static('public'));

// Set up Multer to store uploaded files temporarily
const upload = multer({ dest: 'uploads/' });

// Handle file uploads and compression
app.post('/compress', upload.single('upload'), async (req, res) => {
  try {
    const inputPath = req.file.path;
    const outputPath = `${inputPath}-compressed.glb`;

    const io = new NodeIO().registerExtensions([draco()]);

    const doc = io.readBinary(fs.readFileSync(inputPath));
    await doc.transform(draco());

    io.writeBinary(doc, outputPath);

    // Send back the compressed file
    res.download(outputPath, 'compressed.glb', (err) => {
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });

  } catch (err) {
    console.error('Compression error:', err);
    res.status(500).send('Compression failed.');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
