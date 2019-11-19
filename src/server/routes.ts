"use strict";

import { Express } from "express";
import * as token from "../token";
import * as stock from "../stock";
import * as error from "./error";
import * as express from "express";
import { NextFunction } from "connect";

/**
 * Modulo de seguridad, login/logout, cambio de contraseñas, etc
 */
export function init(app: Express) {
  app.route("/v1/stock/").post(validateToken, validateArticleStockCreation, createArticleStock);
  app.route("/v1/stock/:articleId").get(validateToken, getArticleStock);
  app.route("/v1/stock/:articleId").put(validateToken, updateArticleStock);
}

interface IUserSessionRequest extends express.Request {
  user: token.ISession;
}

/**
 * @apiDefine AuthHeader
 *
 * @apiExample {String} Header Autorización
 *    Authorization=bearer {token}
 *
 * @apiErrorExample 401 Unauthorized
 *    HTTP/1.1 401 Unauthorized
 */
function validateToken(req: IUserSessionRequest, res: express.Response, next: NextFunction) {
  const auth = req.header("Authorization");
  if (!auth) {
    return error.handle(res, error.newError(error.ERROR_UNAUTHORIZED, "Unauthorized"));
  }

  token.validate(auth)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => error.handle(res, err));
}

function validateArticleStockCreation(req: IUserSessionRequest, res: express.Response, next: NextFunction) {
  const auth = req.header("Authorization");
  stock.validateArticleStockCreation(auth, req.body)
    .then(_ => {
      next();
    })
    .catch(err => {
      error.handle(res, err);
    });
}

/**
 * @api {post} /v1/stock/ Crear nuevo stock
 * @apiName Crear nuevo stock
 * @apiGroup Stock
 *
 * @apiDescription Crear el stock de un nuevo artículo.
 *
 * @apiExample {json} Body
 *    {
 *      "articleId": "{articleId}",
 *      "initialStock": {stock},
 *      "minStockWarning": {minStock}
 *    }
 *
 * @apiSuccessExample {json} Response
 * HTTP/1.1 200 OK
 *    {
 *      "_id": "{newStockId}",
 *      "articleId": "{articleId}",
 *      "stock": {stock},
 *      "minStockWarning": {stock},
 *      "updated": "{now}",
 *      "created": "{now}",
 *      "enabled": true
 *    }
 *
 * @apiUse ParamValidationErrors
 * @apiUse OtherErrors
 * @apiUse AuthHeader
 * @apiUse UnknownError
 * @apiUse NotFound
 * @apiUse CustomError
 *
 */
function createArticleStock(req: IUserSessionRequest, res: express.Response) {
  stock.createArticleStock(req.body)
    .then(stock => {
      res.json(stock);
    })
    .catch(err => {
      error.handle(res, err);
    });
}

/**
 * @api {get} /v1/stock/:articleId/ Obtener stock
 * @apiName Obtener stock
 * @apiGroup Stock
 *
 * @apiDescription Obtener el stock de un artículo.
 *
 * @apiSuccessExample {json} Response
 * HTTP/1.1 200 OK
 *    {
 *      "_id": "{newStockId}",
 *      "articleId": "{articleId}",
 *      "stock": {stock},
 *      "minStockWarning": {stock},
 *      "updated": "{date}",
 *      "created": "{date}",
 *      "enabled": true
 *    }
 *
 * @apiUse ParamValidationErrors
 * @apiUse OtherErrors
 * @apiUse AuthHeader
 * @apiUse UnknownError
 * @apiUse NotFound
 * @apiUse CustomError
 */
function getArticleStock(req: IUserSessionRequest, res: express.Response) {
  const articleId = escape(req.params.articleId);
  stock.getArticleStock(articleId)
    .then(stock => {
      res.json(stock);
    })
    .catch(err => {
      error.handle(res, err);
    });
}

/**
 * @api {put} /v1/stock/:articleId/ Modificar stock
 * @apiName Modificar stock
 * @apiGroup Stock
 *
 * @apiDescription Modifica el stock de un artículo.
 *
 * @apiExample {json} Body
 *    {
 *      "action": "decrease" | “increase”,
 *      "amount": {amount}
 *    }
 *
 * @apiSuccessExample {json} Response
 * HTTP/1.1 200 OK
 *    {
 *      "_id": "{newStockId}",
 *      "articleId": "{articleId}",
 *      "stock": {stock},
 *      "minStockWarning": {stock},
 *      "updated": "{now}",
 *      "created": "{now}",
 *      "enabled": true
 *    }
 *
 * @apiUse ParamValidationErrors
 * @apiUse OtherErrors
 * @apiUse AuthHeader
 * @apiUse UnknownError
 * @apiUse NotFound
 * @apiUse CustomError
 */
function updateArticleStock(req: IUserSessionRequest, res: express.Response) {
  const articleId = escape(req.params.articleId);
  stock.updateArticleStock(articleId, req.body)
    .then(stock => {
      res.json(stock);
    })
    .catch(err => {
      error.handle(res, err);
    });
}