import { z } from 'zod';
import fs from 'fs';
import { describe, it, expect } from 'vitest';
import { useApi }  from '@demo-api-infra/custom-fetch';

describe('testing with auth usage(JWT)', async () => {
  const apiUtils = useApi();

  const postsSchema = z.object({
    name: z.string().min(1, '欄位必須'),
    content: z.string(),
  });

  const signResponseSchema = z.object({
    token: z.string().min(1, 'required'),
    sub: z.string().min(1, 'sub is required'),
    role: z.string().min(1, 'role is required'),
    exp: z.number().int().nonnegative('請輸入正整數或0'),
  });

  const { data: signInResponse, execute: signExecute } = apiUtils.post('/sign', {}, signResponseSchema);
  await signExecute();
  const signInValidator = signResponseSchema.safeParse(signInResponse.value);
  expect(signInValidator.success).toBe(true);
  expect(signInValidator.data?.token).toBeTypeOf('string');
  const signResult = signInValidator.data;
  const token = signResult?.token ?? '';

  const original = !signResult ? null : {
    sub: signResult.sub,
    role: signResult.role,
    exp: signResult.exp,
  }
  expect(original).not.toBe(null);
  if (original === null) {
    return;
  }

  it('get :: auth query string', async () => {
    const query = {
      name: 'testing',
      content: 'hello',
    }

    const { data, execute } = apiUtils.getWithAuth(['/auth/posts', token], query, postsSchema);
    await execute();
    const expected = {
      ...query,
      ...original
    }
    expect(data.value).toMatchObject(expected);
  });

  it('post :: auth json post', async () => {
    const jsonInput = {
      name: 'testing cool',
      content: 'this is content',
    }
    const expected = `name : ${jsonInput.name} content: ${jsonInput.content ?? 'none'}`;
    const postsMessageJsonSchema = z.object({
      message: z.string().min(1, 'required'),
    });

    const { data, execute } = apiUtils.postWithAuth(['auth/posts', token], jsonInput, postsMessageJsonSchema);
    await execute();
    expect(data.value).toMatchObject({
      message: expected,
      ...original,
    });
  });

  it('post :: auth upload', async () => {
    const uploadFileResponseSchema = z.object({
      name: z.string().min(1, 'name required'),
      size: z.number().positive(),
      type: z.string().min(1, 'name required'),
    });

    const content = fs.readFileSync('./sample.txt')

    const blob = new Blob([content], { type: 'text/plain' });
    const form = new FormData()
    form.append('files', blob, 'sample.txt');
    expect(form.has('files')).toBe(true);
    expect(form.get('files')).toBeInstanceOf(Blob);

    const { data, execute } = apiUtils.uploadWithAuth(['auth/upload', token], form, uploadFileResponseSchema);
    await execute();
    expect(data.value).toMatchObject({
      name: 'sample.txt',
      size: blob.size,
      type: 'text/plain;charset=utf-8',
      ...original,
    });
  });

  it('post :: auth postform', async () => {
    const postFormResponseSchema = z.object({
      message: z.string(),
    });

    const postForm = new URLSearchParams();
    postForm.append('name', 'sample content');
    postForm.append('content', 'sample content');
    const postFormJsonInput = {
      name: 'sample content',
      content: 'sample content',
    }
    const { data, execute } = apiUtils.postFormWithAuth(['auth/postform', token], postFormJsonInput, postFormResponseSchema);
    await execute();
    expect(data.value).toMatchObject({
      message: `name is ${postFormJsonInput.name}, content is ${postFormJsonInput.content}`,
      ...original
    });
  });

  it('get:: auth preview pdf', async () => {
    const { data, execute } = apiUtils.previewWithAuth(['/auth/preview-pdf', token], {});
    await execute();
    const filePdfBlob = data.value;
    expect(filePdfBlob).toBeInstanceOf(Blob);
    expect(filePdfBlob?.size).toBeGreaterThan(0);
    expect(filePdfBlob?.type).toBe('application/pdf');
  });
});
