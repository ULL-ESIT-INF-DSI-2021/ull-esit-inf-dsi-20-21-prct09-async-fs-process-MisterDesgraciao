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
            let outputLineas: number = 0;
            contadorLineas.stdout.on('data', (chunk) => {
              outputLineas += chunk;
            });
            comprobacion = true;
            contadorLineas.stdout.on('close', () => {
              console.log(
                  `El total de líneas es ${outputLineas}.`);
            });
            contadorLineas.stdout.pipe(process.stdout);
          }
```

Por último, para imprimir este valor tenemos las dos variantes:
- La variante sin `pipe` que realizar un `console.log()` cuando la variable recibe un argumento de tipo `close`, es decir, que el programa finaliza correctamente (termina el comando `wc`). 
- Usando `contadorLineas.stdout.pipe(process.stdout)` lo que hacemos es enviar el valor de `contadorLineas` usando un `pipe` (debido a que es un objeto `ChildProcess`, es decir, hereda de `Stream`) a la salida por terminal, simbolizada por la variable `process.stdout`.

Un par de apuntes que tengo que hacer sobre estas dos salidas. La primera es que no entiendo muy bien cómo funciona el output a través de `console.log()`, quiero decir, a pesar de declararlo como `number`, esta variable tiene el número recibido más el nombre del fichero. En un principio pensé que esto funcionada más como un vector, pero se parece más a un string, y si accedeo al valor de la posición 1, accedo solo al primer dígito, y no al número completo.

Esto podría suponer un problema: el imprimir [x] por [x] supone que para cantidades muy grandes de texto es posible que falten dígitos por imprimir. Así que al final me he decantado por imprimir el valor completo de la variable, pues aunque tiene un formato feo (el que recibe del buffer pero en string), siempre es correcto.

Por último, comentar que para este programa no he realizado tests porque no puedo realizar comprobaciones con `mocha` sobre un comando creado con `yargs`. Este ejercicio lo único que hace es recoger información e implimirla por pantalla, lo cual no sé si puede comprobar siquiera.

## Ejercicio 3


## Ejercicio 4

