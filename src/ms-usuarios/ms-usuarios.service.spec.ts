import { Test, TestingModule } from '@nestjs/testing';
import { MsUsuariosService } from './ms-usuarios.service';

describe('MsUsuariosService', () => {
  let service: MsUsuariosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MsUsuariosService],
    }).compile();

    service = module.get<MsUsuariosService>(MsUsuariosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
