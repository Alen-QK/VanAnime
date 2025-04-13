import { Injectable } from '@nestjs/common';
import { QbittorrentService } from '../../../libs/utils/qbittorrent/qbittorrent.service';
import { TorrentTransformerService } from '../../../libs/utils/magnet/torrent-transformer/torrent-transformer.service';
import { MagnetFileDetails } from '../../../libs/modal/magnet/file';
import { MagnetParseResponseDto } from './dto/magnet.response.dto';
import { HttpStatusCode } from 'axios';
import { ResponseBase } from '../../../libs/dto/response-base.dto';
import { MagnetSubmitDto } from './dto/magnet.submit.dto';
import { StoreService } from '../../../libs/core/store/store.service';

@Injectable()
export class MagnetService {
  constructor(
    private readonly qbService: QbittorrentService,
    private readonly torrentTransformService: TorrentTransformerService,
    private readonly storeService: StoreService,
  ) {}

  async parseMagnet(magnet: string) {
    const results = await this.torrentTransformService.parseMagnet(magnet);
    const response = new MagnetParseResponseDto(
      HttpStatusCode.Ok,
      true,
      results as MagnetFileDetails,
    );
    return response;
  }

  async submitNewTask(data: MagnetSubmitDto) {
    if (this.storeService.findTask(data.details.infoHash)) {
      const response = new ResponseBase(
        HttpStatusCode.Ok,
        false,
        '本任务已经存在于任务列表中',
      );
      return response;
    }

    const result = await this.qbService.submitNewTask(data.details);

    if (result) {
      this.storeService.addNewRecord(
        data.details.torrentName,
        data.originMagnet,
        data.details.infoHash,
        data.source,
        data.details.filesList,
      );
    }

    const response = new ResponseBase(
      result ? HttpStatusCode.Ok : HttpStatusCode.BadRequest,
      result,
    );
    return response;
  }
}
