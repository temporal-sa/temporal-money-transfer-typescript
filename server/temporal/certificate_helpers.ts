import fs from 'fs-extra';
import { ConfigObj } from './config';

export async function getCertKeyBuffers(config: ConfigObj) {
  let cert = null;
  let key = null;

  // if certPath and keyPath have contents, read them
  if (config.certPath !== '' && config.keyPath !== '') {
    cert = await fs.readFile(config.certPath);
    key = await fs.readFile(config.keyPath);
  }
  else if (config.certContent !== '' && config.keyContent !== '') {
    cert = Buffer.from(config.certContent, 'utf8');
    key = Buffer.from(config.keyContent, 'utf8');
  }

  return {
    cert: cert,
    key: key
  }
}