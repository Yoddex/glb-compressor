
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { NodeIO } = require('@gltf-transform/core');
const { draco } = require('@gltf-transform/functions');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
const upload = multer({ dest: 'uploads/' });

app.post('/compress', upload.single('model'), async (req, res) => {
    try {
        const io = new NodeIO().registerExtensions([draco()]);
        const doc = io.read(req.file.path);
        await doc.transform(draco());
        const outputPath = path.join('compressed', `${req.file.filename}.glb`);
        io.write(outputPath, doc);
        res.download(outputPath);
    } catch (err) {
        console.error('Compression error:', err);
        res.status(500).send('Compression failed.');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
