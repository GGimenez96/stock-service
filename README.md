# Microservicio de stock

Este microservicio gestiona el stock de todos los artículos.

[Documentación de API](./README-API.md)

La documentación de las api también se pueden consultar desde el home del microservicio
que una vez levantado el servidor se puede navegar en [localhost:3007](http://localhost:3007/)

## Dependencias

### Auth

El stock sólo puede usarse por usuario autenticados, ver la arquitectura de microservicios de [ecommerce](https://github.com/nmarsollier/ecommerce).

### Catalog

Funcionalidades relacionadas con el Catálogo:
- Informar stock de los artículos.
- Crear stock inicial cuando se cree un artículo.
- Modificar el stock de los artículos.
- Eliminar el stock cuando se elimine un artículo.
- Informar sobre stock bajo.

Los artículos del microservicio de stock se corresponden con los del Catálogo, ver la arquitectura de microservicios de [ecommerce](https://github.com/nmarsollier/ecommerce).

### Cart

Cuando hay artículos agregados a un carrito, se disminuye el stock para asegurar la completitud de esa orden. De la misma forma, si los artículos se quitan de un carrito, el stock vuelve a incrementarse.

### Order

Al completarse una orden, se informa el stock de los artículos involucrados en la orden y, si corresponde, se emite una alerta sobre aquellos que hayan alcanzado su límite de stock bajo.

### Node 10.15

Seguir los pasos de instalación del sitio oficial

[nodejs.org](https://nodejs.org/en/)

### MongoDb

Ver tutorial de instalación en [README.md](../README.md) en la raíz.

### RabbitMQ

La comunicación con el resto de los microservicios es a través de rabbit.

Ver tutorial de instalación en [README.md](../README.md) en la raíz.

## Ejecución

Abrir ventana de comandos en la carpeta del microservicio y ejecutar :

```bash
npm install
npm start
```

## Apidoc

Apidoc es una herramienta que genera documentación de apis para proyectos node (ver [Apidoc](http://apidocjs.com/)).

El microservicio muestra la documentación como archivos estáticos si se abre en un browser la raíz del servidor [localhost:3007](http://localhost:3007/)

Ademas se genera la documentación en formato markdown.

## Archivo .env

Este archivo permite configurar diversas opciones de la app, ver ejemplos en .env.example
