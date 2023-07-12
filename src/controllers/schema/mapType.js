const IntercomToSchemaTypes = {
    string: {type: 'text'},
    integer: {type: 'number', subType: 'integer'},
    float: {type: 'number'},
    boolean: {type: 'text', subType: 'boolean'},
    date: {type: 'date'},
};

export const mapType = (dataType) => IntercomToSchemaTypes[dataType];
