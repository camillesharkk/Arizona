// Dedicated candidate flag and port. Existing launcher uses isolated local file data.
process.env.NEXT_PUBLIC_CT_PREVIEW = '1';
process.env.NEXT_DIST_DIR = process.argv.includes('--build') || process.argv.includes('--built') ? '.tools/ct-build' : '.tools/ct-dev';
process.env.PACK_TEST_PORT ||= '3436';
process.env.PACK_TEST_DATA_DIR ||= '.tools/ct-data';
await import('./pack-preview-server.mjs');
