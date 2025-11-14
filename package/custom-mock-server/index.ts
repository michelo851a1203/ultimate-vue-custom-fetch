// import { validator } from 'hono/validator';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono();

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

export default app;
