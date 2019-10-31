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
  app.route("/v1/stock/").post(validateToken, createArticleStock);
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

function createArticleStock(req: IUserSessionRequest, res: express.Response) {
  stock.createArticleStock(req.body)
    .then(stock => {
      res.json(stock);
    })
    .catch(err => {
      error.handle(res, err);
    });
}

function getArticleStock(req: IUserSessionRequest, res: express.Response) {

}

function updateArticleStock(req: IUserSessionRequest, res: express.Response) {

}