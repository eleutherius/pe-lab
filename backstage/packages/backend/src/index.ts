import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

async function importBackendFeature<T>(
  featureImport: Promise<T>,
): Promise<{ default: T }> {
  const imported = await featureImport;
  const candidate =
    (imported as { default?: { $$type?: string; default?: T } }).default;

  if (candidate?.$$type === '@backstage/BackendFeature') {
    return { default: candidate as T };
  }

  if (
    candidate &&
    typeof candidate === 'object' &&
    'default' in candidate &&
    (candidate as { default?: { $$type?: string } }).default?.$$type ===
      '@backstage/BackendFeature'
  ) {
    return { default: (candidate as { default: T }).default };
  }

  return {
    default: imported,
  };
}

backend.add(importBackendFeature(import('@backstage/plugin-app-backend')));
backend.add(importBackendFeature(import('@backstage/plugin-auth-backend')));
backend.add(
  importBackendFeature(
    import('@backstage/plugin-auth-backend-module-guest-provider'),
  ),
);
backend.add(importBackendFeature(import('@backstage/plugin-catalog-backend')));
backend.add(
  importBackendFeature(
    import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'),
  ),
);
backend.add(importBackendFeature(import('@backstage/plugin-proxy-backend')));
backend.add(importBackendFeature(import('@backstage/plugin-scaffolder-backend')));
backend.add(importBackendFeature(import('@backstage/plugin-search-backend')));
backend.add(
  importBackendFeature(import('@backstage/plugin-search-backend-module-catalog')),
);
backend.add(importBackendFeature(import('@backstage/plugin-techdocs-backend')));

backend.start();
