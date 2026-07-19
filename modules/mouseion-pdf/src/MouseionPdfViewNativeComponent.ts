import type { ViewProps } from 'react-native';
import type { HostComponent } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

export interface NativeProps extends ViewProps {
  filePath: string;
  page: number;
  scale: number;
}

export default codegenNativeComponent<NativeProps>(
  'MouseionPdfView',
) as HostComponent<NativeProps>;
