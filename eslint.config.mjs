import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // 👇 Thêm cấu hình rules ở đây
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'no-var': 'off',
      '@typescript-eslint/no-explicit-any':'off',
      'react/no-unescaped-entities':'off'
    }
  }
];

export default eslintConfig;
