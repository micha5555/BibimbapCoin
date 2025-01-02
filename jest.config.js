module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: [
        '/node_modules/', // Ignoruj folder node_modules
        '/dist/test/'     // Ignoruj folder dist/test
    ],
};