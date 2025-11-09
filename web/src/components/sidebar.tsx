import { CopyIcon } from "lucide-react";
import { IconButton } from "./ui/icon-button";
import { WebhooksList } from "./webhooks-list";
import { Suspense } from "react";


export  function Sidebar() {
  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center justify-between border-b border-zinc-700 px-4 py-5">
        <div className="flex items-baseline">
            <span className="font-semibold text-zinc-100">Webhook</span>
            <span className="font-normal text-zinc-400">.inspect</span>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-zinc-700 px-4 py-2.5">
        <div className="flex-1 min-w-0 flex items-center gap-1 text-xs font-mono text-zinc-300">
            <span className="truncate">https://webhook.site/1234567890</span>
        </div>
        <IconButton icon={<CopyIcon className="size-4" />} size="sm" />
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <WebhooksList />
      </Suspense>
    </div>
  )
}