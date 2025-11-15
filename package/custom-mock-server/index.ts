// import { validator } from 'hono/validator';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { sign, verify, jwt } from 'hono/jwt';
import type { JwtVariables } from 'hono/jwt';

type Variables = JwtVariables;

export const userPayloadSchema = z.object({
  sub: z.string(),
  role: z.string(),
  exp: z.number().int().nonnegative('請輸入正整數或0'),
});

export type UserPayload = z.infer<typeof userPayloadSchema>;

const app = new Hono<{ Variables: Variables }>();

const secret = '7a37ace2a64f2b5be4395cbf53b87e8c';

export const postsSchema = z.object({
  name: z.string().min(1, '欄位必須'),
  content: z.string().optional(),
});

export type Posts = z.infer<typeof postsSchema>;

app.get('/', (ctx) => {
  return ctx.text('hello hono');
});

// query string 
app.get('/posts', (ctx) => {
  const name = ctx.req.query('name');
  const content = ctx.req.query('content');
  console.log(`\x1b[32m GET::/posts query string \x1b[0m query string -> name: ${name}, content: ${content}`);
  return ctx.json({
    name,
    content,
  })
});

// app.post('/posts', async (ctx) => {
//   const input = await ctx.req.json();
//   const validator = postsSchema.safeParse(input);
//   if (!validator.success) {
//     return ctx.json({
//       message: 'not valid message'
//     }, 405);
//   }
//   const { name, content } = validator.data;
//   return ctx.json({
//     message: `name : ${name}, content : ${content}`
//   }, 200)
// });

// app.post('/raws_post', validator('json', (value, ctx) => {
//   const body = value['body'];
//   const parsed = postsSchema.safeParse(body);
//   if (!parsed.success) {
//     return ctx.json({
//       message: 'message error'
//     }, 400);
//   }
//   return parsed.data;
// }), async (ctx) => {
//   const { name, content } = ctx.req.valid('json');
//   return ctx.json({
//     message: `name : ${name} content: ${content ?? 'none'}`
//   });
// });

// json post 
app.post('/posts', zValidator('json', postsSchema), async (ctx) => {
  const { name, content } = ctx.req.valid('json');
  console.log(`\x1b[32m POST::/posts json input \x1b[0m json body -> name: ${name}, content: ${content}`);
  return ctx.json({
    message: `name : ${name} content: ${content ?? 'none'}`
  });
});


// form data with upload
app.post('/upload', async (ctx) => {
  const body = await ctx.req.parseBody()
  const files = body['files'];
  if (files instanceof File) {
    console.log(`\x1b[32m POST::/upload FormData \x1b[0m file name : ${files.name}`);
    return ctx.json({
      name: files.name,
      size: files.size,
      type: files.type
    });
  }
  return ctx.json({ error: 'No files uploaded'}, 400)
});

// applicatoin/x-www-urlencoded form
app.post('/postform', async (ctx) => {
  const body = await ctx.req.parseBody();
  const name = body['name'];
  const content = body['content'];

  if (typeof name !== 'string' && typeof content !== 'string') {
    return ctx.json({
      error: 'not valid body'
    }, 400)
  }
  console.log(`\x1b[32m POST::/postForm postForm \x1b[0m name : ${name}, content : ${content}`);
  return ctx.json({
    message: `name is ${name}, content is ${content}`
  }, 200)
});

app.post('/sign', async (ctx) => {
  const original = {
    sub: 'user1234',
    role: 'admin',
    exp: Math.floor(Date.now() / 1000) * 60 * 5,
  }
  const token = await sign(original, secret, 'HS256');
  console.log(`\x1b[32m POST::/sign in to get token \x1b[0m token: \x1b[31m${token}\x1b[0m`);
  return ctx.json({
    token,
    ...original,
  }, 201)
});

app.use('/auth/*', jwt({ secret }));

app.get('/auth/posts', async (ctx) => {
  const payload = ctx.get('jwtPayload');
  const name = ctx.req.query('name');
  const content = ctx.req.query('content');
  console.log(`\x1b[31m GET::/posts query string \x1b[0m query string -> name: ${name}, content: ${content}`);
  return ctx.json({
    name,
    content,
    ...payload,
  });
});

app.post('auth/posts', zValidator('json', postsSchema), async (ctx) => {
  const payload = ctx.get('jwtPayload');
  const { name, content } = ctx.req.valid('json');
  console.log(`\x1b[31m POST::/posts json input \x1b[0m json body -> name: ${name}, content: ${content}`);
  return ctx.json({
    message: `name : ${name} content: ${content ?? 'none'}`,
    ...payload,
  });
});

app.post('auth/upload', async (ctx) => {
  const body = await ctx.req.parseBody()
  const payload = ctx.get('jwtPayload');
  const files = body['files'];
  if (files instanceof File) {
    console.log(`\x1b[31m POST::auth/upload FormData \x1b[0m file name : ${files.name}`);
    return ctx.json({
      name: files.name,
      size: files.size,
      type: files.type,
      ...payload,
    });
  }
  return ctx.json({ error: 'No files uploaded'}, 400)
});

app.post('auth/postform', async (ctx) => {
  const body = await ctx.req.parseBody();
  const payload = ctx.get('jwtPayload');
  const name = body['name'];
  const content = body['content'];

  if (typeof name !== 'string' && typeof content !== 'string') {
    return ctx.json({
      error: 'not valid body'
    }, 400)
  }
  console.log(`\x1b[31m POST::auth/postForm postForm \x1b[0m name : ${name}, content : ${content}`);
  return ctx.json({
    message: `name is ${name}, content is ${content}`,
    ...payload,
  }, 200)
});

export default app;
