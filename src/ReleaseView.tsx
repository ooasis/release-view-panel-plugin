import React, { useState, useEffect } from 'react';
import { AnnotationEvent, DataFrame, FieldType, GrafanaTheme2, MutableDataFrame, PanelProps, toDataFrame } from '@grafana/data';
import { ReleaseViewOptions } from 'types';
import { css, cx } from 'emotion';
import {  Table, useStyles2 } from '@grafana/ui';
import { getBackendSrv } from '@grafana/runtime';
import { applyFieldOverrides, createTheme } from '@grafana/data';

interface Props extends PanelProps<ReleaseViewOptions> {}

interface ReleaseDTO {
  start?: number;
  end?: number;
  rallyProject?: string;
  rallyArtifact?: string;
  gitlabGroup?: string;
  gitlabProject?: string;
  releaseTag?: string;
  rollbackTag?: string;
  rt?: string;
  configChangeOnly?: boolean;
  notes?: string;
}

// type ReleaseAnno = {
//   time?: number;
//   tags?: string;
//   release?: string;
//   rallyArtifact?: string;
//   rallyArtifactUrl?: string;
//   gitlabProject?: string;
//   gitlabDiffUrl?: string;
//   rt?: string;
//   rtUrl?: string;
//   releaseTag?: string;
//   rollbackTag?: string;
// };

export const ReleaseViewPanel: React.FC<Props> = ({ options, data, width, height, timeRange, replaceVariables }) => {
  const  styles  = useStyles2(getStyles);

  const [annotations, setAnnotations] = useState<DataFrame>(toDataFrame([]));

  const fetchAnnotations = async () => {
    const params: any = {
      tags: 'release',
      limit: 100,
      type: 'annotation',
      from: timeRange.from.valueOf(),
      to: timeRange.to.valueOf(),
    };

    const frame = new MutableDataFrame({
      fields: [
        {
          name: 'Time',
          type: FieldType.time,
          config: {
            custom: {
              filterable: false,
            },
          },
        },
        {
          name: 'Team',
          type: FieldType.string,
          config: {
            custom: {
              filterable: true,
            },
          },
        },
        {
          name: 'Project',
          type: FieldType.string,
          config: {
            custom: {
              filterable: true,
            },
          },
        },
        {
          name: 'Story/Defect',
          type: FieldType.string,
          config: {
            custom: {
              filterable: false,
            },
            links: [
              {
                targetBlank: true,
                title: 'Rally Link',
                url: '${__data.fields.L1}',
              },
            ],
          },
        },
        {
          name: 'Release',
          type: FieldType.string,
          config: {
            custom: {
              filterable: false,
            },
            links: [
              {
                targetBlank: true,
                title: 'Code Diff',
                url: '${__data.fields.L2}',
              },
            ],
          },
        },
        {
          name: 'Rollback',
          type: FieldType.string,
          config: {
            custom: {
              filterable: false,
            },
          },
        },
        {
          name: 'L1',
          type: FieldType.string,
          config: {
            custom: {
              width: 1,
            },
          },
        },
        {
          name: 'L2',
          type: FieldType.string,
          config: {
            custom: {
              width: 1,
            },
          },
        },
      ],      
    });

    const raw: Array<AnnotationEvent> = await getBackendSrv().get('/api/annotations', params, `anno-view-panel`);
    raw.forEach((r) => {
      const release = r.text?.split("\n")[0];
      const rawReleaseData = r.text?.split("\n").slice(-1)[0];
      const releaseDTO: ReleaseDTO = rawReleaseData ? JSON.parse(rawReleaseData) : {};

      // const rallyArtifact = releaseDTO.rallyArtifact?.split(":")[2];
      const rallyProjectId = releaseDTO.rallyProject?.split(":")[0];
      const rallyProject = releaseDTO.rallyProject?.split(":")[1];
      const rallyArtifactId = releaseDTO.rallyArtifact?.split(":")[0];
      const rallyArtifactType = releaseDTO.rallyArtifact?.split(":")[1] === 'story' ? 'userstory' : 'defect';
      const rallyArtifactUrl = `https://rally1.rallydev.com/#/${rallyProjectId}/dashboard?detail=%2F${rallyArtifactType}%2F${rallyArtifactId}&fdp=true`;

      const gitlabGroup = releaseDTO.gitlabGroup?.split(":")[1];
      const gitlabProject = releaseDTO.gitlabProject?.split(":")[1];
      const releaseTag = releaseDTO.releaseTag?.split(":")[0];
      const rollbackTag = releaseDTO.rollbackTag?.split(":")[0];
      const gitlabDiffUrl = `http://gitlab.shopzilla.com/${gitlabGroup}/${gitlabProject}/-/compare/${releaseTag}...${rollbackTag}`;

      frame.appendRow([
        r.time,
        rallyProject,
        // rallyArtifact,
        gitlabProject,
        // rt: releaseDTO.rt,
        // rtUrl: `${releaseDTO.rt}`,
        release,
        releaseTag,
        rollbackTag,
        // r.tags?.join(", "),
        rallyArtifactUrl,
        gitlabDiffUrl,
      ]);
    })

    const styledFrame = applyFieldOverrides({
      data: [frame],
      fieldConfig: {
        defaults: {},
        overrides: [{
          "matcher": {
            "id": "byRegexp",
            "options": "L.+"
          },
          "properties": [
            {
              "id": "custom.width",
              "value": 1
            }
          ]
        }],
      },
      replaceVariables: replaceVariables,
      theme: createTheme(),
    })[0];

    setAnnotations(styledFrame);
  };

  useEffect(() => {
    fetchAnnotations();
  }, []);

 
  return (
    <div
      className={cx(
        styles.wrapper,
        css`
          width: ${width}px;
          height: ${height}px;
        `
      )}
    >
      <div className={styles.textBox}>
        <div>
          <Table data={annotations} width={width} height={400}></Table>
        </div>
      </div>
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    wrapper: css`
      position: relative;
    `,
    textBox: css`
      padding: 10px;
    `,
  };
};
