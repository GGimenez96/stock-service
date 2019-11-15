"use strict";

/**
 *  Servicios de escucha de eventos rabbit
 */
import { RabbitDirectConsumer } from "./tools/directConsumer";
import { RabbitFanoutEmitter } from "./tools/fanoutEmitter";
import { IRabbitMessage } from "./tools/common";
import * as articleDeleted from "../stock/articleDeleted";
import * as cartArticles from "../stock/cartArticles";

interface ICartUpdatedMessage {
  articleId: string;
  amount: number;
}

export function init() {
  const cart = new RabbitDirectConsumer("stock-update", "cart-stock");
  cart.addProcessor("article-add", processCartArticleAdd);
  cart.addProcessor("article-remove", processCartArticleRemove);
  cart.init();

  const catalog = new RabbitDirectConsumer("articles", "catalog-stock");
  catalog.addProcessor("article-delete", processCatalogArticleDelete);
  catalog.init();
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

interface ICatalogArticleDeletedMessage {
  articleId: string;
}

function processCatalogArticleDelete(rabbitMessage: IRabbitMessage) {
  const deletedArticle: ICatalogArticleDeletedMessage = rabbitMessage.message;
  articleDeleted.deleteArticleStock(deletedArticle.articleId);
}