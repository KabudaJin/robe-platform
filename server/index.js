const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// 确保上传目录存在
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

const readFabrics = () => {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, 'fabricData.json')));
  } catch (e) {
    return [];
  }
};

app.get('/api/fabrics', (req, res) => {
  const data = readFabrics();
  res.json(data);
});

app.post('/api/fabrics', upload.single('image'), (req, res) => {
  const { name, material, color, weight } = req.body;
  const imageUrl = `/uploads/${req.file.filename}`;
  const newFabric = { name, material, color, weight, image: imageUrl };

  const data = readFabrics();
  data.push(newFabric);
  fs.writeFileSync(path.join(__dirname, 'fabricData.json'), JSON.stringify(data, null, 2));

  res.json({ message: '上传成功', fabric: newFabric });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
});
  
