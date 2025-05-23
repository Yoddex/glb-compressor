const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { NodeIO } = require("@gltf-transform/core");
const { dracoCompress } = require("@gltf-transform/functions");

const app = express();
const PORT = process.env.PORT || 10000;
const upload = multer({ dest: "uploads/" });

app.use(express.static("public"));

app.post("/compress", upload.single("upload"), async (req, res) => {
    try {
        const inputPath = req.file.path;
        const outputPath = `compressed/${req.file.originalname}`;

        const io = new NodeIO(); // ✅ Fixed: No registerExtensions

        const doc = io.read(inputPath);
        await doc.transform(dracoCompress());
        io.write(outputPath, doc);

        res.download(outputPath);
    } catch (e) {
        console.error("Compression error:", e);
        res.status(500).send("Compression failed: " + e.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
