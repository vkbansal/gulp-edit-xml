const Stream = require('stream');
const xml2js = require('xml2js');
const isFunction = require('lodash.isfunction');
const isObject = require('lodash.isobject');
const assign = require('object-assign');
const PluginError = require('plugin-error');

const xmlEdit = function(transform, options) {
    if (!isFunction(transform)) {
        transform = function(data) {
            return data;
        };
    }

    const defaults = {
        parserOptions: {},
        builderOptions: {
            headless: true,
            renderOpts: {
                pretty: false
            }
        }
    };

    const settings = assign(defaults, options);

    const stream = new Stream.Transform({ objectMode: true });

    stream._transform = function(file, unused, done) {
        const that = this;

        if (file.isNull()) {
            return done(null, file);
        }

        if (file.isStream()) {
            return done(new PluginError('gulp-xml-edit', 'Streaming not supported'));
        }

        const content = file.contents.toString('utf-8');
        const parser = new xml2js.Parser(settings.parserOptions);
        const builder = new xml2js.Builder(settings.builderOptions);

        parser.parseString(content, function(err, data) {
            let content = transform.call(null, data);

            if (!isObject(content)) {
                done(new PluginError('gulp-xml-edit', 'transformation does not returns an object'));
                return;
            }

            content = builder.buildObject(content);
            file.contents = new Buffer(content);

            return done(null, file);
        });
    };

    return stream;
};

module.exports = xmlEdit;
