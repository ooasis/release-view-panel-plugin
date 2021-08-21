import { PanelPlugin } from '@grafana/data';
import { ReleaseViewOptions } from './types';
import { ReleaseViewPanel } from './ReleaseView';

export const plugin = new PanelPlugin<ReleaseViewOptions>(ReleaseViewPanel).setPanelOptions(builder => {
  return builder
    .addTextInput({
      path: 'rallyUrl',
      name: 'Url of Rally Site',
      description: 'Url of Rally Site',
      defaultValue: '',
    })
    .addTextInput({
      path: 'gitlabUrl',
      name: 'Url of Gitlab Site',
      description: 'Url of Gitlab Site',
      defaultValue: '',
    })
    .addTextInput({
      path: 'ticketUrlTemplate',
      name: 'Url template of ticket Url',
      description: 'Url template of ticket Url. Use #{ticket} as placeholder for ticket number',
      defaultValue: '',
    });
});
