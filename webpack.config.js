/**
 * Webpack@5 build configuration
 * @author codejedi365
 */
// IMPORTS
const { resolve, dirname, basename } = require("path");
const { Z_DEFAULT_COMPRESSION, Z_BEST_SPEED } = require("constants");
const nodeExternals = require("webpack-node-externals");
const FileManagerPlugin = require("filemanager-webpack-plugin");
const thisModule = require("./package.json");

// CONSTANTS
const isProduction = process.env.NODE_ENV === "production";
const pkgDir = __dirname;
const entrypoint = resolve(pkgDir, "lib", "index.ts");
const outDir = (() => {
    const dir = resolve(
        __dirname,
        /^\.{1,2}|\/$/.test(dirname(thisModule.main))
            ? "dist"
            : dirname(thisModule.main)
    );
    if (dir.search(pkgDir)) {
        // Prevent malicious cleaning of directories outside of project
        throw new Error("WARNING: outDir points outside of project directory");
    }
    return dir;
})();

/**
 * Dynamic configuration function
 * @param env webpack environment object
 * @returns Webpack configuration object
 */
function buildConfig() {
    return {
        entry: entrypoint,
        output: {
            clean: true,
            path: outDir,
            filename: basename(thisModule.main),
            library: {
                type: "commonjs"
            }
        },
        plugins: [
            new FileManagerPlugin({
                runOnceInWatchMode: true,
                events: {
                    onEnd: {
                        archive: [
                            {
                                // Bundle all Docs into a compressed tarball to be included in dist/
                                source: resolve(pkgDir, "docs"),
                                destination: resolve(outDir, "docs.tar.gz"),
                                format: "tar",
                                options: {
                                    gzip: true,
                                    gzipOptions: {
                                        level: isProduction
                                            ? Z_DEFAULT_COMPRESSION
                                            : Z_BEST_SPEED
                                    }
                                }
                            }
                        ],
                        copy: [
                            {
                                source: resolve(pkgDir, "lib", "globals.d.ts"),
                                destination: resolve(
                                    outDir,
                                    basename(thisModule.types)
                                )
                            }
                        ]
                    }
                }
            })
        ],
        module: {
            rules: [
                {
                    test: /(?<!\.test)\.(ts)$/i,
                    loader: "ts-loader",
                    options: {
                        onlyCompileBundledFiles: true
                    },
                    exclude: ["/node_modules/"]
                }
            ]
        },
        optimization: {
            // minimize & mangle the output files (TerserPlugin w/ webpack@v5)
            minimize: isProduction,
            // determine which exports are used by modules and removed unused ones
            usedExports: true
        },
        resolve: {
            extensions: [".ts", ".js", ".json"]
        },
        // ignore all modules in node_modules folder (ie. do not bundle runtime dependencies)
        externals: [nodeExternals()],
        externalsPresets: {
            // ignore node built-in modules like path, fs, etc.
            node: true
        }
    };
}

module.exports = (env) => {
    const config = buildConfig(env);
    if (isProduction) {
        config.mode = "production";
    } else {
        config.mode = "development";
    }
    return config;
};
