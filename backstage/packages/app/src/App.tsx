import React from 'react';
import { createApp } from '@backstage/app-defaults';
import { AppRouter, FlatRoutes } from '@backstage/core-app-api';
import {
  createApiFactory,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import {
  AlertDisplay,
  CatalogIcon,
  DocsIcon,
  OAuthRequestDialog,
  Sidebar,
  SidebarDivider,
  SidebarExpandButton,
  SidebarGroup,
  SidebarItem,
  SidebarPage,
  SidebarScrollWrapper,
  SidebarSpace,
} from '@backstage/core-components';
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
import {
  Router as SearchRouter,
  SearchClient,
  SidebarSearchModal,
} from '@backstage/plugin-search';
import { searchApiRef } from '@backstage/plugin-search-react';
import { ServicePortalPage } from '@backstage/plugin-service-portal';
import {
  TechDocsIndexPage,
  TechDocsReaderPage,
  techdocsPlugin,
} from '@backstage/plugin-techdocs';
import { TechDocsAddons } from '@backstage/plugin-techdocs-react';
import { ReportIssue } from '@backstage/plugin-techdocs-module-addons-contrib';
import { VmManagerPage } from '@backstage/plugin-vm-manager';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import AppsIcon from '@material-ui/icons/Apps';
import ApiIcon from '@material-ui/icons/Extension';
import ComputerIcon from '@material-ui/icons/Computer';
import SearchIcon from '@material-ui/icons/Search';
import { Navigate, Route } from 'react-router-dom';

const app = createApp({
  apis: [
    createApiFactory({
      api: searchApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new SearchClient({ discoveryApi, fetchApi }),
    }),
  ],
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

const Root = ({ children }: { children?: React.ReactNode }) => (
  <SidebarPage>
    <Sidebar>
      <SidebarGroup label="Search" icon={<SearchIcon />} to="/search">
        <SidebarSearchModal />
      </SidebarGroup>
      <SidebarDivider />
      <SidebarScrollWrapper>
        <SidebarGroup label="Menu" icon={<CatalogIcon />}>
          <SidebarItem icon={CatalogIcon} to="/catalog" text="Catalog" />
          <SidebarItem icon={DocsIcon} to="/docs" text="Docs" />
          <SidebarItem icon={ApiIcon} to="/api-docs" text="APIs" />
          <SidebarItem
            icon={AppsIcon}
            to="/service-portal"
            text="Services"
          />
          <SidebarItem icon={ComputerIcon} to="/vm-manager" text="VMs" />
          <SidebarItem
            icon={AddCircleOutlineIcon}
            to="/create"
            text="Create"
          />
          <SidebarItem
            icon={AccountTreeIcon}
            to="/catalog-graph"
            text="Graph"
          />
        </SidebarGroup>
      </SidebarScrollWrapper>
      <SidebarSpace />
      <SidebarDivider />
      <SidebarExpandButton />
    </Sidebar>
    {children}
  </SidebarPage>
);

export default app.createRoot(
  <>
    <AlertDisplay />
    <OAuthRequestDialog />
    <AppRouter>
      <Root>
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
          <Route path="/search/*" element={<SearchRouter />} />
          <Route path="/service-portal" element={<ServicePortalPage />} />
          <Route path="/vm-manager" element={<VmManagerPage />} />
          <Route path="/api-docs" element={<ApiExplorerPage />} />
          <Route path="/catalog-import" element={<CatalogImportPage />} />
          <Route path="/catalog-graph" element={<CatalogGraphPage />} />
        </FlatRoutes>
      </Root>
    </AppRouter>
  </>,
);
