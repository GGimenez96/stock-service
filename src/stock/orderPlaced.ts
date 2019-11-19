"use strict";

import { Stock, IStock } from "../stock/schema";
import * as error from "../server/error";
import { sendArticlesStock, sendStockStatusAlert } from "../rabbit/stockService";

export interface IOrderPlacedArticle {
  articleId: string;
  quantity: number;
}
export async function processOrderPlaced(articles: IOrderPlacedArticle[]) {
  const articlesIds: string[] = [];
  articles.forEach(article => articlesIds.push(article.articleId));

  Stock.find({
    articleId: { $in: articlesIds },
    enabled: true
  }, function (err: any, articlesStock: IStock[]) {
    if (err) return console.error(err);

    if (!articlesStock.length) {
      const result = error.newError(error.ERROR_BAD_REQUEST, "No articles were found");
      console.error(result);
    }
    const result: IStock[] = articlesStock;
    const lowStockArticles: IStock[] = result.filter(article => article.stock <= article.minStockWarning);
    if (result.length) {
      console.log(result);
      sendArticlesStock(result).then();
    }
    if (lowStockArticles.length) {
      console.log(lowStockArticles);
      sendStockStatusAlert(lowStockArticles).then();
    }
  });
}