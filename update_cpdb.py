#
# Copyright (c) 2020 Nutanix Inc. All rights reserved.
#

#pylint: disable=broad-except
import env
import json
import logging
import os
import re
import shutil
import sys
import urllib
from optparse import OptionParser
import requests
import time
import cluster.genesis_utils as genesis_utils
#import cluster.host_upgrade_helper as host_upgrade_helper
from framework.main.lcm_framework_pb2 import LcmEntityV2 as LcmEntity
from framework.main.lcm_framework_pb2 import LcmAvailableVersionV2 as LcmAvailableVersion
from cluster.lcm.interface import LcmInterface
from framework.main.utils.cpdb_utils import CpdbUtils
import framework.main.consts as consts
#from utils.zeus_utils import ZeusUtils

#_NCC_PATH = os.path.abspath("ncc/lib/py/")
#if os.path.isdir(_NCC_PATH):
#  sys.path[:] = filter(lambda path: not path.startswith("/home/nutanix"), sys.path)
#  sys.path.insert(0, "/home/nutanix/lib/python")
#  for path in os.listdir(_NCC_PATH):
#    sys.path.insert(0, os.path.join(_NCC_PATH, path))

#from google.protobuf.json_format import MessageToDict
#from ncc.hardware_information_pb2 import HardWareInfoProto

BUILDS = "builds"
COMPONENT = "component"
CONFIGURATIONS = "configurations"
CONNECTED_SITE = "connected_site"
DARK_SITE = "dark_site"
IMAGE_LIST = "image_list"
IMAGE_NAME = "image"
URLS = "urls"
URL = "url"
TYPE = "type"

def get_url_from_details(configuration):
    """
    Fetch the component name and url from the configuration
    Args:
        configuration (dict): metadata of component
    Returns:
        dict: dictionary with component as key and url as value
    """
    dict_url = {}
    key_value = ""
    for url_metadata in configuration.get(URLS, []):
        if url_metadata.get(TYPE, "") == DARK_SITE:
            key_value = url_metadata[URL]
    bundle = re.match(r"BASE_URL/(.*)", key_value)
    if bundle is None:
        bundle = configuration[COMPONENT]
    else:
        bundle = bundle.group(1)
    for url_metadata in configuration.get(URLS, []):
        if url_metadata.get(TYPE, "") == CONNECTED_SITE:
            dict_url[bundle] = url_metadata[URL]
    return dict_url

def get_configs(location):
    """
    Reads the json file in the path of location and
    fetch the configurations details in rim_config.json
    Args:
        location (str): reads the rim_config.json file
    Returns:
        list: list of configurations
    """
    print('Reading the rim_config.json file')
    try:
        with open(location, 'r') as json_file:
            data = json_file.read()
        json_dict = json.loads(data)
        configs = json_dict[CONFIGURATIONS]
    except Exception as err:
        print("Error occured:%s", err)
    return configs

def check_component_exist(configs, components):
    """
    Checks if the given components are present in configs or not
    if doesn't present then it prints corresponding error message
    and stops execution of the program.
    Args:
        configs (list): list of dictionaries of metadata
        components (list): component names
    """
    component_list = []
    for configuration in configs:
        component_list.append(configuration[COMPONENT])
    for component in components:
        if component not in component_list:
            print("Invalid component name is given: %s", component)
            sys.exit(1)

def get_url_from_config(location, components):
    """
    Gets configuration from the location, check if exists in valid
    configuration and gets corresponding url of metadata.json if present
    Args:
        location (str): path of the rim_config.json file
        components (list): list of components given to download
    Returns:
        dict: a dictionary with key as component and value as
            url metadata provided in rim_config.json correspondingly
    """
    dict_url = {}
    try:
        configs = get_configs(location)
        if not components:
            for configuration in configs:
                dict_url.update(get_url_from_details(configuration))
            return dict_url
        check_component_exist(configs, components)
        for component in components:
            for configuration in configs:
                if str(configuration[COMPONENT]) == component:
                    dict_url.update(get_url_from_details(configuration))
    except Exception as err:
        print('Error occured:%s', err)
        sys.exit(0)
    return dict_url

def get_subdir_list(url):
    """
    This function process the url and return list of
    urls of directories present in the directory
    Args:
        url (str): url of the component from rim_config.json
    Returns:
        list: list of directories in the provided url
    """
    url_list = []
    response = requests.get(url)
    response_text = str(response.text)
    dir_list = re.findall(r".*\[DIR\].*<a href.*>(.*)</a>.*", response_text)
    for directory in dir_list:
        url_list.append(os.path.join(url, directory))
    return url_list

def get_metadata_url_list(url):
    """
    Checks if the url is a metadata.json file
    if not gets the list of all metdata.json file in the url
    Args:
        url (str): url of the component
    Returns:
        list: list of metadata.json url's of the component
    """
    urls_list = []
    check = re.match(r".*\.json$", url)
    if check is not None:
        return [url]
    sub_dir_list = get_subdir_list(url)
    if not sub_dir_list:
        url += "metadata.json"
        return [url]
    for i in sub_dir_list:
        urls_list.extend(get_metadata_url_list(i))
    return urls_list

def get_metadata_url(dict_url):
    """
    Creates a dictionary with component and list of
    metadata.json url's
    Args:
        dict_url (dict): a dictionary with keys as component
            and values are url from rim_json
    Returns:
        dict: dictionary with keys as component and values are list of
            metadata_json urls
    """
    temp_dict = {}
    for component, url in dict_url.items():
        print("retrieving the metadata.json list %s", component)
        temp_dict[component] = get_metadata_url_list(url)
    return temp_dict

def get_image_metadata(url):
    """
    Process the metadata.json file and get list of images
    Args:
        url (str): metadata.json's url
    Returns:
        list: list of images present in the metadata.json url
    """
    image_list = []
    try:
        data = requests.get(url).text
        json_dict = json.loads(data)
        image_list = json_dict[IMAGE_LIST]
    except Exception as err:
        print("error occured on loading the metadata.json url:%s", err)
    return image_list

def download_image_url(image_dict):
    """
    Downloads the image and creates metadata.json,
    metadata.sign in the corresponding build folder.
    Args:
        image_dict (dict): image metadata
    """
    image = image_dict[URL]
    print('Downloading image from %s', image)
    try:
        image_name = image_dict[IMAGE_NAME]
        urllib.urlretrieve(image, image_name)
    except Exception as err:
        print("error occured on downloading the file:%s", err)
    logging.debug('Creating metadata.json from %s \n', image_dict)
    try:
        image_dict[URL] = image_dict[IMAGE_NAME]
        data = [image_dict]
        with open('metadata.json', 'w') as metadata_file:
            json.dump(data, metadata_file, ensure_ascii=False, indent=4)
    except Exception as err:
        print("error occured on creating the file:%s", err)
    print('Creating metadata.sign file')
    try:
        sign_file = open("metadata.sign", 'w')
        sign_file.close()
    except Exception as err:
        print("error occured on creating the file:%s", err)

def get_current_version(uuid, entity):
  #HW_INFO_ZK_PATH = "/appliance/logical/hw_info/" + uuid
  #zk = genesis_utils.get_zk_session()
  #proto = HardWareInfoProto()
  #proto.ParseFromString(zk.get(HW_INFO_ZK_PATH))
  #proto_dict = MessageToDict(proto)
  url = "http://localhost:8004/components/1234" # +get_node_uuid
  data = requests.get(url)
  components_info = data.json()["components"]
  bmc = components_info["bmc"][0]["version"]
  bmc = bmc.split()[0]
  bmc = ".".join(bmc.split(".")[:-1])

  if "bmc" in entity.lower(): return bmc
  if "bios" in entity.lower(): return components_info["bios"][0]["version"]

def download_rim_url(url):
    """
    Download the rim_config file from the url and save in
    current working directory
    Args:
        url (str): Url of the rim_config.json file
    """
    print "Downloading rim URL"
    try:
        urllib.urlretrieve(url, 'metadata.json')
    except Exception as err:
        print("Error occured in downloading the rim_config: %s", err)

def add_available_versions(uuid, node_uuid, entities):
    li = LcmInterface()
    cu = CpdbUtils.get_instance(li)
    entity_uuid = uuid
    entity_class = entities.get("entity_class")
    entity_version = get_current_version(node_uuid, entity_class)
    version_list = entities.get("versions")
    print ("updating : %s:%s:%s:%s" % (entity_uuid, entity_class, entity_version, version_list))
    #version_list = [{
    #    "version": "PB42.500",
    #    "status": "recommended",
    #    "flags": ["warm_reboot_phoenix", "cold_reboot_phoenix"],
    #    "image": "release.smc.gen11.bios.CascadeLake.X11DPT_B.image.PB42300",
    #    "update_library_modules": [],
    #    "dependencies": [
    #        {
    #            "entity_class": "BMCs",
    #            "entity_model": "BMC Firmware on CascadeLake",
    #            "version": "7.07"
    #        }
    #    ]
    #}
    #]
    ret, msg = cu.update_available_versions_for_entity(entity_uuid,
                                                       entity_class,
                                                       entity_version,
                                                       version_list,
                                                       proto=False)
    if not ret:
        print "Unable to update the available versin  %s" % msg
    LAST_INVENTORY_TIME = "/appliance/logical/lcm/last_inventory_time"
    li.zeus.set_zknode(LAST_INVENTORY_TIME, str(time.time()))

def update_entities(entities):
    """
    
    :param entities: 
    :return: 
    """
    li = LcmInterface()
    genesis = li.genesis
    node_uuids = genesis.get_node_uuid_list()
    print "node uuids %s" % node_uuids
    for node_uuid in node_uuids:
        cu = CpdbUtils.get_instance(li)
        inventory_out = []
        inventory_out.append(entities.get("entity_class"))
        inventory_out.append("None")
        inventory_out.append(entities.get("entity_model"))
        inventory_out.append(entities.get("description"))
        inventory_out.append(get_current_version(node_uuid, entities.get("entity_class"))) 
        print "get_current_version %s" % (get_current_version(node_uuid, entities.get("entity_class"))) 
        inventory_out.append("1")
        inventory_out.append(entities.get("entity_type"))
        
        print("inventory %s" % inventory_out)
        
        db_entry = cu._get_db_entry_for_entity(LcmEntity,
                                               consts.LCM_TABLE_NAME_MAP[
                                                   "entity"], inventory_out,
                                               node_uuid)
        entity = LcmEntity()
        entity.CopyFrom(db_entry.value)
        entity.entity_class = entities.get("entity_class")
        #if inventory_out[1] != 'None':
        #    entity.id = inventory_out[1]

        entity.entity_model = entities.get("entity_model")
        entity.description = entities.get("description")
        entity.version = get_current_version(node_uuid, entities.get("entity_class"))

       # if inventory_out[5] != 'None':
        #    entity.count += int(inventory_out[5])
        entity.count += 1

        entity.entity_type = entities.get("entity_type")
        entity.hw_family = genesis.get_lcm_family_from_cvm_host_layout(node_uuid)
        entity.last_detected_time_usecs = int(time.time() * 1e6)
        entity.ClearField("group_policy_enum_list")
        db_entry.value = entity
        uuid = genesis.convert_to_uuid(db_entry.value.uuid)
        print "updating Entity DB"
        ret, status = cu._update_cpdb_entity("entity", uuid, db_entry)
        if not ret:
            print "Not able to update %s" % entities.get("entity_class")
            sys.exit(1)
        print "updating Available version DB"
        add_available_versions(db_entry.value.uuid, node_uuid, entities)
    return node_uuids

def delete_available_db():
    li = LcmInterface()
    cu = CpdbUtils.get_instance(li)
    if not cu.cleanup_lcm_available_version_table():
      print("Attempt to clean LcmAvailable prior to inventory failed")
    else:
      print("Cleaned up LCM Available Version table")
    ret1, ql1 = li.cpdb.get_entities(LcmEntity, "lcm_entity_v2")
    for uuid, db_entry in ql1:
        ret, status = li.cpdb.update_entity(
            uuid, db_entry, delete=True)
        if not ret:
          log.ERROR("Error while deleting an entity %s " % uuid )
          sys.exit(1)
    print_cpdb()

def print_cpdb():
    print("################## Entity DB ##################")
    li = LcmInterface()
    ret1, ql1 = li.cpdb.get_entities(LcmEntity, "lcm_entity_v2")
    for k, v in ql1:
        print(v.value)
    print("################## Available version DB ##################")
    ret2, ql2 = li.cpdb.get_entities(LcmAvailableVersion,
                                     "lcm_available_version_v2")
    for k, v in ql2:
        print(v.value)

def main():
    """
    Create a Dark-Site Bundle from rim_config.json
    based on the user given command line arguments
    """

    parser = OptionParser()
    parser.add_option("-c", "--config", action="store", dest="config",
                      help="Path of the rim_config.json file")
    parser.add_option("-u", "--url", action="store", dest="url_config",
                      help="Path of the rim_config.json file")
    parser.add_option("-d", "--delete", action="store_true", dest="delete",
                      help="Delete the available DB")
    parser.add_option("-p", "--print", action="store_true", dest="print_db",
                      help="Print the available DB")
    options, args = parser.parse_args()

    print "parsing options"
    if args:
        print("Improper parameter %s", args)
        sys.exit(1)

    if options.config:
        json_loc = options.config
    elif options.url_config:
        download_rim_url(options.url_config)
        json_loc = os.path.join(os.getcwd(), 'metadata.json')
    elif options.delete:
        delete_available_db()
        sys.exit(0)
    elif options.print_db:
        print_cpdb()
        sys.exit(0)
    else:
        parser.error("\nrim_config.json using -c/--config or "
                     "-u/--url_config is not given\n"
                     "Note: Please provide complete path/url of rim_config.json\n"
                     "[or] use -h/--help as arguments for help.")
        sys.exit(1)

    print("Loading json %s" % json_loc)
    try:
      with open(json_loc) as fd:
        metadata = json.load(fd)
    except Exception as e:
      print("Got exception %s " % str(e))
      sys.exit(1)

    managed_entities = metadata.get("managed_entities", [])
    if not managed_entities:
        print("No managed entities")
        sys.exit(1)
    print "calling the update_entities"
    for entities in managed_entities:
      uuids = update_entities(entities)

    print_cpdb()
if __name__ == "__main__":
    try:
        main()
    except Exception as err:
        print("Exception occurred while running build: %s", err)
        sys.exit(1)
