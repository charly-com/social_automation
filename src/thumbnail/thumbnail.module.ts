import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Thumbnail, ThumbnailSchema } from './thumbnail.schema';
import { ThumbnailService } from './thumbnail.service';
import { ThumbnailController } from './thumbnail.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Thumbnail.name, schema: ThumbnailSchema },
    ]),
  ],
  providers: [ThumbnailService],
  controllers: [ThumbnailController],
  exports: [ThumbnailService],
})
export class ThumbnailModule {}
