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
import { useCallback, useEffect, useState } from 'react';
import {
  Content,
  Header,
  Page,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import {
  Button,
  Chip,
  CircularProgress,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import CloudIcon from '@material-ui/icons/Cloud';
import StorageIcon from '@material-ui/icons/Storage';
import type { Entity } from '@backstage/catalog-model';

type VmStatus = 'running' | 'stopped' | 'pending';

interface VmState {
  status: VmStatus;
  loading: boolean;
}

const useStyles = makeStyles(theme => ({
  chip: {
    fontWeight: 'bold',
    minWidth: 90,
  },
  chipRunning: {
    backgroundColor: theme.palette.success?.main ?? '#4caf50',
    color: '#fff',
  },
  chipStopped: {
    backgroundColor: theme.palette.error.main,
    color: '#fff',
  },
  chipPending: {
    backgroundColor: theme.palette.warning.main ?? '#ff9800',
    color: '#fff',
  },
  actionButton: {
    marginRight: theme.spacing(1),
    minWidth: 80,
  },
  envIcon: {
    verticalAlign: 'middle',
    marginRight: theme.spacing(0.5),
    fontSize: 16,
  },
  tableHead: {
    backgroundColor: theme.palette.background.default,
  },
}));

function getEnvironment(entity: Entity): 'cloud' | 'on-premise' {
  const tags = entity.metadata.tags ?? [];
  return tags.includes('on-premise') ? 'on-premise' : 'cloud';
}

function initialStatus(): VmStatus {
  return Math.random() > 0.3 ? 'running' : 'stopped';
}

export function VmManagerPage() {
  const classes = useStyles();
  const catalogApi = useApi(catalogApiRef);

  const [vms, setVms] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();
  const [vmStates, setVmStates] = useState<Record<string, VmState>>({});

  useEffect(() => {
    catalogApi
      .getEntities({
        filter: { kind: 'Resource', 'spec.type': 'virtual-machine' },
      })
      .then(result => {
        setVms(result.items);
        const states: Record<string, VmState> = {};
        for (const vm of result.items) {
          states[vm.metadata.name] = {
            status: initialStatus(),
            loading: false,
          };
        }
        setVmStates(states);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [catalogApi]);

  const handleAction = useCallback((name: string, action: 'start' | 'stop') => {
    setVmStates(prev => ({
      ...prev,
      [name]: { ...prev[name], loading: true, status: 'pending' },
    }));

    // Simulate async call (replace with real API call)
    setTimeout(() => {
      setVmStates(prev => ({
        ...prev,
        [name]: {
          loading: false,
          status: action === 'start' ? 'running' : 'stopped',
        },
      }));
    }, 1500);
  }, []);

  if (loading) return <Progress />;
  if (error) return <ResponseErrorPanel error={error} />;

  const cloudVms = vms.filter(v => getEnvironment(v) === 'cloud');
  const onPremVms = vms.filter(v => getEnvironment(v) === 'on-premise');

  return (
    <Page themeId="tool">
      <Header title="VM Manager" subtitle="WMS Virtual Machines" />
      <Content>
        <VmTable
          title="Cloud VMs"
          vms={cloudVms}
          vmStates={vmStates}
          onAction={handleAction}
          classes={classes}
        />
        <div style={{ marginTop: 24 }} />
        <VmTable
          title="On-Premise VMs"
          vms={onPremVms}
          vmStates={vmStates}
          onAction={handleAction}
          classes={classes}
        />
      </Content>
    </Page>
  );
}

function StatusChip({
  status,
  classes,
}: {
  status: VmStatus;
  classes: ReturnType<typeof useStyles>;
}) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  let cls = classes.chipPending;
  if (status === 'running') cls = classes.chipRunning;
  else if (status === 'stopped') cls = classes.chipStopped;
  return (
    <Chip label={label} size="small" className={`${classes.chip} ${cls}`} />
  );
}

function VmTable({
  title,
  vms,
  vmStates,
  onAction,
  classes,
}: {
  title: string;
  vms: Entity[];
  vmStates: Record<string, VmState>;
  onAction: (name: string, action: 'start' | 'stop') => void;
  classes: ReturnType<typeof useStyles>;
}) {
  const isCloud = title.toLowerCase().includes('cloud');

  return (
    <>
      <Typography variant="h6" gutterBottom>
        {isCloud ? (
          <CloudIcon className={classes.envIcon} />
        ) : (
          <StorageIcon className={classes.envIcon} />
        )}
        {title}
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead className={classes.tableHead}>
            <TableRow>
              <TableCell>
                <strong>Name</strong>
              </TableCell>
              <TableCell>
                <strong>Description</strong>
              </TableCell>
              <TableCell>
                <strong>Tags</strong>
              </TableCell>
              <TableCell>
                <strong>Status</strong>
              </TableCell>
              <TableCell>
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vms.map(vm => {
              const state = vmStates[vm.metadata.name] ?? {
                status: 'stopped',
                loading: false,
              };
              return (
                <TableRow key={vm.metadata.name} hover>
                  <TableCell>
                    <strong>{vm.metadata.name}</strong>
                  </TableCell>
                  <TableCell>{vm.metadata.description ?? '—'}</TableCell>
                  <TableCell>
                    {(vm.metadata.tags ?? [])
                      .filter(t => !['on-premise', 'cloud'].includes(t))
                      .map(tag => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          style={{ marginRight: 4 }}
                        />
                      ))}
                  </TableCell>
                  <TableCell>
                    {state.loading ? (
                      <CircularProgress size={20} />
                    ) : (
                      <StatusChip status={state.status} classes={classes} />
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      className={classes.actionButton}
                      disabled={state.loading || state.status === 'running'}
                      onClick={() => onAction(vm.metadata.name, 'start')}
                    >
                      Start
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      className={classes.actionButton}
                      disabled={state.loading || state.status === 'stopped'}
                      onClick={() => onAction(vm.metadata.name, 'stop')}
                    >
                      Stop
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
