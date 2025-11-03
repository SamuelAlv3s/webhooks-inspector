import { createFileRoute } from '@tanstack/react-router'
import { Panel, PanelGroup, PanelResizeHandle} from 'react-resizable-panels'
import { Sidebar } from '../components/sidebar'
import { Badge } from '../components/ui/badge'
import { WebhookDetailHeader } from '../components/webhook-detail-header'
import { SectionTitle } from '../components/section-title'
import { SectionDataTable } from '../components/section-data-table'
import { CodeBlock } from '../components/ui/code-block'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {

  const overviewData = [
    { key: 'method', value: 'POST' },
    { key: 'url', value: 'https://webhook.site/1234567890' },
    { key: 'status', value: '200' },
    { key: 'time', value: '100ms' },
    { key: 'size', value: '100kb' },
    { key: 'ip', value: '127.0.0.1' },
    { key: 'user-agent', value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
    { key: 'referer', value: 'https://webhook.site/1234567890' }
  ];


  return (
    <div className="h-screen bg-zinc-900">
      <PanelGroup direction="horizontal">
        <Panel defaultSize={20} minSize={15} maxSize={40}>
            <Sidebar />
        </Panel>
        <PanelResizeHandle className="w-px bg-zinc-700 hover:bg-zinc-600 transition-colors duration-150"/>
        <Panel defaultSize={80} minSize={60}>
          <div className="flex h-full flex-col">
            <WebhookDetailHeader />
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-6 p-6">
                <div className="space-y-4">
                  <SectionTitle>Request Overview</SectionTitle>
                  <div className="overflow-hidden rounded-lg border border-zinc-700">
                    <SectionDataTable data={overviewData} />
                  </div>
                </div>

                <div className="space-y-4">
                  <SectionTitle>Query Parameters</SectionTitle>
                  <div className="overflow-hidden rounded-lg border border-zinc-700">
                    <SectionDataTable data={overviewData} />
                  </div>
                </div>

                <div className="space-y-4">
                  <SectionTitle>Request body</SectionTitle>
                  <div className="overflow-hidden rounded-lg border border-zinc-700">
                    <CodeBlock code={JSON.stringify(overviewData, null, 2)} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  )
}