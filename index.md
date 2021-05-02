# Desarrollo de Sistemas Informáticos.
## Universidad de La Laguna. Tercer año.
## Informe Práctica 9: Sistema de ficheros y creación de procesos en Node.js.

Realizado por: **Óscar Ignacio Pozo Fernández**
Correo: **alu0101036526@ull.edu.es**  
Enunciados completos en [este link.](https://ull-esit-inf-dsi-2021.github.io/prct09-async-fs-process/)

## Ejercicio 1

El primer ejercicio consiste en realizar una ejecución del siguiente programa:

```typescript
import {access, constants, watch} from 'fs';

if (process.argv.length !== 3) {
  console.log('Please, specify a file');
} else {
  const filename = process.argv[2];
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
```

#### Preguntas
El programa consiste en observar los cambios sobre un fichero concreto, para este caso usaremos **helloworld.txt**. Para ello, el programa usa varias funciones de **fs**:
- **fs.access** es un función que comprueba los permisos que tiene el usuario, que en este caso intenta ejecutar el programa, respecto al fichero que aporta en la ejecución.
- **fs.constants** es un almacén de varoles (flags) para **fs.access**. Es decir, fs.access debe recibir una de estas constantes, pues dependiento de ello comprueba el permiso en específico del usuario. Por ejemplo, en este caso usa 'F_OK' para comprobar si el usuario puede ver el fichero, es decir, si existe (y está disponible para él verlo). Otras flags que tiene son R_OK, W_OK, X_OK, que respectivamente comprueban permisos de Lectura, Escritura y Ejecución.
- **fs.watch** es la función que nos permite poner bajo vigilancia un directorio/fichero. Es un objeto que heredad de **EventEmitter**, por lo cual a través del objeto **watcher** podemos recibir las actualizaciones sobre el fichero. 

#### Ejecución del programa
Para poder ejecutar el programa hay que hacerlo de la siguiente manera: `node ./dist/ejercicio-1.js helloworld.txt`. Esto se debe a que necesita recibir como argumento el *filename* del fichero a vigilar.

Si ejecutamos correctamente, nos mostrará lo siguiente por terminal: 
`Starting to watch file helloworld.txt`
`File helloworld.txt is no longer watched`.

La intuición nos dice que esto no debería ser así, pues la mayoría de programas se van ejecutando de manera secuencial, sin embargo para la función `fs.watch`, y para todos los objetos de clase `EventEmitter`, su ejecución es **asíncrona**, es decir, se ejecutan cuando se cumple una condición. 

Y aunque esa condición se cumpla al mismo tiempo que se realiza la ejecución de la función, la diferencia reside en la organización de *Node.js*. Este tiene una **Pila de llamadas** donde se va ejecutando de manera secuencial el código, sin embargo, para las funciones que tienen *callback* ( () => {} ) como `fs.watch` o los `SetTimeout()`, su código se ejecuta en otra parte: la *Web API*. Sin embargo, si existe algún resultado que, por ejemplo, deba ser imprimido por pantalla, no lo manda directamente al **Pila de llamadas**, si no que primero se envía a una **Cola**. Es de esta **Cola** de la que se van extrayendo elementos para ejecutar en la **Pila de llamadas**, y es así cómo el contenido de estas funciones con *callback* siempre es de lo último en ejecutarse.

Si realizamos algún cambio sobre el fichero **helloworld.txt**, entonces nos muestra el siguiente mensaje: `File helloworld.txt has been modified somehow`. Esto significa que el objeto *watcher* está recibiendo de la función *watch()* un argumento de tipo *change*, que nos dice que **algo** ha cambiado respecto al fichero. Un detalle en este punto es que la frase por consola se imprime 2 veces. No estoy seguro si es porque la función *watch()* devuelve los instancias de *change* o es algún otro motivo.

Si volvemos a realizar otro cambio sobre el fichero, vuelve a imprimir: `File helloworld.txt has been modified somehow`.

---

Para comprobar que todo esto es correcto, he realizado una modificación muy simplemente: añadir un `console.log()` después de la función `access` y realizar una ejecución normal del programa:
```typescript
import {access, constants, watch} from 'fs';

if (process.argv.length !== 3) {
  console.log('Please, specify a file');
} else {
  const filename = process.argv[2];
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
  console.log('Esta es la última línea.');
}
```

Y, como aclaramos antes, el mensaje que acabo de añadir se imprime **antes** que todos los mensajes dentro de `access` a pesar de estar declarado después.

[![P9-E1-terminal.png](https://i.postimg.cc/qBnbngyy/P9-E1-terminal.png)](https://postimg.cc/vDYtwYPZ)

Para este ejercicio no he realizado ningún tests por dos motivos: primero porque no puedo realizar tests con `mocha` si no es sobre variables o estructuras de datos, y segundo porque es un ejercicio que consiste en analizar el funcionamiento del programa y contestar las preguntas planteadas.

## Ejercicio 2

Este ejercicio consiste en crear un pequeño programa al que se le otorga un nombre de un fichero, y si existe, imprimir el número de líneas, palabras y/o caracteres del mismo. 

Para lograr esto, he creado un nuevo comando usando el módulo `yargs`:

```typescript
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
  /**
   * continúa en el handler...
   */
```

Este comando lo he llamado **'contador'**, y debe recibir como argumento el nombre del fichero y , como mínimo, uno de las 3 siguientes opciones: `lineas`, `palabras` y/o `caracteres`. Si el nombre del fichero recibido no lo encuentra (no existe o no puede leerlo), comunica el error. Así mismo, si no se le especifica ninguna de las 3 opciones también lo comenta por terminal.

Así pues, cuando se ejecuta el `handler`, lo primero que se hace es comprobar que los tipos son correctos: el nombre del fichero es tipo `string` y el de las opciones son `boolean`. Lo siguiente que hace es comprobar con `fs.access` si el fichero en cuestión existe/tiene permisos el usuario para **leerlo** (constante *R_OK*). Si devuelve un error, lo comunicamos, si no, continuamos con la ejecución.

```typescript
/**
 * código anterior.
 */
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
          /**
           * If de cada opción...
           */
```

Para comentar el código de los `if` me basta con hacerlo con uno solo, pues las 3 versiones usan el mismo comando `wc` (*Word Counter*) pero con opciones diferentes: **-l** para líneas, **-w** para palabras y **-m** para caracteres. Es decir, las 3 funciones juntas se verían así:

```typescript
const contadorLineas = spawn('wc', ['-l', filename]);
const contadorPalabras = spawn('wc', ['-w', filename]);
const contadorCaracteres = spawn('wc', ['-m', filename]);
```

Con esto aclarado, vamos al código. Lo primero que hay que hacer es comprobar si la opción está seleccionada desde la ejecución del comando. Si es `true`, entonces lo primero que hacemos el usar `spawn` para almacenar en `contadorLineas` un `ChildProcess`, que en este caso cuenta las líneas del fichero.

Posteriormente, lo que ocurre es que a través de `contadorLineas.stdout.on()` le podemos especificar qué hacer cuando el objeto lee. En el caso de que reciba un argumento de tipo `data`, lo que hace es coger ese valor almacenado en `chunk`, y lo suma al contador llamado `outputLineas`.

Le damos un valor `true` a `comprobacion` para que después no nos salte el mensaje de error de que no se ha otorgado ninguna opción en la ejecución.

```typescript
          /**
           * código anterior.
           */
          if (argv.lineas === true) {
            const contadorLineas = spawn('wc', ['-l', filename]);
            let outputLineas = ' ;
            contadorLineas.stdout.on('data', (chunk) => {
              outputLineas += chunk;
            });
            comprobacion = true;
            contadorLineas.stdout.on('close', () => {
              const outputLineasArray = outputLineas.split(/\s+/);
              console.log(
                  `El total de líneas es ${outputLineasArray[1]}.`);
            });
            contadorLineas.stdout.pipe(process.stdout);
          }
          /**
           * Resto de ifs...
           */
```

Por último, para imprimir este valor tenemos las dos variantes:
- La variante sin `pipe` que realizar un `console.log()` cuando la variable recibe un argumento de tipo `close`, es decir, que el programa finaliza correctamente (termina el comando `wc`). 
- Usando `contadorLineas.stdout.pipe(process.stdout)` lo que hacemos es enviar el valor de `contadorLineas` usando un `pipe` (debido a que es un objeto `ChildProcess`, es decir, hereda de `Stream`) a la salida por terminal, simbolizada por la variable `process.stdout`.

Un par de apuntes que tengo que hacer sobre estas dos salidas. La primera es que he creado una variable `outputLineasArray`, que a través de la función `split()` y el valor (extraído de los apuntes de clase), puedo almacenar por separado el número, de líneas en este caso, y el nombre del fichero. Es por esto que uso `outputLineasArray[1]`.

Sin embargo, no sé cómo hacer esto mismo con `pipe`. Así que al final me he decantado por imprimir el valor completo de la variable, pues aunque tiene un formato feo (el que recibe del buffer pero en string), siempre muestra todos los valores.

Por último, comentar que para este programa no he realizado tests porque no puedo realizar comprobaciones con `mocha` sobre un comando creado con `yargs`. Este ejercicio lo único que hace es recoger información e implimirla por pantalla, lo cual no sé si puede comprobar siquiera.

## Ejercicio 3

Para este ejercicio nos piden crear un programa en paralelo al ejercicio de la Práctica 8. Ese ejercicio consistía en crear un programa que permita crear, modificar y eliminar Notas dentro de ficheros de distintos usuarios. En este ejercicio nos centramos en observar, a través de la función `fs.watch()`, si la carpeta seleccionada recibe algún cambio en los ficheros que contiene.

Para conseguir este objetivo, hago uso de la función `yargs`, para crear un nuevo comando llamado **observar**. Este nuevo comando debe recibir tanto la **ruta** como el **nombre** de la carpeta a observar. Por ejemplo: --usuario="oscar" --ruta="./users"

```typescript
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
  /**
   * Continúa en el handler...
   */
```

Lo primero que hace es comprobar el formato correcto de los dos argumentos. En caso de que alguno no sea de tipo *string*, comunica el error por terminal y no ejecuta nada.

En caso afirmativo, crea la variable `fileroute`, que no es más que la unión de la `argv.ruta` + `/` + `argv.usuario`, de esta manera obtenemos la ruta absoluta de la carpeta de usuario. Con este nuevo valor, lo primero que hacemos es comprobar si existe usando `fs.access()`. Si no existe, lo comunicamos, y si existe continuamos con el código.

```typescript
handler(argv) {
    if (typeof argv.usuario === 'string' &&
        typeof argv.ruta === 'string') {
      const fileroute: string = argv.ruta + '/' + argv.usuario;
      fs.access(fileroute, fs.constants.R_OK, (err) => {
        if (err) {
          console.log(chalk.red.inverse(`El fichero ${fileroute} no existe.`));
        } else {
          /**
           * Resto del código...
           */
        }
      });
    } else {
      console.log(chalk.red.inverse(
          'El valor de algún argumento no es de tipo string'));
    }
  },
}).parse();
```

Comunicamos la dirección que estamos observando para que el usuario lo sepa.

Usamos `fs.watch()` para crear el objeto `Watcher` que nos dará la información sobre lo que ocurre dentro de la carpeta. Para conseguir esto, en el *callback* declaramos dos variables: `eventType` y `filename`, que nos indican qué tipo de evento ha ocurrido dentro de la carpeta y sobre qué fichero, respectivamente.

Es importante crear la variable `rutaFichero` con el contenido de `fileroute` + `/` + `filename`, pues es la ruta absoluta del **fichero** que ha sufrido algún cambio, y la necesitamos después para algunas funciones.

Principalmente, nos basamos en los dos valores que puede obtener `eventType` para distinguir los eventos que ocurren. Si el valor es *rename*, entonces es que ha aparecido o desaparecido un fichero del directorio. Esto lo podemos saber por la documentación de la propia función:
> On most platforms, 'rename' is emitted whenever a filename appears or disappears in the directory.

Así pues, para distinguir si el fichero ha sido creado o ha sido borrado, lo único que hay que hacer es comprobar la ruta absoluta `rutaFichero` con `fs.access()`. En caso de que tratar de acceder al fichero de un error, significa que ha sido borrado, pero si se puede acceder a él, es que ha sido creado. Por último, llamamos también a `fs.readFile()` para imprimir por pantalla el contenido de este nuevo fichero.

```typescript
          /**
           * código anterior.
           */
          console.log(chalk.green.inverse(`Observamos en: ${fileroute}`));
          const vigilancia = fs.watch(fileroute, (eventType, filename) => {
            const rutaFichero = fileroute + '/' + filename;
            if (eventType === 'rename') {
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
              /**
               * código posterior...
               */
```

En caso de `eventType` obtenga el valor *change*, entonces significa que se ha producido algún cambio sobre algún fichero. Primero lo comunicamos por terminal, y posteriormente llamamos a `fs.readFile()` para leer el nuevo contenido del mismo.

```typescript
            /**
             * código anterior.
             */
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
          /**
           * código posterior...
           */
```

Una ejecución de ejemplo de este programa siguiendo estas acciones: [Modifico el fichero] > [Borro hola.txt] > [Creo el fichero hola.txt fuera de la carpeta y la muevo dentro]

[![Ejecucion-Ejemplo-Ejercicio-3.png](https://i.postimg.cc/FFT2DT2t/Ejecucion-Ejemplo-Ejercicio-3.png)](https://postimg.cc/PN83qQXK)

En esta captura se pueden observar lo que ya había comentado antes: algunos comandos se repiten. En concreto para este caso únicamente ocurre cuando pasa un `change` en el `eventType` de `fs.watch()`. También resaltar que al crear directamente el fichero en el directorio, solo salta el `eventType` de `rename`. Sin embargo, en este ejemplo me equivoqué: lo creé fuera y después lo moví dentro. Lo que ocurrió fue que detectó un nuevo fichero, así que obtuvo un evento `rename`, pero también lo detectó como `change` y actuó al respecto.

Por último sobre este ejercicio, queda contestar a las preguntas realizadas en el guión:
> ¿Qué evento emite el objeto Watcher cuando se crea un nuevo fichero en el directorio observado? ¿Y cuando se elimina un fichero existente? ¿Y cuando se modifica?

Un objeto `Watcher` emite un evento *rename* cuando un elemento aparece o desaparece de un directorio. Cuando se modifica, entonces `Watcher` emite un evento *change*.

> ¿Cómo haría para mostrar, no solo el nombre, sino también el contenido del fichero, en el caso de que haya sido creado o modificado?

Esta cuestión la he realizado. Lo primero que hay que hacer es asegurarse que el fichero existe con `fs.access()`. Entonces podemos leer el contenido del mismo con `fs.readFile()` e imprimirlo por pantalla. 

> ¿Cómo haría para que no solo se observase el directorio de un único usuario sino todos los directorios correspondientes a los diferentes usuarios de la aplicación de notas?

Esta cuestión no la he realizado por falta de tiempo. Para poder realizarla lo primero es comprobar que el fichero a observar existe. Después, lo que hay que hacer es leer el contenido del directorio con `fs.readdir()` y almacenar esos valores en una variable que llamaremos `contenido`. Si accedemos a `contenido` usando un bucle `forEach()`, entonces obtenemos el nombre de cada carpeta de usuario, es decir, el valor de `argv.usuario`. Sería en este punto que creamos un objeto `Watcher` por cada carpeta de usuario y así podríamos estar al tanto de todos los cambios de todas las carpetas.

---
Para este ejercicio tampoco he podido realizar tests por la propia naturaleza de `mocha` y su incompatibilidad de comprobar cosas de `yargs`.

## Ejercicio 4

Para este ejercicio se nos pide lo siguiente:
> Desarrolle una aplicación que permita hacer de wrapper de los distintos comandos empleados en Linux para el manejo de ficheros y directorios. En concreto, la aplicación deberá permitir:
>
> - Dada una ruta concreta, mostrar si es un directorio o un fichero.
> - Crear un nuevo directorio a partir de una nueva ruta que recibe como parámetro.
> - Listar los ficheros dentro de un directorio.
> - Mostrar el contenido de un fichero (similar a ejecutar el comando cat).
> - Borrar ficheros y directorios.
> - Mover y copiar ficheros y/o directorios de una ruta a otra. Para este caso, la aplicación recibirá una ruta origen y una ruta destino. En caso de que la ruta origen represente un directorio, se debe copiar dicho directorio y todo su contenido a la ruta destino.
>
> Para interactuar con la aplicación a través de la línea de comandos, puede hacer uso de yargs.

Mi interpretación es crear un comando usando `yargs` para cada una de estas tareas que tienen su comando específico en una terminal. El planteamiento de todo es muy sencillo: intentar recrear de la manera más fiel posible, el comportamiento de cada comando.

El primer comando es muy sencillo: comprobar si una ruta dada corresponde a un directorio o un fichero. Solo necesitamos la ruta a analizar. Para comprobar esto, primero hay que saber si esa ruta existe con `fs.access()`, en caso que sí, para diferenciar si es un fichero o un directorio es usar las funciones `fs.readFile` y `fs.readdir`, respectivamente. La que **no falle** corresponde al tipo, es decir, si falla la lectura del directorio, es porque es un fichero y viceversa.

```typescript
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
```

El siguiente comando es **mkdir**, con el que creamos un directorio si la ruta no existe. Si lo primero que hay que hacer es comprobar que esa ruta **no exista**. Así que llamamos a `fs.access` esperando a que salte `err`. Es entonces que usamos `fs.mkdir` sobre la ruta otorgada para crear el directorio.

```typescript
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
```

Para el comando de "listar los ficheros de un directorio", al cual he llamado *list*, primero necesitamos comprobar que el directorio existe y después leer su contenido. Para lo primero lo comprobamos con `fs.access` y para lo segundo llamamos a `fs.readdir` para obtener el contenido que imprimimos por pantalla.

```typescript
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
```

Para "Mostrar el contenido de un fichero (similar a ejecutar `cat`)" lo he llamado `cat` directamente, y el planteamiento es igual que el comando anterior: comprobar que el fichero existe y leer su contenido. Para lo primero usamos, como siempre, `fs.access` y para lo segundo usamos `fs.readFile`, imprimiendo el contenido por pantalla.

```typescript
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
```

El penúltimo comando es el borrado **rm** (remove). El ejercicio especifica que debe borrar tanto ficheros como directorios, así que mi planteamiento es el siguiente: primero comprobar que existe (con `fs.access`), después comprobar si es un fichero o un directorio, pues no se borran con el mismo comando. Este segundo paso lo consigo usando `fs.readdir` y `fs.readFile`. El que no devuelva un error de los 2, significa que es de ese tipo, así dependiendo de ello, llamamos dentro de esas funciones a `fs.rmdir` o `fs.rm`, respectivamente. 

De esta manera me aseguro de borrar correctamente cada uno de los 2 tipos de archivos.

```typescript
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
```

Por último, está el comando `move`. Este comando copia todos el contenido de la dirección (ficheros y/o directorios) y lo mueve a la dirección de destino. Estos dos parámetros son obligatorios.

Para conseguir funcionar este programa sin errores, hay que hacer una serie de comprobaciones, las cuales me resulta más explicar de la siguiente manera:
Comprobar que existe el directorio de **origen** (con `fs.access`) > comprobar que existe el directorio de **destino** > comprobar que la dirección de **origen** es un directorio (con `fs.readdir`) > de lo leído del directorio, ir elemento por elemento comprobando si es un fichero o un directorio > Si es un fichero, guardamos su contenido también. > Creamos en la dirección de **destino** el fichero o directorio.

Si algún paso falla en algún momento, se comunica por pantalla.

```typescript
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
```
---

Por último, comentar un par de fallos/vulnerabilidades que tiene este último comando por falta de tiempo: únicamente está planteado para que copie el contenido de un **directorio**, y no de un fichero. Lo mismo para la ruta de salida, solo contempla el mover esos elementos a un directorio, y no el poder escribir todo en un fichero, por ejemplo.

Si la carpeta tiene directorios dentro de ella, solamente copia el directorio y no su contenido con él. Se me hace complejo el poder implimentar la posibilidad de que un usuario pueda tener una carpeta dentro de otra carpeta y así a varios niveles. Como voy muy justo de tiempo, no lo implemento (aún).

Una dificultad que tuve en este ejercicio es que volví a plantearlo como si este programa fuese secuencial. Concretamente, creé una variable al principio donde guardar todos los ficheros/directorios, esto ocurría en el `fs.access` del origen, pues iban uno después del otro (creo que con esto ya se puede preveer el problema). En el `fs.access` del destino recibo esa variable y accedo a los datos para crearlos. 

Obviamente tiene que fallar. Por suerte no tardé mucho en darme cuenta que se debía a que todo este programa funciona de manera asíncrona, y para cuando se ejecute el código correspondiente al **origen**, también lo habrá hecho el de **destino** y cosas como la variable donde guardo los datos está vacía. Esto lo solucioné creando el fichero/directorio nada más confirmo que es un fichero o un directorio correspondiente al origen. 

Por último, comentar que no he realizado `tests` para este ejercicio tampoco, pues pasa lo mismo que los anteriores: es difícil usar `mocha` sobre comandos creados por `yargs`. Sin embargo, creo que para este ejercicio sí podría realizar algunas comprobaciones (similares a los tests del ejercicio 8) de diferentes ficheros y/o directorios que existan o no, después de una ejecución de ejemplo/dirigida. Sin embargo, me he quedado sin tiempo para poder hacerlo.
