/*
 * Copyright 2026 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  createFrontendPlugin,
  createRouteRef,
  NavItemBlueprint,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import AppsIcon from '@material-ui/icons/Apps';

const rootRouteRef = createRouteRef();

const servicePortalPage = PageBlueprint.make({
  params: {
    path: '/service-portal',
    routeRef: rootRouteRef,
    title: 'Service Portal',
    loader: () =>
      import('./components/ServicePortalPage').then(m => (
        <m.ServicePortalPage />
      )),
  },
});

const servicePortalNavItem = NavItemBlueprint.make({
  params: {
    title: 'Service Portal',
    icon: () => <AppsIcon />,
    routeRef: rootRouteRef,
  },
});

export const servicePortalPlugin = createFrontendPlugin({
  pluginId: 'service-portal',
  title: 'Service Portal',
  icon: <AppsIcon />,
  info: { packageJson: () => import('../package.json') },
  extensions: [servicePortalPage, servicePortalNavItem],
});
