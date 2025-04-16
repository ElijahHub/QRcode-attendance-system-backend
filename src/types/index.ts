export interface RouteConfig {
  method: "post" | "get" | "patch" | "delete";
  url: string;
  handler: any;
  schema: any;
  preHandler?: any;
}
