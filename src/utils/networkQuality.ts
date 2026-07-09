import NetInfo, { NetInfoStateType } from '@react-native-community/netinfo';
import { QualityVariant } from './cloudinaryVideo';

export const pickInitialQuality = async (variants: QualityVariant[]): Promise<QualityVariant> => {
  try {
    if (variants.length <= 1) {
      return variants[0] || { label: 'Auto', url: '' };
    }

    const state = await NetInfo.fetch();
    let targetLabel: string;

    switch (state.type) {
      case NetInfoStateType.wifi:
      case NetInfoStateType.ethernet:
        targetLabel = '1080p';
        break;
      case NetInfoStateType.cellular:
        if (state.details && 'cellularGeneration' in state.details) {
          const gen = (state.details as any).cellularGeneration;
          if (gen === '5g') {
            targetLabel = '1080p';
          } else if (gen === '4g') {
            targetLabel = '720p';
          } else {
            targetLabel = '480p';
          }
        } else {
          targetLabel = '720p';
        }
        break;
      default:
        targetLabel = '480p';
    }

    const match = variants.find(v => v.label === targetLabel);
    if (match) return match;

    const fallback = variants.find(v => v.label === 'Auto') || variants[0];
    return fallback || { label: 'Auto', url: '' };
  } catch (e) {
    console.log('Network quality detection failed:', e);
    return variants[0] || { label: 'Auto', url: '' };
  }
};
