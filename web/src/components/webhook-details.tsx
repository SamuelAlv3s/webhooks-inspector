import { useSuspenseQuery } from "@tanstack/react-query";
import { webhookDetailSchema } from "../http/schemas/webhook";
import { SectionTitle } from "./section-title";
import { CodeBlock } from "./ui/code-block";
import { SectionDataTable } from "./section-data-table";
import { WebhookDetailHeader } from "./webhook-detail-header";

interface WebhookDetailsProps {
    id: string;
}

export function WebhookDetails({ id }: WebhookDetailsProps) {

  const {data} = useSuspenseQuery({
    queryKey: ['webhooks', id],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3333/api/webhooks/${id}`)
      const data = await response.json()
      return webhookDetailSchema.parse(data);
    }
  })

  const overviewData = [
    { key: 'Method', value: data.method },
    { key: 'Status Code', value: data.statusCode.toString() },
    { key: 'Content-Type', value: data.contentType ?? 'Application/json' },
    { key: 'Content-Length', value: data.contentLength?.toString() ?? '0' },
  ];

  const headersData = Object.entries(data.headers).map(([key, value]) => ({ key, value }));

  const queryParamsData = Object.entries(data.queryParams ?? {}).map(([key, value]) => ({ key, value: String(value) }));

  return (
    <div className="flex h-full flex-col">
            <WebhookDetailHeader method={data.method} pathName={data.pathName} ip={data.ip} createdAt={data.createdAt} />
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-6 p-6">
                <div className="space-y-4">
                  <SectionTitle>Request Overview</SectionTitle>
                  <div className="overflow-hidden rounded-lg border border-zinc-700">
                    <SectionDataTable data={overviewData} />
                  </div>
                </div>

                <div className="space-y-4">
                  <SectionTitle>Headers</SectionTitle>
                  <div className="overflow-hidden rounded-lg border border-zinc-700">
                    <SectionDataTable data={headersData} />
                  </div>
                </div>

                {queryParamsData.length > 0 && (
                  <div className="space-y-4">
                    <SectionTitle>Query Parameters</SectionTitle>
                    <div className="overflow-hidden rounded-lg border border-zinc-700">
                      <SectionDataTable data={queryParamsData} />
                    </div>
                  </div>
                )}

                {!!data.body && (
                  <div className="space-y-4">
                    <SectionTitle>Request body</SectionTitle>
                    <div className="overflow-hidden rounded-lg border border-zinc-700">
                      <CodeBlock code={data.body} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
  )
}