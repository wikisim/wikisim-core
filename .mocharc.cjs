
// Copied from electrovir: https://github.com/mochajs/mocha/issues/4100#issuecomment-1166629353

function is_test_file(arg)
{
    return arg.match(/\.test\.[jt]sx?$/)
}
// const allTestFiles = './src/**/?(*.)+(spec|test).[jt]s?(x)';
const spec = "src/**/*.test.ts"  // all test files

module.exports = {
    ignore: "src/**/*.browser.test.ts",
    import: "tsx",
    extensions: ["ts", "tsx"],
    require: ["src/test/setup.js"],
    timeout: 0,
    ...(process.argv.slice(2).some(is_test_file) ? {} : {spec}),
};
