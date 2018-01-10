const xmlEdit = require('../index.js');
const es = require('event-stream');
const Vinyl = require('vinyl');

describe('gulp-xml-edit', function() {
    it('should work in buffer mode', function(done) {
        const stream = xmlEdit();
        const fakeBuffer = new Buffer('<svg/>');
        const fakeFile = new Vinyl({ contents: fakeBuffer });

        stream.on('data', file => expect(file.contents.toString()).toEqual(fakeBuffer.toString()));
        stream.on('end', () => done());
        stream.write(fakeFile);
        stream.end();
    });

    it('should let null files pass through', function(done) {
        const stream = xmlEdit();
        const fakeFile = new Vinyl({ path: 'null.md', contents: null });
        let n = 0;

        stream.pipe(
            es.through(
                file => {
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

    it('should transform as expected', function(done) {
        const stream = xmlEdit(data => {
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
                file => {
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
});
