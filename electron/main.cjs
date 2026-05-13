const { app, BrowserWindow, dialog, shell } = require("electron");
const { fork } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const net = require("node:net");
const path = require("node:path");
const Database = require("better-sqlite3");

let serverProcess;
let mainWindow;

app.setName("POMR Coach");

async function createWindow() {
  const port = await getAvailablePort();
  const appRoot = path.join(__dirname, "..");
  const standaloneDir = path.join(appRoot, ".next", "standalone");
  const serverPath = path.join(standaloneDir, "server.js");
  const userDataDir = app.getPath("userData");
  const dbPath = path.join(userDataDir, "pomr-coach.sqlite");

  if (!fs.existsSync(serverPath)) {
    await dialog.showMessageBox({
      type: "error",
      title: "POMR Coach build missing",
      message: "Desktop build files are missing. Please build the app before launching Electron.",
      detail: `Expected server file:\n${serverPath}`,
    });
    app.quit();
    return;
  }

  fs.mkdirSync(userDataDir, { recursive: true });
  applySqliteMigrations(dbPath, path.join(appRoot, "prisma", "migrations"));

  const env = {
    ...process.env,
    NODE_ENV: "production",
    PORT: String(port),
    HOSTNAME: "127.0.0.1",
    DATABASE_URL: `file:${dbPath}`,
    POMR_COACH_ELECTRON: "1",
    ELECTRON_RUN_AS_NODE: "1",
  };

  serverProcess = fork(serverPath, [], {
    cwd: standaloneDir,
    env,
    stdio: ["ignore", "pipe", "pipe", "ipc"],
  });

  serverProcess.stdout?.on("data", (chunk) => console.log(`[next] ${chunk}`));
  serverProcess.stderr?.on("data", (chunk) => console.error(`[next] ${chunk}`));
  serverProcess.on("exit", (code) => {
    if (code !== 0 && !app.isQuitting) {
      dialog.showErrorBox("POMR Coach stopped", "The local app server stopped unexpectedly.");
    }
  });

  await waitForServer(port);

  mainWindow = new BrowserWindow({
    width: 1320,
    height: 920,
    minWidth: 1100,
    minHeight: 760,
    title: "POMR Coach",
    icon: path.join(appRoot, "build", "icon.png"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(`http://127.0.0.1:${port}`)) return { action: "allow" };
    shell.openExternal(url);
    return { action: "deny" };
  });

  await mainWindow.loadURL(`http://127.0.0.1:${port}/cases`);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) void createWindow();
});

app.on("before-quit", () => {
  app.isQuitting = true;
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill();
  }
});

function applySqliteMigrations(dbPath, migrationsDir) {
  const db = new Database(dbPath);
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS "_pomr_migrations" (
      "name" TEXT NOT NULL PRIMARY KEY,
      "appliedAt" TEXT NOT NULL
    );
  `);

  if (!fs.existsSync(migrationsDir)) {
    db.close();
    throw new Error(`Migrations directory not found: ${migrationsDir}`);
  }

  const applied = new Set(
    db.prepare('SELECT "name" FROM "_pomr_migrations"').all().map((row) => row.name),
  );
  const migrations = fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const migrationName of migrations) {
    if (applied.has(migrationName)) continue;
    const sqlPath = path.join(migrationsDir, migrationName, "migration.sql");
    const sql = fs.readFileSync(sqlPath, "utf8").trim();
    if (!sql) continue;

    const runMigration = db.transaction(() => {
      db.exec(sql);
      db.prepare('INSERT INTO "_pomr_migrations" ("name", "appliedAt") VALUES (?, ?)').run(
        migrationName,
        new Date().toISOString(),
      );
    });
    runMigration();
  }

  db.close();
}

function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => {
        if (address && typeof address === "object") resolve(address.port);
        else reject(new Error("Could not allocate a local port."));
      });
    });
  });
}

function waitForServer(port) {
  const deadline = Date.now() + 20_000;

  return new Promise((resolve, reject) => {
    const check = () => {
      http
        .get(`http://127.0.0.1:${port}/cases`, (response) => {
          response.resume();
          if (response.statusCode && response.statusCode < 500) {
            resolve();
            return;
          }
          retry();
        })
        .on("error", retry);
    };

    const retry = () => {
      if (Date.now() > deadline) {
        reject(new Error("POMR Coach local server did not start in time."));
        return;
      }
      setTimeout(check, 300);
    };

    check();
  });
}
