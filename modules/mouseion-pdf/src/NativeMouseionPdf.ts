import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  getPageCount(filePath: string): Promise<number>;
  renderPage(
    filePath: string,
    page: number,
    width: number,
    height: number,
  ): Promise<string>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('MouseionPdf');
