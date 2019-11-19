<a name="top"></a>
# Stock Service v0.1.0

Microservicio de Stock

- [RabbitMQ_GET](#rabbitmq_get)
	- [Artículo agregado al carrito](#artículo-agregado-al-carrito)
	- [Artículo eliminado del carrito](#artículo-eliminado-del-carrito)
	- [Artículo eliminado del catálogo](#artículo-eliminado-del-catálogo)
	- [Logout de Usuarios](#logout-de-usuarios)
	- [Orden completa](#orden-completa)
	
- [RabbitMQ_POST](#rabbitmq_post)
	- [Alerta de stock bajo](#alerta-de-stock-bajo)
	- [Estado del stock](#estado-del-stock)
	
- [Stock](#stock)
	- [Crear nuevo stock](#crear-nuevo-stock)
	- [Modificar stock](#modificar-stock)
	- [Obtener stock](#obtener-stock)
	


# <a name='rabbitmq_get'></a> RabbitMQ_GET

## <a name='artículo-agregado-al-carrito'></a> Artículo agregado al carrito
[Back to top](#top)

<p>Escucha a Cart para saber cuando se agrega un artículo al carrito y así reservar stock.</p>

	DIRECT cart-stock/stock-update





### Success Response

Mensaje

```
{
  "type": "article-add",
  "message": {
    "articleId": "{articleId}",
    "amount": {amount}
    }
}
```


## <a name='artículo-eliminado-del-carrito'></a> Artículo eliminado del carrito
[Back to top](#top)

<p>Escucha a Cart para saber cuando se quita un artículo del carrito y así liberar stock.</p>

	DIRECT cart-stock/stock-update





### Success Response

Mensaje

```
{
  "type": "article-remove",
  "message": {
    "articleId": "{articleId}",
    "amount": {amount}
    }
}
```


## <a name='artículo-eliminado-del-catálogo'></a> Artículo eliminado del catálogo
[Back to top](#top)

<p>Escucha a Catalog para eliminar el stock de un artículo cuando este se elimine del catálogo.</p>

	DIRECT catalog-stock/articles





### Success Response

Mensaje

```
{
  "type": "article-delete",
    "message": {
      "articleId": "{articleId}"
      }
   }
```


## <a name='logout-de-usuarios'></a> Logout de Usuarios
[Back to top](#top)

<p>Escucha de mensajes logout desde auth.</p>

	FANOUT auth/logout





### Success Response

Mensaje

```
{
   "type": "logout",
   "message": "{tokenId}"
}
```


## <a name='orden-completa'></a> Orden completa
[Back to top](#top)

<p>Escucha a Order con el topic &quot;order_placed&quot; para saber cuando una orden se completa y así informar el estado del stock.</p>

	TOPIC sell_flow/topic_cart





### Success Response

Mensaje

```
{
  "type": "order-placed",
    "message": {
      "cartId": "{cartId}",
      "orderId": "{orderId}",
      "articles": [{
        "articleId": "{article id}",
        "quantity" : {quantity}
      }]
    }
}
```


# <a name='rabbitmq_post'></a> RabbitMQ_POST

## <a name='alerta-de-stock-bajo'></a> Alerta de stock bajo
[Back to top](#top)

<p>Cuando se completan órdenes y el stock llega al nivel mínimo, se alerta de la situación para los artículos involucrados en la orden que hayan alcanzado o quedado por debajo del valor de stock mínimo.</p>

	FANOUT stock/stock





### Success Response

Mensaje

```
{
  "exchange": "stock",
  "queue": "stock"
  "type": "low-stock",
    "message": {
      "articles": [{
        "_id": "{stockId}",
        "articleId": "{articleId}",
        "stock": {stock},
        "minStockWarning": {minStockWarning},
        "updated": "{date}",
        "created": "{date}",
        "enabled": true,
        "_v": {_v}
      }]
    }
}
```


## <a name='estado-del-stock'></a> Estado del stock
[Back to top](#top)

<p>Cuando una orden se complete, se avisa la nueva cantidad de stock de los artículos involucrados en la orden.</p>

	FANOUT stock/stock





### Success Response

Mensaje

```
{
  "exchange": "stock",
  "queue": "stock"
  "type": "stock-updated",
    "message": {
      "articles": [{
        "_id": "{stockId}",
        "articleId": "{articleId}",
        "stock": {stock},
        "minStockWarning": {minStockWarning},
        "updated": "{date}",
        "created": "{date}",
        "enabled": true,
        "_v": {_v}
      }]
    }
}
```


# <a name='stock'></a> Stock

## <a name='crear-nuevo-stock'></a> Crear nuevo stock
[Back to top](#top)

<p>Crear el stock de un nuevo artículo.</p>

	POST /v1/stock/



### Examples

Body

```
{
  "articleId": "{articleId}",
  "initialStock": {stock},
  "minStockWarning": {minStock}
}
```
Header Autorización

```
Authorization=bearer {token}
```


### Success Response

Response

```
HTTP/1.1 200 OK
   {
     "_id": "{newStockId}",
     "articleId": "{articleId}",
     "stock": {stock},
     "minStockWarning": {stock},
     "updated": "{now}",
     "created": "{now}",
     "enabled": true
   }
```


### Error Response

400 Bad Request

```
HTTP/1.1 400 Bad Request
{
   "messages" : [
     {
       "path" : "{Nombre de la propiedad}",
       "message" : "{Motivo del error}"
     },
     ...
  ]
}
```
500 Server Error

```
HTTP/1.1 500 Internal Server Error
{
   "error" : "Not Found"
}
```
401 Unauthorized

```
HTTP/1.1 401 Unauthorized
```
500 Internal Server Error

```
HTTP/1.1 500 Internal Server Error
 {
   "error" : "{error}"
 }
```
404 Not Found

```
HTTP/1.1 404 Not Found
 {
   "url": "{url}",
   "error" : "Not Found"
 }
```
Custom Error

```
HTTP/1.1 {CODE} Custom Error
 {
   "code": {code},
   "error" : "Custom error message"
 }
```
## <a name='modificar-stock'></a> Modificar stock
[Back to top](#top)

<p>Modifica el stock de un artículo.</p>

	PUT /v1/stock/:articleId/



### Examples

Body

```
{
  "action": "decrease" | “increase”,
  "amount": {amount}
}
```
Header Autorización

```
Authorization=bearer {token}
```


### Success Response

Response

```
HTTP/1.1 200 OK
   {
     "_id": "{newStockId}",
     "articleId": "{articleId}",
     "stock": {stock},
     "minStockWarning": {stock},
     "updated": "{now}",
     "created": "{now}",
     "enabled": true
   }
```


### Error Response

400 Bad Request

```
HTTP/1.1 400 Bad Request
{
   "messages" : [
     {
       "path" : "{Nombre de la propiedad}",
       "message" : "{Motivo del error}"
     },
     ...
  ]
}
```
500 Server Error

```
HTTP/1.1 500 Internal Server Error
{
   "error" : "Not Found"
}
```
401 Unauthorized

```
HTTP/1.1 401 Unauthorized
```
500 Internal Server Error

```
HTTP/1.1 500 Internal Server Error
 {
   "error" : "{error}"
 }
```
404 Not Found

```
HTTP/1.1 404 Not Found
 {
   "url": "{url}",
   "error" : "Not Found"
 }
```
Custom Error

```
HTTP/1.1 {CODE} Custom Error
 {
   "code": {code},
   "error" : "Custom error message"
 }
```
## <a name='obtener-stock'></a> Obtener stock
[Back to top](#top)

<p>Obtener el stock de un artículo.</p>

	GET /v1/stock/:articleId/



### Examples

Header Autorización

```
Authorization=bearer {token}
```


### Success Response

Response

```
HTTP/1.1 200 OK
   {
     "_id": "{newStockId}",
     "articleId": "{articleId}",
     "stock": {stock},
     "minStockWarning": {stock},
     "updated": "{date}",
     "created": "{date}",
     "enabled": true
   }
```


### Error Response

400 Bad Request

```
HTTP/1.1 400 Bad Request
{
   "messages" : [
     {
       "path" : "{Nombre de la propiedad}",
       "message" : "{Motivo del error}"
     },
     ...
  ]
}
```
500 Server Error

```
HTTP/1.1 500 Internal Server Error
{
   "error" : "Not Found"
}
```
401 Unauthorized

```
HTTP/1.1 401 Unauthorized
```
500 Internal Server Error

```
HTTP/1.1 500 Internal Server Error
 {
   "error" : "{error}"
 }
```
404 Not Found

```
HTTP/1.1 404 Not Found
 {
   "url": "{url}",
   "error" : "Not Found"
 }
```
Custom Error

```
HTTP/1.1 {CODE} Custom Error
 {
   "code": {code},
   "error" : "Custom error message"
 }
```
