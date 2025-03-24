import { Body, Controller, Post, Res } from '@nestjs/common';
import { MagnetService } from './magnet.service';
import { AddParamDTO } from './dto/magnet.add.dto';
import { Response } from 'express';
import { MagnetFileDetails } from '../../../libs/types/magnet/file';

@Controller('magnet')
export class MagnetController {
  constructor(private readonly magnetService: MagnetService) {}

  @Post('parse')
  async parseMagnet(
    @Body() data: AddParamDTO,
    @Res() res: Response,
  ): Promise<void> {
    const response = await this.magnetService.parseMagnet(data.magnet);
    res.status(200).json(response);
  }

  @Post('submit')
  async submitNewTask(
    @Body() data: MagnetFileDetails,
    @Res() res: Response,
  ): Promise<void> {
    const response = await this.magnetService.submitNewTask(data);
    res.status(response.statusCode).json(response);
  }
}
