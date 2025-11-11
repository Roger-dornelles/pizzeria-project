import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from './upload.service';
import {
  uploadFileToSupabase,
  deleteFileFromSupabase,
} from 'src/storage/storage.client';
import { Injectable, NotFoundException } from '@nestjs/common';

describe('UploadService', () => {
  let service: UploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadService],
    }).compile();

    service = module.get<UploadService>(UploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
