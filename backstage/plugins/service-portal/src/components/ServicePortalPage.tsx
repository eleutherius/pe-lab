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
import { useEffect, useState } from 'react';
import {
  Content,
  Header,
  Page,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';
import { catalogApiRef, entityRouteRef } from '@backstage/plugin-catalog-react';
import {
  Avatar,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  makeStyles,
  Typography,
} from '@material-ui/core';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import type { Entity } from '@backstage/catalog-model';
import { useNavigate } from 'react-router-dom';

const SECTION_ANNOTATION = 'portal.backstage.io/section';
const ICON_ANNOTATION = 'portal.backstage.io/icon-url';

const useStyles = makeStyles(theme => ({
  section: {
    marginBottom: theme.spacing(4),
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
    fontWeight: 600,
  },
  card: {
    height: '100%',
    border: `1px solid ${theme.palette.divider}`,
    transition: 'border-color 0.2s, box-shadow 0.2s',
    '&:hover': {
      borderColor: theme.palette.primary.main,
      boxShadow: theme.shadows[4],
    },
  },
  cardArea: {
    height: '100%',
    display: 'flex',
    alignItems: 'flex-start',
    padding: theme.spacing(2),
    gap: theme.spacing(2),
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: theme.palette.primary.main,
    flexShrink: 0,
  },
  avatarImg: {
    objectFit: 'contain',
    padding: 4,
    borderRadius: 8,
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
  },
  cardContent: {
    padding: 0,
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardDesc: {
    color: theme.palette.text.secondary,
    fontSize: '0.75rem',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  externalIcon: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.5,
    verticalAlign: 'middle',
  },
  emptyState: {
    padding: theme.spacing(4),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

function getIconUrl(entity: Entity): string | undefined {
  return entity.metadata.annotations?.[ICON_ANNOTATION];
}

function getExternalLink(entity: Entity): string | undefined {
  return entity.metadata.links?.[0]?.url;
}

function getInitials(name: string): string {
  return name
    .split(/[-_ ]/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

function ServiceCard({
  entity,
  classes,
}: {
  entity: Entity;
  classes: ReturnType<typeof useStyles>;
}) {
  const navigate = useNavigate();
  const catalogEntityRoute = useRouteRef(entityRouteRef);
  const externalLink = getExternalLink(entity);
  const iconUrl = getIconUrl(entity);
  const name = entity.metadata.title ?? entity.metadata.name;
  const description = entity.metadata.description ?? '';

  const handleClick = () => {
    if (externalLink) {
      window.open(externalLink, '_blank', 'noopener noreferrer');
    } else {
      const kind = entity.kind.toLowerCase();
      const namespace = entity.metadata.namespace ?? 'default';
      navigate(
        catalogEntityRoute({
          kind,
          namespace,
          name: entity.metadata.name,
        }),
      );
    }
  };

  return (
    <Card className={classes.card} elevation={0}>
      <CardActionArea onClick={handleClick} className={classes.cardArea}>
        {iconUrl ? (
          <img
            src={iconUrl}
            alt={name}
            width={40}
            height={40}
            className={classes.avatarImg}
          />
        ) : (
          <Avatar className={classes.avatar} variant="rounded">
            {getInitials(name)}
          </Avatar>
        )}
        <CardContent className={classes.cardContent}>
          <Typography variant="subtitle2" className={classes.cardTitle}>
            {name}
            {externalLink && <OpenInNewIcon className={classes.externalIcon} />}
          </Typography>
          {description && (
            <Typography className={classes.cardDesc}>{description}</Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export function ServicePortalPage() {
  const classes = useStyles();
  const catalogApi = useApi(catalogApiRef);
  const [sections, setSections] = useState<Map<string, Entity[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    catalogApi
      .getEntities({})
      .then(result => {
        const map = new Map<string, Entity[]>();
        for (const entity of result.items) {
          const section = entity.metadata.annotations?.[SECTION_ANNOTATION];
          if (!section) continue;
          if (!map.has(section)) map.set(section, []);
          map.get(section)!.push(entity);
        }
        // Sort sections alphabetically, but keep custom order if provided
        setSections(map);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [catalogApi]);

  if (loading) return <Progress />;
  if (error) return <ResponseErrorPanel error={error} />;

  return (
    <Page themeId="home">
      <Header
        title="Service Portal"
        subtitle="All services, tools and resources"
      />
      <Content>
        {sections.size === 0 ? (
          <div className={classes.emptyState}>
            <Typography variant="h6">No services yet</Typography>
            <Typography variant="body2">
              Add the annotation{' '}
              <code>{SECTION_ANNOTATION}: "Section Name"</code> to any catalog
              entity to make it appear here.
            </Typography>
          </div>
        ) : (
          Array.from(sections.entries()).map(([sectionName, entities]) => (
            <div key={sectionName} className={classes.section}>
              <Typography variant="h6" className={classes.sectionTitle}>
                {sectionName}
              </Typography>
              <Grid container spacing={2}>
                {entities.map(entity => (
                  <Grid
                    item
                    key={`${entity.kind}-${entity.metadata.name}`}
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                  >
                    <ServiceCard entity={entity} classes={classes} />
                  </Grid>
                ))}
              </Grid>
            </div>
          ))
        )}
      </Content>
    </Page>
  );
}
