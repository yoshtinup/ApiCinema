export class GetDispenserById {
  constructor(dispenserRepository) {
    this.dispenserRepository = dispenserRepository;
  }
  async execute(id) {
    return await this.dispenserRepository.getDispenserById(id);
  }
}
