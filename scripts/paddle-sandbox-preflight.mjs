import fs from 'node:fs';
import { parseEnv } from 'node:util';

const option = process.argv.indexOf('--env-file');
const file = option < 0 ? '.env.local' : process.argv[option + 1];
if (!file) throw new Error('--env-file requires a local environment file');
const env = parseEnv(fs.readFileSync(file, 'utf8'));
if (env.PADDLE_ENVIRONMENT !== 'sandbox' || env.NEXT_PUBLIC_PADDLE_ENV !== 'sandbox') {
  throw new Error('Both Paddle environments must be sandbox');
}
const key = String(env.PADDLE_API_KEY || '').trim();
const token = String(env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '').trim();
if (!key.startsWith('pdl_sdbx_apikey_') || !token.startsWith('test_')) {
  throw new Error('Sandbox API key and sandbox browser token required');
}
const productId = String(env.PADDLE_PRODUCT_ID || '').trim();
if (!/^pro_[a-z0-9]+$/.test(productId)) throw new Error('PADDLE_PRODUCT_ID must identify the existing product');

// Only these fields are reported. Credentials, customer records and raw bodies stay out of output.
async function inspect(route, authenticated = true) {
  const response = await fetch('https://sandbox-api.paddle.com' + route, {
    headers: authenticated ? { Authorization: 'Bearer ' + key } : {},
    signal: AbortSignal.timeout(20000),
  });
  const body = await response.json();
  return { response, body, report: {
    route, authenticated, status: response.status,
    requestId: body.meta?.request_id || response.headers.get('request-id'),
    errorCode: body.error?.code || null,
  } };
}
const publicRoot = await inspect('/', false);
const root = await inspect('/');
const product = await inspect('/products/' + productId);
const permissions = root.body.data?.caller?.permissions || [];
const prices = root.response.ok && permissions.includes('price.read')
  ? await inspect('/prices?product_id=' + productId)
  : null;
const result = {
  checkedAt: new Date().toISOString(), environment: 'sandbox',
  apiKeyFormatValid: /^pdl_sdbx_apikey_[a-z\d]{26}_[a-zA-Z\d]{22}_[a-zA-Z\d]{3}$/.test(key),
  browserTokenEnvironment: 'sandbox', browserTokenAccountVerified: false,
  account: root.body.data?.caller?.account || null,
  permissions,
  responses: [publicRoot.report, root.report, product.report, ...(prices ? [prices.report] : [])],
  product: product.response.ok ? { id: product.body.data?.id, name: product.body.data?.name, status: product.body.data?.status } : null,
  prices: prices?.response.ok ? prices.body.data?.map(price => ({ id: price.id, productId: price.product_id, status: price.status, unitPrice: price.unit_price, billingCycle: price.billing_cycle })) : null,
  priceStrategy: 'Existing product with a non-catalog one-time price from the server quote. PADDLE_PRICE_ID is unused.',
  credentialAccepted: Boolean(root.response.ok && root.body.data?.caller?.account),
};
console.log(JSON.stringify(result, null, 2));
if (!result.credentialAccepted || !product.response.ok) process.exitCode = 1;
