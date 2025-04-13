export interface MagnetFile {
  name: string;
  length: number;
}

export interface MagnetFileDetails {
  filesList: MagnetFile[];
  torrentName: string;
  infoHash: string;
}

export interface QBTaskContent {
  availability: number;
  index: number;
  is_seed: boolean;
  name: string;
  piece_range: number[];
  priority: number;
  progress: number;
  size: number;
}
