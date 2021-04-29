import {access, constants, watch} from 'fs';

if (process.argv.length !== 3) {
  console.log('Please, specify a file');
} else {
  const filename = process.argv[2];

  /**
   * fs.access lo que hace es comprobar los permisos que tiene el usuario, que
   * en este caso intenta ejecutar el programa, respecto al fichero que aporta
   * en la ejecución.
   *
   * fs.constants es un almacén de varoles (flags) para fs.access.
   * Es decir, fs.access debe recibir una de estas constantes,
   * pues dependiento de ello comprueba el permiso en específico del usuario.
   * Por ejemplo, en este caso usa 'F_OK' para comprobar si el usuario puede
   * ver el fichero, es decir, si existe (y está disponible para él verlo).
   * Otras flags que tiene son R_OK, W_OK, X_OK, que respectivamente
   * comprueban permisos de Lectura, Escritura y Ejecución.
   */
  access(filename, constants.F_OK, (err) => {
    if (err) {
      console.log(`File ${filename} does not exist`);
    } else {
      console.log(`Starting to watch file ${filename}`);

      const watcher = watch(process.argv[2]);

      watcher.on('change', () => {
        console.log(`File ${filename} has been modified somehow`);
      });

      console.log(`File ${filename} is no longer watched`);
    }
  });
}
