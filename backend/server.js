const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// --- Database & Storage Fallback ---

const ROLES_FILE = path.join(__dirname, 'roles.json');
const REPORTS_FILE = path.join(__dirname, 'reports.json');
let useLocalDB = false;

function loadLocalData(file) {
    try {
        if (fs.existsSync(file)) {
            return JSON.parse(fs.readFileSync(file, 'utf8'));
        }
    } catch (err) {
        console.error(`Error loading local file ${file}:`, err);
    }
    return [];
}

function saveLocalData(file, data) {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(`Error saving local file ${file}:`, err);
    }
}

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/damage-report';
mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log('Connected to MongoDB');
        useLocalDB = false;
    })
    .catch(err => {
        console.error('MongoDB connection error, falling back to local JSON storage:', err.message);
        useLocalDB = true;
    });

// --- Schemas & Models ---

const roleSchema = new mongoose.Schema({
    roleName: { type: String, required: true },
    loginName: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isUser: { type: Boolean, default: false },
    canProcess: { type: Boolean, default: false },
    isViewOnly: { type: Boolean, default: false },
    description: String,
    createdAt: { type: Date, default: Date.now }
});

const Role = mongoose.model('Role', roleSchema);

const reportSchema = new mongoose.Schema({
    reportId: { type: String, required: true, unique: true },
    teamGroup: String,
    teamPage: String,
    branch: String,
    name: String,
    phone: String,
    purchaseDate: String,
    productName: String,
    receivedDate: String,
    problemDesc: String,
    invoice: String,
    photo: String,
    teamLead: String,
    status: { type: String, default: 'pending' },
    processingProductType: String,
    processingChecklist: Object,
    timestamp: { type: Date, default: Date.now },
    statusUpdatedAt: Date
});

const Report = mongoose.model('Report', reportSchema);

// --- API Routes ---

// 1. Roles API
app.get('/api/roles', async (req, res) => {
    try {
        if (useLocalDB) {
            const roles = loadLocalData(ROLES_FILE).map(({ password, ...rest }) => rest);
            return res.json(roles);
        }
        const roles = await Role.find({}, '-password');
        res.json(roles);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch roles' });
    }
});

app.post('/api/roles', async (req, res) => {
    try {
        const { roleName, accessLevels, loginName, password, description } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (useLocalDB) {
            const roles = loadLocalData(ROLES_FILE);
            if (roles.find(r => r.loginName === loginName)) {
                return res.status(400).json({ error: 'Login name already exists' });
            }

            const newRole = {
                _id: Date.now().toString(),
                roleName,
                loginName,
                password: hashedPassword,
                isUser: accessLevels.includes('User'),
                canProcess: accessLevels.includes('Processing'),
                isViewOnly: accessLevels.includes('View Only'),
                description,
                createdAt: new Date()
            };

            roles.push(newRole);
            saveLocalData(ROLES_FILE, roles);
            return res.status(201).json({ message: 'Role created successfully (Local Storage)', roleId: newRole._id });
        }

        const existingRole = await Role.findOne({ loginName });
        if (existingRole) return res.status(400).json({ error: 'Login name already exists' });

        const newRole = new Role({
            roleName,
            loginName,
            password: hashedPassword,
            isUser: accessLevels.includes('User'),
            canProcess: accessLevels.includes('Processing'),
            isViewOnly: accessLevels.includes('View Only'),
            description
        });

        await newRole.save();
        res.status(201).json({ message: 'Role created successfully', roleId: newRole._id });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/roles/:id', async (req, res) => {
    try {
        const { roleName, loginName, password, accessLevels, description } = req.body;

        if (useLocalDB) {
            const roles = loadLocalData(ROLES_FILE);
            const index = roles.findIndex(r => r._id === req.params.id);
            if (index === -1) return res.status(404).json({ error: 'Role not found' });

            roles[index].roleName = roleName || roles[index].roleName;
            roles[index].loginName = loginName || roles[index].loginName;
            roles[index].description = description || roles[index].description;

            if (password) {
                const salt = await bcrypt.genSalt(10);
                roles[index].password = await bcrypt.hash(password, salt);
            }

            if (accessLevels) {
                roles[index].isUser = accessLevels.includes('User');
                roles[index].canProcess = accessLevels.includes('Processing');
                roles[index].isViewOnly = accessLevels.includes('View Only');
            }

            saveLocalData(ROLES_FILE, roles);
            return res.json({ message: 'Role updated successfully (Local Storage)' });
        }

        const updateData = { roleName, loginName, description };
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }
        if (accessLevels) {
            updateData.isUser = accessLevels.includes('User');
            updateData.canProcess = accessLevels.includes('Processing');
            updateData.isViewOnly = accessLevels.includes('View Only');
        }

        const updatedRole = await Role.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedRole) return res.status(404).json({ error: 'Role not found' });
        res.json({ message: 'Role updated successfully', role: updatedRole });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/roles/:id', async (req, res) => {
    try {
        if (useLocalDB) {
            const roles = loadLocalData(ROLES_FILE);
            const filtered = roles.filter(r => r._id !== req.params.id);
            if (roles.length === filtered.length) return res.status(404).json({ error: 'Role not found' });
            saveLocalData(ROLES_FILE, filtered);
            return res.json({ message: 'Role deleted successfully (Local Storage)' });
        }
        const deletedRole = await Role.findByIdAndDelete(req.params.id);
        if (!deletedRole) return res.status(404).json({ error: 'Role not found' });
        res.json({ message: 'Role deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete role' });
    }
});

// 2. Reports API
app.get('/api/products', async (req, res) => {
    try {
        const apiKey = req.headers['x-api-key'] || 'my-secret-key-ChanRas-123';
        const response = await fetch('https://oder-backend-2.onrender.com/api/products', {
            headers: { 'X-API-Key': apiKey }
        });
        
        if (response.ok) {
            const data = await response.json();
            return res.json(data);
        }
        
        // Fallback if external API fails
        console.warn('External products API failed, using fallback mock data');
        res.json({
            status: "success",
            data: [
                {
                    Barcode: "12345678",
                    ProductName: "ផលិតផលគំរូ (Mock)",
                    Price: 10.5,
                    Cost: 8.0,
                    ImageURL: "https://example.com/image.jpg",
                    Tags: "CategoryA, New"
                },
                {
                    Barcode: "JR-OE3",
                    ProductName: "JR OE3",
                    Price: 15.0,
                    Cost: 12.0,
                    ImageURL: "",
                    Tags: "Electronics"
                }
            ]
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.get('/api/reports', async (req, res) => {
    try {
        if (useLocalDB) return res.json(loadLocalData(REPORTS_FILE));
        const reports = await Report.find({}).sort({ timestamp: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

app.post('/api/reports', async (req, res) => {
    try {
        const reportData = req.body;
        if (!reportData.reportId) reportData.reportId = 'AUTO-' + Date.now().toString().slice(-4);
        reportData.timestamp = new Date();

        if (useLocalDB) {
            const reports = loadLocalData(REPORTS_FILE);
            reports.push(reportData);
            saveLocalData(REPORTS_FILE, reports);
            return res.status(201).json({ message: 'Report created successfully (Local Storage)', report: reportData });
        }

        const newReport = new Report(reportData);
        await newReport.save();
        res.status(201).json({ message: 'Report created successfully', report: newReport });
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/reports/:id', async (req, res) => {
    try {
        const updateData = req.body;
        updateData.statusUpdatedAt = new Date();

        if (useLocalDB) {
            const reports = loadLocalData(REPORTS_FILE);
            const index = reports.findIndex(r => r.reportId === req.params.id);
            if (index === -1) return res.status(404).json({ error: 'Report not found' });
            
            reports[index] = { ...reports[index], ...updateData };
            saveLocalData(REPORTS_FILE, reports);
            return res.json({ message: 'Report updated successfully (Local Storage)' });
        }

        const updatedReport = await Report.findOneAndUpdate({ reportId: req.params.id }, updateData, { new: true });
        if (!updatedReport) return res.status(404).json({ error: 'Report not found' });
        res.json({ message: 'Report updated successfully', report: updatedReport });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update report' });
    }
});

app.delete('/api/reports/:id', async (req, res) => {
    try {
        const updateData = { 
            status: 'DELETED', 
            statusUpdatedAt: new Date() 
        };

        if (useLocalDB) {
            const reports = loadLocalData(REPORTS_FILE);
            const index = reports.findIndex(r => r.reportId === req.params.id);
            if (index === -1) return res.status(404).json({ error: 'Report not found' });
            
            reports[index] = { ...reports[index], ...updateData };
            saveLocalData(REPORTS_FILE, reports);
            return res.json({ message: 'Report deleted successfully (Local Storage)' });
        }

        const deletedReport = await Report.findOneAndUpdate({ reportId: req.params.id }, updateData, { new: true });
        if (!deletedReport) return res.status(404).json({ error: 'Report not found' });
        res.json({ message: 'Report deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete report' });
    }
});

// 3. Login API
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const defaults = {
            'admin': { pass: '1234', role: 'Admin' },
            'checker': { pass: '1234', role: 'InventoryChecker' },
            'user': { pass: '1234', role: 'StandardUser' }
        };

        if (defaults[username] && defaults[username].pass === password) {
            return res.json({ success: true, username: username, role: defaults[username].role });
        }

        const roles = useLocalDB ? loadLocalData(ROLES_FILE) : await Role.find({});
        const user = roles.find(r => r.loginName === username);

        if (user && await bcrypt.compare(password, user.password)) {
            let userRole = 'StandardUser';
            if (user.roleName.toLowerCase().includes('admin')) userRole = 'Admin';
            else if (user.canProcess) userRole = 'InventoryChecker';
            return res.json({ success: true, username: user.roleName, role: userRole });
        }

        res.status(401).json({ error: 'Invalid username or password' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error during login' });
    }
});

// Static Files & Start
const staticPath = 'C:/ACC_CODE/frontend';
console.log('Serving static files from:', staticPath);
app.use(express.static(staticPath, { index: 'login.html' }));
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
