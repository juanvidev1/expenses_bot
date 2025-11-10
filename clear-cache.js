// Clear module cache for hot reload
export async function resolve(specifier, context, defaultResolve) {
  const result = await defaultResolve(specifier, context);

  // Clear cache for local modules
  if (
    result.url &&
    result.url.includes('file://') &&
    result.url.includes('/src/')
  ) {
    delete require.cache[result.url];
  }

  return result;
}
