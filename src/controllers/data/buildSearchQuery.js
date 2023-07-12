const buildMultidropdownFilter = (key, value) => ({
    field: key,
    operator: 'IN',
    value: value || [],
});

const buildDateboxFilter = (key, value) => ({
    field: key,
    operator: '>',
    value: value,
});

const builders = {
    multidropdown: buildMultidropdownFilter,
    datebox: buildDateboxFilter,
};

const buildFilter = ({filter, value}) => {
    const builder = builders[filter.type];

    return builder(filter.id, value);
};

export const buildSearchQuery = (filters) => {
    const res = filters.map(buildFilter);

    if (res.length > 1) {
        return {
            operator: 'AND',
            value: res,
        };
    } else {
        return res[0];
    }
};
