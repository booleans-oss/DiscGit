interface WebhookConfig {
  content_type: string;
  insecure_ssl: string;
  url: string;
}
interface WebhookLastResponse {
  code?: number;
  status: string;
  message?: string;
}
export interface Webhook {
  type: string;
  id: number;
  name: string;
  active: boolean;
  events: Array<string>;
  config: WebhookConfig;
  updated_at: string;
  created_at: string;
  url: string;
  test_url: string;
  ping_url: string;
  last_response: WebhookLastResponse;
}
