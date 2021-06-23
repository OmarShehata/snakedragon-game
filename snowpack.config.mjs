export default {
  exclude: ['**/node_modules/**/*', 'todo', 'todo_old'],
  optimize: {
    bundle: true,
    minify: true,
    target: 'es2018',
  },
};