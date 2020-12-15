import {parse as parsePath} from 'path';
import {ESLintUtils} from '@typescript-eslint/experimental-utils';

const REPO_URL = "https://github.com/testcafe-community/eslint-plugin-testcafe-community";
import { version } from '../package.json';


export const createRule = ESLintUtils.RuleCreator(name => {
    const ruleName = parsePath(name).name;
    return `${REPO_URL}/blob/tree/master/docs/rules/${ruleName}.md`;
})
