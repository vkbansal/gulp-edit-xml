const xmlEdit = require('./gulp-edit-xml');
const es = require('event-stream');
const Vinyl = require('vinyl');

describe('gulp-xml-edit', () => {
	it('should work in buffer mode', (done) => {
		const stream = xmlEdit();
		const fakeBuffer = new Buffer('<svg/>');
		const fakeFile = new Vinyl({ contents: fakeBuffer });

		stream.on('data', (file) =>
			expect(file.contents.toString()).toEqual(fakeBuffer.toString())
		);
		stream.on('end', () => done());
		stream.write(fakeFile);
		stream.end();
	});

	it('should let null files pass through', (done) => {
		const stream = xmlEdit();
		const fakeFile = new Vinyl({ path: 'null.md', contents: null });
		let n = 0;

		stream.pipe(
			es.through(
				(file) => {
					expect(file.path).toBe('null.md');
					expect(file.contents).toBe(null);
					n++;
				},
				() => {
					expect(n).toBe(1);
					done();
				}
			)
		);

		stream.write(fakeFile);
		stream.end();
	});

	it('should transform as expected', (done) => {
		const stream = xmlEdit((data) => {
			delete data.svg.g[0].circle[0].$.transform;
			return data;
		});
		const fakeBuffer = new Buffer(
			"<svg><g><circle cx='20' cy='20' cr='20' transform='translate(20 20)'/></g></svg>"
		);
		const fakeFile = new Vinyl({
			contents: fakeBuffer
		});
		let n = 0;

		stream.pipe(
			es.through(
				(file) => {
					expect(file.contents.toString()).toBe(
						'<svg><g><circle cx="20" cy="20" cr="20"/></g></svg>'
					);
					n++;
				},
				() => {
					expect(n).toBe(1);
					done();
				}
			)
		);

		stream.write(fakeFile);
		stream.end();
	});

	it('should pass the raw file to the transform', (done) => {
		let captured = null;
		const stream = xmlEdit((data, file) => {
			delete data.svg.g[0].circle[0].$.transform;
			captured = file.name;
			return data;
		});
		const fakeBuffer = new Buffer(
			"<svg><g><circle cx='20' cy='20' cr='20' transform='translate(20 20)'/></g></svg>"
		);
		const fakeFile = new Vinyl({
			contents: fakeBuffer,
			name: 'expected.xml'
		});
		let n = 0; // eslint-disable-line no-unused-vars

		stream.pipe(
			es.through(
				(file) => {
					expect(file.contents.toString()).toBe(
						'<svg><g><circle cx="20" cy="20" cr="20"/></g></svg>'
					);
					n++;
				},
				() => {
					expect(captured).not.toBe(null);
					expect(captured).toBe('expected.xml');
					done();
				}
			)
		);

		stream.write(fakeFile);
		stream.end();
	});
});
