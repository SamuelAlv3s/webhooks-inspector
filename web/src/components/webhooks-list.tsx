import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { WebhooksListItem } from "./webhooks-list-item";
import { webhookListSchema } from "../http/schemas/webhook";
import { Loader2, Wand2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CodeBlock } from "./ui/code-block";

export function WebhooksList() {

    const [checkedWebhooksIds, setCheckedWebhooksIds] = useState<string[]>([]);

    const [generatedHandlerCode, setGeneratedHandlerCode] = useState<string | null>(null);

    const hasAnyWebhookChecked = checkedWebhooksIds.length > 0;

    const handleCheckboxChange = (webhookId: string) => {
        if (checkedWebhooksIds.includes(webhookId)) {
            setCheckedWebhooksIds((prev) => prev.filter((id) => id !== webhookId));
        } else {
            setCheckedWebhooksIds((prev) => [...prev, webhookId]);
        }
    };

    const loadMoreRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery({
        queryKey: ['webhooks'],
        queryFn: async ({ pageParam }) => {
            const url = new URL("http://localhost:3333/api/webhooks");

            if (pageParam) {
                url.searchParams.set("cursor", pageParam);
            }

            const response = await fetch(url);
            const data = await response.json()
            return webhookListSchema.parse(data);
        },
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialPageParam: undefined as string | undefined,
    });

    const webhooks = data?.pages.flatMap((page) => page.webhooks) ?? [];

    useEffect(() => {

        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        }, { threshold: 0.7 })

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        }

    }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

    const handleGenerateHandler = async () => {
        const response = await fetch("http://localhost:3333/api/webhooks/generate-handler", {
            method: "POST",
            body: JSON.stringify({ webhookIds: checkedWebhooksIds }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        type GenerateHandlerResponse = {
            code: string;
        };

        const data: GenerateHandlerResponse = await response.json();
        setGeneratedHandlerCode(data.code);
    };

    return (
        <>
            <div className="flex-1 overflow-y-auto relative">
                <div className="space-y-1 p-2">

                    <button disabled={!hasAnyWebhookChecked} className="bg-indigo-400 text-white size-8 w-full rounded-lg flex items-center justify-center gap-3 font-medium text-sm mb-3 disabled:opacity-50" onClick={handleGenerateHandler}>
                        <Wand2 className="size-4" />
                        Gerar handler
                    </button>

                    {webhooks.map((webhook) => (
                        <WebhooksListItem key={webhook.id} webhook={webhook} onWebhookChecked={handleCheckboxChange} isWebhookChecked={checkedWebhooksIds.includes(webhook.id)} />
                    ))}
                </div>

                {hasNextPage && (
                    <div className="p-2" ref={loadMoreRef}>
                        {isFetchingNextPage && (
                            <div className="flex items-center justify-center py-2">
                                <Loader2 className="size-5 animate-spin text-zinc-500" />
                            </div>
                        )}
                    </div>
                )}


            </div>

            {generatedHandlerCode && (
                <Dialog.Root defaultOpen>
                    <Dialog.Overlay className="bg-black/60 fixed inset-0 z-20">
                        <Dialog.Content className="z-40 fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 flex justify-center items-center">
                            <div className="bg-zinc-900 w-[600px] p-4 rounded-lg max-h-[400px] overflow-y-auto border border-zinc-800">
                                <CodeBlock code={generatedHandlerCode} language="typescript" />
                            </div>
                        </Dialog.Content>
                    </Dialog.Overlay>
                </Dialog.Root>
            )}
        </>

    )
}