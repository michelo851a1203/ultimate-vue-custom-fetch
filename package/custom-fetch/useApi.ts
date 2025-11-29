import type { MaybeRef } from 'vue'
import { z } from 'zod';
import type { RequestInputs, RequestJsonInputs } from './customFetchCore';
import { useCustomFetchCore } from './customFetchCore';

class useMainApi {
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
      isBearerTokenRequired: true,
      token,
      query,
      responseSchema,
      errorResponseSchema,
    })(url).get().json<T>();
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
      isBearerTokenRequired: true,
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
      isBearerTokenRequired: true,
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
      isBearerTokenRequired: true,
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
      isBearerTokenRequired: true,
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
    })(url).post().json<T>()
  }

  uploadWithAuth<T, E>(
    urlAndToken: [string, string],
    form: FormData,
    responseSchema?: z.ZodType<T>, 
    errorResponseSchema?: z.ZodType<E>
  ) {
    const [url, token] = urlAndToken;
    return useCustomFetchCore({
      isBearerTokenRequired: true,
      token,
      form,
      responseSchema,
      errorResponseSchema,
    })(url).post().json<T>();
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
    })(url).post().json<T>()
  }

  postFormWithAuth<T, E>(
    urlAndToken: [string, string],
    postForm: MaybeRef<Record<string, RequestInputs>>,
    responseSchema?: z.ZodType<T>, 
    errorResponseSchema?: z.ZodType<E>
  ) {
    const [url, token] = urlAndToken;
    return useCustomFetchCore({
      isBearerTokenRequired: true,
      token,
      postForm,
      responseSchema,
      errorResponseSchema,
    })(url).post().json<T>();
  }

  preview<E>(
    url: string, 
    query: MaybeRef<Record<string, RequestInputs>>, 
    errorResponseSchema?: z.ZodType<E>
  ) {
    return useCustomFetchCore({
      query,
      errorResponseSchema,
    })(url).get().blob();
  }

   previewWithAuth<E>(
    urlAndToken: [string, string],
    query: MaybeRef<Record<string, RequestInputs>>, 
    errorResponseSchema?: z.ZodType<E>
  ) {
    const [url, token] = urlAndToken;
    return useCustomFetchCore({
      isBearerTokenRequired: true,
      token,
      query,
      errorResponseSchema,
    })(url).get().blob();
  }

  // download<E>(
  //   url: string, 
  //   json: MaybeRef<RequestJsonInputs>, 
  //   errorResponseSchema?: z.ZodType<E>
  // ) {
  //   return useCustomFetchCore({
  //     json,
  //     errorResponseSchema,
  //   })(url).post().blob();
  // }
  //
  // downloadWithAuth<E>(
  //   urlAndToken: [string, string],
  //   json: MaybeRef<RequestJsonInputs>, 
  //   errorResponseSchema?: z.ZodType<E>
  // ) {
  //   const [url, token] = urlAndToken;
  //   return useCustomFetchCore({
  //     isBrearerTokenRequired: true,
  //     token,
  //     json,
  //     errorResponseSchema,
  //   })(url).post().blob()
  // }
}

export const useApi = new useMainApi();
