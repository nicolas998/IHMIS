import time
import sys
import os

sys.path.append("{0}/..".format(os.path.dirname(os.path.realpath(__file__))))
from libs.FolderDefinition import FolderDefinition
from libs.ReprGenInterface import ReprGenInterface
from libs.ReprComposition import ReprComposition
from libs.Debug import Debug

debug_level_arg = 10

# ####################################################### ARGS ####################################################### #

model_id_arg = ReprGenInterface.get_model_id(sys.argv)
timestamp_arg = ReprGenInterface.get_timestamp_opt(sys.argv)
flextime_arg = ReprGenInterface.get_flextime(sys.argv)
runset_id_arg = ReprGenInterface.get_runset_id(sys.argv)

# ####################################################### DEFS ####################################################### #


def generate_representation(sc_model_id, timestamp, flextime=None, runset_id=None, debug_lvl=0):
    """

    :param sc_model_id:
    :param timestamp:
    :param debug_lvl:
    :param runset_id:
    :return:
    """

    requiered_repres1 = 'disclausgsih'
    requiered_repres2 = 'fldidxusgsih'

    # start counting time for debug
    start_time = time.time() if debug_lvl > 0 else None

    # define the timestamp
    if timestamp is not None:
        if flextime is None:
            if FolderDefinition.check_both_representations_exist(sc_model_id, requiered_repres1, requiered_repres2,
                                                                 timestamp, runset_id=runset_id, debug_lvl=0):
                the_timestamp = timestamp
            else:
                the_timestamp = None
        else:
            repr1_folder_path = FolderDefinition.get_historical_img_folder_path(sc_model_id, requiered_repres1,
                                                                                runset_id=runset_id)
            repr2_folder_path = FolderDefinition.get_historical_img_folder_path(sc_model_id, requiered_repres2,
                                                                                runset_id=runset_id)
            the_timestamp1 = FolderDefinition.retrive_closest_timestamp_in_hist_folder(repr1_folder_path, timestamp,
                                                                                       accept_range=flextime)
            the_timestamp2 = FolderDefinition.retrive_closest_timestamp_in_hist_folder(repr2_folder_path, timestamp,
                                                                                       accept_range=flextime)
            the_timestamp = the_timestamp1 if the_timestamp1 == the_timestamp2 else None
    else:
        the_timestamp = ReprComposition.get_most_recent_timestamp_between(sc_model_id, requiered_repres2,
                                                                          requiered_repres1, runset_id=runset_id,
                                                                          debug_lvl=debug_lvl)

    # must have a matching timestamp
    if the_timestamp is None:
        Debug.dl("reprgen_dcufldicuih_sing: Not found a matching timestamp for '{0}' and '{1}' ('{2}').".format(
            requiered_repres1, requiered_repres2, sc_model_id), 1, debug_lvl)
        return None

    # replacing color
    replace_color = [161, 218, 180]

    ReprComposition.plot_composition_map(sc_model_id, the_timestamp, 'dcufldicuih', requiered_repres1, requiered_repres2,
                                         replace_color=replace_color, runset_id=runset_id, debug_lvl=debug_level_arg)

    # debug info
    d_time = time.time() - start_time
    Debug.dl("reprgen_dcufldicuih_sing: generate_representation({0}) function took {1} seconds ".format(sc_model_id,
                                                                                                        d_time),
             1, debug_lvl)

    return

# ####################################################### CALL ####################################################### #

generate_representation(model_id_arg, timestamp_arg, flextime=flextime_arg, runset_id=runset_id_arg,
                        debug_lvl=debug_level_arg)