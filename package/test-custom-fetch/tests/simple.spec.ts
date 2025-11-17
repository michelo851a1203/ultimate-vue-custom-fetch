import fs from 'fs';
import { z } from 'zod';
import { useApi }  from '@demo-api-infra/custom-fetch';
import { describe, it, expect } from 'vitest';

describe('\x1b[032m testing useApi methods success usage\x1b[0m', () => {
  const apiUtils = useApi();

  const postsSchema = z.object({
    name: z.string().min(1, '欄位必須'),
    content: z.string(),
  });

  it('get :: query string', async () => {
    const query = {
      name: 'testing',
      content: 'hello',
    }

    const { data, execute } = apiUtils.get('/posts', query, postsSchema);
    await execute();
    expect(data.value).toMatchObject(query);
  });

  it('post :: json post', async () => {
    const jsonInput = {
      name: 'testing cool',
      content: 'this is content',
    }
    const expected = `name : ${jsonInput.name} content: ${jsonInput.content ?? 'none'}`;
    const postsMessageJsonSchema = z.object({
      message: z.string().min(1, 'required'),
    });

    const { data, execute } = apiUtils.post('/posts', jsonInput, postsMessageJsonSchema);
    await execute();
    expect(data.value).toMatchObject({
      message: expected,
    });
  });

  it('post :: upload', async () => {
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

    const { data, execute } = apiUtils.upload('/upload', form, uploadFileResponseSchema);
    await execute();
    expect(data.value).toMatchObject({
      name: 'sample.txt',
      size: blob.size,
      type: 'text/plain;charset=utf-8'
    });
  });

  it('post :: postform', async () => {
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
    const { data, execute } = apiUtils.postForm('/postform', postFormJsonInput, postFormResponseSchema);
    await execute();
    expect(data.value).toMatchObject({
      message: `name is ${postFormJsonInput.name}, content is ${postFormJsonInput.content}`
    });
  });

  it('get:: preview pdf', async () => {
    const { data, execute } = apiUtils.preview('/preview-pdf', {});
    await execute();
    const filePdfBlob = data.value;
    expect(filePdfBlob).toBeInstanceOf(Blob);
    expect(filePdfBlob?.size).toBeGreaterThan(0);
    expect(filePdfBlob?.type).toBe('application/pdf');
  });
});
