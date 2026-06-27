import { homePage, errorPage } from './src/html.js';
import { createShare, checkKey, retrieveShare } from './src/handler.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }});
    }

    try {
      const host = url.host;
      // Routes
      if (path === '/' && method === 'GET') {
        return new Response(homePage(env, host), {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }

      if (path === '/api/share' && method === 'POST') {
        return createShare(request, env, ctx);
      }

      if (path.startsWith('/api/check/') && method === 'GET') {
        const key = path.split('/api/check/')[1];
        return checkKey(key, env);
      }

      if (path.startsWith('/api/retrieve/') && method === 'POST') {
        const key = path.split('/api/retrieve/')[1];
        return retrieveShare(key, request, env, ctx);
      }

      if (path.startsWith('/api/retrieve/') && method === 'GET') {
        const key = path.split('/api/retrieve/')[1];
        return retrieveShare(key, request, env, ctx);
      }

      if (path.startsWith('/s/') && method === 'GET') {
        const key = path.split('/s/')[1];
        return retrieveShare(key, request, env, ctx);
      }


      // favicon
      if (path === '/favicon.ico') {
        return new Response(null, { status: 204 });
      }

      // 404
      return new Response(errorPage('404', 'Page not found', host), {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    } catch (e) {
      return new Response(errorPage('Error', e.message, host), {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }
  }
};
