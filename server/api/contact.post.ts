import { ContactRepository } from '../utils/common-repositories';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' });
  }

  const { name, email, subject, message, type, phone, portfolioUrl } = body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw createError({ statusCode: 422, statusMessage: 'Name is required' });
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw createError({ statusCode: 422, statusMessage: 'A valid email address is required' });
  }

  if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
    throw createError({ statusCode: 422, statusMessage: 'Subject is required' });
  }

  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    throw createError({ statusCode: 422, statusMessage: 'Message must be at least 10 characters long' });
  }

  const submissionType = type === 'contributor_application' ? 'contributor_application' : 'contact';

  const saved = await ContactRepository.saveSubmission({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: subject.trim(),
    message: message.trim(),
    type: submissionType,
    phone: phone ? String(phone).trim() : undefined,
    portfolioUrl: portfolioUrl ? String(portfolioUrl).trim() : undefined
  });

  return {
    success: true,
    submissionId: saved.id,
    message: submissionType === 'contributor_application'
      ? 'Your contributor application has been received by the TipOffPh editorial desk. We will review your portfolio and get back to you.'
      : 'Thank you for reaching out! Your message has been routed to the TipOffPh editorial team.'
  };
});
