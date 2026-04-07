import { GenericDOMParser } from "../../rich_text/generic_interface"
import { shared_get_referenced_ids_from_tiptap } from "../../rich_text/shared_get_referenced_ids_from_tiptap"
import { IdAndMaybeVersion, IdAndVersion, parse_id } from "../id"
import { DataComponent, DataComponentsByIdv } from "../interface"


/**
 * These may all be the same or all be different.
 *
 * @property idv_of_concepts is the entry point to the knowledge graph, from which all
 * the concepts can be reached.  Typically this is the top level component, the
 * narrative, the summary of the graph, or the most general perspective.
 * For example like: [https://wikisim.org/wiki/1239](National energy budget for UK)
 * Defaults to idv_of_interest if not provided.
 *
 * @property idv_of_interest is the entry point to the knowledge graph containing
 * the data of interest, e.g. [https://wikisim.org/wiki/1239](National energy budget for UK according to Sustainable Energy Without the Hot Air, 2009, Prof. Mackay)
 * Required
 *
 * @property idv_of_comparison is the entry point to the knowledge graph containing
 * the data to compare to.  For example this might in the future be "National energy budget for UK according to XYZ political party)
 * Defaults to idv_of_concepts if not provided, or idv_of_interest if idv_of_concepts is not provided.
 *
 * TODO convert these ids back into strings to allow for versioning, i.e. allow
 * for "123v10" instead of just 123.
 */
export interface KnowledgeGraphIds
{
    idv_of_interest: IdAndVersion
    idv_of_concepts?: IdAndVersion
    // TODO, change this to a list
    idv_of_comparison?: IdAndVersion
}

export interface Graph<NodeType = DataComponent>
{
    apex_id: IdAndVersion
    map_concept_ido_to_idv_of_interest: Record<number, string>
    nodes: { [idv: string]: GraphNode<NodeType> }
}

export interface GraphNode<NodeType = DataComponent>
{
    component: NodeType
    children: IdAndVersion[]
    alternatives?: IdAndVersion[]
}


export function make_graph<C extends DataComponent>(parser: GenericDOMParser, data_map: DataComponentsByIdv<C>, ids: KnowledgeGraphIds): Graph<C>
{
    const { idv_of_interest, idv_of_concepts = idv_of_interest, idv_of_comparison } = ids

    const concept_graph = make_graph_inner(parser, data_map, idv_of_concepts)

    const graph_of_interest = (idv_of_interest.to_str() === idv_of_concepts.to_str())
        ? concept_graph
        : make_graph_inner(parser, data_map, idv_of_interest)

    mutate_graph_of_interest_with_mapping_from_concept_to_node_ids({ graph_of_interest, concept_graph })

    if (!idv_of_comparison)
    {
        return graph_of_interest
    }

    const comparison_graph = (idv_of_comparison.to_str() === idv_of_concepts.to_str())
        ? concept_graph
        : (idv_of_comparison.to_str() === idv_of_interest.to_str())
            ? graph_of_interest
            : make_graph_inner(parser, data_map, idv_of_comparison)

    mutate_graph_of_interest_with_alternatives({ graph_of_interest, comparison_graph })

    return graph_of_interest
}


function make_graph_inner<C extends DataComponent>(parser: GenericDOMParser, data_map: DataComponentsByIdv<C>, apex_id: IdAndVersion): Graph<C>
{
    const apex_component = data_map[apex_id.to_str()]
    if (!apex_component) throw new Error(`Apex (top level) component with id ${apex_id.to_str()} not found`)

    const graph: Graph<C> = {
        map_concept_ido_to_idv_of_interest: {},
        apex_id,
        nodes: {},
    }

    function make_graph_recursive(component: C): IdAndVersion
    {
        if (graph.nodes[component.id.to_str()]) return component.id

        const direct_dependency_ids = shared_get_referenced_ids_from_tiptap(parser, component.input_value || "")
        const children = direct_dependency_ids
            .map(id =>
            {
                const c = data_map[id.to_str()]
                if (!c) console.log(`Component with id ${id.to_str()} not found in data_map while processing component with id ${component.id.to_str()}`)
                // if (!c) throw new Error(`Component with id ${id.to_str()} not found in data_map while processing component with id ${component.id.to_str()}`)
                return c
            })
            .filter((c): c is C =>
            {
                return !!c
            })
            .map(make_graph_recursive)

        graph.nodes[component.id.to_str()] = {
            component,
            children,
        }

        return component.id
    }

    make_graph_recursive(apex_component)

    make_ids_unique(graph)

    return graph
}


function mutate_graph_of_interest_with_mapping_from_concept_to_node_ids<C extends DataComponent>(args: { graph_of_interest: Graph<C>, concept_graph: Graph<C> }): undefined
{
    const { graph_of_interest, concept_graph } = args

    const map_concept_id_to_node_id: Record<string, string> = {}

    // First load up the default mapping from concept ids to themselves
    Object.values(concept_graph.nodes).forEach(node =>
    {
        map_concept_id_to_node_id[node.component.id.id] = node.component.id.to_str()
    })

    // Now go through graph_of_interest and if any nodes have a subject_id,
    // use that to match back to them
    Object.values(graph_of_interest.nodes).forEach(node =>
    {
        const subject_id = node.component.subject_id
        if (!subject_id) return
        map_concept_id_to_node_id[subject_id] = node.component.id.to_str()
    })

    graph_of_interest.map_concept_ido_to_idv_of_interest = map_concept_id_to_node_id
}


function mutate_graph_of_interest_with_alternatives(args: { graph_of_interest: Graph, comparison_graph: Graph }): undefined
{
    const { graph_of_interest, comparison_graph } = args

    const comparison_graph_nodes_by_ido: Record<number, GraphNode> = {}
    Object.values(comparison_graph.nodes).forEach(node =>
    {
        comparison_graph_nodes_by_ido[node.component.id.id] = node
    })

    // Are there any nodes in graph_of_interest who reference the base through
    // component.subject_id?  If so add the nodes from the base as alternatives
    // to these nodes
    Object.values(graph_of_interest.nodes).forEach(node =>
    {
        const subject_id = node.component.subject_id
        if (!subject_id) return

        const base_node = comparison_graph_nodes_by_ido[subject_id]
        if (!base_node) return

        node.alternatives = node.alternatives || []
        node.alternatives.push(base_node.component.id)
    })

    // Are there any nodes in the comparison_graph which have component.subject_id
    // referencing nodes in the graph_of_interest? If so add these nodes from the
    // base as alternatives to the nodes in the graph_of_interest
    const map_subject_id_from_base_to_base_node_id: Record<number, IdAndVersion[]> = {}

    Object.values(comparison_graph.nodes).forEach(node =>
    {
        const subject_id = node.component.subject_id
        if (!subject_id) return

        const ids = map_subject_id_from_base_to_base_node_id[subject_id] || []
        ids.push(node.component.id)
        map_subject_id_from_base_to_base_node_id[subject_id] = ids
    })

    Object.values(graph_of_interest.nodes).forEach(node =>
    {
        const base_node_ids = map_subject_id_from_base_to_base_node_id[node.component.id.id]
        if (!base_node_ids) return

        base_node_ids.forEach(base_node_id =>
        {
            const base_node = comparison_graph.nodes[base_node_id.to_str()]
            if (!base_node) return

            node.alternatives = node.alternatives || []
            node.alternatives.push(base_node.component.id)
        })
    })

    make_ids_unique(graph_of_interest)

    ensure_all_references_ids_are_in_graph({ graph_of_interest, comparison_graph })
}


function make_ids_unique(graph: Graph): void
{
    // Make ids unique
    Object.values(graph.nodes).forEach(node =>
    {
        node.children = unique_ids(node.children)
        node.alternatives = node.alternatives && unique_ids(node.alternatives)
    })
}


function unique_ids(ids: IdAndVersion[]): IdAndVersion[]
{
    const idv_strings = ids.map(id => id.to_str())
    const unique_idv_strings = Array.from(new Set(idv_strings))
    return unique_idv_strings.map(id_str => parse_id(id_str, true))
}


function ensure_all_references_ids_are_in_graph(args: { graph_of_interest: Graph, comparison_graph: Graph }): void
{
    const { graph_of_interest, comparison_graph } = args

    const missing_ids = new Set<string>()

    function check_id(id: IdAndMaybeVersion | number)
    {
        const id_is_number = typeof id === "number"

        if (!id_is_number && id.has_version() && !graph_of_interest.nodes[id.to_str()])
        {
            missing_ids.add(id.to_str())
        }
    }

    Object.values(graph_of_interest.nodes).forEach(node =>
    {
        node.children.forEach(check_id)
        node.alternatives?.forEach(check_id)
    })

    // Now copy over any missing ids from the base graph
    missing_ids.forEach(id =>
    {
        const base_node = comparison_graph.nodes[id]
        if (!base_node) return console.error(`Id ${id} is missing from graph of interest and not found in comparison_graph`)

        graph_of_interest.nodes[id] = base_node
    })
}
