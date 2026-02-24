import { createClient } from "@nhost/nhost-js";

export const nhost = createClient({
  subdomain: process.env.REACT_APP_NHOST_SUBDOMAIN,
  region: process.env.REACT_APP_NHOST_REGION
});