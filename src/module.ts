import { PanelPlugin } from '@grafana/data';
import { ReleaseViewOptions } from './types';
import { ReleaseViewPanel } from './ReleaseView';

export const plugin = new PanelPlugin<ReleaseViewOptions>(ReleaseViewPanel).setPanelOptions(builder => {
  return builder
    .addTextInput({
      path: 'text',
      name: 'Simple text option',
      description: 'Description of panel option',
      defaultValue: 'Default value of text input option',
    });
});
