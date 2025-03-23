import { UserManager, WebStorageStateStore, Log } from 'oidc-client-ts';

const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL || "https://keycloak.direa.synology.me";
const REALM = "sso";
const CLIENT_ID = "chrome-ext";

export const userManager = new UserManager({
  authority: KEYCLOAK_URL + `/realms/${REALM}`,
  client_id: CLIENT_ID,
  redirect_uri: `${window.location.origin}${window.location.pathname}`,
  post_logout_redirect_uri: window.location.origin,
  scope: 'openid profile email',
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
  monitorSession: true,
  automaticSilentRenew: true,
  silent_redirect_uri: `${window.location.origin}/silent-redirect.html`,
});

Log.setLogger(console);
Log.setLevel(Log.DEBUG);
