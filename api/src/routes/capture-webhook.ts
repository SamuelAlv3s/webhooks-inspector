import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { webhooks } from "@/db/schema";
import { db } from "@/db";

export const captureWebhook: FastifyPluginAsyncZod = async (app) => {
    app.all(
        "/capture/*",
        {
            schema: {
                hide: true,
                summary: "Capture incoming webhook requests",
                tags: ["External"],
                response: {
                    201: z.object({ id: z.uuidv7() }),
                },
            },
        },
        async (request, reply) => {
            const method = request.method;
            const ip = request.ip;
            const contentType = request.headers["content-type"];
            const contentLength = request.headers["content-length"]
                ? Number(request.headers["content-length"])
                : null;
            const headers = Object.fromEntries(
                Object.entries(request.headers).map(([key, value]) => [
                    key,
                    Array.isArray(value) ? value.join(", ") : value || "",
                ])
            );

            let body: string | null = null;

            if (request.body) {
                body =
                    typeof request.body === "string"
                        ? request.body
                        : JSON.stringify(request.body, null, 2);
            }

            const url = new URL(
                request.url,
                `http://${request.headers.host ?? "localhost"}`
            );

            const pathName = url.pathname.replace(/^\/capture/, "") || "/";
            const queryParams = Object.fromEntries(url.searchParams.entries());
            const statusCode = 201;

            const result = await db
                .insert(webhooks)
                .values({
                    method,
                    pathName,
                    ip,
                    statusCode,
                    contentType,
                    contentLength,
                    queryParams,
                    headers,
                    body,
                })
                .returning({ id: webhooks.id });

            return reply.status(statusCode).send({ id: result[0].id });
        }
    );
};