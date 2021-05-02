import * as fs from 'fs';
import {spawn} from 'child_process';
import * as yargs from 'yargs';
import * as chalk from 'chalk';
/**
 * Ejecutar con: node ./dist/ejercicio-2.js contador --fichero="..." ...
 */

yargs.command({
  command: 'contador',
  describe: 'Cuenta el número de varias cosas',
  builder: {
    fichero: {
      describe: 'Fichero a leer',
      demandOption: true,
      type: 'string',
    },
    lineas: {
      describe: 'Lee el número de líneas',
      demandOption: false,
      type: 'boolean',
    },
    palabras: {
      describe: 'Lee el número de palabras',
      demandOption: false,
      type: 'boolean',
    },
    caracteres: {
      describe: 'Lee el número de caracteres',
      demandOption: false,
      type: 'boolean',
    },
  },
  handler(argv) {
    if (typeof argv.fichero === 'string' &&
         (typeof argv.lineas === 'boolean' ||
         typeof argv.palabras === 'boolean' ||
         typeof argv.caracteres === 'boolean')) {
      const filename: string = argv.fichero;
      fs.access(filename, fs.constants.R_OK, (err) => {
        if (err) {
          console.log(chalk.red.inverse(`El fichero ${filename} no existe.`));
        } else {
          console.log(chalk.green.inverse(`Contamos del fichero ${filename}.`));
          let comprobacion: boolean = false;
          if (argv.lineas === true) {
            const contadorLineas = spawn('wc', ['-l', filename]);
            let outputLineas: number = 0;
            contadorLineas.stdout.on('data', (chunk) => {
              outputLineas += chunk;
            });
            contadorLineas.stdout.on('close', () => {
              console.log(
                  // eslint-disable-next-line max-len
                  `El total de líneas es ${outputLineas}.`);
            });
            // console.log('Las líneas impresas usando pipe() son:');
            contadorLineas.stdout.pipe(process.stdout);
            comprobacion = true;
          }
          if (argv.palabras === true) {
            const contadorPalabras = spawn('wc', ['-w', filename]);
            let outputPalabras: number = 0;
            contadorPalabras.stdout.on('data', (chunk) => {
              outputPalabras += chunk;
            });
            contadorPalabras.stdout.on('close', () => {
              console.log(
                  // eslint-disable-next-line max-len
                  `El total de palabras es ${outputPalabras}.`);
            });
            // console.log('Las palabras impresas usando pipe() son:');
            contadorPalabras.stdout.pipe(process.stdout);
            comprobacion = true;
          }
          if (argv.caracteres === true) {
            const contadorCaracteres = spawn('wc', ['-m', filename]);
            let outputCaracteres: number = 0;
            contadorCaracteres.stdout.on('data', (chunk) => {
              outputCaracteres += chunk;
            });
            contadorCaracteres.stdout.on('close', () => {
              console.log(
                  // eslint-disable-next-line max-len
                  `El total de caracteres es ${outputCaracteres}.`);
            });
            // console.log('Los caracteres impresos usando pipe() son:');
            contadorCaracteres.stdout.pipe(process.stdout);
            comprobacion = true;
          }
          if (!comprobacion) {
            // eslint-disable-next-line max-len
            console.log(chalk.red.inverse('No se ha introducido ninguna opción o se ha introducido un valor no válido.'));
            // eslint-disable-next-line max-len
            console.log(chalk.red.inverse('Ejecute el programa con algunas o todas de estas opciones: --lineas=true --palabras=true --caracteres==true'));
          }
        }
      });
    }
  },
})
    .parse();
