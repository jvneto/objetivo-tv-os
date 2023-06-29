const { app, BrowserWindow, ipcMain, autoUpdater } = require('electron');
const path = require('path');
const Windows = require('./src/class/__instance_windows');
const log = require('electron-log');
const packageJson = require('./package.json');
const { version, isBeta } = packageJson;
// require('update-electron-app')({
//     logger: log,
// });

handleSquirrelEvent();

function handleSquirrelEvent() {
    if (process.argv.length === 1) {
        return false;
    }

    const ChildProcess = require('child_process');
    const path = require('path');
    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);

    const spawn = function (command, args) {
        let spawnedProcess, error;
        try {
            spawnedProcess = ChildProcess.spawn(command, args, { detached: true });
        } catch (error) { }
        return spawnedProcess;
    };

    const spawnUpdate = function (args) {
        return spawn(updateDotExe, args);
    };

    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
            spawnUpdate(['--createShortcut', exeName]);
            setTimeout(app.quit, 1000);
            return true;
        case '--squirrel-uninstall':
            spawnUpdate(['--removeShortcut', exeName]);
            setTimeout(app.quit, 1000);
            return true;
        case '--squirrel-obsolete':
            app.quit();
            return true;
    }
}

// Windows Declaretion and Controller
var authWindow;
var splashWindow;
var mainWindow;

const createWindow = (accessToken = null) => {
    let { screen } = require('electron');
    let windows = new Windows(screen);

    // Main Window Instance
    mainWindow = windows.main();

    // if (process.platform.toLowerCase() == 'linux') {
    //  authWindow.loadFile(path.join(__dirname, '/routes/auth.html'));
    // }

    // Splash Window Instance
    splashWindow = windows.splash();
    splashWindow.loadFile(path.join(__dirname, '/routes/splash.html'));
    splashWindow.once('ready-to-show', () => {
        splashWindow.show();
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.on('close', function () {
            if (!splashWindow.isDestroyed()) {
                splashWindow.close();
            }
        });

        setTimeout(() => {
            if (!splashWindow.isDestroyed()) {
                splashWindow.close();
            }

            if (mainWindow) {
                mainWindow.show();
            }
        }, 1500);
    });
};

if (!app.requestSingleInstanceLock()) {
    app.quit();
} else {
    app.on('ready', () => {
        createWindow();
        app.on('activate', function () {
            if (BrowserWindow.getAllWindows().length === 0) createWindow();
        });
    });
}

app.on('window-all-closed', function () {
    windowsAllClose = true;
    if (process.platform !== 'darwin') app.quit();
});

// IpcMain Events
ipcMain.on('is-packaged', (event) => {
    event.returnValue = app.isPackaged;
});
ipcMain.on('get-version', (event) => {
    event.returnValue = version;
});
ipcMain.on('get-release-type', (event) => {
    event.returnValue = isBeta ? 'BETA' : '';
});
ipcMain.on('restart-app', () => {
    app.relaunch();
    app.exit();
});
ipcMain.on('close-app', () => {
    app.exit();
});

ipcMain.on('instance-window-main', () => {
    if (!splashWindow.isDestroyed()) {
        mainWindow.loadFile(path.join(__dirname, '/routes/main.html'));
    }
});

// AutoUpdater
autoUpdater.on('update-not-available', (info) => {
    if (!splashWindow.isDestroyed()) {
        splashWindow.webContents.send('autoUpdateNotAvailable', {
            state: true,
        });
    }
    // if (!splashWindow.isDestroyed()) {
    //  authWindow.loadFile(path.join(__dirname, '/routes/auth.html'));
    // }
});

autoUpdater.on('error', (error) => {
    if (!splashWindow.isDestroyed()) {
        splashWindow.webContents.send('autoUpdateError', {
            message: error,
        });
    }
});

autoUpdater.on('update-available', (info) => {
    if (!splashWindow.isDestroyed()) {
        splashWindow.webContents.send('autoUpdateAvailable', {
            state: true,
        });
    }
});

autoUpdater.on('update-downloaded', (info) => {
    autoUpdater.quitAndInstall();
});
