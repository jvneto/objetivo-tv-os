var ipcRenderer = require('electron').ipcRenderer;
import { Application } from '../class/__instance_application.js';
import { Connection } from '../class/__instance_connection.js';
import { Exception } from '../class/__instance_exception.js';

let progressBar;
let application = new Application();
let updateAvarible = false;
let hasError = false;

window.onload = () => {
  document.getElementById(
    'text-version',
  ).innerText = `Versão: ${ipcRenderer.sendSync(
    'get-version',
  )} ${ipcRenderer.sendSync('get-release-type')}`;

  if (application.SLMP()) {
    application.instanceWindowMain();
  } else {
    document.getElementById(
      'text-update-state',
    ).innerHTML = `Buscando atualização do Objetivo TvOS! <br/><span class="text-xs text-gray-700">Aguarde, isso pode demorar...</span>`;

    (async () => {
      new Connection()
        .getLastRelease()
        .then(function (response) {
          if (
            response.data['name'] !=
              `v${ipcRenderer.sendSync('get-version')}` &&
            hasError == false
          ) {
            document.getElementById('button-close').classList.remove('hidden');
            if (application.getOS() == 'linux') {
              document.getElementById(
                'text-update-state',
              ).innerHTML = `O Objetivo TvOS esta desatualizado! <br/><span class="text-xs text-red-700">Atualização manual necessária.</span>`;
            } else {
              if (!updateAvarible) {
                document.getElementById(
                  'text-update-state',
                ).innerHTML = `O Objetivo TvOS esta desatualizado! <br/><span class="text-xs text-red-700">Aguarde até que atualização seja propagada, isso pode demorar um pouco!</span>`;
              }
            }
          } else {
            application.instanceWindowMain();
          }
        })
        .catch(function (error) {
          new Exception().create({
            status: error.response.status,
            message: error.response.data.message,
          });
        });
    })();
  }
};

ipcRenderer.on('autoUpdateNotAvailable', (event, arg) => {
  if (arg.state) {
    updateAvarible = false;
  }
});

ipcRenderer.on('autoUpdateAvailable', (event, arg) => {
  if (arg.state) {
    updateAvarible = true;
    document.getElementById(
      'text-update-state',
    ).innerHTML = `Atualizando Objetivo TvOS! <span class="text-xs text-gray-700">Aguarde, isso pode demorar...</span>`;
    let timeCounter = 5;
    document
      .getElementById('container-progress-bar')
      .classList.remove('hidden');
    progressBar = setInterval(() => {
      document.getElementById(
        'progress-progress-bar',
      ).style.width = `${(timeCounter =
        timeCounter >= 100
          ? 2
          : timeCounter * 1.2 > 100
          ? 100
          : timeCounter * 1.2)}%`;
    }, 700);
  }
});

ipcRenderer.on('autoUpdateError', (event, arg) => {
  hasError = true;
  document.getElementById(
    'text-update-state',
  ).innerHTML = `<span class="text-xs text-red-700">${arg.message}</span>`;
  document.getElementById('button-close').classList.remove('hidden');
  document.getElementById('container-progress-bar').classList.remove('hidden');
  document.getElementById('progress-progress-bar').style.width = '100%';
  document.getElementById('progress-progress-bar').classList.add('bg-red-300');
  clearInterval(progressBar);
});

window.CloseAll = function CloseAll() {
  application.closeAll();
};
