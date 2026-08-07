import fs from 'fs';
import path from 'path';

import { ContentData } from '../types';

export function getContent(): ContentData {
  const filePath = path.join(process.cwd(), 'public', 'content.json');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileContent) as ContentData;
}
