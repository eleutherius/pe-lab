import React from 'react';
import { createApp } from '@backstage/app-defaults';
import { AppRouter, FlatRoutes } from '@backstage/core-app-api';
import { AlertDisplay, OAuthRequestDialog } from '@backstage/core-components';
import { ApiExplorerPage, apiDocsPlugin } from '@backstage/plugin-api-docs';
import {
  CatalogEntityPage,
  CatalogIndexPage,
  catalogPlugin,
} from '@backstage/plugin-catalog';
import {
  CatalogImportPage,
  catalogImportPlugin,
} from '@backstage/plugin-catalog-import';
import { CatalogGraphPage } from '@backstage/plugin-catalog-graph';
import { ScaffolderPage, scaffolderPlugin } from '@backstage/plugin-scaffolder';
import { SearchPage } from '@backstage/plugin-search';
import {
  TechDocsIndexPage,
  TechDocsReaderPage,
  techdocsPlugin,
} from '@backstage/plugin-techdocs';
import { TechDocsAddons } from '@backstage/plugin-techdocs-react';
import { ReportIssue } from '@backstage/plugin-techdocs-module-addons-contrib';
import { Navigate, Route } from 'react-router-dom';

const app = createApp({
  bindRoutes({ bind }) {
    bind(catalogPlugin.externalRoutes, {
      createComponent: scaffolderPlugin.routes.root,
      createFromTemplate: scaffolderPlugin.routes.selectedTemplate,
      viewTechDoc: techdocsPlugin.routes.docRoot,
    });

    bind(apiDocsPlugin.externalRoutes, {
      registerApi: catalogImportPlugin.routes.importPage,
    });

    bind(scaffolderPlugin.externalRoutes, {
      registerComponent: catalogImportPlugin.routes.importPage,
      viewTechDoc: techdocsPlugin.routes.docRoot,
    });
  },
});

export default app.createRoot(
  <>
    <AlertDisplay />
    <OAuthRequestDialog />
    <AppRouter>
      <FlatRoutes>
        <Route path="/" element={<Navigate to="/catalog" replace />} />
        <Route path="/catalog" element={<CatalogIndexPage />} />
        <Route
          path="/catalog/:namespace/:kind/:name"
          element={<CatalogEntityPage />}
        />
        <Route path="/docs" element={<TechDocsIndexPage />} />
        <Route
          path="/docs/:namespace/:kind/:name/*"
          element={
            <TechDocsReaderPage>
              <TechDocsAddons>
                <ReportIssue />
              </TechDocsAddons>
            </TechDocsReaderPage>
          }
        />
        <Route path="/create" element={<ScaffolderPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/api-docs" element={<ApiExplorerPage />} />
        <Route path="/catalog-import" element={<CatalogImportPage />} />
        <Route path="/catalog-graph" element={<CatalogGraphPage />} />
      </FlatRoutes>
    </AppRouter>
  </>,
);
