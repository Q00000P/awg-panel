import type { ErrorCorrection } from 'qr';
import { encodeQR } from 'qr';

export function encodeQRCode(config: string): string {
  return tryECCModes((ecc) => {
    return encodeQR(config, 'svg', {
      ecc,
      scale: 2,
      encoding: 'byte',
    });
  });
}

export function encodeQRCodeTerm(config: string): string {
  return tryECCModes((ecc) => {
    return encodeQR(config, 'term', {
      ecc,
      encoding: 'byte',
    });
  });
}

function tryECCModes<T>(callback: (ecc: ErrorCorrection) => T): T {
  // От low к high: чем ниже коррекция, тем меньше модулей на тот же конфиг,
  // и тем проще камере. Раньше брался первый влезающий уровень начиная с
  // high — на длинных AWG-конфигах это давало предельно плотный QR.
  const ECMode = ['low', 'medium', 'quartile', 'high'] as const;
  for (const ecc of ECMode) {
    try {
      return callback(ecc);
    } catch (err) {
      if (!(err instanceof Error && err.message === 'Capacity overflow')) {
        throw err;
      }
      // retry with lower ecc
    }
  }
  throw new Error(
    'Failed to generate QR code: Capacity overflow at all ECC levels'
  );
}
