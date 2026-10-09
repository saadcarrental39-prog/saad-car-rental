// Same handler under a neutral name (ad-blockers often block URLs that contain "collect", "track" or "analytics").
import * as c from "./collect.js";
export const onRequestPost = c.onRequestPost;
export const onRequestGet = c.onRequestGet;
export const onRequest = c.onRequest;
