import type { MaybeRef } from 'vue';
import { toValue } from 'vue';
import { createFetch } from '@vueuse/core'
import type { BeforeFetchContext, AfterFetchContext } from '@vueuse/core'
import { z } from 'zod';

export type RequestInput = string | number | boolean;
export type RequestInputs = RequestInput | RequestInput[];

export type RequestJsonInput = Record<string, RequestInputs>
export type RequestJsonInputs = RequestJsonInput | RequestJsonInput[] | Record<string, RequestJsonInput> | RequestInputs

type BeforeFetchFn = (ctx: BeforeFetchContext) => BeforeFetchContext;
type AfterFetchFn = (ctx: AfterFetchContext) => AfterFetchContext;

export interface CustomFetchOptions<T, E> {
  /**
   * @description 這個用於是否需要 token
   */
  isBrearerTokenRequired?: boolean

  /**
   * @description 如果 isBrearerTokenRequired 這個為 true 就會驗是否 token 有值且正確
   */
  token?: string

  /**
   * @description 用於 query string
   */
  query?: MaybeRef<Record<string, RequestInputs>>

  /**
   * @description 用於 raw json 傳輸
   */
  json?: MaybeRef<RequestJsonInputs>

  /**
   * @description 用於 formData
   */
  form?: FormData

  /**
   * @description 用於 Content-Type: application/x-www-form-urlencoded 傳輸
   */
  postForm?: MaybeRef<Record<string, RequestInputs>>

  /**
   * @description 用於驗證 response 資料型別是否合規
   */
  responseSchema?: z.ZodType<T>

  /**
   * @description 用於驗證 錯誤回傳 response 資料型別是否合規
   */
  errorResponseSchema?: z.ZodType<E>
}

/**
 * 用於建立 function stack
 * @param input: T any type 
 * @param fnList: Array of beforeFetch functions
 */
const makeFnStack = <T>(
  input: T,
  fnList: ((input: T) => T)[]
): T => fnList.reduce((acc, fn) => fn(acc), input);

const noActionContext = <T extends BeforeFetchContext | AfterFetchContext>(ctx: T): T => ctx;

/**
 * getAuthorization: Add token to the request header
 *
 * @param ctx: BeforeFetchContext
 * @returns BeforeFetchContext
 */
const getAuthorizationBeforeFetch = (
  isBearerTokenRequired: boolean = false,
  token?: string
): BeforeFetchFn => {
  if (!isBearerTokenRequired) return noActionContext<BeforeFetchContext>;
  return (ctx: BeforeFetchContext) => {
    if (!token) {
      ctx.cancel();
      return ctx;
    }
    ctx.options.headers = {
      ...ctx.options.headers,
      Authorization: `Bearer ${token}`
    };
    return ctx;
  };
};

/**
 * generateURLSearchParameters: generate url search parameters
 *
 * @param queryData: Record<string, RequestInputs>
 * @returns URLSearchParams
 */
const generateURLSearchParameters = (queryData: Record<string, RequestInputs>): URLSearchParams => {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(queryData)) {
    if (Array.isArray(value)) {
      value.forEach(el => query.append(key, el.toString()));
      continue;
    }
    if (value) {
      query.append(key, value.toString());
    }
  }
  return query;
};


/**
 * generateQueryString: Generate the query string from the query data
 *
 * @param queryData: Record<string, RequestInputs>
 * @returns string
 */
const generateQueryString = (queryData: Record<string, RequestInputs>): string => {
  const query = generateURLSearchParameters(queryData);
  const queryString = query.toString();
  return queryString.length > 0 ? `?${queryString}` : "";
};

/**
 * getQueryBeforeFetch: Add query parameters to the request
 *
 * @param MaybeRef<Record<string, RequestInputs>>
 * @returns BeforeFetchFn
 */
const getQueryBeforeFetch = (
  query?: MaybeRef<Record<string, RequestInputs>>
): BeforeFetchFn => {
  const currentQuery = toValue(query);
  if (!currentQuery) return noActionContext;
  if (Object.keys(currentQuery).length === 0) return noActionContext;
  return (ctx: BeforeFetchContext): BeforeFetchContext => {
    ctx.url += generateQueryString(currentQuery);
    return ctx;
  };
};

/**
 * getJsonFormatBeforeFetch: Format the JSON data to be sent with the request
 *
 * @param MaybeRef<RequestJsonInputs>
 * @returns BeforeFetchFn
 */
const getJsonFormatBeforeFetch = (
  jsonInput?: MaybeRef<RequestJsonInputs>
): BeforeFetchFn => {
  const currentRawData = toValue(jsonInput);
  if (!currentRawData) return noActionContext;
  return (ctx: BeforeFetchContext): BeforeFetchContext => {
    ctx.options.headers = {
      ...ctx.options.headers,
      "Content-Type": "application/json"
    };
    ctx.options.body = JSON.stringify(currentRawData);
    return ctx;
  };
};

/**
 * getJsonFormatBeforeFetch: Format the JSON data to be sent with the request
 *
 * @param MaybeRef<RequestJsonInputs>
 * @returns BeforeFetchFn
 */
const getFormDataBeforeFetch = (
  form?: FormData
): BeforeFetchFn => {
  if (!form) return noActionContext;
  return (ctx: BeforeFetchContext): BeforeFetchContext => {
    ctx.options.body = form;
    return ctx;
  };
};


/**
 * getQueryBeforeFetch: Add query parameters to the request
 *
 * @param MaybeRef<Record<string, RequestInputs>>
 * @returns BeforeFetchFn
 */
const getPostFormBeforeFetch = (
  postForm?: MaybeRef<Record<string, RequestInputs>>
): BeforeFetchFn => {
  const currentPostForm = toValue(postForm);
  if (!currentPostForm) return noActionContext;
  if (Object.keys(currentPostForm).length === 0) return noActionContext;
  return (ctx: BeforeFetchContext): BeforeFetchContext => {
    ctx.options.headers = {
      ...ctx.options.headers,
      "Content-Type": "application/x-www-form-urlencoded"
    };
    ctx.options.body = generateURLSearchParameters(currentPostForm).toString();
    return ctx;
  };
};

/**
 * responseSchemaAfterFetch : if response.ok is true, validate the response schema
 *
 * @param zod.ZodTypeAny responseSchema
 * @returns (ctx: AfterFetchContext) => AfterFetchContext
 */
const responseSchemaAfterFetch = <T>(responseSchema?: z.ZodType<T>): AfterFetchFn => {
  if (!responseSchema) return noActionContext;
  return (ctx: AfterFetchContext) => {
    if (!ctx.response.ok) return ctx;
    const validatedResponse = responseSchema.safeParse(ctx.data);
    if (!validatedResponse.success) {
      if (import.meta.env.MODE !== "production") {
        console.group("%c [api response] type error", "color: yellow;");
        console.log(validatedResponse.error);
        console.groupEnd();
      }
      throw validatedResponse.error;
    }
    return ctx;
  };
};

/**
 * errorSchemaAfterFetch : if response.ok is false, validate the error response schema
 *
 * @param zod.ZodTypeAny errorResponseSchema
 * @returns AfterFetchFn
 */
const errorSchemaAfterFetch = <E>(errorResponseSchema?: z.ZodType<E>): AfterFetchFn => {
  if (!errorResponseSchema) return noActionContext;
  return (ctx: AfterFetchContext) => {
    if (ctx.response.ok) return ctx;
    const validatedError = errorResponseSchema.safeParse(ctx.data);
    if (!validatedError.success) {
      if (import.meta.env.MODE !== "production") {
        console.group("%c [api error] type error", "color: yellow;");
        console.log(validatedError.error);
        console.groupEnd();
      }
      throw validatedError.error;
    }
    return ctx;
  };
};

/**
 * @param  options: CustomFetchOptions
 * @returns BeforeFetchFn
 * @description 這個用於註冊 beforeFetch 的方法
 */
const getBeforeFetch = <T, E>(options: CustomFetchOptions<T, E>): BeforeFetchFn => {
  const { isBrearerTokenRequired, token, query, json, form, postForm } = options;
  return (ctx: BeforeFetchContext) => makeFnStack(ctx, [
    getAuthorizationBeforeFetch(isBrearerTokenRequired, token),
    getQueryBeforeFetch(query),
    getJsonFormatBeforeFetch(json),
    getFormDataBeforeFetch(form),
    getPostFormBeforeFetch(postForm),
  ]);
};

/**
 * @param  options: CustomFetchOptions
 * @returns AfterFetchFn
 * @description 這個用於註冊 afterFetch 的方法
 */
const getAfterFetch = <T, E>(options: CustomFetchOptions<T, E>): AfterFetchFn => {
  const { responseSchema, errorResponseSchema } = options;
  return (ctx: AfterFetchContext) => makeFnStack(ctx, [
    responseSchemaAfterFetch(responseSchema),
    errorSchemaAfterFetch(errorResponseSchema)
  ]);
};

export const useCustomFetchCore = <T, E>(options: CustomFetchOptions<T, E>) => {
  return createFetch({
    baseUrl: `${import.meta.env.VITE_APP_API}`,
    options: {
      timeout: 50000,
      immediate: false,
      beforeFetch: getBeforeFetch(options),
      afterFetch: getAfterFetch(options),
    },
    fetchOptions: {
      mode: "cors",
      redirect: 'follow',
    }
  });
}

