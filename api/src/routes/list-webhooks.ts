import type {FastifyPluginAsyncZod} from "fastify-type-provider-zod";
import { z } from "zod";

export const listWebhooks: FastifyPluginAsyncZod = async (app) => {
   app.get(
    "/api/webhooks",
     {
        schema: {
            summary: "List webhooks",
            tags: ["webhooks"],
            querystring: z.object({
                limit: z.coerce.number().min(1).max(100).default(20),
            }),
            response: {
                200: z.array(z.object({
                    id: z.string(),
                })),
            }
        }
     },
     async (request, reply) => {
        return reply.status(200).send([
            { id: "1" },
            { id: "2" },
            { id: "3" },
        ]);
     })
}