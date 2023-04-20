const SECTION = 'openshift';
const APP_ID = 'ocp-advisor';
const FRONTEND_PORT = 8002;
const routes = {};

routes[`/preview/${SECTION}/${APP_ID}`] = {
  host: `https://localhost:${FRONTEND_PORT}`,
};
routes[`/${SECTION}/${APP_ID}`] = {
  host: `https://localhost:${FRONTEND_PORT}`,
};
routes[`/preview/apps/${APP_ID}`] = {
  host: `https://localhost:${FRONTEND_PORT}`,
};
routes[`/apps/${APP_ID}`] = { host: `https://localhost:${FRONTEND_PORT}` };

module.exports = { routes };
