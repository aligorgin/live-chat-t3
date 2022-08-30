import {createRouter} from "./context";
import {Message, messageSubSchema, sendMessageSchema} from "../../constants/schemas";
import {randomUUID} from "crypto";
import {Events} from "../../constants/events";
import {TRPCError} from "@trpc/server";
import * as trpc from '@trpc/server';

export const roomRouter = createRouter()
    .mutation('send-message', {
        input: sendMessageSchema,
        resolve({ctx, input}) {
            const message: Message = {
                id: randomUUID(),
                ...input,
                sentAt: new Date(),
                sender: {
                    name: ctx.session?.user?.name || 'unknown',
                }
            };

            ctx.ee.emit(Events.SEND_MESSAGE, message);

            return true;
        },
    })
    .subscription('onSendMessage', {
        input: messageSubSchema,
        resolve({ctx, input}) {
            return new trpc.Subscription<Message>((emit) => {
                function onMessage(data: Message) {
                    if (input.roomId === data.roomId) {
                        emit.data(data)
                    }
                }

                ctx.ee.on(Events.SEND_MESSAGE, onMessage)

                return () => {
                    ctx.ee.on(Events.SEND_MESSAGE, onMessage)
                }
            })
        }
    });