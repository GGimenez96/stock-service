"use strict";

import { Stock, IStock } from "../stock/schema";
import { IStockResponse } from "../stock";
import * as error from "../server/error";

export async function processCartMovement(cartMovement: "add" | "remove", articleId: string, amount: number) {
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
          if (stock.stock < amount && action === "decrease") {
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