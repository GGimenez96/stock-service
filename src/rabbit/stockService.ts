"use strict";

/**
 *  Servicios de escucha de eventos rabbit
 */
import { RabbitDirectConsumer } from "./tools/directConsumer";
import { RabbitFanoutEmitter } from "./tools/fanoutEmitter";
import { IRabbitMessage } from "./tools/common";
import * as articleDeleted from "../stock/articleDeleted";
import * as cartArticles from "../stock/cartArticles";
import * as orderPlaced from "../stock/orderPlaced";
import { RabbitTopicConsumer } from "./tools/topicConsumer";
import { IStock } from "../stock/schema";

interface ICartUpdatedMessage {
  articleId: string;
  amount: number;
}

interface ICatalogArticleDeletedMessage {
  articleId: string;
}

interface IOrderPlacedMessage {
  cartId: string;
  orderId: string;
  articles: orderPlaced.IOrderPlacedArticle[];
}

export function init() {
  const cart = new RabbitDirectConsumer("stock-update", "cart-stock");
  cart.addProcessor("article-add", processCartArticleAdd);
  cart.addProcessor("article-remove", processCartArticleRemove);
  cart.init();

  const catalog = new RabbitDirectConsumer("articles", "catalog-stock");
  catalog.addProcessor("article-delete", processCatalogArticleDelete);
  catalog.init();

  const order = new RabbitTopicConsumer("topic_stock", "sell_flow", "order_placed");
  order.addProcessor("order-placed", processOrderPlaced);
  order.init();
}

/**
 * @api {direct} cart-stock/stock-update Artículo agregado al carrito
 * @apiName Artículo agregado al carrito
 * @apiGroup RabbitMQ GET
 *
 * @apiDescription Escucha a Cart para saber cuando se agrega un artículo al carrito y así reservar stock.
 *
 * @apiSuccessExample {json} Mensaje
 *  {
 *    "type": "article-add",
 *    "message": {
 *      "articleId": "{articleId}",
 *      "amount": {amount}
 *      }
 *  }
 *
 */
function processCartArticleAdd(rabbitMessage: IRabbitMessage) {
  const updatedArticle: ICartUpdatedMessage = rabbitMessage.message;
  cartArticles.processCartMovement("add", updatedArticle.articleId, updatedArticle.amount).then(stock => {
    console.log("Article stock reserved!");
    console.log(stock);
  }).catch(err => {
    console.error(err);
  });
}

/**
 * @api {direct} cart-stock/stock-update Artículo eliminado del carrito
 * @apiName Artículo eliminado del carrito
 * @apiGroup RabbitMQ GET
 *
 * @apiDescription Escucha a Cart para saber cuando se quita un artículo del carrito y así liberar stock.
 *
 * @apiSuccessExample {json} Mensaje
 *  {
 *    "type": "article-remove",
 *    "message": {
 *      "articleId": "{articleId}",
 *      "amount": {amount}
 *      }
 *  }
 *
 */
function processCartArticleRemove(rabbitMessage: IRabbitMessage) {
  const updatedArticle: ICartUpdatedMessage = rabbitMessage.message;
  cartArticles.processCartMovement("remove", updatedArticle.articleId, updatedArticle.amount).then(stock => {
    console.log("Article stock released!");
    console.log(stock);
  }).catch(err => {
    console.error(err);
  });
}

/**
 * @api {direct} catalog-stock/articles Artículo eliminado del catálogo
 * @apiName Artículo eliminado del catálogo
 * @apiGroup RabbitMQ GET
 *
 * @apiDescription Escucha a Catalog para eliminar el stock de un artículo cuando este se elimine del catálogo.
 *
 * @apiSuccessExample {json} Mensaje
 *  {
 *    "type": "article-delete",
 *      "message": {
 *        "articleId": "{articleId}"
 *        }
 *     }
 *
 */
function processCatalogArticleDelete(rabbitMessage: IRabbitMessage) {
  const deletedArticle: ICatalogArticleDeletedMessage = rabbitMessage.message;
  articleDeleted.deleteArticleStock(deletedArticle.articleId);
}

/**
 * @api {topic} sell_flow/topic_cart Orden completa
 * @apiName Orden completa
 * @apiGroup RabbitMQ GET
 *
 * @apiDescription Escucha a Order con el topic "order_placed" para saber cuando una orden se completa y así informar el estado del stock.
 *
 * @apiSuccessExample {json} Mensaje
 *  {
 *    "type": "order-placed",
 *      "message": {
 *        "cartId": "{cartId}",
 *        "orderId": "{orderId}",
 *        "articles": [{
 *          "articleId": "{article id}",
 *          "quantity" : {quantity}
 *        }]
 *      }
 *  }
 *
 */
function processOrderPlaced(rabbitMessage: IRabbitMessage) {
  const placedOrder: IOrderPlacedMessage = rabbitMessage.message;
  orderPlaced.processOrderPlaced(placedOrder.articles);
}

/**
 * @api {fanout} stock/stock Estado del stock
 * @apiName Estado del stock
 * @apiGroup RabbitMQ POST
 *
 * @apiDescription Cuando una orden se complete, se avisa la nueva cantidad de stock de los artículos involucrados en la orden.
 *
 * @apiSuccessExample {json} Mensaje
 *  {
 *    "exchange": "stock",
 *    "queue": "stock"
 *    "type": "stock-updated",
 *      "message": {
 *        "articles": [{
 *          "_id": "{stockId}",
 *          "articleId": "{articleId}",
 *          "stock": {stock},
 *          "minStockWarning": {minStockWarning},
 *          "updated": "{date}",
 *          "created": "{date}",
 *          "enabled": true,
 *          "_v": {_v}
 *        }]
 *      }
 *  }
 *
 */
export async function sendArticlesStock(articles: IStock[]): Promise<IRabbitMessage> {
  const message: IRabbitMessage = {
    type: "stock-order-placed",
    exchange: "stock",
    message: {
      articles: articles
    }
  };
  return RabbitFanoutEmitter.getEmitter("stock", "stock").send(message);
}

/**
 * @api {fanout} stock/stock Alerta de stock bajo
 * @apiName Alerta de stock bajo
 * @apiGroup RabbitMQ POST
 *
 * @apiDescription Cuando se completan órdenes y el stock llega al nivel mínimo, se alerta de la situación para los artículos involucrados en la orden que hayan alcanzado o quedado por debajo del valor de stock mínimo.
 *
 * @apiSuccessExample {json} Mensaje
 *  {
 *    "exchange": "stock",
 *    "queue": "stock"
 *    "type": "low-stock",
 *      "message": {
 *        "articles": [{
 *          "_id": "{stockId}",
 *          "articleId": "{articleId}",
 *          "stock": {stock},
 *          "minStockWarning": {minStockWarning},
 *          "updated": "{date}",
 *          "created": "{date}",
 *          "enabled": true,
 *          "_v": {_v}
 *        }]
 *      }
 *  }
 *
 */
export async function sendStockStatusAlert(articles: IStock[]): Promise<IRabbitMessage> {
  const message: IRabbitMessage = {
    type: "low-stock",
    exchange: "stock",
    message: {
      articles: articles
    }
  };
  return RabbitFanoutEmitter.getEmitter("stock", "stock").send(message);
}