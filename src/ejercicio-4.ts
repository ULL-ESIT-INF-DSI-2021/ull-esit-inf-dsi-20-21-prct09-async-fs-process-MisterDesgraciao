/* eslint-disable max-len */
import * as fs from 'fs';
import * as yargs from 'yargs';
import * as chalk from 'chalk';

yargs.command({
  command: 'ruta',
  describe: 'Dada un ruta, dice si es un directorio o un fichero.',
  builder: {
    ruta: {
      describe: 'Ruta a analizar.',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.ruta === 'string') {
      const rutaAnalizar: string = argv.ruta;
      fs.access(rutaAnalizar, fs.constants.F_OK, (err) => {
        if (err) {
          console.log(chalk.red.inverse(`La ruta ${argv.ruta} no existe.`));
        } else {
          fs.readdir(rutaAnalizar, (err) => {
            if (!err) {
              console.log(chalk.green('Es un directorio.'));
            }
          });
          fs.readFile(rutaAnalizar, (err) => {
            if (!err) {
              console.log(chalk.green('Es un documento.'));
            }
          });
        }
      });
    } else {
      console.log(chalk.red.inverse('Formato de la ruta no válido. Debe ser un string'));
    }
  },
});

yargs.command({
  command: 'mkdir',
  describe: '',
  builder: {
    algo: {

    },
  },
  handler(argv) {

  },
});

yargs.command({
  command: 'list',
  describe: '',
  builder: {
    algo: {

    },
  },
  handler(argv) {

  },
});

yargs.command({
  command: 'cat',
  describe: '',
  builder: {
    algo: {

    },
  },
  handler(argv) {

  },
});

yargs.command({
  command: 'rm',
  describe: '',
  builder: {
    algo: {

    },
  },
  handler(argv) {

  },
});

yargs.command({
  command: 'move',
  describe: '',
  builder: {
    algo: {

    },
  },
  handler(argv) {

  },
}).parse();
