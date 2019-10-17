"use strict";

import { Document, model, Schema } from "mongoose";
import * as env from "../server/environment";
import { ObjectID } from "bson";

const conf = env.getConfig(process.env);

export interface IStock extends Document {
  stockId: ObjectID;
  articleId: ObjectID;
  stock: number;
  tempStock: number;
  minStockWarning: number;
  status: "normal" | "low";
  updated: Date;
  created: Date;
  enabled: Boolean;
}

/**
 * Esquema del stock
 */
const StockSchema = new Schema({
  stockId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  articleId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  stock: {
    type: Number,
    required: true
  },
  tempStock: {
    type: Number,
    required: true
  },
  minStockWarning: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    default: "normal"
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

/**
 * Trigger antes de guardar
 */
StockSchema.pre("save", function (this: IStock, next) {
  this.updated = new Date();

  next();
});

export let Stock = model<IStock>("Stock", StockSchema);
