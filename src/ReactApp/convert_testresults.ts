import * as _ from 'lodash';

const convert_testresults = (old_json: string) => {
    const old_obj = JSON.parse(old_json);

    let old_obj_merged = _.get(old_obj, 'json');
    let information = _.get(old_obj, 'info.Information');
    _.entries(old_obj_merged).forEach(([k, v]: [string, any]) => {
        _.assign(v, {testcount_: _.get(information, 'testcount'),
                     submissioncount_: _.get(information, 'submissioncount')});
        if (_.get(information, k) !== undefined) {
            _.assign(v, {information_: _.get(information, k)});
        }
    });

    let testsuite_obj = {};

    let test_suite: any = {
        name: 'Test Suite',
        result: 'passed',
        children: [_.entries(old_obj_merged), _.entries(old_obj_merged.value_)]
                    .flat()
                    .filter(([k, _]: [string, any]) => !k.endsWith("_"))
                    .map(([k, v]: [string, any]) => convert_node(k, v)),
    };

    let new_obj = {children: [test_suite]};
    return JSON.stringify(new_obj);

};

const info_mapping: Record<string, string> = {
    "2": "there was no comparison done",
    "1": "all elements are the same",
    "0": "not all elemts are the same",
    "-1": "class does not agree",
    "-2": "dimension does not agree",
    "-3": "size does not agree",
    "-4": "is not present in student results",
    "-5": "can not be compared (function_handle,inline)",
    "-6": "is not present in reference results"
};

const result_mapping: Record<string, string | undefined> = {
    "2": undefined,
    "1": "passed",
    "0": "failed",
    "-1": "failed",
    "-2": "failed",
    "-3": "failed",
    "-4": "missing",
    "-5": "error",
    "-6": "missing"
};

const is_comparison = (name: string, old_obj: any) => {
    return (_.get(old_obj, 'value_.student_') !== undefined && _.get(old_obj, 'value_.reference_') !== undefined);
};

const is_single_cell = (name: string, old_obj: any) => {
    return (_.get(old_obj, 'value_.cell') !== undefined);
};

const is_multi_cell = (name: string, old_obj: any) => {
    return (_.get(old_obj, 'cell') !== undefined);
};

const is_test = (name: string, old_obj: any) => {
    return (_.get(old_obj, 'comparison') !== undefined && _.get(old_obj, 'additional') !== undefined);
};

const convert_node = (name: string, old_obj: any) => {
    if (old_obj === undefined) {
        return {name, undefined};
    }

    if (is_comparison(name, old_obj)) {
        return convert_comparison(name, old_obj);
    } else if (is_single_cell(name, old_obj)) {
        return convert_single_cell(name, old_obj);
    } else if (is_multi_cell(name, old_obj)) {
        return convert_multi_cell(name, old_obj);
    } else if (is_test(name, old_obj)) {
        return convert_test(name, old_obj);
    }

    let new_obj: any = {
        name: name,
        result: result_mapping[old_obj.comparison_],
        info: info_mapping[old_obj.info_],
        children: [_.entries(old_obj), _.entries(old_obj.value_)]
                    .flat()
                    .filter(([k, _]: [string, any]) => !k.endsWith("_"))
                    .map(([k, v]: [string, any]) => convert_node(k, v)),
    };
    return new_obj;
};

const convert_test = (name: string, old_obj: any) => {
    let new_obj: any = {
        name: name,
        result: result_mapping[old_obj.comparison.comparison_],
        info: old_obj.information_.join('\n'),
        children: [convert_node('comparison', old_obj.comparison), convert_node('figures', old_obj.figures),  convert_node('additional', old_obj.additional)],
    };
    return new_obj;
};

const convert_single_cell = (name: string, old_obj: any) => {
    let new_obj: any = {
        name: name,
        result: result_mapping[old_obj.comparison_],
        info: info_mapping[old_obj.info_],
        children: [convert_comparison(old_obj.value_.info_, old_obj.value_.cell)],
    };
    return new_obj;
};

const convert_multi_cell = (name: string, old_obj: any) => {
    return convert_comparison(old_obj.info_, old_obj.cell);
};

const convert_comparison = (name: string, old_obj: any) => {
    let student = undefined;
    let reference = undefined;

    if (old_obj.value_.student_ !== undefined) {
        student = {
            type: old_obj.value_.student_.class_,
            shape: old_obj.value_.student_.size_,
            info: old_obj.value_.student_.info_,
            value: old_obj.value_.student_.value_,
        };
    }

    if (old_obj.value_.reference_ !== undefined) {
        reference = {
            type: old_obj.value_.reference_.class_,
            shape: old_obj.value_.reference_.size_,
            info: old_obj.value_.reference_.info_,
            value: old_obj.value_.reference_.value_,
        };
    }

    let new_obj = {
        name: name,
        tag: 'comparison',
        result: result_mapping[old_obj.comparison_],
        info: info_mapping[old_obj.comparison_],
        student: student,
        reference: reference,
    };
    return new_obj;
};

export default convert_testresults;