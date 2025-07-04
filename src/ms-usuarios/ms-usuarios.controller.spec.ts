import { Test, TestingModule } from '@nestjs/testing';
import { MsUsuariosController } from './ms-usuarios.controller';
import { MsUsuariosService } from './ms-usuarios.service';

describe('MsUsuariosController', () => {
  let controller: MsUsuariosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MsUsuariosController],
      providers: [MsUsuariosService],
    }).compile();

    controller = module.get<MsUsuariosController>(MsUsuariosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
