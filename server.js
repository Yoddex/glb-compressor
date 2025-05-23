const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { NodeIO } = require('@gltf-transform/core');
const { draco } = require('@gltf-transform/functions');
const { EXTENSIONS } = require('@gltf-transform/extensions');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/compress', upload.single('upload'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const io = new NodeIO().registerExtensions(EXTENSIONS);

    const doc = io.read(filePath);
    await doc.transform(draco());

    const outputPath = path.join('compressed', `${req.file.filename}.glb`);
    io.write(outputPath, doc);

    res.download(outputPath, 'compressed.glb', () => {
      fs.unlinkSync(filePath); // clean up temp file
      fs.unlinkSync(outputPath); // clean up output after sending
    });
  } catch (err) {
    console.error('Compression error:', err);
    res.status(500).send('Compression failed.');
  }
});

app.listen(10000, () => {
  console.log('Server running at http://localhost:10000');
});
