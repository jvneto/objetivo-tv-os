let shell = require('electron').shell;

const OpenExternalLink = (link) => {
  shell.openExternal(link);
};
