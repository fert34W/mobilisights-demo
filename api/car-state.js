// /api/car-state.js
// Azure Static Web Apps function (JavaScript) — runs on the Free plan
// Docs: https://learn.microsoft.com/azure/static-web-apps/apis

export default async function (context, req) {
  const base = process.env.MOBILISIGHTS_BASE || 'https://www.mobilisights.io';
  const token = process.env.MOBILISIGHTS_TOKEN;

  if (!token) {
    context.res = {
      status: 500,
      headers: { 'content-type': 'application/json' },
      body: { error: 'Server misconfiguration: MOBILISIGHTS_TOKEN missing.' }
    };
    return;
  }

  const contractId = (req.query?.contractId || '').trim();
  if (!contractId) {
    context.res = {
      status: 400,
      headers: { 'content-type': 'application/json' },
      body: { error: 'Missing contractId query parameter.' }
    };
    return;
  }

  try {
    // ⚠️ Update this path to the exact one you use successfully in Postman.
    // The below is a best-guess based on the docs name "getContractCarState".
    const upstreamUrl =
      `${base}/api/connected-fleet/v1/contracts/${encodeURIComponent(contractId)}/car/state`;

    const upstreamRes = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    const contentType = upstreamRes.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const body = isJson ? await upstreamRes.json() : await upstreamRes.text();

    if (!upstreamRes.ok) {
      context.res = {
        status: upstreamRes.status,
        headers: { 'content-type': 'application/json' },
        body: { error: 'Upstream error', status: upstreamRes.status, details: body }
      };
      return;
    }

    context.res = {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body
    };
  } catch (err) {
    context.log(err);
    context.res = {
      status: 500,
      headers: { 'content-type': 'application/json' },
      body: { error: 'Proxy error', details: err.message }
    };
  }
}
``