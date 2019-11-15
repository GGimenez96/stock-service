"use strict";

/**
 *  Servicios de escucha de eventos rabbit
 */
import { RabbitDirectConsumer } from "./tools/directConsumer";
import { RabbitFanoutEmitter } from "./tools/fanoutEmitter";
import { IRabbitMessage } from "./tools/common";
import { Stock, IStock } from "../stock/schema";
import { IStockResponse } from "../stock";
import * as error from "../server/error";
import { RabbitTopicConsumer } from "./tools/topicConsumer";
import { RabbitFanoutConsumer } from "./tools/fanoutConsumer";

interface ICartUpdatedMessage {
  articleId: string;
  amount: number;
}

export function init() {
  const cart = new RabbitDirectConsumer("stock-update", "cart-stock");
  cart.addProcessor("article-add", processCartArticleAdd);
  cart.addProcessor("article-remove", processCartArticleRemove);
  cart.init();
}

function processCartArticleAdd(rabbitMessage: IRabbitMessage) {
  const updatedArticle: ICartUpdatedMessage = rabbitMessage.message;
  processCartMovement("add", updatedArticle.articleId, updatedArticle.amount).then(stock => {
    console.log("Article stock reserved!");
    console.log(stock);
  }).catch(err => {
    console.error(err);
  });
}

function processCartArticleRemove(rabbitMessage: IRabbitMessage) {
  const updatedArticle: ICartUpdatedMessage = rabbitMessage.message;
  processCartMovement("remove", updatedArticle.articleId, updatedArticle.amount).then(stock => {
    console.log("Article stock released!");
    console.log(stock);
  }).catch(err => {
    console.error(err);
  });
}

async function processCartMovement(cartMovement: "add" | "remove", articleId: string, amount: number) {
  const action = cartMovement === "add" ? "decrease" : "increase";
  try {
    return new Promise((resolve, reject) => {
      Stock.findOne({
        articleId: articleId,
        enabled: true
      }, function (err: any, stock: IStock) {
        if (err) return reject(err);

        if (!stock) {
          const result = error.newError(error.ERROR_BAD_REQUEST, "Invalid article id");
          reject(result);
        } else {
          if (stock.stock < amount) {
            const result = error.newError(error.ERROR_BAD_REQUEST, "Invalid amount");
            return reject(result);
          }
          stock.updateStock(action, amount);

          // Save the Stock
          stock.save(function (err: any, stock) {
            if (err) return reject(err);

            const result: IStockResponse = {
              _id: stock._id,
              articleId: stock.articleId,
              stock: stock.stock,
              minStockWarning: stock.minStockWarning,
              updated: stock.updated,
              created: stock.created,
              enabled: stock.enabled,
            };
            resolve(result);
          });
        }
      });
    });
  } catch (err) {
    return Promise.reject(err);
  }
}