declare module "@eslint/migrate-config/src/migrate-config" {
    import type { Linter } from "eslint";
    import type { MigrationImport } from "@eslint/migrate-config/src/types";

    /**
     * Migrates an eslintrc config to flat config format.
     * @param config The eslintrc config to migrate.
     * @param options An object of the following options:
     *   - sourceType: The module type to output.
     *   - ignorePatterns: An array of glob patterns to ignore.
     *   - gitignore: `true` to include contents of a .gitignore file.
     *
     * @returns The migrated config and any messages to display to the user.
     */
    // eslint-disable-next-line import/prefer-default-export
    export function migrateConfig(
        config: Linter.Config,
        options?: {
            sourceType?: "module" | "commonjs";
            ignorePatterns?: string[];
            gitignore?: boolean;
        }
    ): {
        code: string;
        messages: Array<string>;
        imports: Map<string, MigrationImport>;
    };
}
