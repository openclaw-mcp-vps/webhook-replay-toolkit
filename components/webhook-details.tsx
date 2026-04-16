import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type WebhookDetailsProps = {
  webhook: {
    id: string;
    source: string;
    method: string;
    path: string;
    query: string | null;
    headers: string;
    body: string;
    bodySize: number;
    replayCount: number;
    lastReplayAt: Date | null;
    createdAt: Date;
  };
};

export function WebhookDetails({ webhook }: WebhookDetailsProps) {
  const parsedHeaders = webhook.headers ? (JSON.parse(webhook.headers) as Record<string, string>) : {};

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span>{webhook.method}</span>
            <span className="font-mono text-base text-[#58a6ff]">{webhook.path || "/"}</span>
            <Badge>{webhook.source}</Badge>
          </CardTitle>
          <CardDescription>
            Captured {format(webhook.createdAt, "PPP p")} • {webhook.bodySize} bytes • replayed {webhook.replayCount} times
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-[#9ba5b3]">
          <p><strong className="text-[#c9d1d9]">Webhook ID:</strong> <span className="font-mono">{webhook.id}</span></p>
          <p><strong className="text-[#c9d1d9]">Query:</strong> <span className="font-mono">{webhook.query || "(none)"}</span></p>
          <p><strong className="text-[#c9d1d9]">Last replay:</strong> {webhook.lastReplayAt ? format(webhook.lastReplayAt, "PPP p") : "Never"}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Headers</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="max-h-[340px] overflow-auto rounded-md border border-[#30363d] bg-[#0d1117] p-4 text-xs text-[#c9d1d9]">
            {JSON.stringify(parsedHeaders, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Body</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="max-h-[420px] overflow-auto rounded-md border border-[#30363d] bg-[#0d1117] p-4 text-xs text-[#c9d1d9]">
            {webhook.body}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
