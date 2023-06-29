let ipcRenderer = require('electron').ipcRenderer;

class Application {
    constructor() { }
    SLMP() {
        return !ipcRenderer.sendSync('is-packaged');
    }
    getVersion() {
        return ipcRenderer.sendSync('get-version');
    }
    getOS() {
        return process.platform.toLowerCase();
    }
    restartApp() {
        return ipcRenderer.send('restart-app');
    }
    closeAll() {
        return ipcRenderer.send('close-app');
    }
instanceWindowMain() {
    return ipcRenderer.send('instance-window-main');
  }
}
export { Application };
