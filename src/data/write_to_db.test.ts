import { expect } from "chai"

import { IdAndVersion } from "./id"
import { DataComponent } from "./interface"
import { prepare_data_component_for_db_insert, prepare_data_component_for_db_update } from "./write_to_db"


describe("prepare_data_component_for_db_insert", function ()
{
    function data_component_fixture(): DataComponent {
        return {
            id: new IdAndVersion(-1, 1),
            owner_id: "owner-123",
            editor_id: "editor-123",
            created_at: new Date("2023-01-01T00:00:00Z"),
            comment: "Test comment",
            bytes_changed: 100,
            version_type: undefined,
            version_rolled_back_to: undefined,
            title: "<p>Test Title</p>",
            description: "<p>Test Description</p>",
            label_ids: [-3, -4],
            input_value: "123",
            result_value: "123",
            value_type: "number",
            value_number_display_type: "bare",
            value_number_sig_figs: 2,
            datetime_range_start: new Date("2023-01-01T00:00:00Z"),
            datetime_range_end: new Date("2023-01-02T00:00:00Z"),
            datetime_repeat_every: undefined,
            units: "units",
            dimension_ids: [new IdAndVersion(-2, 1)],

            plain_title: "",
            plain_description: "",
        }
    }

    it("should prepare data component for DB insert", function ()
    {
        const data_component: DataComponent = data_component_fixture()

        const result = prepare_data_component_for_db_insert(data_component)
        expect(result).to.have.property("p_id", data_component.id.id)
        expect(result).to.not.have.property("p_version_number")
        expect(result).to.have.property("p_owner_id", data_component.owner_id)
        expect(result).to.not.have.property("p_editor_id", data_component.editor_id)
        expect(result).to.not.have.property("p_created_at")
        expect(result).to.have.property("p_comment", data_component.comment)
        expect(result).to.have.property("p_bytes_changed", data_component.bytes_changed)
        expect(result).to.have.property("p_version_type", data_component.version_type)
        expect(result).to.have.property("p_value_number_display_type", data_component.value_number_display_type)
        expect(result).to.have.property("p_value_number_sig_figs", data_component.value_number_sig_figs)
        expect(result).to.have.property("p_version_rolled_back_to", data_component.version_rolled_back_to)
        expect(result).to.have.property("p_title", data_component.title)
        expect(result).to.have.property("p_description", data_component.description)
        expect(result).to.have.property("p_label_ids").that.deep.equals(data_component.label_ids)
        expect(result).to.have.property("p_input_value", data_component.input_value)
        expect(result).to.have.property("p_result_value", data_component.result_value)
        expect(result).to.have.property("p_value_type", data_component.value_type)
        expect(result).to.have.property("p_datetime_range_start", data_component.datetime_range_start!.toISOString())
        expect(result).to.have.property("p_datetime_range_end", data_component.datetime_range_end!.toISOString())
        expect(result).to.have.property("p_datetime_repeat_every", data_component.datetime_repeat_every)
        expect(result).to.have.property("p_units", data_component.units)
        expect(result).to.have.property("p_dimension_ids").that.deep.equals(data_component.dimension_ids!.map(d => d.to_str()))
        expect(result).to.have.property("p_plain_title", "Test Title")
        expect(result).to.have.property("p_plain_description", "Test Description")
        expect(result).to.have.property("p_test_run_id", undefined)
    })

    it("should prepare data component for DB update", function ()
    {
        const data_component: DataComponent = data_component_fixture()

        const result = prepare_data_component_for_db_update(data_component)
        expect(result).to.have.property("p_id", data_component.id.id)
        expect(result).to.have.property("p_version_number")
        expect(result).to.not.have.property("p_owner_id", data_component.owner_id)
        expect(result).to.not.have.property("p_editor_id", data_component.editor_id)
        expect(result).to.not.have.property("p_created_at")
        expect(result).to.have.property("p_comment", data_component.comment)
        expect(result).to.have.property("p_bytes_changed", data_component.bytes_changed)
        expect(result).to.have.property("p_version_type", data_component.version_type)
        expect(result).to.have.property("p_value_number_display_type", data_component.value_number_display_type)
        expect(result).to.have.property("p_value_number_sig_figs", data_component.value_number_sig_figs)
        expect(result).to.have.property("p_version_rolled_back_to", data_component.version_rolled_back_to)
        expect(result).to.have.property("p_title", data_component.title)
        expect(result).to.have.property("p_description", data_component.description)
        expect(result).to.have.property("p_label_ids").that.deep.equals(data_component.label_ids)
        expect(result).to.have.property("p_input_value", data_component.input_value)
        expect(result).to.have.property("p_result_value", data_component.result_value)
        expect(result).to.have.property("p_value_type", data_component.value_type)
        expect(result).to.have.property("p_datetime_range_start", data_component.datetime_range_start!.toISOString())
        expect(result).to.have.property("p_datetime_range_end", data_component.datetime_range_end!.toISOString())
        expect(result).to.have.property("p_datetime_repeat_every", data_component.datetime_repeat_every)
        expect(result).to.have.property("p_units", data_component.units)
        expect(result).to.have.property("p_dimension_ids").that.deep.equals(data_component.dimension_ids!.map(d => d.to_str()))
        expect(result).to.have.property("p_plain_title", "Test Title")
        expect(result).to.have.property("p_plain_description", "Test Description")
        expect(result).to.not.have.property("p_test_run_id", undefined)
    })
})
