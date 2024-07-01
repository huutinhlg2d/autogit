import { EnvType, load } from "ts-dotenv";

export type Env = EnvType<typeof schema>;

export const schema = {
  REPO_URL: String,
};

export let env: Env;

export const loadEnv = () => {
  env = load(schema);
};
