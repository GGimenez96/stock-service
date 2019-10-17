"use strict";

/**
 * Son eventos enviados a rabbit.
 */
import amqp = require("amqplib");

import * as env from "../../server/environment";
import { IRabbitMessage } from "./common";

export class RabbitFanoutEmitter {
    conf = env.getConfig(process.env);
    channel: amqp.Channel;
    static instances = new Map<string, RabbitFanoutEmitter>();

    static getEmitter(queue: string, exchange: string) {
        const name = queue + "_" + exchange;
        if (!this.instances.has(name)) {
            this.instances.set(name, new RabbitFanoutEmitter(queue, exchange));
        }
        return this.instances.get(name);
    }

    private constructor(private queue: string, private exchange: string) {
    }

    public async send(message: IRabbitMessage): Promise<IRabbitMessage> {
        try {
            const channel = await this.getChannel();
            const exchange = await channel.assertExchange(this.exchange, "fanout", { durable: false });
            const queue = await channel.assertQueue(this.queue, { durable: false });

            if (channel.publish(exchange.exchange, queue.queue, new Buffer(JSON.stringify(message)))) {
                console.log("RabbitMQ Publish Stock Fanout " + message);
                return Promise.resolve(message);
            } else {
                return Promise.reject(new Error("No se pudo encolar el mensaje"));
            }

        } catch (err) {
            return new Promise<IRabbitMessage>((resolve, reject) => {
                console.log("RabbitMQ Stock " + err);
                return Promise.reject(err);
            });
        }
    }

    private async getChannel(): Promise<amqp.Channel> {
        if (!this.channel) {
            try {
                const conn = await amqp.connect(this.conf.rabbitUrl);
                this.channel = await conn.createChannel();
                console.log("RabbitMQ " + this.exchange + " conectado");
                this.channel.on("close", function () {
                    console.error("RabbitMQ " + this.exchange + " Conexión cerrada");
                    this.channel = undefined;
                });
            } catch (onReject) {
                console.error("RabbitMQ " + this.exchange + " " + onReject.message);
                this.channel = undefined;
                return Promise.reject(onReject);
            }
        }
        if (this.channel) {
            return Promise.resolve(this.channel);
        } else {
            return Promise.reject(new Error("No channel available"));
        }
    }
}

