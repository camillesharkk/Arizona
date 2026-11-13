process.env.NEXT_PUBLIC_NC_PREVIEW = '1';
process.env.PACK_TEST_DATA_DIR = '.tools/nc-data';
process.env.PACK_TEST_PORT ||= '3431';
await import('./pack-preview-server.mjs');
