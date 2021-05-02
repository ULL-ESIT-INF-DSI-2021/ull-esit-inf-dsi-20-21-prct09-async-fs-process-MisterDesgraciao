import * as fs from 'fs';
// import {spawn} from 'child_process';
import * as yargs from 'yargs';
import * as chalk from 'chalk';

/**
 * Ejecutar con:
 *  node ./dist/ejercicio-3.js observar --usuario="..." --ruta="..."
 */

yargs.command({
  command: 'observar',
  describe: 'Observa un directorio.',
  builder: {
    usuario: {
      describe: 'Nombre de usuario',
      demandOption: true,
      type: 'string',
    },
    ruta: {
      describe: 'Dirección de la carpeta',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.usuario === 'string' &&
        typeof argv.direccion === 'string') {
      const fileroute: string = argv.direccion + '/' + argv.usuario;
      fs.access(fileroute, fs.constants.R_OK, (err) => {
        if (err) {
          console.log(chalk.red.inverse(`El fichero ${fileroute} no existe.`));
        } else {
          const vigilancia = fs.watch(fileroute, () => {});
          console.log(`Observamos en: ${fileroute}`);
          vigilancia.on('close', () => {
            console.log('Fichero cerrado');
          });
          vigilancia.on('change', () => {
            console.log('Fichero modificado o borrado');
          });
          vigilancia.on('error', () => {
            console.log('Error Fichero');
          });
          vigilancia.on('event', () => {
            console.log('event activado');
          });
        }
      });
    } else {
      console.log(chalk.red.inverse(
          'El valor de algún argumento no es de tipo string'));
    }
  },
}).parse();
