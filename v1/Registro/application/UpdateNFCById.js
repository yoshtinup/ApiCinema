export class UpdateNFCById {
  constructor(registroRepository) {
    this.registroRepository = registroRepository;
  }
  async execute(id, nfc) {
    return await this.registroRepository.updateNFCById(id, nfc);
  }
}
