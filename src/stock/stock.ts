"use strict";

import * as async from "async";
import { RestClient } from "typed-rest-client/RestClient";
import * as env from "../server/environment";
import * as error from "../server/error";
import { Stock, IStock } from "./schema";

const conf = env.getConfig(process.env);
