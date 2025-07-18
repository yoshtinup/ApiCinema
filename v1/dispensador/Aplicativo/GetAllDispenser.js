export class GetAllDispenser {
  constructor(dispenserRepository) {
    this.dispenserRepository = dispenserRepository;
  }
  async execute() {
    return await this.dispenserRepository.getAllDispensers();
  }
}
