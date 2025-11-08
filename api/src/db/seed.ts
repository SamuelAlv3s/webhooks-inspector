import { faker } from "@faker-js/faker";
import { db } from ".";
import { webhooks } from "./schema";

const STRIPE_EVENT_TYPES = [
    "payment_intent.created",
    "payment_intent.succeeded",
    "payment_intent.payment_failed",
    "payment_intent.canceled",
    "payment_intent.processing",
    "invoice.created",
    "invoice.finalized",
    "invoice.payment_succeeded",
    "invoice.payment_failed",
    "invoice.voided",
    "charge.pending",
    "charge.succeeded",
    "charge.failed",
    "charge.refunded",
    "checkout.session.completed",
    "checkout.session.expired",
    "customer.created",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "payment_method.attached",
    "payout.created",
    "payout.paid",
    "payout.canceled",
];

const STRIPE_PATHS = [
    "/api/webhooks/stripe",
    "/integrations/stripe/webhooks",
    "/webhooks/stripe",
];

const HTTP_STATUS_CODES = [
    200, 200, 200, 200, 200, 200, 200, 204, 202, 400, 401, 403, 404, 409, 500, 503,
];

const STRIPE_API_VERSIONS = [
    "2024-04-10",
    "2023-10-16",
    "2023-08-16",
    "2022-11-15",
    "2020-08-27",
];

type StripeEventType = (typeof STRIPE_EVENT_TYPES)[number];

function buildStripeDataObject(eventType: StripeEventType, amount: number, currency: string) {
    if (eventType.startsWith("payment_intent")) {
        return {
            id: `pi_${faker.string.alphanumeric({ length: 24, casing: "lower" })}`,
            object: "payment_intent",
            amount,
            currency,
            status: faker.helpers.arrayElement(["requires_payment_method", "processing", "succeeded", "requires_action", "canceled"]),
            customer: `cus_${faker.string.alphanumeric({ length: 14, casing: "lower" })}`,
            metadata: {
                order_id: faker.string.alphanumeric({ length: 10, casing: "upper" }),
            },
        };
    }

    if (eventType.startsWith("invoice")) {
        return {
            id: `in_${faker.string.alphanumeric({ length: 24, casing: "lower" })}`,
            object: "invoice",
            amount_due: amount,
            currency,
            status: faker.helpers.arrayElement(["draft", "open", "paid", "uncollectible", "void"]),
            customer: `cus_${faker.string.alphanumeric({ length: 14, casing: "lower" })}`,
            hosted_invoice_url: faker.internet.url(),
            lines: {
                data: [
                    {
                        id: `il_${faker.string.alphanumeric({ length: 24, casing: "lower" })}`,
                        amount,
                        description: faker.commerce.productDescription(),
                    },
                ],
            },
        };
    }

    if (eventType.startsWith("charge")) {
        return {
            id: `ch_${faker.string.alphanumeric({ length: 24, casing: "lower" })}`,
            object: "charge",
            amount,
            currency,
            paid: eventType === "charge.succeeded",
            status: faker.helpers.arrayElement(["pending", "succeeded", "failed"]),
            refunded: eventType === "charge.refunded",
            customer: `cus_${faker.string.alphanumeric({ length: 14, casing: "lower" })}`,
            payment_method: `pm_${faker.string.alphanumeric({ length: 24, casing: "lower" })}`,
        };
    }

    if (eventType.startsWith("checkout.session")) {
        return {
            id: `cs_${faker.string.alphanumeric({ length: 24, casing: "lower" })}`,
            object: "checkout.session",
            amount_total: amount,
            currency,
            customer: `cus_${faker.string.alphanumeric({ length: 14, casing: "lower" })}`,
            payment_status: faker.helpers.arrayElement(["paid", "unpaid", "no_payment_required"]),
            mode: faker.helpers.arrayElement(["subscription", "payment"]),
            success_url: faker.internet.url(),
            cancel_url: faker.internet.url(),
        };
    }

    if (eventType.startsWith("customer")) {
        return {
            id: `cus_${faker.string.alphanumeric({ length: 14, casing: "lower" })}`,
            object: "customer",
            email: faker.internet.email(),
            name: faker.person.fullName(),
            phone: faker.phone.number(),
            address: {
                line1: faker.location.streetAddress(),
                city: faker.location.city(),
                country: faker.location.countryCode(),
                postal_code: faker.location.zipCode(),
            },
            subscriptions: {
                total_count: faker.number.int({ min: 0, max: 3 }),
            },
        };
    }

    if (eventType.startsWith("payment_method")) {
        return {
            id: `pm_${faker.string.alphanumeric({ length: 24, casing: "lower" })}`,
            object: "payment_method",
            type: faker.helpers.arrayElement(["card", "bank_account", "ideal"]),
            billing_details: {
                email: faker.internet.email(),
                name: faker.person.fullName(),
            },
            customer: `cus_${faker.string.alphanumeric({ length: 14, casing: "lower" })}`,
        };
    }

    if (eventType.startsWith("payout")) {
        return {
            id: `po_${faker.string.alphanumeric({ length: 24, casing: "lower" })}`,
            object: "payout",
            amount,
            currency,
            status: faker.helpers.arrayElement(["paid", "pending", "canceled"]),
            arrival_date: Math.floor(faker.date.future({ years: 1 }).getTime() / 1000),
            method: faker.helpers.arrayElement(["instant", "standard"]),
        };
    }

    return {
        id: `obj_${faker.string.alphanumeric({ length: 16, casing: "lower" })}`,
        object: "generic",
        amount,
        currency,
        status: "processed",
    };
}

function buildStripeEvent(eventType: StripeEventType) {
    const currency = faker.finance.currencyCode().toLowerCase();
    const amount = faker.number.int({ min: 500, max: 250_000 });
    const createdAt = faker.date.recent({ days: 120 });
    const signatureTimestamp = Math.floor(createdAt.getTime() / 1000);

    const payload = {
        id: `evt_${faker.string.alphanumeric({ length: 24, casing: "lower" })}`,
        object: "event",
        api_version: faker.helpers.arrayElement(STRIPE_API_VERSIONS),
        created: signatureTimestamp,
        data: {
            object: buildStripeDataObject(eventType, amount, currency),
        },
        livemode: faker.datatype.boolean(),
        pending_webhooks: faker.number.int({ min: 0, max: 3 }),
        request: {
            id: `req_${faker.string.alphanumeric({ length: 24, casing: "lower" })}`,
            idempotency_key: faker.string.alphanumeric({ length: 24, casing: "lower" }),
        },
        type: eventType,
    };

    const body = JSON.stringify(payload, null, 2);

    const headers = {
        "user-agent": "Stripe/1.0 (+https://stripe.com/docs/webhooks)",
        "stripe-signature": `t=${signatureTimestamp},v1=${faker.string.hexadecimal({ length: 64, casing: "lower", prefix: "" })}`,
        "content-type": "application/json",
        "stripe-trace-id": faker.string.alphanumeric({ length: 32, casing: "lower" }),
    };

    const includeQueryParams = faker.datatype.boolean({ probability: 0.35 });

    return {
        method: "POST",
        pathName: faker.helpers.arrayElement(STRIPE_PATHS),
        ip: faker.internet.ipv4(),
        statusCode: faker.helpers.arrayElement(HTTP_STATUS_CODES),
        contentType: "application/json",
        contentLength: Buffer.byteLength(body, "utf-8"),
        queryParams: includeQueryParams
            ? {
                  livemode: payload.livemode.toString(),
                  attempt: faker.number.int({ min: 1, max: 5 }).toString(),
              }
            : undefined,
        headers,
        body,
        createdAt,
    };
}

async function seed() {
    console.info("🌱 Starting database seed for Stripe webhook events...");

    await db.delete(webhooks);

    const totalWebhooks = 75;
    const webhookEvents = Array.from({ length: totalWebhooks }, () =>
        buildStripeEvent(faker.helpers.arrayElement(STRIPE_EVENT_TYPES))
    );

    await db.insert(webhooks).values(webhookEvents);

    console.info(`✅ Inserted ${webhookEvents.length} webhook events.`);
}

seed()
    .then(() => {
        console.info("🌱 Database seed completed successfully.");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Failed to seed database.", error);
        process.exit(1);
    }); 