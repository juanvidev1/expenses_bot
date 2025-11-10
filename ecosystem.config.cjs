module.exports = {
  apps : [{
    name   : "expenses-app",
    script : "./src/index.js",
    watch: true,
    env: {
     "NODE_ENV": "development"
    }
  }]
}
