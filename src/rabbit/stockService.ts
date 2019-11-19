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

function processCartArticleAdd(rabbitMessage: IRabbitMessage) {
  const updatedArticle: ICartUpdatedMessage = rabbitMessage.message;
  cartArticles.processCartMovement("add", updatedArticle.articleId, updatedArticle.amount).then(stock => {
    console.log("Article stock reserved!");
    console.log(stock);
  }).catch(err => {
    console.error(err);
  });
}

function processCartArticleRemove(rabbitMessage: IRabbitMessage) {
  const updatedArticle: ICartUpdatedMessage = rabbitMessage.message;
  cartArticles.processCartMovement("remove", updatedArticle.articleId, updatedArticle.amount).then(stock => {
    console.log("Article stock released!");
    console.log(stock);
  }).catch(err => {
    console.error(err);
  });
}

function processCatalogArticleDelete(rabbitMessage: IRabbitMessage) {
  const deletedArticle: ICatalogArticleDeletedMessage = rabbitMessage.message;
  articleDeleted.deleteArticleStock(deletedArticle.articleId);
}

function processOrderPlaced(rabbitMessage: IRabbitMessage) {
  const placedOrder: IOrderPlacedMessage = rabbitMessage.message;
  orderPlaced.processOrderPlaced(placedOrder.articles);
}

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