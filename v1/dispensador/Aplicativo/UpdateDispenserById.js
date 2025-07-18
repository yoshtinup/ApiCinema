export class UpdateDispenserById {
  constructor(dispenserRepository) {
    this.dispenserRepository = dispenserRepository;
  }
  async execute(id, dispenserData) {
    return await this.dispenserRepository.updateDispenserById(id, dispenserData);
  }
}
