var Stream = require('stream'),
    xml2js = require('xml2js'),
    _ = require('lodash'),
    gutil = require('gulp-util');
 
var xmlEdit = function(transform, options){

    if(!_.isFunction(transform)){
        transform = function(data){
            return data;
        };
    }
    
    var defaults = {
        parserOptions: {},
        builderOptions: {
            headless:true,
            renderOpts:{
                pretty: false
            }
        }
    }

    var settings = _.assign(defaults,options);

    var stream = new Stream.Transform({ objectMode: true });

    stream._transform = function(file, unused, done){
        
        var that = this;

        if (file.isNull()) {
            return done(null, file);
        }
 
        if (file.isStream()) {
          return done(new gutil.PluginError('gulp-xml-edit', 'Streaming not supported'));
        }

        
        var content = file.contents.toString('utf-8'),
            parser = new xml2js.Parser(settings.parserOptions),
            builder = new xml2js.Builder(settings.builderOptions);

        parser.parseString(content, function(err,data){
            var content = transform.call(null, data);
            if(!_.isObject(content)){
                done(new gutil.PluginError('gulp-xml-edit', 'transformation does not returns an object'));
                return;
            }
            content = builder.buildObject(content);
            file.contents = new Buffer(content);
            return done(null, file);
        });
    };
    
    return stream;
}
 
module.exports = xmlEdit;
