import next from "eslint-config-next";

const config = [
  { ignores: [".next/**", "src/generated/**", "node_modules/**"] },
  ...next,
];

export default config;
