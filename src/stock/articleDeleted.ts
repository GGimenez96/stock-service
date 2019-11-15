"use strict";

import { Stock, IStock } from "../stock/schema";

export function deleteArticleStock(articleId: string) {
  Stock.findOneAndDelete({ articleId: articleId }, function (err: any, stock: IStock) {
    if (err) {
      console.error("An error occured while trying to delete the article");
      return new Error(err);
    }
    if (!stock) {
      console.error(`Article with id "${articleId}" does not exist.`);
    } else {
      console.log("Article deleted:");
      console.log(stock);
    }
  });
}