declare module 'gulp-edit-xml' {
  import * as Xml2JS from 'xml2js';
  function gulpExitXml(
    transform: (data: any, file: any) => any,
    options?: { parserOptions?: Xml2JS.OptionsV2; builderOptions?: Xml2JS.OptionsV2 }
  ): void;

  export default gulpExitXml;
}
