import { expect } from "chai"
import * as z from "zod"

import { tiptap_mention_chip } from "../../rich_text/tiptap_mention_chip"
import { flatten_data_component_to_json, hydrate_data_component_from_json } from "../convert_between_json"
import { IdAndVersion, parse_id } from "../id"
import { DataComponentsByIdv } from "../interface"
import { init_data_component } from "../modify"
import { make_field_validators } from "../validate_fields"
import { data_components_by_idv } from "./data_components_by_id"
import { Graph, make_graph } from "./graph"


describe("graph", () =>
{
    const parser = new DOMParser()

    const data = [
        init_data_component({ id: IdAndVersion.from_str("1v1"), title: "A value" }),
        init_data_component({ id: IdAndVersion.from_str("2v1"), title: "A top plan", input_value: `${tiptap_mention_chip("1v1")} + 2` }),
        init_data_component({ id: IdAndVersion.from_str("3v1"), title: "An author" }),
        init_data_component({ id: IdAndVersion.from_str("4v1"), title: "An alternative value", subject_id: 1, according_to_id: 3 }),
        init_data_component({ id: IdAndVersion.from_str("5v1"), title: "An alternative plan", input_value: `${tiptap_mention_chip("4v1")} + 3`, subject_id: 2, according_to_id: 3 }),

        init_data_component({ id: IdAndVersion.from_str("1v2"), title: "A value (newer version)" }),
        init_data_component({ id: IdAndVersion.from_str("2v2"), title: "A top plan (newer version)", input_value: `${tiptap_mention_chip("1v2")} + 2` }),

        init_data_component({ id: IdAndVersion.from_str("6v1"), title: "Something that references two different versions", input_value: `${tiptap_mention_chip("1v2")} + ${tiptap_mention_chip("1v1")}` }),
    ].map(flatten_data_component_to_json)
    const field_validators = make_field_validators(z)
    const components = data.map(d => hydrate_data_component_from_json(d, field_validators))
    const data_map: DataComponentsByIdv = data_components_by_idv(components)

    it("makes a graph from a list of components and idv_of_interest and ignores data from other graph", () =>
    {
        const graph = make_graph(parser, data_map, { idv_of_interest: parse_id("2v2", true) })
        const minimised = minimise_graph(graph)

        expect(minimised.map_concept_ids).deep.equals({
            1: "1v2",
            2: "2v2",
        })

        expect(minimised.nodes).deep.equals({
            "1v2": {
                title: "A value (newer version)",
                children: [],
            },
            "2v2": {
                title: "A top plan (newer version)",
                children: ["1v2"],
            },
        })
    })


    it("makes a graph from a idv_of_interest and map_concept_ids its subject_ids (the id_of_concepts) back to the id versions of interest", () =>
    {
        const graph = make_graph(parser, data_map, { idv_of_interest: parse_id("5v1", true), idv_of_concepts: parse_id("2v2", true) })

        const minimised = minimise_graph(graph)

        expect(minimised.map_concept_ids).deep.equals({
            1: "4v1",
            2: "5v1",
        })

        expect(minimised.nodes).deep.equals({
            "4v1": {
                title: "An alternative value",
                children: [],
            },
            "5v1": {
                title: "An alternative plan",
                children: ["4v1"],
            },
        })
    })


    it("makes a graph from a idv_of_interest, uses it also for concepts and compares to another graph", () =>
    {
        const graph = make_graph(parser, data_map, { idv_of_interest: parse_id("2v2", true), idv_of_comparison: parse_id("5v1", true) })

        const minimised = minimise_graph(graph)

        expect(minimised.map_concept_ids).deep.equals({
            1: "1v2",
            2: "2v2",
        })

        expect(minimised.nodes).deep.equals({
            "1v2": {
                title: "A value (newer version)",
                children: [],
                alternatives: ["4v1"],
            },
            "2v2": {
                title: "A top plan (newer version)",
                children: ["1v2"],
                alternatives: ["5v1"],
            },

            // referenced alternatives
            "4v1": {
                title: "An alternative value",
                children: [],
            },
            "5v1": {
                title: "An alternative plan",
                children: ["4v1"],
            },
        })
    })


    it("makes a graph from a idv_of_interest, uses a different graph for concepts and compares to another graph", () =>
    {
        const graph = make_graph(parser, data_map, { idv_of_concepts: parse_id("2v2", true), idv_of_interest: parse_id("5v1", true), idv_of_comparison: parse_id("2v2", true) })

        const minimised = minimise_graph(graph)

        expect(minimised.map_concept_ids).deep.equals({
            1: "4v1",
            2: "5v1",
        })

        expect(minimised.nodes).deep.equals({
            "1v2": {
                title: "A value (newer version)",
                children: [],
            },
            "2v2": {
                title: "A top plan (newer version)",
                children: ["1v2"],
            },

            // referenced alternatives
            "4v1": {
                title: "An alternative value",
                children: [],
                alternatives: ["1v2"],
            },
            "5v1": {
                title: "An alternative plan",
                children: ["4v1"],
                alternatives: ["2v2"],
            },
        })
    })


    describe("older idv_of_interest versions", () =>
    {

        it("can make a graph from an older idv_of_interest version", () =>
        {
            const graph = make_graph(parser, data_map, { idv_of_interest: parse_id("2v1", true) })

            const minimised = minimise_graph(graph)

            expect(minimised.map_concept_ids).deep.equals({
                1: "1v1",
                2: "2v1",
            })

            expect(minimised.nodes).deep.equals({
                "1v1": {
                    title: "A value",
                    children: [],
                },
                "2v1": {
                    title: "A top plan",
                    children: ["1v1"],
                },
            })
        })


        it("can make compare a graph of an older idv_of_interest version", () =>
        {
            const graph = make_graph(parser, data_map, { idv_of_interest: parse_id("2v1", true), idv_of_comparison: parse_id("5v1", true) })

            const minimised = minimise_graph(graph)

            expect(minimised.map_concept_ids).deep.equals({
                1: "1v1",
                2: "2v1",
            })

            expect(minimised.nodes).deep.equals({
                "1v1": {
                    title: "A value",
                    children: [],
                    alternatives: ["4v1"],
                },
                "2v1": {
                    title: "A top plan",
                    children: ["1v1"],
                    alternatives: ["5v1"],
                },
                "4v1": {
                    title: "An alternative value",
                    children: [],
                },
                "5v1": {
                    title: "An alternative plan",
                    children: ["4v1"],
                },
            })
        })


        it("can use an older idv_of_interest version for a comparison graph", () =>
        {
            const graph = make_graph(parser, data_map, { idv_of_concepts: parse_id("2v2", true), idv_of_interest: parse_id("5v1", true), idv_of_comparison: parse_id("2v1", true) })

            const minimised = minimise_graph(graph)

            expect(minimised.map_concept_ids).deep.equals({
                1: "4v1",
                2: "5v1",
            })

            expect(minimised.nodes).deep.equals({
                "1v1": {
                    title: "A value",
                    children: [],
                },
                "2v1": {
                    title: "A top plan",
                    children: ["1v1"],
                },
                "4v1": {
                    title: "An alternative value",
                    children: [],
                    alternatives: ["1v1"],
                },
                "5v1": {
                    title: "An alternative plan",
                    children: ["4v1"],
                    alternatives: ["2v1"],
                },
            })
        })
    })

    describe("handles different versions of same component", () =>
    {
        it("should report different versions of the same component in one graph", () =>
        {
            expect(data_map["6v1"]!.input_value).equals(`<p>${tiptap_mention_chip("1v2")} + ${tiptap_mention_chip("1v1")}</p>`, "Ids have newer version first to test that order doesn't affect the result")

            const graph = make_graph(parser, data_map, { idv_of_interest: parse_id("6v1", true) })

            const minimised = minimise_graph(graph)

            expect(minimised.map_concept_ids).deep.equals({
                1: "1v2",
                6: "6v1",
            })

            expect(minimised.nodes).deep.equals({
                "1v1": {
                    title: "A value",
                    children: [],
                    multiple_versions: { latest_version: 2 },
                },
                "1v2": {
                    title: "A value (newer version)",
                    children: [],
                    multiple_versions: { latest_version: 2 },
                },
                "6v1": {
                    title: "Something that references two different versions",
                    children: ["1v1", "1v2"],
                },
            })
        })
    })
})


interface MinimisedNode
{
    title: string
    children: string[]
    alternatives?: string[]
    multiple_versions?: { latest_version: number }
}
function minimise_graph(graph: Graph)
{
    const minimised: Record<string, MinimisedNode> = {}
    for (const [id, node] of Object.entries(graph.nodes))
    {
        minimised[id] = {
            title: node.component.title,
            children: node.children.map(c => c.to_str()),
        }
        if (node.alternatives) minimised[id].alternatives = node.alternatives.map(a => a.to_str())
        if (node.multiple_versions) minimised[id].multiple_versions = node.multiple_versions
    }

    return {
        map_concept_ids: graph.map_concept_ido_to_idv_of_interest,
        nodes: minimised,
    }
}
