import { MagnetFile } from '../magnet/file';

export interface StoreTaskRecord {
  name: string;
  magnet: string;
  infoHash: string;
  source: string;
  isCompleted: boolean;
  isDownloaded: boolean;
  addDate: number;
  selectedContents: MagnetFile[];
}
