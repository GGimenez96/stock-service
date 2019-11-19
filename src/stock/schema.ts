"use strict";

import { Document, model, Schema } from "mongoose";

export interface IStock extends Document {
  articleId: string;
  stock: number;
  minStockWarning: number;
  updated: Date;
  created: Date;
  enabled: Boolean;
  updateStock: Function;
}

/**
 * Esquema del stock
 */
const StockSchema = new Schema({
  articleId: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true
  },
  minStockWarning: {
    type: Number,
    required: true
  },
  updated: {
    type: Date,
    default: Date.now()
  },
  created: {
    type: Date,
    default: Date.now()
  },
  enabled: {
    type: Boolean,
    default: true
  }
}, { collection: "stock" });

StockSchema.index({ stockId: 1, enabled: -1 });
StockSchema.index({ stockId: 1, articleId: 1 });

StockSchema.methods.updateStock = function (action: "increase" | "decrease", amount: number) {
  switch (action) {
    case "increase":
      this.stock += amount;
      break;

    case "decrease":
      this.stock -= amount;
      break;

    default:
      break;
  }
};

/**
 * Trigger antes de guardar
 */
StockSchema.pre("save", function (this: IStock, next) {
  this.updated = new Date();

  next();
});

export let Stock = model<IStock>("Stock", StockSchema);
