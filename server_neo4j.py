from neo4j import GraphDatabase, Query
from aiohttp import web
from collections import defaultdict
from shapely.geometry import shape, mapping
from shapely import wkt
from concurrent.futures import ProcessPoolExecutor
import asyncio
import json
import time

###########################################################
### Some helpers related to neo4j ...
###########################################################


def prepare_feature_collections(dd):
    """
    Prepare a list of FeatureCollections,
    one FeatureCollection per GasparClass (category).
    """
    feature_collections = []

    for category, elements in dd.items():
        features = []
        for _elements in elements:
            for name, uid, geom_wkt in _elements:
                features.append({
                    "type": "Feature",
                    "geometry": mapping(wkt.loads(geom_wkt)),
                    "id": uid,
                    "properties": {
                        "name": name,
                        "CHOUCAS_CLASS": category,
                    }
                })
        feature_collections.append({
            "type": "FeatureCollection",
            "CHOUCAS_CLASS": category,
            "features": features
        })

    return json.dumps(feature_collections)


def prepare_feature_collection(values, category):
    """
    Prepare a FeatureCollection given `values`, the result of
    the query to neo4j, and `category`, the ClassGaspar category name.
    """
    return json.dumps({
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "id": v[1],
            "geometry": mapping(wkt.loads(v[2])),
            "properties": {
                "name": v[0],
                "CHOUCAS_CLASS": category,
            },
        } for v in values]
    })


def _run(_statement, uri, user, password):
    """
    Used in the process pool executor to query the DB and return
    the list of values.
    """
    driver = GraphDatabase.driver(uri, auth=(user, password))
    with driver.session() as session:
        result = list(session.run(Query(_statement)).values())
    return result


async def run(statement, uri, user, password):
    """
    Run a statement asynchronously using a process pool executor.
    """
    with ProcessPoolExecutor() as executor:
        result = await asyncio.get_event_loop().run_in_executor(
                executor, _run, statement, uri, user, password)
    return result


def set_end_node(dict_in, path):
    """
    Used to construct the tree (dict_in) to be returned to Gaspar from
    the path from each "leaf" concept to the root.
    """
    for p in path:
        if not p in dict_in:
            dict_in[p] = {}
        dict_in = dict_in[p]

###########################################################
### Async handlers for fecthing features from neo4j and
### getting information about single features
###########################################################

async def handler_info_feature_neo4j(request):
    """
    Handle a get request that allows to fetch all
    the properties of a single neo4j node.
    """
    app = request.app
    _id = request.match_info['id']

    with app['driver'].session() as session:
        q = Query(f"""
            MATCH (o) WHERE id(o) = {_id} RETURN properties(o) as props""")
        result = session.run(q)
        res = result.values()
        info = json.dumps(res[0][0], default=str)

    return web.Response(text=info)


async def handler_gaspar_tree(request):
    """
    Handle a get request that returns the structure
    of the tree of objects for Gaspar.
    """
    with request.app['driver'].session() as session:
        q = Query("""
            match p=(cg:ClassGaspar)-[:isSubClassOf*0..5]->(:ClassGaspar)
            with cg,nodes(p) as path
            unwind path as n
            return cg.name, collect(distinct n.name)""")
        result = session.run(q)
        values = result.values()

    d = {}
    for _, path in values:
        set_end_node(d, reversed(path))

    return web.Response(text=json.dumps(d['objet GASPAR']))


async def handler_features_neo4j_post(request):
    """
    Returns an array of GeoJSON FeatureCollections
    containing all the necessary features for Gaspar,
    pulled from neo4j DB.
    """
    app = request.app

    posted_data = await request.post()
    geom_str = posted_data.get('geometry')
    geom_wkt = wkt.dumps(shape(json.loads(geom_str)))

    t1 = time.time()
    app['logger'].info('Requested all features from neo4j...')

    values = await query_neo4j_all_gaspar_features2(
        app['driver'],
        geom_wkt,
        app['NEO4J_URL'],
        app['NEO4J_USER'],
        app['NEO4J_PASSWORD'],
    )
    result = prepare_feature_collections(values)

    app['logger'].info(
        'Query + JSON serialisation took {:.2f}s.'.format(time.time() - t1))
    app['logger'].info('Returning features from neo4j...')

    return web.Response(text=result)


async def handler_features_cat_neo4j_post(request):
    """
    Returns a GeoJSON FeatureCollection
    containing all the requested features for a GasparClass category,
    pulled from neo4j DB.
    """
    app = request.app

    posted_data = await request.post()
    geom_str = posted_data.get('geometry')
    category = posted_data.get('category')
    geom_wkt = wkt.dumps(shape(json.loads(geom_str)))

    app['logger'].info('Requested all features from neo4j...')

    geom_types = app['neo4j_allowed_category'][category]

    values = []
    for geom_type in geom_types:
        values.extend(
            query_neo4j_per_category(app['driver'], category, geom_wkt))

    result = prepare_feature_collections(values, category)

    app['logger'].info('Returning features from neo4j...')

    return web.Response(text=result)



###########################################################
### Queries to the DB configured
### using the content of the requests made to the web server
###########################################################

def query_neo4j_per_category(driver, category, type_geom, geom_wkt):
    """
    Query to get objects (v2021) for a specific ClassGaspar `category`
    on a specific neo4j layer (provided in `type_geom`),
    intersecting a geometry provided in WKT.
    """
    q = Query(f'''
        call spatial.intersects("{type_geom}", "{geom_wkt}") yield node
        match (:ClassGaspar {{name:"{category}"}})-[:isEquivalentTo]-(:ClassOOR)-[:isInstanceOf]-(o:ObjetGeo:v2021)-[:hasGeometry]-(node)
        return o.name, id(o), node.WKTGeometryEncoder;''')

    with driver.session() as session:
        result = session.run(q)
        values = result.values()

    return values


async def query_neo4j_all_gaspar_features2(driver, geom_wkt, url, user, password):
    """
    Query to get all the ClassGaspar objects (v2021)
    intersecting a geometry provided in WKT.
    """
    values = []

    for type_geom in ("points", "lines", "polygons"):
        q = f'''
            call spatial.intersects("{type_geom}", "{geom_wkt}") yield node
            match (c:ClassGaspar)-[:isEquivalentTo]-(:ClassOOR)-[:isInstanceOf]-(o:ObjetGeo:v2021)-[:hasGeometry]-(node)
            return c.name, collect([o.name, id(o), node.WKTGeometryEncoder]);
            '''
        res = await run(q, url, user, password)
        values.append(dict(res))

    dd = defaultdict(list)
    for myd in values:
        for k, v in myd.items():
            dd[k].append(v)

    return dd


def get_geom_table_neo4j(driver):
    """
    Prepares a dictionary to match category of objects (from neo4j ClassGaspar
    with the layer(s) containing its geometries.
    Returns something like
    {
        "abri": ["points", "polygons"],
        "cabane": ["points", "polygons"],
        ...
    }
    This is necessary to configure the queries per ClassGaspar category
    that will be made later.
    """
    q = Query(
        '''match (c:ClassGaspar)--(d:ClassOOR)--(l:spatialLayerMeta)
           return c.name, collect(l.name);''')

    with driver.session() as session:
        result = session.run(q)
        values = result.values()
    return dict(values)
