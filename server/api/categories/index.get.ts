import { CategoryRepository } from '../../utils/common-repositories';

export default defineEventHandler(async () => {
  const categories = await CategoryRepository.getAllCategoriesWithCounts();
  return { categories };
});
