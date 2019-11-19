"use strict";

import * as async from "async";
import { RestClient } from "typed-rest-client/RestClient";
import * as env from "../server/environment";
import * as error from "../server/error";
import { Stock, IStock } from "./schema";

const conf = env.getConfig(process.env);

export interface IStockResponse {
  _id: string;
  articleId: string;
  stock: number;
  minStockWarning: number;
  updated: Date;
  created: Date;
  enabled: Boolean;
}

interface ICreateStockRequest {
  articleId: string;
  initialStock: number;
  minStockWarning: number;
}
export async function createArticleStock(body: ICreateStockRequest): Promise<IStockResponse> {
  try {
    body = await validateCreateArticleStock(body);

    const today = new Date();
    const stock = <IStock>new Stock();

    stock.articleId = body.articleId;
    stock.stock = body.initialStock;
    stock.minStockWarning = body.minStockWarning;
    stock.updated = today;
    stock.created = today;
    stock.enabled = true;

    // Save article stock
    return new Promise<IStockResponse>((resolve, reject) => {
      stock.save(function (err: any) {
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
    });
  } catch (err) {
    return Promise.reject(err);
  }
}

function validateCreateArticleStock(body: ICreateStockRequest): Promise<ICreateStockRequest> {
  const result: error.ValidationErrorMessage = {
    messages: []
  };

  if (!body.articleId) {
    result.messages.push({ path: "articleId", message: "No puede quedar vacío." });
  }

  if (!body.initialStock || body.initialStock <= 0) {
    result.messages.push({ path: "initialStock", message: "No puede quedar vacío." });
  }

  if (!body.minStockWarning || body.minStockWarning < 0) {
    result.messages.push({ path: "minStockWarning", message: "No puede quedar vacío." });
  }

  if (result.messages.length > 0) {
    return Promise.reject(result);
  }
  return Promise.resolve(body);
}

export async function getArticleStock(articleId: string): Promise<IStockResponse> {
  return new Promise((resolve, reject) => {
    Stock.findOne({
      articleId: articleId,
      enabled: true
    }, function (err: any, stock: IStock) {
      if (err) return reject(err);

      if (!stock) {
        const result = error.newError(error.ERROR_BAD_REQUEST, "Invalid article id");
        reject(result);
      }
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
  });
}

interface IUpdateStockRequest {
  action: "increase" | "decrease";
  amount: number;
}

export async function updateArticleStock(articleId: string, body: IUpdateStockRequest) {
  try {
    body = await validateUpdateArticleStock(body);
    const action = body.action;
    const amount = Number(body.amount);

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
            const result = error.newError(error.ERROR_BAD_REQUEST, "Amount can't be greater than available stock");
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

function validateUpdateArticleStock(body: IUpdateStockRequest): Promise<IUpdateStockRequest> {
  const result: error.ValidationErrorMessage = {
    messages: []
  };

  if (!body.action) {
    result.messages.push({ path: "action", message: "No puede quedar vacío." });
  }

  if (body.action !== "increase" && body.action !== "decrease") {
    result.messages.push({ path: "action", message: "Acción no válida." });
  }

  if (!body.amount || body.amount <= 0) {
    result.messages.push({ path: "amount", message: "No puede quedar vacío." });
  }

  if (result.messages.length > 0) {
    return Promise.reject(result);
  }
  return Promise.resolve(body);
}