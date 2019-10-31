"use strict";

import * as async from "async";
import { RestClient } from "typed-rest-client/RestClient";
import * as env from "../server/environment";
import * as error from "../server/error";
import { Stock, IStock } from "./schema";

const conf = env.getConfig(process.env);

interface IGetStockRequest {
  articleId: string;
  stock: number;
  status: "normal" | "low";
}

interface ICreateStockRequest {
  articleId: string;
  initialStock: number;
  minStockWarning: number;
}
export async function createArticleStock(body: ICreateStockRequest): Promise<IGetStockRequest> {
  try {
    body = await validateCreateArticleStock(body);

    const today = new Date();
    const stock = <IStock>new Stock();

    stock.articleId = body.articleId;
    stock.stock = body.initialStock;
    stock.tempStock = body.initialStock;
    stock.minStockWarning = body.minStockWarning;
    stock.status = "normal";
    stock.updated = today;
    stock.created = today;
    stock.enabled = true;

    // Save article stock
    return new Promise<IGetStockRequest>((resolve, reject) => {
      stock.save(function (err: any) {
        if (err) return reject(err);

        const newStock: IGetStockRequest = {
          articleId: stock.articleId,
          stock: stock.stock,
          status: "normal"
        };
        resolve(newStock);
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

interface IUpdateStockRequest {
  action: "increase" | "decrease";
  amount: number;
}
