import type {FastifyPluginAsyncZod} from "fastify-type-provider-zod";
import { z } from "zod";
import { webhooks } from "@/db/schema";
import { db } from "@/db";
import { eq, inArray } from "drizzle-orm";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export const generateHandler: FastifyPluginAsyncZod = async (app) => {
   app.post(
    "/api/webhooks/generate-handler",
     {
        schema: {
            summary: "Generate a Typescripthandler for the selected webhooks",
            tags: ["webhooks"],
            body: z.object({
                webhookIds: z.array(z.uuidv7()),
            }),
            response: {
                201: z.object({
                    code: z.string(),
                }),
            }
        }
     },
     async (request, reply) => {
        const {webhookIds} = request.body;

        const result = await db.select().from(webhooks).where(inArray(webhooks.id, webhookIds));

        const webhooksBodies = result.map(webhook => webhook.body).join("\n\n");

        const {text} = await generateText({
            model: google('gemini-2.5-flash'),
            prompt: `
            
            You are an expert TypeScript backend engineer.

            You will receive multiple webhook request payload schemas and example bodies. Each webhook body is separated by a blank line.

            Generate a single TypeScript module that:
            - Exports a function named handleWebhooks that accepts a JSON-like payload (arrays/objects/strings/numbers) matching the incoming webhook data.
            - Uses zod to validate the incoming payload. Infer the schema based on the provided webhook payloads. If multiple bodies are provided, infer a schema that is compatible with all of them (e.g. discriminated union, optional fields).
            - After validation, iterate over each webhook event (if multiple) and call a placeholder async function processWebhook(event) with the validated data.
            - Includes all necessary imports \`z\` from \`zod\` and any types needed.
            - Adds descriptive inline comments only where important.

            Return only the TypeScript code without markdown fences.

            Webhook payloads:
            ${webhooksBodies}
            `.trim()
        })

        return reply.status(201).send({ code: text });
     })
}