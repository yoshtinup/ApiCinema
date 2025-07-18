export class DeleteDispenserById {
  constructor(dispenserRepository) {
    this.dispenserRepository = dispenserRepository;
  }
  async execute(id) {
    return await this.dispenserRepository.deleteDispenserById(id);
  }
}
