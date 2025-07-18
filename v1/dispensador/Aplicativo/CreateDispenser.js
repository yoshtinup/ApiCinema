export class CreateDispenser {
  constructor(dispenserRepository) {
    this.dispenserRepository = dispenserRepository;
  }
  async execute(dispenserData) {
    return await this.dispenserRepository.createDispenser(dispenserData);
  }
}
