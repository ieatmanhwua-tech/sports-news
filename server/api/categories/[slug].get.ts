import { CategoryRepository } from '../../utils/common-repositories';

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug');
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Slug required' });
  }

  const result = await CategoryRepository.getCategoryBySlug(slug);
  if (!result) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Category Not Found',
      message: `The category "${slug}" is not recognized in the TipOffPh registry.`
    });
  }

  return result;
});
