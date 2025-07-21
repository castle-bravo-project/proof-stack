const {
  app,
  BrowserWindow,
  Menu,
  shell,
  ipcMain,
  dialog,
} = require('electron');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Keep a global reference of the window object
let mainWindow;
let db;
let isDev =
  process.env.NODE_ENV === 'development' || process.argv.includes('--dev');

// Initialize SQLite database for legal document storage
function initializeDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'proofstack.db');
  db = new sqlite3.Database(dbPath);

  // Create tables for legal document management
  db.serialize(() => {
    // Evidence items table
    db.run(`CREATE TABLE IF NOT EXISTS evidence_items (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      description TEXT,
      source TEXT,
      date_collected DATETIME,
      file_path TEXT,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Chain of custody table
    db.run(`CREATE TABLE IF NOT EXISTS chain_of_custody (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      evidence_id TEXT,
      handler TEXT NOT NULL,
      action TEXT NOT NULL,
      timestamp DATETIME NOT NULL,
      location TEXT,
      notes TEXT,
      FOREIGN KEY (evidence_id) REFERENCES evidence_items (id)
    )`);

    // Legal analysis results table
    db.run(`CREATE TABLE IF NOT EXISTS legal_analysis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      evidence_id TEXT,
      rule_id TEXT NOT NULL,
      score INTEGER,
      compliant BOOLEAN,
      findings TEXT,
      recommendations TEXT,
      analysis_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (evidence_id) REFERENCES evidence_items (id)
    )`);

    console.log('ProofStack database initialized');
  });
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1400,
    minHeight: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    icon: path.join(__dirname, '../public/favicon.ico'),
    titleBarStyle: 'default',
    show: false, // Don't show until ready
  });

  // Load the app
  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  console.log('Loading ProofStack URL:', startUrl);
  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Set up menu
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Import Evidence',
          accelerator: 'CmdOrCtrl+I',
          click: () => {
            mainWindow.webContents.send('menu-import-evidence');
          },
        },
        {
          label: 'Export Analysis Report',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            mainWindow.webContents.send('menu-export-report');
          },
        },
        { type: 'separator' },
        {
          label: 'Backup Database',
          click: () => {
            mainWindow.webContents.send('menu-backup-db');
          },
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'Evidence',
      submenu: [
        {
          label: 'New Evidence Item',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-evidence');
          },
        },
        {
          label: 'Run Legal Analysis',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.webContents.send('menu-run-analysis');
          },
        },
        {
          label: 'Update Chain of Custody',
          click: () => {
            mainWindow.webContents.send('menu-update-custody');
          },
        },
      ],
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'FRE Compliance Check',
          click: () => {
            mainWindow.webContents.send('menu-fre-check');
          },
        },
        {
          label: 'Digital Authentication Guide',
          click: () => {
            mainWindow.webContents.send('menu-auth-guide');
          },
        },
        {
          label: 'Chain of Custody Tutorial',
          click: () => {
            mainWindow.webContents.send('menu-custody-tutorial');
          },
        },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('menu-settings');
          },
        },
        {
          label: 'Toggle Developer Tools',
          accelerator:
            process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools();
            }
          },
        },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About ProofStack',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About ProofStack',
              message: 'ProofStack Digital Evidence Assessment Platform',
              detail:
                'Progressive Enhancement API Key Management\nAI-Powered Legal Analysis with Gemini Integration\nDemo Mode for Educational Learning\nSecure Local Storage for Legal Documents\nVersion: 1.1.0\n⚖️ Legal compliance made simple',
            });
          },
        },
        {
          label: 'Legal Standards Guide',
          click: () => {
            mainWindow.webContents.send('menu-legal-guide');
          },
        },
        {
          label: 'Technical Support',
          click: () => {
            shell.openExternal(
              'https://github.com/castle-bravo-project/proofstack/issues'
            );
          },
        },
      ],
    },
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(() => {
  initializeDatabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (db) {
    db.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Database IPC handlers
ipcMain.handle('db-insert-evidence', async (event, evidence) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`INSERT INTO evidence_items 
      (id, type, description, source, date_collected, file_path, metadata) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`);

    stmt.run(
      [
        evidence.id,
        evidence.type,
        evidence.description,
        evidence.source,
        evidence.dateCollected,
        evidence.filePath,
        JSON.stringify(evidence.metadata),
      ],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ success: true, id: this.lastID });
        }
      }
    );
    stmt.finalize();
  });
});

ipcMain.handle('db-get-evidence', async (event, id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM evidence_items WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        if (row && row.metadata) {
          row.metadata = JSON.parse(row.metadata);
        }
        resolve(row);
      }
    });
  });
});

ipcMain.handle('db-get-all-evidence', async (event) => {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM evidence_items ORDER BY created_at DESC',
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const evidence = rows.map((row) => {
            if (row.metadata) {
              row.metadata = JSON.parse(row.metadata);
            }
            return row;
          });
          resolve(evidence);
        }
      }
    );
  });
});

// File operation handlers
ipcMain.handle('save-file', async (event, filePath, content) => {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});
