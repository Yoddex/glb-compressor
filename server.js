const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { NodeIO } = require('@gltf-transform/core');
const { draco } = require('@gltf-transform/functions');

const app = express();
const port = process.env.PORT || 10000;

// Serve static frontend files
app.use(express.static('public'));

// Multer config to handle file upload
const upload = multer({ dest: 'uploads/' });

// POST route for GLB compression
app.post('/compress', upload.single('upload'), async (req, res) => {
  try {
    const inputPath = req.file.path;
    const outputPath = `${inputPath}-compressed.glb`;

    // Create IO and register extensions separately
    const io = new NodeIO();
    io.registerExtensions([draco()]);

    // Read, compress, and write the GLB file
    const doc = io.readBinary(fs.readFileSync(inputPath));
    await doc.transform(draco());

    io.writeBinary(doc, outputPath);

    // Download result and cleanup temp files
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
