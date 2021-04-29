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

## Ejercicio 2


## Ejercicio 3


## Ejercicio 4

