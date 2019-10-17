"use strict";

/**
 *  Servicios de escucha de eventos rabbit
 */
import { RabbitDirectConsumer } from "./tools/directConsumer";
import { RabbitFanoutEmitter } from "./tools/fanoutEmitter";
import { IRabbitMessage } from "./tools/common";
import { IStock } from "../stock/schema";
import { RabbitTopicConsumer } from "./tools/topicConsumer";

export function init() {
  console.log("Stock service iniciado.");
}