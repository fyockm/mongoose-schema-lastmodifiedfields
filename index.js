var mongoose = require("mongoose"),
    _ = require("underscore");

module.exports = exports = function lastModifiedFields(schema, options) {
    options = _.extend({fieldSuffix:"_lastModifiedDate"}, options);
    var omittedFields = _.union(options.omittedFields, ['_id', schema.options.discriminatorKey, schema.options.versionKey]);
    var modifedFieldSuffix = options.fieldSuffix;

    schema.eachPath(function(pathName, schemaType) {
        // if the path does not already have the modification date suffix, and we are supposed to be inluding this
        if ( pathName.indexOf(modifedFieldSuffix) === -1 && omittedFields.indexOf(pathName) === -1 )
        {
            var addObj = {};
            addObj[pathName+modifedFieldSuffix] = { type: Date };
            schema.add(addObj);
        }
    });

    schema.pre('save', function(next) {
        var updateTimestamp = new Date();
        _.each(this.modifiedPaths(), function(modifiedPath) {
            if ( modifiedPath.indexOf(modifedFieldSuffix) === -1 )
            {
                var modifiedDatePath = modifiedPath + modifedFieldSuffix;
                if ( this.schema.paths[modifiedDatePath] )
                {
                    this.set(modifiedDatePath, updateTimestamp);
                }
            }
        }, this);
        next();
    });
};