#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import asyncio
import json
import logging
import os
import geopandas as gpd
import spacy
import sys
import time
import matplotlib.pyplot as plt
from geojsoncontour import contourf_to_geojson
from aiohttp import web
from concurrent.futures import ProcessPoolExecutor
from rasterio.enums import Resampling
from rasterio.io import MemoryFile
from shapely.geometry import shape, mapping
from shapely.ops import unary_union
from neo4j import GraphDatabase
from server_neo4j import (
    handler_info_feature_neo4j,
    handler_gaspar_tree,
    handler_features_neo4j_post,
    handler_features_cat_neo4j_post,
    get_geom_table_neo4j,
)
try:
    import uvloop
except:
    uvloop = None

HOST = os.environ.get('HOST_IP', '127.0.0.1')


def get_env_variable(var_name):
    try:
        return os.environ[var_name]
    except KeyError:
        error_msg = (
            f'Please set the {var_name} environment variable \n'
            f'(`export {var_name}="secret_value"` on GNU/Linux \n'
            f'or `set {var_name}="secret_value"` on Windows).\n')
        sys.exit(error_msg)


async def handler_activity_features(request):
    """
    Returns a GeoJSON FeatureCollection
    containing specific features for the requested activity
    (such a 'ski areas', 'ski lift' and 'pistes' for the activity "ski").
    """
    app = request.app
    category = request.match_info['category']

    if category not in app['allowed_activity']:
        return web.Response(text='Error')

    app['logger'].info(
        'Requested features for activity "{}" : found {} features'
        .format(category, len(app['layer_activity_{}'.format(category)]))
    )
    result = app['layer_activity_{}'.format(category)].to_json()
    return web.Response(text=result)


async def index(request):
    """Handler for the index page."""
    return web.FileResponse('./dist/index.html')


def compute_binary_predicate(_op, _geoms1, _geoms2):
    geoms1 = [shape(i) for i in json.loads(_geoms1)]
    geoms2 = [shape(i) for i in json.loads(_geoms2)]
    result = {}
    for ix1, g1 in enumerate(geoms1):
        result[ix1] = {}
        for ix2, g2 in enumerate(geoms2):
            result[ix1][ix2] = getattr(g1, _op)(g2)
    return json.dumps(result)


def compute_op_geom(_op, _geoms, options):
    geoms = [shape(i) for i in json.loads(_geoms)]

    if _op == 'unary_union':
        res = unary_union(geoms)

    elif _op == 'intersection':
        res = geoms[0]
        for _geom in geoms[1:]:
            res = _geom.intersection(res)

    elif _op == 'symmetric_difference':
        res = geoms[0].symmetric_difference(geoms[1])

    elif _op == 'buffer':

        geo_serie = gpd.GeoSeries(
            geoms,
            crs='+proj=longlat +datum=WGS84 +no_defs ',
        ).to_crs(epsg=2154)

        if options['dist'] and int(options['dist']) != 0:
            res = unary_union(
                geo_serie.buffer(float(options['dist']))
                .boundary.buffer(float(options['uncertainty']))
                .to_crs('+proj=longlat +datum=WGS84 +no_defs ')
                .values
            )
        else:
            res = unary_union(
                geo_serie
                .buffer(float(options['uncertainty']))
                .to_crs('+proj=longlat +datum=WGS84 +no_defs ')
                .values
            )
    return json.dumps(mapping(res))


async def handler_geom_op(request):
    """
    Handles some geo-operations (buffer, unary-union and intersection)
    to be performed on an array of GeoJSON geometries.
    """
    _op = request.match_info['op']

    if _op in request.app['allowed_binary_predicate']:
        posted_data = await request.post()
        _geoms1 = posted_data.get('geoms1')
        _geoms2 = posted_data.get('geoms2')

        with ProcessPoolExecutor() as executor:
            result = await asyncio.get_event_loop().run_in_executor(
                executor,
                compute_binary_predicate,
                _op,
                _geoms1,
                _geoms2,
            )

        return web.Response(text=result)

    elif _op in request.app['allowed_geom_operation']:
        posted_data = await request.post()
        _geoms = posted_data.get('geoms')

        options = {
            'dist': posted_data.get('distance'),
            'uncertainty': posted_data.get('uncertainty'),
        } if _op == 'buffer' else None

        with ProcessPoolExecutor() as executor:
            result = await asyncio.get_event_loop().run_in_executor(
                executor,
                compute_op_geom,
                _op,
                _geoms,
                options,
            )

        return web.Response(text=result)

    else:
        return web.Response(
            text=json.dumps({
                'message': (
                    'Error : binary predicate or geometric operation '
                    f'\'{_op}\' not found.'
                ),
            })
        )


async def handler_clue(request):
    """
    Handles clues in natural language to extract part of speech and named
    entities if any.
    """
    posted_data = await request.post()
    clue_nl = posted_data.get('clue_nl')
    doc = request.app['nlp'](clue_nl)
    part_of_speech = [
        (x.orth_, x.pos_, x.lemma_)
        for x in [
            y for y in doc if not y.is_stop and y.pos_ != 'PUNCT']
    ]

    named_entities = [(X.text, X.label_) for X in doc.ents]
    return web.Response(
        text=json.dumps({
            "part_of_speech": part_of_speech,
            "named_entities": named_entities,
        })
    )


async def handler_point_from_raster(request):
    """
    Computes a grid of points (with value) from
    a raster in order to plot a proportionnal symbols layers.
    Currently the resolution is downscaled (by 2) in order
    to get a layer that is not too heavy to render.
    """
    t1 = time.time()
    posted_data = await request.post()
    file = posted_data.get('file')

    # We want to [up|down]scale the resolution so that
    # the created points are distant of 25m
    target_resolution = 25

    with MemoryFile(file.file.read()) as memory_file:
        with memory_file.open() as dataset:
            current_resolution = round(dataset.res[0] * 10) / 10
            scale_factor = current_resolution / target_resolution
            data = dataset.read(
                out_shape=(
                    dataset.count,
                    int(dataset.height * scale_factor),
                    int(dataset.width * scale_factor)
                ),
                resampling=Resampling.bilinear
            )

            transform = dataset.transform * dataset.transform.scale(
                (dataset.width / data.shape[-1]),
                (dataset.height / data.shape[-2])
            )

    features = []
    band = data[0]
    start_x = transform[2]
    start_y = transform[5]
    cellsize_x = transform[0]
    cellsize_y = transform[4]

    for ix_y in range(band.shape[0]):
        coord_y = start_y + (ix_y * cellsize_y + (cellsize_y / 2))
        for ix_x in range(band.shape[1]):
            coord_x = start_x + (ix_x * cellsize_x + (cellsize_x / 2))
            features.append({
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [coord_x, coord_y],
                },
                'properties': {
                    'value': float(band[ix_y][ix_x])
                }
            })

    gdf = gpd.GeoDataFrame.from_features(
        features,
        crs='EPSG:2154',
    ).to_crs('EPSG:4326')

    # TODO: store the resolution on the geojson that is returned to the client
    # (it will help to choose the correct size of proprtionnal symbols)

    request.app['logger'].info(
        'Points creation + serialisation took {:.2f}s.'
        .format(time.time() - t1))

    return web.Response(text=gdf.to_json())


async def handler_contours(request):
    """
    Computes a contour layer from a raster
    (with only one level, what is superior to 0.499).
    Currently the resolution is downscaled (by 2) in order
    to get a result that visually fits the location of the symbols on
    the proportionnal symbols layer.
    """
    t1 = time.time()
    posted_data = await request.post()
    file = posted_data.get('file')
    steps = posted_data.get('steps')
    clipping_poly = posted_data.get('boundingBox')

    steps = [float(i) for i in steps.replace(' ', '').split(',')]

    target_resolution = 25

    with MemoryFile(file.file.read()) as memory_file:
        with memory_file.open() as src:
            # data = src.read(1)
            # transform = src.transform

            current_resolution = round(src.res[0] * 10) / 10
            scale_factor = current_resolution / target_resolution

            data = src.read(
                out_shape=(
                    src.count,
                    int(src.height * scale_factor),
                    int(src.width * scale_factor)
                ),
                resampling=Resampling.bilinear
            )[0]

            transform = src.transform * src.transform.scale(
                (src.width / data.shape[-1]),
                (src.height / data.shape[-2])
            )

            start_x = transform[2]
            start_y = transform[5]
            cellsize_x = transform[0]
            cellsize_y = transform[4]

    xs = [
        start_x + (ix_x * cellsize_x + (cellsize_x / 2))
        for ix_x in range(data.shape[1])
    ]
    ys = [
        start_y + (ix_y * cellsize_y + (cellsize_y / 2))
        for ix_y in range(data.shape[0])
    ]

    # contours = plt.contourf(xs, ys, data, [0.499, 1])
    contours = plt.contourf(xs, ys, data, steps)

    geojson = contourf_to_geojson(contourf=contours)
    features = json.loads(geojson)['features']

    # Build the GeoDataFrame from the contours
    gdf = gpd.GeoDataFrame.from_features(
        features,
        crs='EPSG:2154',
    )

    # Well...  why not ?
    gdf.geometry = gdf.geometry.buffer(1)

    # We want to send it in wgs84 ...
    gdf = gdf.to_crs('EPSG:4326')

    # We also want to clip it with the initial search area
    clipping_feature = shape(json.loads(clipping_poly)['geometry'])
    gdf.geometry = gdf.geometry.intersection(clipping_feature)

    request.app['logger'].info(
        'Contours creation + serialisation took {:.2f}s.'
        .format(time.time() - t1))

    return web.Response(text=gdf.to_json())


async def handle_404(request, response):
    return web.Response(text="ERROR 404 !")


async def error_middleware(app, handler):
    async def middleware_handler(request):
        try:
            response = await handler(request)
            if response.status == 404:
                return await handle_404(request, response)
            return response
        except web.HTTPException as ex:
            if ex.status == 404:
                return await handle_404(request, ex)
            raise

    return middleware_handler


async def make_app(loop, prefix_data, addr='0.0.0.0', port='8008'):
    logging.basicConfig(level=logging.INFO)
    app = web.Application(
        client_max_size=17408**2,
        middlewares=[error_middleware],
    )
    app['logger'] = logging.getLogger("main")

    app.add_routes([
        web.get('/activity-features/{category}', handler_activity_features),
        web.post('/neo4j-all-features', handler_features_neo4j_post),
        web.post('/neo4j-features/{category}', handler_features_cat_neo4j_post),
        web.get('/neo4j-info/{id}', handler_info_feature_neo4j),
        web.get('/neo4j-gaspar-tree', handler_gaspar_tree),
        web.post('/contours', handler_contours),
        web.post('/raster-to-points', handler_point_from_raster),
        web.post('/parse-clue', handler_clue),
        web.post('/{op}', handler_geom_op),
        web.get('/', index),
        web.static('/', 'dist/'),
    ])

    app['logger'].info('Connecting to neo4j...')

    # Stuff related to Neo4j
    app['NEO4J_USER'] = get_env_variable('NEO4J_USER')
    app['NEO4J_PASSWORD'] = get_env_variable('NEO4J_PASSWORD')
    app['NEO4J_URL'] = f'bolt://{HOST}:7687'

    app['driver'] = GraphDatabase.driver(
        app['NEO4J_URL'], auth=(app['NEO4J_USER'], app['NEO4J_PASSWORD']))

    app['neo4j_allowed_category'] = get_geom_table_neo4j(app['driver'])

    # Binary predicates that can be used through a POST request
    app['allowed_binary_predicate'] = {
        'intersects',
        'equals',
        'contains',
        'crosses',
        'overlaps',
        'touches',
        'within',
    }

    # Geometric operation that can be used through a POST request
    app['allowed_geom_operation'] = {
        'buffer',
        'intersection',
        'difference',
        'symmetric_difference',
        'unary_union',
    }

    # Activity (of the victim) that can be used
    # to request supplementary data
    app['allowed_activity'] = {
        'ski',
        'randonnee',
        'speleologie',
        'escalade',
        'vtt',
    }

    app['logger'].info('Opening OSM layers in memory...')

    # Specific layers related to the activity of the victim
    app['layer_activity_ski'] = gpd.read_file(
        os.path.join(
            prefix_data,
            'domaine_station_remontee_ski_choucas_large.geojson'))
    app['layer_activity_speleologie'] = gpd.read_file(
        os.path.join(
            prefix_data,
            'cave_entrance_speleologie_choucas_large.geojson'))
    app['layer_activity_escalade'] = gpd.read_file(
        os.path.join(
            prefix_data,
            'sport_climbing_escalade_choucas_large.geojson'))
    app['layer_activity_vtt'] = gpd.read_file(
        os.path.join(
            prefix_data,
            'mtb_scale_vtt_choucas_large.geojson'))

    app['logger'].info('Loading spaCy model for French...')
    app['nlp'] = spacy.load('fr_core_news_sm')

    handler = app.make_handler()
    srv = await loop.create_server(handler, addr, port)
    app['logger'].info('Serving on' + str(srv.sockets[0].getsockname()))

    return srv, app, handler


def main(prefix_data='data/osm/'):
    if uvloop:
        asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())
    loop = asyncio.get_event_loop()
    asyncio.set_event_loop(loop)
    srv, app, handler = loop.run_until_complete(
        make_app(loop, prefix_data))

    try:
        loop.run_forever()
    except KeyboardInterrupt:
        pass
    finally:
        srv.close()
        loop.run_until_complete(srv.wait_closed())
        loop.run_until_complete(app.shutdown())
        loop.run_until_complete(handler.shutdown(60.0))
        loop.run_until_complete(app.cleanup())
    loop.close()


if __name__ == '__main__':
    main()
