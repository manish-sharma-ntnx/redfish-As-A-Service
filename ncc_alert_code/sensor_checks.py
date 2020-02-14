import json
import requests
from util.ncc.plugins.base_plugin import BaseCheckPlugin, BaseModule
from util.ncc.plugins.base_plugin import register_check
from stats.arithmos.interface.arithmos_type_pb2 import ArithmosEntityProto
import serviceability.interface.utils as utils

class SensorCheckPlugin(BaseCheckPlugin):
  NAME = "cpu_temperature_check"
  SHORT_HELP = "CPU Temperature Check"
  TIMEOUT_SECS = 120
  CPU_TEMP_THRESHOLD = 50

  @classmethod
  def get_checks(cls, cmdlist, *args, **kwargs):
    return [(cls.cpu_temp_check, [], "CPU Temperature Check")]

  @classmethod
  @register_check("106090")
  def cpu_temp_check(cls):
    """
    CPU Temperature Check
    """
    sub_entities = {}
    alert_msg = ""
    alert_score = 100
    url = "http://localhost:8004/components/1234" # +get_node_uuid
    data = requests.get(url)
    cls.DEBUG("Data received from Redfish %s" % data)

    cpu_info = data.json()["components"]["cpu"]
    cls.INFO("CPU data received from Redfish %s" % cpu_info)

    for cpu in cpu_info:
      entity_score = 100
      msg = ""
      if cpu["temperature"] >= cls.CPU_TEMP_THRESHOLD:
        msg = ("%s temperature is higher(%s) than threhsold(%s)"
               % (cpu["name"], cpu["temperature"], cls.CPU_TEMP_THRESHOLD))
        cls.INFO(msg)
        entity_score = 24
      sub_entities.update({cpu["name"]:{"score":entity_score,
                                "cpu": cpu["name"],
                                "msg": msg}})
      if msg and msg not in alert_msg: alert_msg += "\n" + msg
      alert_score = min(alert_score, entity_score)

    cls.add_target_to_transfer_proto(
      ArithmosEntityProto.kNode,
      { "service_vm_id" : utils.service_vm_id() },
      alert_score,
      106090,
      {},
      sub_entities)
    if alert_score == 100: return cls.success()
    if alert_score == 24: return cls.fail(alert_msg)

class SensorChecksModule(BaseModule):
  NAME       = 'sensor_checks'
  SHORT_HELP = 'Checks relating to sensor values'

  @staticmethod
  def plugins():
    plugin_list = [
      SensorCheckPlugin,
      ]

    return plugin_list

