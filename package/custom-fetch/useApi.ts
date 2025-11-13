import type { MaybeRef } from 'vue'
import { z } from 'zod';
import type { RequestInputs, RequestJsonInputs } from './customFetchCore';
import { useCustomFetchCore } from './customFetchCore';

class useApi {
  constructor() {
  }

  get<T, E>(
    url: string, 
    query: MaybeRef<Record<string, RequestInputs>>, 
    responseSchema?: z.ZodType<T>, 
    errorResponseSchema?: z.ZodType<E>
  ) {
    return useCustomFetchCore<T, E>({
      query,
      responseSchema,
      errorResponseSchema,
    })(url).get().json<T>()
  }

  getWithAuth<T, E>(
    urlAndToken: [string, string],
    query: MaybeRef<Record<string, RequestInputs>>, 
    responseSchema?: z.ZodType<T>, 
    errorResponseSchema?: z.ZodType<E>
  ) {
    const [url, token] = urlAndToken;
    return useCustomFetchCore({
      isBrearerTokenRequired: true,
      token,
      query,
      responseSchema,
      errorResponseSchema,
    })(url).json<T>();
  }

  post<T, E>(
    url: string, 
    json: MaybeRef<RequestJsonInputs>, 
    responseSchema?: z.ZodType<T>, 
    errorResponseSchema?: z.ZodType<E>
  ) {
    return useCustomFetchCore<T, E>({
      json,
      responseSchema,
      errorResponseSchema,
    })(url).post().json<T>()
  }

  postWithAuth<T, E>(
    urlAndToken: [string, string],
    json: MaybeRef<RequestJsonInputs>, 
    responseSchema?: z.ZodType<T>, 
    errorResponseSchema?: z.ZodType<E>
  ) {
    const [url, token] = urlAndToken;
    return useCustomFetchCore<T, E>({
      isBrearerTokenRequired: true,
      token,
      json,
      responseSchema,
      errorResponseSchema,
    })(url).post().json<T>()
  }

  put<T, E>(
    url: string, 
    json: MaybeRef<RequestJsonInputs>, 
    responseSchema?: z.ZodType<T>, 
    errorResponseSchema?: z.ZodType<E>
  ) {
    return useCustomFetchCore<T, E>({
      json,
      responseSchema,
      errorResponseSchema,
    })(url).put().json<T>()
  }

  putWithAuth<T, E>(
    urlAndToken: [string, string],
    json: MaybeRef<RequestJsonInputs>, 
    responseSchema?: z.ZodType<T>, 
    errorResponseSchema?: z.ZodType<E>
  ) {
    const [url, token] = urlAndToken;
    return useCustomFetchCore<T, E>({
      isBrearerTokenRequired: true,
      token,
      json,
      responseSchema,
      errorResponseSchema,
    })(url).put().json<T>()
  }

  delete(url: string) {
    return useCustomFetchCore({})(url).delete().statusCode.value;
  }

  deleteWithAuth(urlAndToken: [string, string]) {
    const [url, token] = urlAndToken;
    return useCustomFetchCore({
      isBrearerTokenRequired: true,
      token
    })(url).delete().statusCode.value;
  }

  patch<T, E>(
    url: string, 
    json: MaybeRef<RequestJsonInputs>, 
    responseSchema?: z.ZodType<T>, 
    errorResponseSchema?: z.ZodType<E>
  ) {
    return useCustomFetchCore<T, E>({
      json,
      responseSchema,
      errorResponseSchema,
    })(url).put().json<T>()
  }

  patchWithAuth<T, E>(
    urlAndToken: [string, string],
    json: MaybeRef<RequestJsonInputs>, 
    responseSchema?: z.ZodType<T>, 
    errorResponseSchema?: z.ZodType<E>
  ) {
    const [url, token] = urlAndToken;
    return useCustomFetchCore<T, E>({
      isBrearerTokenRequired: true,
      token,
      json,
      responseSchema,
      errorResponseSchema,
    })(url).put().json<T>()
  }

  upload<T, E>(
    url: string, 
    form: FormData,
    responseSchema?: z.ZodType<T>, 
    errorResponseSchema?: z.ZodType<E>
  ) {
    return useCustomFetchCore<T, E>({
      form,
      responseSchema,
      errorResponseSchema,
    })(url).get().json<T>()
  }

  uploadWithAuth<T, E>(
    urlAndToken: [string, string],
    form: FormData,
    responseSchema?: z.ZodType<T>, 
    errorResponseSchema?: z.ZodType<E>
  ) {
    const [url, token] = urlAndToken;
    return useCustomFetchCore({
      isBrearerTokenRequired: true,
      token,
      form,
      responseSchema,
      errorResponseSchema,
    })(url).json<T>();
  }

  postForm<T, E>(
    url: string, 
    postForm: MaybeRef<Record<string, RequestInputs>>,
    responseSchema?: z.ZodType<T>, 
    errorResponseSchema?: z.ZodType<E>
  ) {
    return useCustomFetchCore<T, E>({
      postForm,
      responseSchema,
      errorResponseSchema,
    })(url).get().json<T>()
  }

  postFormWithAuth<T, E>(
    urlAndToken: [string, string],
    postForm: MaybeRef<Record<string, RequestInputs>>,
    responseSchema?: z.ZodType<T>, 
    errorResponseSchema?: z.ZodType<E>
  ) {
    const [url, token] = urlAndToken;
    return useCustomFetchCore({
      isBrearerTokenRequired: true,
      token,
      postForm,
      responseSchema,
      errorResponseSchema,
    })(url).json<T>();
  }
}

export default new useApi();
