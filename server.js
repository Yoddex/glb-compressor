const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { NodeIO } = require('@gltf-transform/core');
const { draco } = require('@gltf-transform/functions');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

app.post('/compress', upload.single('upload'), async (req, res) => {
  try {
    const inputPath = req.file.path;
    const outputPath = path.join('uploads', 'compressed.glb');

    const io = new NodeIO();
    const doc = io.read(inputPath);

    // ✅ Correct for GLTF-Transform v4+
    await draco(doc);

    io.write(outputPath, doc);

    res.download(outputPath, 'compressed.glb', () => {
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  } catch (e) {
    console.error("Compression error:", e);
    res.status(500).send("Compression failed: " + e.message);
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
