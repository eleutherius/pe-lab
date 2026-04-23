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
import ComputerIcon from '@material-ui/icons/Computer';

const rootRouteRef = createRouteRef();

const vmManagerPage = PageBlueprint.make({
  params: {
    path: '/vm-manager',
    routeRef: rootRouteRef,
    title: 'VM Manager',
    loader: () =>
      import('./components/VmManagerPage').then(m => <m.VmManagerPage />),
  },
});

const vmManagerNavItem = NavItemBlueprint.make({
  params: {
    title: 'VM Manager',
    icon: () => <ComputerIcon />,
    routeRef: rootRouteRef,
  },
});

export const vmManagerPlugin = createFrontendPlugin({
  pluginId: 'vm-manager',
  title: 'VM Manager',
  icon: <ComputerIcon />,
  info: { packageJson: () => import('../package.json') },
  extensions: [vmManagerPage, vmManagerNavItem],
});
