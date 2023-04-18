import babel from 'rollup-plugin-babel';
import terser from '@rollup/plugin-terser';

export default {
	input: 'src/index.js',
	output: [{
		file: 'dist/memman-transform.js',
		format: 'esm',
	}, {
		file: 'dist/bundle.min.js',
		format: 'iife',
		name: 'version',
		plugins: [terser()]
	}],
	plugins: [
		babel({
			babelrc: false,
			presets: ['@babel/preset-env'],
			plugins: ['@babel/plugin-transform-runtime'],
			runtimeHelpers: true,
		}),
	],
};