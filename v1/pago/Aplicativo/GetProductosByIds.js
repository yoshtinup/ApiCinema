export class GetProductosByIds {
  constructor(pagoRepository) {
    this.pagoRepository = pagoRepository;
  }

  async execute(ids) {
    return await this.pagoRepository.getProductosByIds(ids);
  }
}
