/* eslint-disable max-len */
import * as fs from 'fs';
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
        typeof argv.ruta === 'string') {
      const fileroute: string = argv.ruta + '/' + argv.usuario;
      fs.access(fileroute, fs.constants.R_OK, (err) => {
        if (err) {
          console.log(chalk.red.inverse(`El fichero ${fileroute} no existe.`));
        } else {
          console.log(chalk.green.inverse(`Observamos en: ${fileroute}`));
          const vigilancia = fs.watch(fileroute, (eventType, filename) => {
            const rutaFichero = fileroute + '/' + filename;
            if (eventType === 'rename') {
              // On most platforms, 'rename' is emitted whenever a filename appears or disappears in the directory.
              fs.access(rutaFichero, fs.constants.F_OK, (err) => {
                if (err) {
                  console.log(chalk.green(
                      `Se ha borrado el fichero '${filename}' en ${fileroute}`));
                } else {
                  console.log(chalk.green(
                      `Se ha creado el fichero '${filename}' en ${fileroute}.`));
                  fs.readFile(rutaFichero, 'utf8', (err, data) => {
                    if (err) console.log(chalk.red.inverse('Falló la lectura del fichero'));
                    console.log(chalk.green('El contendio del fichero es: '));
                    console.log(data);
                  });
                }
              });
            } else if (eventType === 'change') {
              console.log(chalk.green(
                  `Se ha modificado el fichero: ${rutaFichero}`));
              fs.readFile(rutaFichero, 'utf8', (err, data) => {
                if (err) {
                  console.log(chalk.red.inverse(
                      'Falló la lectura del fichero'));
                }
                console.log(`Fichero: ${rutaFichero}`);
                console.log(chalk.green(`El contenido del fichero es:`));
                console.log(data);
              });
            }
          });

          vigilancia.on('close', () => {
            console.log('Fichero cerrado');
          });
        }
      });
    } else {
      console.log(chalk.red.inverse(
          'El valor de algún argumento no es de tipo string'));
    }
  },
}).parse();
