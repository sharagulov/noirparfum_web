const FILE_PROTOCOL = "file:";
const APP_ORIGIN = "https://noir.local";

function normalizeRoute(route = "/") {
  if (!route.startsWith("/")) return `/${route}`;
  return route;
}

export function isFileRuntime() {
  return location.protocol === FILE_PROTOCOL;
}

export function getAppUrl() {
  if (!isFileRuntime()) return new URL(location.href);
  const hashRoute = location.hash.replace(/^#/, "") || "/";
  return new URL(normalizeRoute(hashRoute), APP_ORIGIN);
}

export function getAppPath() {
  return getAppUrl().pathname;
}

export function getAppSearch() {
  return getAppUrl().search;
}

export function getAppParams() {
  return new URLSearchParams(getAppSearch());
}

export function getAppFragment() {
  if (!isFileRuntime()) return location.hash;
  return getAppUrl().hash;
}

export function navigateApp(target, { replace = false } = {}) {
  const route = normalizeRoute(target);
  if (!isFileRuntime()) {
    history[replace ? "replaceState" : "pushState"]({}, "", route);
    return;
  }
  if (replace) {
    history.replaceState({}, "", `${location.pathname}${location.search}#${route}`);
    return;
  }
  location.hash = route;
}
