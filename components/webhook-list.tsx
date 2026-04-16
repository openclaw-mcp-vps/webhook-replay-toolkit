import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type WebhookListItem = {
  id: string;
  source: string;
  method: string;
  path: string;
  bodySize: number;
  replayCount: number;
  createdAt: Date;
};

type WebhookListProps = {
  webhooks: WebhookListItem[];
};

export function WebhookList({ webhooks }: WebhookListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Captured webhooks</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Path</TableHead>
              <TableHead>Body</TableHead>
              <TableHead>Replays</TableHead>
              <TableHead>Captured</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webhooks.map((webhook) => (
              <TableRow key={webhook.id}>
                <TableCell>
                  <Badge>{webhook.source}</Badge>
                </TableCell>
                <TableCell>{webhook.method}</TableCell>
                <TableCell>
                  <Link href={`/dashboard/webhooks/${webhook.id}`} className="text-[#58a6ff] hover:underline">
                    {webhook.path || "/"}
                  </Link>
                </TableCell>
                <TableCell>{(webhook.bodySize / 1024).toFixed(1)} KB</TableCell>
                <TableCell>{webhook.replayCount}</TableCell>
                <TableCell>{formatDistanceToNow(webhook.createdAt, { addSuffix: true })}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
