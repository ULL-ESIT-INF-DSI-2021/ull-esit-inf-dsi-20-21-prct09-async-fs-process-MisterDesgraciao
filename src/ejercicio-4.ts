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
      const path: string = argv.ruta;
      fs.access(path, fs.constants.F_OK, (err) => {
        if (err) {
          console.log(chalk.red.inverse(`La ruta ${argv.ruta} no existe.`));
        } else {
          fs.readdir(path, (err) => {
            if (!err) {
              console.log(chalk.green('Es un directorio.'));
            }
          });
          fs.readFile(path, (err) => {
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
  describe: 'Dada un ruta, la crea como nuevo directorio.',
  builder: {
    ruta: {
      describe: 'Ruta de directorio a crear.',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.ruta === 'string') {
      const path: string = argv.ruta;
      fs.readdir(path, (err) => {
        if (err) {
          console.log(chalk.green('Creando la ruta.'));
          fs.mkdir(path, () => {
            console.log(chalk.green(`Ruta ${path} creada.`));
          });
        } else {
          console.log(chalk.red.inverse('Error. La ruta ya existe como directorio.'));
        }
      });
    } else {
      console.log(chalk.red.inverse('La ruta especificada no es de formato string.'));
    }
  },
});

yargs.command({
  command: 'list',
  describe: 'Mostrar los ficheros dentro de un directorio.',
  builder: {
    ruta: {
      describe: 'Ruta a analizar.',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.ruta === 'string') {
      const path: string = argv.ruta;
      fs.access(path, fs.constants.F_OK, (err) => {
        if (err) {
          console.log(chalk.red('Error. El directorio no existe'));
        } else {
          fs.readdir(path, 'utf8', (err, files) => {
            if (err) {
              console.log(chalk.red.inverse('Fallo inesperado en la lectura.'));
            } else {
              console.log(chalk.green(`Leemos del directorio '${path}'. Dentro hay los siguientes ficheros:`));
              console.log(files);
            }
          });
        }
      });
    } else {
      console.log(chalk.red.inverse('La ruta especificada no es de formato string.'));
    }
  },
});

yargs.command({
  command: 'cat',
  describe: 'Mostrar el contenido de un fichero.',
  builder: {
    ruta: {
      describe: 'Fichero a leer.',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.ruta === 'string') {
      const path: string = argv.ruta;
      fs.access(path, (err) => {
        if (err) {
          console.log(chalk.red('Error. El fichero no existe'));
        } else {
          fs.readFile(path, 'utf8', (err, data) => {
            if (err) {
              console.log(chalk.red('Error. Esta dirección no corresponde a un documento.'));
            } else {
              console.log(chalk.green(`El contenido de ${path} es:`));
              console.log(data);
            }
          });
        }
      });
    } else {
      console.log(chalk.red.inverse('La ruta especificada no es de formato string.'));
    }
  },
});

yargs.command({
  command: 'rm',
  describe: 'Elimina ficheros y directorios',
  builder: {
    ruta: {
      describe: 'Ruta a eliminar',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.ruta === 'string') {
      const path: string = argv.ruta;
      fs.access(path, (err) => {
        if (err) {
          console.log(chalk.red('Error. El fichero/directorio no existe'));
        } else {
          fs.readdir(path, (err) => {
            if (!err) {
              console.log(chalk.green(`Eliminamos el directorio: ${path}`));
              fs.rmdir(path, (err) => {
                if (err) console.log(chalk.red.inverse(`Error al intentar borrar el directorio ${path}`));
              });
            }
          });
          fs.readFile(path, (err) => {
            if (!err) {
              console.log(chalk.green(`Eliminamos el fichero: ${path}`));
              fs.rm(path, (err) => {
                if (err) console.log(chalk.red.inverse(`Error al intentar borrar el fichero ${path}`));
              });
            }
          });
        }
      });
    } else {
      console.log(chalk.red.inverse('La ruta especificada no es de formato string.'));
    }
  },
});

yargs.command({
  command: 'move',
  describe: 'Copiar y mover ficheros y/o directorios',
  builder: {
    origen: {
      describe: 'Ruta de origen',
      demandOption: true,
      type: 'string',
    },
    destino: {
      describe: 'Ruta de destino',
      demandOption: true,
      type: 'string',
    },
  },
  handler(argv) {
    if (typeof argv.origen === 'string' && typeof argv.destino === 'string') {
      const originPath: string = argv.origen;
      const destinationPath: string = argv.destino;
      fs.access(originPath, (err) => {
        if (err) {
          console.log(chalk.red('Error. El fichero/directorio de origen no existe'));
        } else {
          fs.access(destinationPath, (err) => {
            if (err) {
              console.log(chalk.red('Error. El fichero/directorio de destino no existe'));
            } else {
              fs.readdir(originPath, 'utf-8', (err, files) => {
                if (err) {
                  console.log(chalk.red.inverse(`Error al intentar leer el directorio ${originPath}`));
                } else {
                  files.forEach((elemento) => {
                    const rutaElemento = originPath + '/' + elemento;
                    fs.readFile(rutaElemento, (err, data) => {
                      if (err) {
                        console.log(chalk.red.inverse('Error inesperado al leer el fichero.'));
                      } else {
                        const nuevoFichero = destinationPath + '/' + elemento;
                        fs.writeFile(nuevoFichero, data, 'utf8', (err) => {
                          if (err) {
                            console.log(chalk.red.inverse(`Error al crear el fichero ${nuevoFichero}`));
                          }
                        });
                      }
                    });
                    fs.readdir(rutaElemento, (err, files) => {
                      if (err) {
                        console.log(chalk.red.inverse(`Error inesperado al leer de la carpeta ${rutaElemento}`));
                      } else {
                        const nuevaCarpeta = destinationPath + '/' + elemento;
                        fs.mkdir(nuevaCarpeta, (err) => {
                          if (err) console.log(chalk.red.inverse('Error, no se ha podido crear la carpeta.'));
                        });
                      }
                    });
                  });
                }
              });
            }
          });
        }
      });
      console.log(chalk.green('Ficheros y directorios movidos correctamente.'));
    } else {
      console.log(chalk.red.inverse('La ruta especificada no es de formato string.'));
    }
  },
}).parse();
